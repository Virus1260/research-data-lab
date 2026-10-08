import os
import re
import json
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup

BASE_DIR = r"e:\git_desktop\research-data-lab\data\lyophilizationcore"
ARTICLES_DIR = os.path.join(BASE_DIR, "articles")
MEDIA_DIR = os.path.join(BASE_DIR, "media")
os.makedirs(ARTICLES_DIR, exist_ok=True)
os.makedirs(MEDIA_DIR, exist_ok=True)

# Load sitemap
sitemap_path = r"e:\git_desktop\research-data-lab\scratch\sitemap_entries.json"
with open(sitemap_path, "r", encoding="utf-8") as f:
    entries = json.load(f)

demo_slugs = {
    "classic-cap-hpeszv", "creative-course-session", "face-serum-gxrcld",
    "group-fitness-class", "handmade-vase-slowpy", "hand-soap-giguos",
    "individual-coaching-session", "intro-language-tutoring-session",
    "set-of-plates-cxlzwx", "sunglasses-iubjnq", "wooden-chair-mopukh",
    "wool-sweater-lortoo", "terms-and-conditions", "privacy-policy",
    "contact-us"
}

target_entries = []
for e in entries:
    slug = e["url"].strip("/").split("/")[-1]
    if slug not in demo_slugs:
        target_entries.append(e)

print(f"Total target freeze-drying technical articles to crawl: {len(target_entries)}")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

downloaded_images = {}  # url -> local_filename
img_counter = 0

def sanitize_filename(name):
    clean = re.sub(r'[\\/*?:"<>|]', "_", name)
    return clean[:80]

def download_media(img_url, base_url):
    global img_counter
    if not img_url:
        return None
    full_url = urllib.parse.urljoin(base_url, img_url)
    if full_url in downloaded_images:
        return downloaded_images[full_url]
    
    # Exclude tiny UI SVGs or standard logos if needed, but grab content diagrams
    try:
        parsed = urllib.parse.urlparse(full_url)
        raw_name = os.path.basename(parsed.path)
        if not raw_name or len(raw_name) > 60 or "." not in raw_name:
            ext = ".png"
            if "webp" in full_url.lower():
                ext = ".webp"
            elif "jpg" in full_url.lower() or "jpeg" in full_url.lower():
                ext = ".jpg"
            img_counter += 1
            local_filename = f"lyo_fig_{img_counter:03d}{ext}"
        else:
            local_filename = sanitize_filename(raw_name)
            
        target_path = os.path.join(MEDIA_DIR, local_filename)
        if not os.path.exists(target_path):
            req = urllib.request.Request(full_url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                if len(data) > 1000:  # skip 1x1 tracking pixels
                    with open(target_path, "wb") as out:
                        out.write(data)
                    downloaded_images[full_url] = local_filename
                    return local_filename
        else:
            downloaded_images[full_url] = local_filename
            return local_filename
    except Exception as e:
        # print(f"Error downloading image {img_url}: {e}")
        pass
    return None

def html_to_clean_markdown(soup, base_url):
    # Extract metadata
    meta_desc = ""
    desc_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if desc_tag and desc_tag.get("content"):
        meta_desc = desc_tag["content"].strip()
        
    og_image = ""
    img_tag = soup.find("meta", attrs={"property": "og:image"})
    if img_tag and img_tag.get("content"):
        og_image = img_tag["content"].strip()

    # Find main article content container if present, or work on body
    # Remove unwanted global chrome: header, nav, footer, script, style
    for junk in soup(["script", "style", "noscript", "svg", "nav", "footer", "form"]):
        junk.extract()

    # Extract all links before removing anything
    links = []
    for a in soup.find_all("a"):
        href = a.get("href")
        text = a.get_text(strip=True)
        if href and not href.startswith("#") and not href.startswith("mailto:") and not href.startswith("tel:"):
            full_href = urllib.parse.urljoin(base_url, href)
            links.append({"text": text, "href": full_href})

    # Images
    images_meta = []
    for im in soup.find_all("img"):
        src = im.get("src")
        alt = im.get("alt", "").strip()
        if src and "logo" not in src.lower() and not src.endswith(".svg"):
            local_name = download_media(src, base_url)
            images_meta.append({"src": src, "local": local_name, "alt": alt})

    # Convert content elements into formatted markdown lines
    # Zyro pages use h1, h2, h3, h4, h5, p, li, blockquote, div
    md_lines = []
    seen_lines = set()
    
    # Find all paragraph and heading elements in document order
    content_elements = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "table"])
    
    skip_phrases = {
        "home", "about us", "knowledge hub", "industry voices", "work with us", "contact us",
        "official@lyophilizationcore.com", "privacy policy", "terms & conditions",
        "all rights reserved", "subscribe to our newsletter"
    }

    for el in content_elements:
        tag = el.name
        text = el.get_text(" ", strip=True)
        if not text:
            continue
        if text.lower() in skip_phrases:
            continue
        if "lyophilization core is a dedicated platform" in text.lower():
            continue

        # Avoid exact duplicate adjacent lines
        if text in seen_lines and len(text) > 40:
            continue
        seen_lines.add(text)

        # Detect heading-like text
        is_numbered_heading = bool(re.match(r"^\d+(\.\d+)*\s+[A-Z]", text))
        
        if tag == "h1":
            md_lines.append(f"# {text}\n")
        elif tag == "h2" or (is_numbered_heading and len(text) < 100):
            md_lines.append(f"\n## {text}\n")
        elif tag in ["h3", "h4", "h5"] or (re.match(r"^[A-Z][A-Za-z0-9\s,\-\(\)]{3,60}:?$", text) and len(text) < 70):
            md_lines.append(f"\n### {text}\n")
        elif tag == "li":
            md_lines.append(f"- {text}")
        elif tag == "table":
            # parse table to markdown table
            rows = el.find_all("tr")
            if rows:
                table_md = []
                for idx, r in enumerate(rows):
                    cells = [c.get_text(" ", strip=True).replace("|", "/") for c in r.find_all(["th", "td"])]
                    if cells:
                        table_md.append("| " + " | ".join(cells) + " |")
                        if idx == 0:
                            table_md.append("| " + " | ".join(["---"] * len(cells)) + " |")
                md_lines.append("\n" + "\n".join(table_md) + "\n")
        else:
            # Paragraph
            # Check for inline bold or link emphasis if wanted
            md_lines.append(f"{text}\n")

    markdown_body = "\n".join(md_lines)
    return meta_desc, og_image, images_meta, links, markdown_body

