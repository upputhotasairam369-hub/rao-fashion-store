from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.routers.auth import verify_token
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order as OrderModel, OrderItem as OrderItemModel, Product as ProductModel, CartItem as CartItemModel, User as UserModel

router = APIRouter()

# Pydantic models
class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    subtotal: float
    image_url: Optional[str] = None

class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "India"
    phone: str

class Order(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    shipping_address: Optional[ShippingAddress] = None
    subtotal: float
    tax: float
    shipping: float
    total: float
    status: str
    created_at: datetime
    updated_at: datetime

class CreateOrderRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "test_checkout"
    items: Optional[List[dict]] = None

class OrderList(BaseModel):
    orders: List[Order]
    total: int

def generate_order_id():
    return f"ord_{int(datetime.utcnow().timestamp())}_{abs(hash(datetime.utcnow().isoformat())) % 10000}"

@router.post("/", response_model=Order)
async def create_order(
    request: CreateOrderRequest,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a new order with backend price and stock validation"""
    try:
        from app.routers.cart import get_user_cart, carts_db

        # 1. Fetch items from database cart first, fallback to in-memory cart, or payload items
        db_cart_items = db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).all()
        cart_items_data = []

        if db_cart_items:
            for ci in db_cart_items:
                cart_items_data.append({
                    "product_id": ci.product_id,
                    "quantity": ci.quantity
                })
        else:
            in_memory_cart = get_user_cart(current_user_id)
            for item in in_memory_cart.get("items", {}).values():
                cart_items_data.append({
                    "product_id": item["product_id"],
                    "quantity": item["quantity"]
                })

        if not cart_items_data and request.items:
            for item in request.items:
                cart_items_data.append({
                    "product_id": str(item.get("product_id") or item.get("id")),
                    "quantity": int(item.get("quantity", 1))
                })

        if not cart_items_data:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # 2. Validate product prices and stock availability against database (Task 7)
        verified_order_items = []
        subtotal = 0.0

        for item_entry in cart_items_data:
            product_id = str(item_entry["product_id"])
            quantity = int(item_entry["quantity"])

            if quantity <= 0:
                continue

            product = db.query(ProductModel).filter(ProductModel.id == product_id).with_for_update().first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")

            if product.stock < quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}, requested: {quantity}"
                )

            # Decrement stock on the backend
            product.stock -= quantity
            item_subtotal = round(product.price * quantity, 2)
            subtotal += item_subtotal

            verified_order_items.append({
                "product_id": product.id,
                "name": product.name,
                "price": product.price,
                "quantity": quantity,
                "subtotal": item_subtotal,
                "image_url": product.image_url
            })

        if not verified_order_items:
            raise HTTPException(status_code=400, detail="No valid items in cart to create an order")

        # 3. Server-side totals calculation in INR (Never trust client calculation)
        subtotal = round(subtotal, 2)
        tax = round(subtotal * 0.05, 2)  # 5% apparel GST
        shipping = 0.0 if subtotal >= 1999.0 else 99.0
        total = round(subtotal + tax + shipping, 2)

        order_id = generate_order_id()
        now = datetime.utcnow()

        # 4. Save order record
        db_order = OrderModel(
            id=order_id,
            user_id=current_user_id,
            status="pending",
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total=total,
            shipping_address=request.shipping_address.dict(),
            created_at=now,
            updated_at=now
        )
        db.add(db_order)
        db.flush()

        # 5. Save order items
        order_items_models = []
        for v_item in verified_order_items:
            db_item = OrderItemModel(
                order_id=order_id,
                product_id=v_item["product_id"],
                name=v_item["name"],
                price=v_item["price"],
                quantity=v_item["quantity"],
                subtotal=v_item["subtotal"],
                image_url=v_item["image_url"]
            )
            db.add(db_item)
            order_items_models.append(
                OrderItem(
                    product_id=v_item["product_id"],
                    name=v_item["name"],
                    price=v_item["price"],
                    quantity=v_item["quantity"],
                    subtotal=v_item["subtotal"],
                    image_url=v_item["image_url"]
                )
            )

        # 6. Clear user cart in DB and memory
        db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).delete()
        if current_user_id in carts_db:
            carts_db[current_user_id]["items"] = {}
            carts_db[current_user_id]["total_items"] = 0
            carts_db[current_user_id]["subtotal"] = 0

        db.commit()
        db.refresh(db_order)

        return Order(
            id=db_order.id,
            user_id=db_order.user_id,
            items=order_items_models,
            shipping_address=request.shipping_address,
            subtotal=db_order.subtotal,
            tax=db_order.tax,
            shipping=db_order.shipping,
            total=db_order.total,
            status=db_order.status,
            created_at=db_order.created_at,
            updated_at=db_order.updated_at
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/", response_model=OrderList)
def get_user_orders(
    current_user_id: str = Depends(verify_token),
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get user's order history"""
    try:
        db_orders = db.query(OrderModel).filter(
            OrderModel.user_id == current_user_id
        ).order_by(OrderModel.created_at.desc()).all()

        orders = []
        for db_order in db_orders:
            order_items = db.query(OrderItemModel).filter(OrderItemModel.order_id == db_order.id).all()
            items = [
                OrderItem(
                    product_id=item.product_id,
                    name=item.name,
                    price=item.price,
                    quantity=item.quantity,
                    subtotal=item.subtotal,
                    image_url=item.image_url
                ) for item in order_items
            ]

            shipping_address = None
            if db_order.shipping_address and isinstance(db_order.shipping_address, dict):
                try:
                    shipping_address = ShippingAddress(**db_order.shipping_address)
                except Exception:
                    shipping_address = None

            orders.append(
                Order(
                    id=db_order.id,
                    user_id=db_order.user_id,
                    items=items,
                    shipping_address=shipping_address,
                    subtotal=db_order.subtotal,
                    tax=db_order.tax,
                    shipping=db_order.shipping,
                    total=db_order.total,
                    status=db_order.status,
                    created_at=db_order.created_at,
                    updated_at=db_order.updated_at
                )
            )

        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_orders = orders[start_idx:end_idx]

        return OrderList(
            orders=paginated_orders,
            total=len(orders)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get specific order details from database"""
    try:
        db_order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Check permission: owner or admin
        user = db.query(UserModel).filter(UserModel.id == current_user_id).first()
        is_admin = user and user.role == "admin"
        if db_order.user_id != current_user_id and not is_admin:
            raise HTTPException(status_code=403, detail="Access denied")

        order_items = db.query(OrderItemModel).filter(OrderItemModel.order_id == db_order.id).all()
        items = [
            OrderItem(
                product_id=item.product_id,
                name=item.name,
                price=item.price,
                quantity=item.quantity,
                subtotal=item.subtotal,
                image_url=item.image_url
            ) for item in order_items
        ]

        shipping_address = None
        if db_order.shipping_address and isinstance(db_order.shipping_address, dict):
            try:
                shipping_address = ShippingAddress(**db_order.shipping_address)
            except Exception:
                shipping_address = None

        return Order(
            id=db_order.id,
            user_id=db_order.user_id,
            items=items,
            shipping_address=shipping_address,
            subtotal=db_order.subtotal,
            tax=db_order.tax,
            shipping=db_order.shipping,
            total=db_order.total,
            status=db_order.status,
            created_at=db_order.created_at,
            updated_at=db_order.updated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{order_id}/tracking")
async def get_order_tracking(
    order_id: str,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get order tracking information from database"""
    try:
        db_order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")

        user = db.query(UserModel).filter(UserModel.id == current_user_id).first()
        is_admin = user and user.role == "admin"
        if db_order.user_id != current_user_id and not is_admin:
            raise HTTPException(status_code=403, detail="Access denied")

        status_descriptions = {
            "pending": "Your order has been received and is pending processing.",
            "processing": "Your order is currently being prepared in our warehouse.",
            "shipped": "Your order has been dispatched and is on its way.",
            "delivered": "Your package has been successfully delivered.",
            "cancelled": "This order was cancelled."
        }

        description = status_descriptions.get(db_order.status.lower(), f"Order status is {db_order.status}")

        tracking_info = {
            "order_id": order_id,
            "status": db_order.status,
            "tracking_number": f"TRK-{order_id.upper()}",
            "created_at": db_order.created_at.isoformat(),
            "updated_at": db_order.updated_at.isoformat(),
            "updates": [
                {
                    "timestamp": db_order.updated_at.isoformat(),
                    "status": db_order.status.capitalize(),
                    "description": description
                }
            ]
        }

        return tracking_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


