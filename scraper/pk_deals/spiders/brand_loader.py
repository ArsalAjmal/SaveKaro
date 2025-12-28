import os
import yaml
import scrapy
from pk_deals.spiders.base_shopify import ShopifyCollectionSpider

class BrandSpider(scrapy.Spider):
    name = "brand"
    """
    Usage:
      scrapy crawl brand -a key=limelight
    """

    def __init__(self, key=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not key:
            raise ValueError("Provide -a key=<brand key from brands.yml>")
        self.key = key

    def start_requests(self):
        cfg_path = os.path.join(os.path.dirname(__file__), "..", "configs", "brands.yml")
        cfg_path = os.path.abspath(cfg_path)
        with open(cfg_path, "r") as f:
            data = yaml.safe_load(f)
        brand_cfg = next((b for b in data.get("brands", []) if b.get("key") == self.key), None)
        if not brand_cfg:
            raise ValueError(f"Brand '{self.key}' not found in brands.yml")

        platform = brand_cfg.get("platform")
        domain = brand_cfg.get("domain").rstrip("/")
        brand = brand_cfg.get("brand")
        collections = brand_cfg.get("collections", [])

        if platform == "shopify":
            sp = ShopifyCollectionSpider()
            sp._set_crawler(self.crawler)
            for req in sp.add_collection_requests(domain, collections, brand):
                yield req
        else:
            raise ValueError(f"Unsupported platform: {platform}")