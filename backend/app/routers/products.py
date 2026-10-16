from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product as ProductModel

router = APIRouter()

# Pydantic models
class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    currency: str = "INR"
    category: str
    image_url: str
    stock: int
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    size: Optional[str] = "One Size"
    condition: Optional[str] = "Good"
    measurements: Optional[str] = None
    flaws: Optional[str] = None
    is_featured: Optional[bool] = False

class ProductList(BaseModel):
    products: List[Product]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool

class Category(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

# Curated synthetic starter inventory for RAO'S THRIFT
mock_products = [
    {
        "id": "RT-TEE-001",
        "name": "Acid Wash Vintage Nirvana Graphic Tee",
        "description": "Authentic boxy-fit heavy cotton tee featuring vintage acid wash finish and cracked archival band graphics. One-of-one curated piece.",
        "price": 1499.0,
        "currency": "INR",
        "category": "Oversized Tees",
        "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.9,
        "review_count": 18,
        "size": "Oversized XL",
        "condition": "Good",
        "measurements": "Pit to pit: 24.5\", Length: 29.5\", Shoulder: 22\"",
        "flaws": "Natural vintage fading throughout graphic, clean hem",
        "is_featured": True
    },
    {
        "id": "RT-TEE-002",
        "name": "Heavyweight 280GSM Drop-Shoulder Boxy Tee",
        "description": "Deadstock custom drop-shoulder silhouette in washed raven black. Ultra-dense cotton with ribbed crewneck.",
        "price": 1199.0,
        "currency": "INR",
        "category": "Oversized Tees",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "stock": 4,
        "rating": 4.8,
        "review_count": 22,
        "size": "L",
        "condition": "New With Tags",
        "measurements": "Pit to pit: 23\", Length: 28\", Sleeve: 9.5\"",
        "flaws": "None (Deadstock condition)",
        "is_featured": True
    },
    {
        "id": "RT-HOOD-001",
        "name": "Sun-Faded Distressed Charcoal Hoodie",
        "description": "Heavy 450GSM loopback French terry hoodie with sun-faded wash and subtle edge distress. Deep crossover hood with kangaroo pocket.",
        "price": 2799.0,
        "currency": "INR",
        "category": "Hoodies & Sweatshirts",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 5.0,
        "review_count": 31,
        "size": "Oversized L",
        "condition": "Like New",
        "measurements": "Chest: 26\", Length: 27.5\", Sleeve: 25.5\"",
        "flaws": "None. Intentional artisanal edge distress.",
        "is_featured": True
    },
    {
        "id": "RT-HOOD-002",
        "name": "Vintage 90s Collegiate Zip-Up Hoodie",
        "description": "Original 90s boxy zip-up with antique brass YKK zipper, split front pockets, and contrast interior hood.",
        "price": 2499.0,
        "currency": "INR",
        "category": "Hoodies & Sweatshirts",
        "image_url": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.7,
        "review_count": 14,
        "size": "XL",
        "condition": "Good",
        "measurements": "Chest: 25\", Length: 28\", Sleeve: 24\"",
        "flaws": "Subtle patina on metal zipper pull",
        "is_featured": False
    },
    {
        "id": "RT-DENIM-001",
        "name": "90s Raw Indigo Carpenter Baggy Denim",
        "description": "Wide-leg utility carpenter jeans with hammer loop, reinforced tool pockets, and clean straight cuff stacking.",
        "price": 2999.0,
        "currency": "INR",
        "category": "Baggy Denim",
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.9,
        "review_count": 27,
        "size": "32x32",
        "condition": "Like New",
        "measurements": "Waist: 33\", Inseam: 32\", Leg Opening: 9.5\", Thigh: 13.5\"",
        "flaws": "None. Crisp unwashed vintage indigo.",
        "is_featured": True
    },
    {
        "id": "RT-DENIM-002",
        "name": "Washed Stonewash Wide-Leg Skater Jeans",
        "description": "Bleach stonewash heavy denim with relaxed skater drape. High rise with roomy thigh and flared lower leg.",
        "price": 2699.0,
        "currency": "INR",
        "category": "Baggy Denim",
        "image_url": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.6,
        "review_count": 19,
        "size": "34x30",
        "condition": "Good",
        "measurements": "Waist: 34.5\", Inseam: 30\", Leg Opening: 10\", Thigh: 14\"",
        "flaws": "Natural whiskering at thigh crease",
        "is_featured": False
    },
    {
        "id": "RT-SHIRT-001",
        "name": "Heavyweight Vintage Shadow Plaid Flannel",
        "description": "Thick brushed cotton overshirt in muted olive and black shadow plaid. Dual chest patch pockets with horn buttons.",
        "price": 1899.0,
        "currency": "INR",
        "category": "Vintage Shirts",
        "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.8,
        "review_count": 16,
        "size": "L",
        "condition": "Good",
        "measurements": "Chest: 23.5\", Length: 30\", Shoulders: 20\"",
        "flaws": "Top interior button replaced, invisible when worn",
        "is_featured": True
    },
    {
        "id": "RT-SHIRT-002",
        "name": "Retro Rayon Camp Collar Bowling Shirt",
        "description": "Flowy vintage rayon shirt with open camp collar, contrast chest stripe, and boxy straight-cut hem.",
        "price": 2199.0,
        "currency": "INR",
        "category": "Vintage Shirts",
        "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.7,
        "review_count": 11,
        "size": "M",
        "condition": "Like New",
        "measurements": "Chest: 22\", Length: 27\", Shoulders: 19\"",
        "flaws": "None",
        "is_featured": False
    },
    {
        "id": "RT-JACKET-001",
        "name": "Washed Duck Canvas Workwear Chore Jacket",
        "description": "Heavyweight rugged canvas jacket with corduroy collar, blanket lining, and brass rivets. Built to last decades.",
        "price": 4299.0,
        "currency": "INR",
        "category": "Jackets & Outerwear",
        "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 5.0,
        "review_count": 45,
        "size": "L",
        "condition": "Good",
        "measurements": "Chest: 25\", Length: 28.5\", Shoulders: 21\"",
        "flaws": "Minor authentic paint speckle on lower left cuff",
        "is_featured": True
    },
    {
        "id": "RT-JACKET-002",
        "name": "Two-Tone 90s Crinkle Nylon Track Jacket",
        "description": "Authentic 90s oversized windbreaker shell jacket in emerald green and pitch black. Stand-up collar with elasticated hem.",
        "price": 2499.0,
        "currency": "INR",
        "category": "Jackets & Outerwear",
        "image_url": "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&auto=format&fit=crop&q=80",
        "stock": 1,
        "rating": 4.4,
        "review_count": 9,
        "size": "XL",
        "condition": "Fair",
        "measurements": "Chest: 26.5\", Length: 28.5\", Sleeve: 25\"",
        "flaws": "Minor 2mm pinhole on lower right hem",
        "is_featured": False
    },
    {
        "id": "RT-ACC-001",
        "name": "Washed Chunky Ribbed Streetwear Beanie",
        "description": "Tight-gauge ribbed knit beanie with roll cuff. Comfortable all-day tension and deep acid lime brand accent stitch.",
        "price": 699.0,
        "currency": "INR",
        "category": "Accessories",
        "image_url": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80",
        "stock": 8,
        "rating": 4.9,
        "review_count": 39,
        "size": "One Size",
        "condition": "New With Tags",
        "measurements": "Height: 8.5\", Width: 9\" (unstretched)",
        "flaws": "None (Deadstock)",
        "is_featured": True
    },
    {
        "id": "RT-ACC-002",
        "name": "Tactical Surplus Webbing Crossbody Sling",
        "description": "Compact utility bag crafted from recycled cordura nylon with quick-release buckle and waterproof compartments.",
        "price": 1299.0,
        "currency": "INR",
        "category": "Accessories",
        "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
        "stock": 2,
        "rating": 4.8,
        "review_count": 14,
        "size": "One Size",
        "condition": "Like New",
        "measurements": "Width: 10\", Height: 6.5\", Depth: 3.5\"",
        "flaws": "None",
        "is_featured": False
    },
    {
        "id": "RT-TEE-003",
        "name": "Archival Tokyo Underground Graphic Tee",
        "description": "Rare Japanese import graphic tee from late 90s Tokyo underground streetwear movement. Single-stitch hems throughout.",
        "price": 1599.0,
        "currency": "INR",
        "category": "Oversized Tees",
        "image_url": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
        "stock": 0,
        "rating": 4.9,
        "review_count": 19,
        "size": "XL",
        "condition": "Like New",
        "measurements": "Pit to pit: 24\", Length: 30\"",
        "flaws": "None. Archival grade preservation.",
        "is_featured": False
    }
]

mock_categories = [
    {"id": "1", "name": "Oversized Tees", "description": "Drop shoulder heavyweight graphic & boxy tees", "image_url": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80"},
    {"id": "2", "name": "Hoodies & Sweatshirts", "description": "Sun-faded distressed hoodies & collegiate pullovers", "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"},
    {"id": "3", "name": "Baggy Denim", "description": "90s carpenter fits, wide-leg washes & skater jeans", "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80"},
    {"id": "4", "name": "Vintage Shirts", "description": "Heavyweight plaids, camp collars & retro button-downs", "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"},
    {"id": "5", "name": "Jackets & Outerwear", "description": "Canvas workwear jackets, nylon track tops & bombers", "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"},
    {"id": "6", "name": "Accessories", "description": "Cotton beanies, military surplus bags & utility belts", "image_url": "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=80"}
]

def _normalize_image_url(raw_url: Optional[str], request: Request) -> Optional[str]:
    """Normalize image URLs to avoid mixed content and host mismatches."""
    if not raw_url:
        return raw_url

    url = raw_url.strip()
    base = str(request.base_url).rstrip('/')

    # Full GCS or external image URLs (e.g., unsplash)
    if url.startswith(('https://', 'http://')) and not any(h in url for h in ['localhost', '127.0.0.1', '0.0.0.0']):
        if url.startswith('http://'):
            return 'https://' + url[len('http://'):]
        return url

    if '/uploads/' in url:
        uploads_index = url.find('/uploads/')
        url = url[uploads_index:]

    if url.startswith('/uploads'):
        import os
        GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "")
        if GCS_BUCKET_NAME:
            filename = url.replace('/uploads/', '').lstrip('/')
            if filename:
                return f"https://storage.googleapis.com/{GCS_BUCKET_NAME}/uploads/{filename}"
        return f"{base}{url}"

    localhost_prefixes = (
        'http://localhost', 'http://127.0.0.1', 'http://0.0.0.0',
        'https://localhost', 'https://127.0.0.1', 'https://0.0.0.0',
    )
    if url.startswith(localhost_prefixes):
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            path_and_query = parsed.path or ''
            if parsed.query:
                path_and_query += f"?{parsed.query}"
            return f"{base}{path_and_query}"
        except Exception:
            return base

    return url


@router.get("/", response_model=ProductList)
async def get_products(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search query"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    size: Optional[str] = Query(None, description="Filter by size"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    sort_by: Optional[str] = Query("newest", description="Sort by field: newest, price, rating, name"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """Get products with filtering, searching, and pagination"""
    try:
        query = db.query(ProductModel)
        
        # Apply category filter
        if category and category.lower() != "all" and category.lower() != "shop all":
            query = query.filter(ProductModel.category.ilike(f"%{category}%"))
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                ProductModel.name.ilike(search_term) | 
                ProductModel.description.ilike(search_term) |
                ProductModel.category.ilike(search_term)
            )
        
        # Apply price filters
        if min_price is not None:
            query = query.filter(ProductModel.price >= min_price)
        if max_price is not None:
            query = query.filter(ProductModel.price <= max_price)

        # Apply thrift specific filters
        if size:
            query = query.filter(ProductModel.size.ilike(f"%{size}%"))
        if condition:
            query = query.filter(ProductModel.condition.ilike(f"%{condition}%"))
        if is_featured is not None:
            query = query.filter(ProductModel.is_featured == is_featured)
        
        # Apply sorting
        if sort_by == "price":
            query = query.order_by(ProductModel.price.asc() if sort_order.lower() == "asc" else ProductModel.price.desc())
        elif sort_by == "rating":
            query = query.order_by(ProductModel.rating.desc())
        elif sort_by == "name":
            query = query.order_by(ProductModel.name.asc() if sort_order.lower() == "asc" else ProductModel.name.desc())
        elif sort_by in ["newest", "created_at"]:
            query = query.order_by(ProductModel.created_at.desc() if sort_order.lower() == "desc" else ProductModel.created_at.asc())
        else:
            query = query.order_by(ProductModel.created_at.desc())
        
        total = query.count()
        offset = (page - 1) * limit
        db_products = query.offset(offset).limit(limit).all()
        
        products = []
        for p in db_products:
            products.append(Product(
                id=p.id,
                name=p.name,
                description=p.description or "",
                price=p.price,
                currency="INR",
                category=p.category,
                image_url=_normalize_image_url(p.image_url, request),
                stock=p.stock,
                rating=p.rating or 5.0,
                review_count=12,
                size=getattr(p, 'size', 'One Size') or 'One Size',
                condition=getattr(p, 'condition', 'Good') or 'Good',
                measurements=getattr(p, 'measurements', None),
                flaws=getattr(p, 'flaws', None),
                is_featured=getattr(p, 'is_featured', False) or False,
            ))
        
        return ProductList(
            products=products,
            total=total,
            page=page,
            limit=limit,
            has_next=offset + limit < total,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories", response_model=List[Category])
async def get_categories(db: Session = Depends(get_db)):
    """Get all product categories from database with fallback to mock_categories"""
    try:
        categories = db.query(ProductModel.category).distinct().all()
        db_names = [c[0] for c in categories if c[0]]
        
        category_list = []
        # First add from predefined mock_categories to preserve descriptions & editorial images
        matched_names = set()
        for idx, mc in enumerate(mock_categories, start=1):
            if mc["name"] in db_names:
                matched_names.add(mc["name"])
                category_list.append(Category(**mc))
        
        # Then add any other distinct categories in DB
        for cat_name in db_names:
            if cat_name not in matched_names:
                category_list.append(Category(
                    id=str(len(category_list) + 1),
                    name=cat_name,
                    description=f"Curated {cat_name} collection",
                    image_url="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"
                ))
        
        if not category_list:
            category_list = [Category(**c) for c in mock_categories]
        
        return category_list
    except Exception as e:
        return [Category(**c) for c in mock_categories]

@router.get("/featured", response_model=List[Product])
async def get_featured_products(request: Request, db: Session = Depends(get_db)):
    """Get featured products for the Latest Drop / Homepage highlights"""
    try:
        # First try items marked is_featured
        db_products = db.query(ProductModel).filter(ProductModel.is_featured == True).limit(8).all()
        if len(db_products) < 4:
            # Fallback to highest rated or newest
            remaining = 8 - len(db_products)
            existing_ids = [p.id for p in db_products]
            additional = db.query(ProductModel).filter(~ProductModel.id.in_(existing_ids)).order_by(ProductModel.created_at.desc()).limit(remaining).all()
            db_products.extend(additional)
        
        products = []
        for p in db_products:
            products.append(Product(
                id=p.id,
                name=p.name,
                description=p.description or "",
                price=p.price,
                currency="INR",
                category=p.category,
                image_url=_normalize_image_url(p.image_url, request),
                stock=p.stock,
                rating=p.rating or 5.0,
                review_count=12,
                size=getattr(p, 'size', 'One Size') or 'One Size',
                condition=getattr(p, 'condition', 'Good') or 'Good',
                measurements=getattr(p, 'measurements', None),
                flaws=getattr(p, 'flaws', None),
                is_featured=getattr(p, 'is_featured', False) or False,
            ))
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/suggestions")
async def get_search_suggestions(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Get search suggestions based on query"""
    try:
        if len(q) < 2:
            return {"suggestions": []}
        
        q_term = f"%{q}%"
        suggestions = []
        
        # Query products
        db_names = db.query(ProductModel.name).filter(ProductModel.name.ilike(q_term)).limit(5).all()
        for (name,) in db_names:
            suggestions.append(name)
            
        # Query categories
        db_cats = db.query(ProductModel.category).filter(ProductModel.category.ilike(q_term)).distinct().limit(3).all()
        for (cat,) in db_cats:
            if cat not in suggestions:
                suggestions.append(cat)
        
        return {"suggestions": suggestions[:6]}
    except Exception as e:
        return {"suggestions": []}

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, request: Request, db: Session = Depends(get_db)):
    """Get product by ID"""
    try:
        db_product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
        
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return Product(
            id=db_product.id,
            name=db_product.name,
            description=db_product.description or "",
            price=db_product.price,
            currency="INR",
            category=db_product.category,
            image_url=_normalize_image_url(db_product.image_url, request),
            stock=db_product.stock,
            rating=db_product.rating or 5.0,
            review_count=12,
            size=getattr(db_product, 'size', 'One Size') or 'One Size',
            condition=getattr(db_product, 'condition', 'Good') or 'Good',
            measurements=getattr(db_product, 'measurements', None),
            flaws=getattr(db_product, 'flaws', None),
            is_featured=getattr(db_product, 'is_featured', False) or False,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
