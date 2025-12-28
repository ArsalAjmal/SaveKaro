from urllib.parse import urljoin, urlparse
import scrapy
from pk_deals.items import ProductItem
from pk_deals.utils.categorize import detect_gender, detect_type

class ShopifyCollectionSpider(scrapy.Spider):
    name = "shopify_brand"
    custom_settings = {
        "ROBOTSTXT_OBEY": True,
    }

    def handle_from_collection_url(self, url: str):
        """
        Extract Shopify collection handle from a full URL:
        https://site/collections/<handle>[?...] -> <handle>
        """
        p = urlparse(url)
        parts = [seg for seg in p.path.split("/") if seg]
        if "collections" in parts:
            i = parts.index("collections")
            if i + 1 < len(parts):
                return parts[i + 1]
        return None

    def add_collection_requests(self, domain, collections, brand):
        for c in collections:
            handle = c.get("handle")
            url = c.get("url")
            gender = c.get("gender")
            ctype = c.get("type")

            # If URL provided, try to derive handle from it
            if not handle and url:
                handle = self.handle_from_collection_url(url)

            if handle:
                page = 1
                api = f"{domain}/collections/{handle}/products.json?limit=250&page={page}"
                yield scrapy.Request(
                    api,
                    callback=self.parse_collection_json,
                    cb_kwargs=dict(domain=domain, handle=handle, page=page, brand=brand, gender=gender, ctype=ctype),
                )
            else:
                self.logger.warning("Skipping collection without resolvable handle: %s", c)

    def parse_collection_json(self, response, domain, handle, page, brand, gender, ctype):
        data = response.json()
        products = data.get("products", [])
        for prod in products:
            yield from self.product_items_from_shopify(prod, domain, brand, gender, ctype)

        # pagination if needed
        if len(products) == 250:
            next_page = page + 1
            api = f"{domain}/collections/{handle}/products.json?limit=250&page={next_page}"
            yield scrapy.Request(
                api,
                callback=self.parse_collection_json,
                cb_kwargs=dict(domain=domain, handle=handle, page=next_page, brand=brand, gender=gender, ctype=ctype),
            )

    def product_items_from_shopify(self, prod, domain, brand, gender_hint, type_hint):
        title = prod.get("title")
        handle = prod.get("handle")
        product_url = urljoin(domain + "/", f"products/{handle}")
        images = prod.get("images") or []
        image_src = images[0]["src"] if images and isinstance(images[0], dict) else (images[0] if images else None)

        tags = prod.get("tags") or []
        gender = gender_hint or detect_gender(title, " ".join(tags))
        ctype = type_hint or detect_type(title, " ".join(tags))

        # fallback: try to infer category from collection handle, tags, or title if still None
        if not ctype:
            # Try handle
            if handle:
                ctype = detect_type(handle)
            # Try tags
            if not ctype and tags:
                ctype = detect_type(" ".join(tags))
            # Try title again
            if not ctype and title:
                ctype = detect_type(title)
            # If still None, set to "other"
            if not ctype:
                ctype = "other"

        # Collect all variants with size and stock information
        variants_list = []
        best_price = None
        best_original_price = None
        best_discount_percent = 0
        
        for v in prod.get("variants", []):
            price = v.get("price")
            compare = v.get("compare_at_price")
            available = v.get("available", False)
            
            # Extract size from variant title or option values
            size = None
            variant_title = v.get("title", "")
            if variant_title and variant_title != "Default Title":
                size = variant_title
            elif v.get("option1") and v.get("option1") != "Default Title":
                size = v.get("option1")
            
            try:
                price_f = float(price) if price else None
                compare_f = float(compare) if compare else None
            except (TypeError, ValueError):
                price_f = None
                compare_f = None
            
            # Add variant info (only add variants with meaningful size info or if stock is tracked)
            variant_info = {
                "size": size,
                "in_stock": available,
                "price": price_f,
                "original_price": compare_f,
                "sku": v.get("sku"),
                "inventory_quantity": v.get("inventory_quantity", 0),
                "variant_id": v.get("id")
            }
            variants_list.append(variant_info)
            
            # Track best discount for the product
            if price_f and compare_f and compare_f > price_f:
                discount = round(((compare_f - price_f) / compare_f) * 100)
                if discount > best_discount_percent:
                    best_discount_percent = discount
                    best_price = price_f
                    best_original_price = compare_f
        
        # Only yield product if it has a discount
        if best_price and best_original_price:
            item = ProductItem(
                title=title,
                brand=brand,
                price=best_price,
                original_price=best_original_price,
                discount_percent=best_discount_percent,
                gender=gender,
                category=ctype,
                url=product_url,
                image_url=image_src,
                source=domain.replace("https://", "").replace("http://", ""),
                currency="PKR",
                tags=tags,
                variants=variants_list,
            )
            
            # Request the product page to try to extract reviews
            yield scrapy.Request(
                product_url,
                callback=self.parse_product_reviews,
                cb_kwargs=dict(item=item),
                dont_filter=True,
                priority=0  # Lower priority than collection requests
            )

    def parse_product_reviews(self, response, item):
        """
        Parse product page to extract review data.
        Supports multiple review platforms commonly used on Shopify:
        - Judge.me
        - Yotpo
        - Product Reviews (Shopify's built-in)
        - Loox
        - Stamped.io
        """
        rating = None
        review_count = 0
        reviews_list = []
        
        # Try Judge.me reviews (most common)
        judgeme_rating = response.css('.jdgm-prev-badge__stars::attr(data-score)').get()
        judgeme_count = response.css('.jdgm-prev-badge__text::text').re_first(r'(\d+)')
        
        if judgeme_rating:
            rating = float(judgeme_rating)
            review_count = int(judgeme_count) if judgeme_count else 0
        
        # Try Yotpo reviews
        if not rating:
            yotpo_rating = response.css('.yotpo-bottomline .text-m::text').get()
            yotpo_count = response.css('.yotpo-bottomline .text-m::text').re_first(r'(\d+)')
            if yotpo_rating:
                try:
                    rating = float(yotpo_rating)
                    review_count = int(yotpo_count) if yotpo_count else 0
                except (ValueError, TypeError):
                    pass
        
        # Try Stamped.io reviews
        if not rating:
            stamped_rating = response.css('.stamped-product-reviews-badge::attr(data-rating)').get()
            stamped_count = response.css('.stamped-product-reviews-badge::attr(data-count)').get()
            if stamped_rating:
                try:
                    rating = float(stamped_rating)
                    review_count = int(stamped_count) if stamped_count else 0
                except (ValueError, TypeError):
                    pass
        
        # Try Loox reviews
        if not rating:
            loox_rating = response.css('.loox-rating::attr(data-rating)').get()
            loox_count = response.css('.loox-rating::attr(data-count)').get()
            if loox_rating:
                try:
                    rating = float(loox_rating)
                    review_count = int(loox_count) if loox_count else 0
                except (ValueError, TypeError):
                    pass
        
        # Try Shopify Product Reviews (basic)
        if not rating:
            spr_rating = response.css('.spr-badge-starrating::attr(aria-label)').re_first(r'([\d.]+)')
            spr_count = response.css('.spr-badge-caption::text').re_first(r'(\d+)')
            if spr_rating:
                try:
                    rating = float(spr_rating)
                    review_count = int(spr_count) if spr_count else 0
                except (ValueError, TypeError):
                    pass
        
        # Try to extract individual reviews (if visible on page - Judge.me example)
        for review_elem in response.css('.jdgm-rev'):
            try:
                author = review_elem.css('.jdgm-rev__author::text').get()
                review_rating = review_elem.css('.jdgm-rev__rating::attr(data-score)').get()
                review_text = review_elem.css('.jdgm-rev__body::text').get()
                review_date = review_elem.css('.jdgm-rev__timestamp::attr(data-content)').get()
                
                if author and review_rating:
                    reviews_list.append({
                        "author": author.strip(),
                        "rating": float(review_rating),
                        "text": review_text.strip() if review_text else "",
                        "date": review_date
                    })
            except (ValueError, TypeError, AttributeError):
                continue
        
        # Limit to top 10 reviews to avoid excessive data
        if len(reviews_list) > 10:
            reviews_list = reviews_list[:10]
        
        # Add review data to item
        item['rating'] = rating
        item['review_count'] = review_count
        item['reviews'] = reviews_list if reviews_list else None
        
        yield item