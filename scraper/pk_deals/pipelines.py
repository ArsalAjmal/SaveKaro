import os
import datetime
from urllib.parse import urlparse

from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv
from scrapy.exceptions import DropItem

load_dotenv()

class CleanAndComputePipeline:
    def process_item(self, item, spider):
        # normalize numeric fields
        def to_float(v):
            if v is None:
                return None
            if isinstance(v, (int, float)):
                return float(v)
            s = str(v)
            s = s.replace(",", "").replace("PKR", "").replace("Rs.", "").replace("Rs", "").strip()
            out = "".join(ch for ch in s if ch.isdigit() or ch == ".")
            try:
                return float(out) if out else None
            except ValueError:
                return None

        price = to_float(item.get("price"))
        original = to_float(item.get("original_price"))

        # infer discount if not present
        discount = item.get("discount_percent")
        if discount is None and original and price and original > price:
            discount = round(((original - price) / original) * 100)

        # enforce minimum 5% discount and valid prices
        if not price or not original or original <= price or (discount is None) or discount < 5:
            raise DropItem("Not discounted >= 5% or invalid price")

        item["price"] = price
        item["original_price"] = original
        item["discount_percent"] = int(discount)

        # normalize brand/source
        if not item.get("source") and item.get("url"):
            item["source"] = urlparse(item["url"]).netloc

        # ensure URL exists
        if not item.get("url"):
            raise DropItem("Missing url")

        item["scraped_at"] = datetime.datetime.utcnow()
        return item

class MongoPipeline:
    def __init__(self, mongo_uri=None, mongo_db=None, mongo_collection=None):
        self.mongo_uri = mongo_uri or os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
        # Prefer DB_NAME, fallback to MONGO_DB for backward compatibility
        self.mongo_db = mongo_db or os.getenv("DB_NAME") or os.getenv("MONGO_DB") or "fwd_project"
        self.mongo_collection = mongo_collection or os.getenv("MONGO_COLLECTION", "products")

    def open_spider(self, spider):
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        self.col = self.db[self.mongo_collection]
        # indexes for filtering
        self.col.create_index([("brand", ASCENDING)])
        self.col.create_index([("discount_percent", ASCENDING)])
        self.col.create_index([("gender", ASCENDING), ("category", ASCENDING)])
        self.col.create_index([("source", ASCENDING)])
        # make unique only when url is a string (ignores missing/null)
        self.col.create_index(
            [("url", ASCENDING)],
            name="url_unique_string_only",
            unique=True,
            partialFilterExpression={"url": {"$type": "string"}}
        )

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        data = dict(item)
        # upsert by product URL to avoid duplicates
        self.col.update_one({"url": data["url"]}, {"$set": data}, upsert=True)
        return item