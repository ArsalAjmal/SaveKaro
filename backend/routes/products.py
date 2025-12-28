from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from models import Product, ProductResponse
from database import get_collection
from bson import ObjectId
import re

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/", response_model=ProductResponse)
async def get_products(
    brand: Optional[str] = Query(None, description="Filter by brand name"),
    gender: Optional[str] = Query(None, description="Filter by gender (men/women/unisex)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    min_discount: Optional[int] = Query(None, description="Minimum discount percentage"),
    search: Optional[str] = Query(None, description="Search in title and tags"),
    sort_by: str = Query("discount_percent", description="Sort by: discount_percent, price, -price (descending)"),
    limit: int = Query(50, ge=1, le=100, description="Number of results per page"),
    skip: int = Query(0, ge=0, description="Number of results to skip")
):
    
    collection = await get_collection()
    
    # Build query filter
    query = {}
    
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    
    if gender:
        query["gender"] = gender.lower()
    
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    if min_discount is not None:
        query["discount_percent"] = {"$gte": min_discount}
    
    if search:
        # Search in title and tags
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Build sort order
    sort_field = sort_by.lstrip("-")
    sort_direction = -1 if sort_by.startswith("-") else 1
    
    # For discount and price, we want descending by default
    if sort_field == "discount_percent":
        sort_direction = -1
    elif sort_field == "price" and not sort_by.startswith("-"):
        sort_direction = 1
    
    # Get total count
    total = await collection.count_documents(query)
    
    # Get products
    cursor = collection.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string and add defaults for missing fields
    for product in products:
        if "_id" in product:
            product["_id"] = str(product["_id"])
        # Ensure optional fields have defaults
        if "original_price" not in product or product["original_price"] is None:
            product["original_price"] = product.get("price", 0)
        if "discount_percent" not in product:
            product["discount_percent"] = 0
        if "url" not in product or product["url"] is None:
            product["url"] = "#"
    
    return ProductResponse(
        total=total,
        skip=skip,
        limit=limit,
        products=products
    )

@router.get("/search")
async def search_products(
    q: str = Query(..., description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results")
):
    """Search products by name, category, brand, or tags"""
    collection = await get_collection()
    
    # Build search query - search across multiple fields
    search_query = {
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}}
        ]
    }
    
    # Get matching products
    cursor = collection.find(search_query).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Convert ObjectId to string
    for product in products:
        product["_id"] = str(product["_id"])
    
    return {
        "query": q,
        "count": len(products),
        "products": products
    }

@router.get("/{product_id}", response_model=Product)
async def get_product_by_id(product_id: str):
    """Get a single product by ID"""
    from bson import ObjectId
    collection = await get_collection()
    
    try:
        product = await collection.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID format")
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product["_id"] = str(product["_id"])
    return Product(**product)

@router.get("/brands/list", response_model=List[str])
async def get_brands():
    """Get list of all unique brands"""
    collection = await get_collection()
    brands = await collection.distinct("brand")
    return sorted(brands)

@router.get("/categories/list", response_model=List[str])
async def get_categories():
    """Get list of all unique categories"""
    collection = await get_collection()
    categories = await collection.distinct("category")
    # Filter out None values
    return sorted([c for c in categories if c])

@router.get("/categories/by-gender")
async def get_categories_by_gender():
    """Return categories grouped by normalized gender (men, women, kids, other)."""
    collection = await get_collection()

    pipeline = [
        {"$match": {"category": {"$ne": None}}},
        {
            "$project": {
                "category": 1,
                "gender": {
                    "$let": {
                        "vars": {"g": {"$toLower": {"$ifNull": ["$gender", "other"]}}},
                        "in": {
                            "$switch": {
                                "branches": [
                                    {"case": {"$in": ["$$g", ["men", "male", "gents"]]}, "then": "men"},
                                    {"case": {"$in": ["$$g", ["women", "female", "ladies", "lady", "woman", "womens"]]}, "then": "women"},
                                    {"case": {"$in": ["$$g", [
                                        "kids", "kid", "children", "child", "youth", "junior",
                                        "boys", "boy", "girls", "girl"
                                    ]]}, "then": "kids"}
                                ],
                                "default": "other"
                            }
                        }
                    }
                }
            }
        },
        {"$group": {"_id": {"gender": "$gender", "category": "$category"}}},
        {"$group": {"_id": "$_id.gender", "categories": {"$addToSet": "$_id.category"}}},
    ]

    docs = await collection.aggregate(pipeline).to_list(length=1000)

    result = {"men": [], "women": [], "kids": [], "other": []}
    for d in docs:
        gender = (d.get("_id") or "other").lower()
        cats = sorted([c for c in d.get("categories", []) if c])
        if gender in result:
            result[gender] = cats
        else:
            result["other"].extend(cats)

    # Ensure uniqueness and sort for 'other'
    result["other"] = sorted(list(set(result["other"])))
    return result

@router.get("/stats/summary")
async def get_stats():
    """Get summary statistics"""
    collection = await get_collection()
    
    pipeline = [
        {
            "$group": {
                "_id": "$brand",
                "count": {"$sum": 1},
                "avg_discount": {"$avg": "$discount_percent"},
                "max_discount": {"$max": "$discount_percent"}
            }
        }
    ]
    
    stats = await collection.aggregate(pipeline).to_list(length=100)
    
    total_products = await collection.count_documents({})
    
    return {
        "total_products": total_products,
        "by_brand": stats
    }

@router.get("/{product_id}")
async def get_product_by_id(product_id: str):
    """Get a single product by ID"""
    collection = await get_collection()
    
    try:
        # Try to convert string ID to ObjectId
        product = await collection.find_one({"_id": ObjectId(product_id)})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Convert ObjectId to string
        product["_id"] = str(product["_id"])
        
        # Ensure optional fields have defaults
        if "original_price" not in product or product["original_price"] is None:
            product["original_price"] = product.get("price", 0)
        if "discount_percent" not in product:
            product["discount_percent"] = 0
        if "url" not in product or product["url"] is None:
            product["url"] = "#"
        
        return product
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Product not found: {str(e)}")
