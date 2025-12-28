import scrapy

class ProductItem(scrapy.Item):
    title = scrapy.Field()
    brand = scrapy.Field()
    price = scrapy.Field()            # float
    original_price = scrapy.Field()   # float
    discount_percent = scrapy.Field() # int
    gender = scrapy.Field()           # "men" | "women" | "unisex" | None
    category = scrapy.Field()         # e.g. "sweater", "kurta"
    url = scrapy.Field()
    image_url = scrapy.Field()
    source = scrapy.Field()           # domain
    currency = scrapy.Field()
    tags = scrapy.Field()
    scraped_at = scrapy.Field()
    variants = scrapy.Field()         # list of dicts: [{"size": "M", "in_stock": True, "price": 2000, "sku": "ABC123"}, ...]
    # Review/Rating fields
    rating = scrapy.Field()           # float: average rating (e.g., 4.5)
    review_count = scrapy.Field()     # int: total number of reviews
    reviews = scrapy.Field()          # list of dicts: [{"author": "John", "rating": 5, "text": "Great product!", "date": "2024-01-01"}, ...]