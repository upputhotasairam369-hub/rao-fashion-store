from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.routers.auth import verify_token
from app.database import get_db
from app.models import Product as ProductModel, CartItem as CartItemModel
from sqlalchemy.orm import Session

router = APIRouter()

# Pydantic models
class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    subtotal: float
    image_url: Optional[str] = None

class CartResponse(BaseModel):
    items: List[CartItem]
    total_items: int
    subtotal: float
    tax: float
    shipping: float
    total: float

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)

class UpdateCartItemRequest(BaseModel):
    quantity: int = Field(ge=0)

# In-memory fallback/cache for backward compatibility
carts_db = {}

def _build_cart_response(items: List[CartItem]) -> CartResponse:
    total_items = sum(item.quantity for item in items)
    subtotal = round(sum(item.subtotal for item in items), 2)
    tax = round(subtotal * 0.08, 2)
    shipping = 0.0 if (subtotal >= 50.0 or total_items == 0) else 5.99
    total = round(subtotal + tax + shipping, 2)

    return CartResponse(
        items=items,
        total_items=total_items,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total
    )

def get_user_cart(user_id: str):
    """Fallback helper for in-memory access if needed"""
    if user_id not in carts_db:
        carts_db[user_id] = {"items": {}, "total_items": 0, "subtotal": 0}
    cart = carts_db[user_id]
    cart["total_items"] = sum(item["quantity"] for item in cart["items"].values())
    cart["subtotal"] = sum(item["subtotal"] for item in cart["items"].values())
    return cart

@router.get("/", response_model=CartResponse)
async def get_cart(current_user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get user's shopping cart from database"""
    try:
        db_items = db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).all()
        cart_items = []
        for ci in db_items:
            cart_items.append(CartItem(
                product_id=ci.product_id,
                name=ci.name,
                price=ci.price,
                quantity=ci.quantity,
                subtotal=ci.subtotal,
                image_url=ci.image_url
            ))
        return _build_cart_response(cart_items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/add", response_model=CartResponse)
async def add_to_cart(
    request: AddToCartRequest,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Add item to cart with backend stock and price verification"""
    try:
        # Validate quantity
        if request.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

        # Get verified product from database
        product = db.query(ProductModel).filter(ProductModel.id == request.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product '{request.product_id}' not found")

        # Check existing cart item
        existing_item = db.query(CartItemModel).filter(
            CartItemModel.user_id == current_user_id,
            CartItemModel.product_id == request.product_id
        ).first()

        new_total_quantity = (existing_item.quantity if existing_item else 0) + request.quantity

        if product.stock < new_total_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add {request.quantity} items. Only {product.stock} items in stock (currently {existing_item.quantity if existing_item else 0} in your cart)."
            )

        if existing_item:
            existing_item.quantity = new_total_quantity
            existing_item.price = product.price
            existing_item.subtotal = round(product.price * new_total_quantity, 2)
            existing_item.updated_at = datetime.utcnow()
        else:
            new_item = CartItemModel(
                user_id=current_user_id,
                product_id=product.id,
                name=product.name,
                price=product.price,
                quantity=request.quantity,
                subtotal=round(product.price * request.quantity, 2),
                image_url=product.image_url,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(new_item)

        db.commit()

        # Update in-memory fallback
        mem_cart = get_user_cart(current_user_id)
        mem_cart["items"][request.product_id] = {
            "product_id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": new_total_quantity,
            "subtotal": round(product.price * new_total_quantity, 2),
            "image_url": product.image_url
        }

        # Return updated cart
        db_items = db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).all()
        cart_items = [
            CartItem(
                product_id=ci.product_id,
                name=ci.name,
                price=ci.price,
                quantity=ci.quantity,
                subtotal=ci.subtotal,
                image_url=ci.image_url
            ) for ci in db_items
        ]
        return _build_cart_response(cart_items)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    request: UpdateCartItemRequest,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Update cart item quantity with stock validation"""
    try:
        existing_item = db.query(CartItemModel).filter(
            CartItemModel.user_id == current_user_id,
            CartItemModel.product_id == product_id
        ).first()

        if not existing_item:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        if request.quantity <= 0:
            db.delete(existing_item)
            db.commit()
            if current_user_id in carts_db and product_id in carts_db[current_user_id]["items"]:
                del carts_db[current_user_id]["items"][product_id]
        else:
            product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
            if product and product.stock < request.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {product.stock} items in stock for '{existing_item.name}'."
                )

            existing_item.quantity = request.quantity
            existing_item.subtotal = round(existing_item.price * request.quantity, 2)
            existing_item.updated_at = datetime.utcnow()
            db.commit()

            mem_cart = get_user_cart(current_user_id)
            if product_id in mem_cart["items"]:
                mem_cart["items"][product_id]["quantity"] = request.quantity
                mem_cart["items"][product_id]["subtotal"] = existing_item.subtotal

        db_items = db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).all()
        cart_items = [
            CartItem(
                product_id=ci.product_id,
                name=ci.name,
                price=ci.price,
                quantity=ci.quantity,
                subtotal=ci.subtotal,
                image_url=ci.image_url
            ) for ci in db_items
        ]
        return _build_cart_response(cart_items)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{product_id}")
async def remove_cart_item(
    product_id: str,
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Remove item from cart in database"""
    try:
        db.query(CartItemModel).filter(
            CartItemModel.user_id == current_user_id,
            CartItemModel.product_id == product_id
        ).delete()
        db.commit()

        if current_user_id in carts_db and product_id in carts_db[current_user_id]["items"]:
            del carts_db[current_user_id]["items"][product_id]

        return {"message": "Item removed from cart"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/")
async def clear_cart(
    current_user_id: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Clear all items in user's shopping cart"""
    try:
        db.query(CartItemModel).filter(CartItemModel.user_id == current_user_id).delete()
        db.commit()

        if current_user_id in carts_db:
            carts_db[current_user_id]["items"] = {}
            carts_db[current_user_id]["total_items"] = 0
            carts_db[current_user_id]["subtotal"] = 0

        return {"message": "Cart cleared"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