def crawl_page(entry):
    url = entry["url"]
    slug = url.strip("/").split("/")[-1] or "index"
    lastmod = entry.get("lastmod", "")
    
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[ERROR] Failed {url}: {e}")
        return None

    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title else slug
    title = re.sub(r"\s*\|\s*LYOPHILIZATION CORE.*", "", title).strip()

    meta_desc, og_image, images_meta, links, markdown_body = html_to_clean_markdown(soup, url)

    # Count words
    word_count = len(markdown_body.split())

    # Build markdown file
    md_content = f"""---
title: "{title}"
slug: "{slug}"
url: "{url}"
lastmod: "{lastmod}"
wordCount: {word_count}
metaDescription: "{meta_desc.replace('\"', '\'')}"
ogImage: "{og_image}"
---

# {title}

> **Source**: [{url}]({url})  
> **Last Modified**: {lastmod}  
> **Word Count**: {word_count} words  
> **Domain Focus**: Pharmaceutical Freeze Drying / Lyophilization

## Overview & Summary
{meta_desc if meta_desc else 'No meta description provided.'}

---

## Technical Content

{markdown_body}

---

## Discovered Related Hyperlinks & Backlinks
"""
    for lk in links:
        t = lk["text"]
        h = lk["href"]
        if t and len(t) > 2 and "lyophilizationcore.com" in h:
            md_content += f"- [{t}]({h})\n"

    md_file_path = os.path.join(ARTICLES_DIR, f"{slug}.md")
    with open(md_file_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    return {
        "slug": slug,
        "title": title,
        "url": url,
        "lastmod": lastmod,
        "wordCount": word_count,
        "metaDescription": meta_desc,
        "ogImage": og_image,
        "mediaDownloaded": [im["local"] for im in images_meta if im.get("local")],
        "backlinksCount": len(links),
        "filePath": f"articles/{slug}.md"
    }

def main():
    start_time = time.time()
    print(f"Starting parallel crawl of {len(target_entries)} articles with 6 threads...")
    
    results = []
    with ThreadPoolExecutor(max_workers=6) as executor:
        future_to_entry = {executor.submit(crawl_page, e): e for e in target_entries}
        done_count = 0
        for future in as_completed(future_to_entry):
            done_count += 1
            res = future.result()
            if res:
                results.append(res)
                if done_count % 10 == 0 or done_count == len(target_entries):
                    print(f"Progress: [{done_count}/{len(target_entries)}] - Crawled: {res['slug']} ({res['wordCount']} words)")

    # Save Master Index
    master_index_path = os.path.join(BASE_DIR, "master_site_index.json")
    with open(master_index_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    total_words = sum(r["wordCount"] for r in results)
    total_images = len(downloaded_images)
    elapsed = time.time() - start_time
    print(f"\n[COMPLETE] Successfully crawled {len(results)} articles in {elapsed:.1f}s.")
    print(f"Total Words Extracted: {total_words:,}")
    print(f"Total Media Downloaded: {total_images} files in {MEDIA_DIR}")
    print(f"Master Index: {master_index_path}")

if __name__ == "__main__":
    main()
