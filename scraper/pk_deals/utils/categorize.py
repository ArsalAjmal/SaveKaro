import re

GENDER_MAP = {
    "men": ["men", "male", "gents", "boys"],
    "women": ["women", "female", "ladies", "girls", "woman", "lady"],
}

TYPE_KEYWORDS = {
    "sweater": ["sweater", "sweat", "cardigan", "pullover"],
    "hoodie": ["hoodie", "hooded"],
    "jacket": ["jacket", "puffer", "bomber", "coat"],
    "t-shirt": ["t-shirt", "tee", "tshirt"],
    "shirt": ["shirt", "button down"],
    "kurta": ["kurta", "kurti", "kameez"],
    "shalwar": ["shalwar", "trouser", "pants"],
    "jeans": ["jeans", "denim"],
    "sweatshirt": ["sweatshirt"],
    "tracksuit": ["tracksuit", "track suit"],
    "dress": ["dress", "maxi", "frock"],
    "suit": ["suit", "2 piece", "3 piece", "unstitched", "stitched"],
}

def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip().lower()

def detect_gender(*texts):
    blob = normalize(" ".join(t for t in texts if t))
    for gender, keys in GENDER_MAP.items():
        if any(k in blob for k in keys):
            return gender
    return None

def detect_type(*texts):
    blob = normalize(" ".join(t for t in texts if t))
    for t, keys in TYPE_KEYWORDS.items():
        if any(k in blob for k in keys):
            return t
    # fallback: try to extract from common patterns
    if "shirt" in blob:
        return "shirt"
    if "suit" in blob:
        return "suit"
    if "dress" in blob:
        return "dress"
    if "kurta" in blob:
        return "kurta"
    if "pant" in blob or "trouser" in blob:
        return "pants"
    if "maxi" in blob:
        return "dress"
    if "frock" in blob:
        return "dress"
    return None