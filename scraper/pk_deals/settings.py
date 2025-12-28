BOT_NAME = "pk_deals"

SPIDER_MODULES = ["pk_deals.spiders"]
NEWSPIDER_MODULE = "pk_deals.spiders"

ROBOTSTXT_OBEY = True
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"

DOWNLOAD_DELAY = 0.5
CONCURRENT_REQUESTS = 8
AUTOTHROTTLE_ENABLED = True

ITEM_PIPELINES = {
    "pk_deals.pipelines.CleanAndComputePipeline": 200,
    "pk_deals.pipelines.MongoPipeline": 500,
}

LOG_LEVEL = "INFO"
FEED_EXPORT_ENCODING = "utf-8"