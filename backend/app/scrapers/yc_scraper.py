"""
YCombinator RFS (Requests for Startups) Scraper
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class YCombinatorScraper:
    """Scrapes YC RFS and startup ideas"""

    BASE_URL = "https://www.ycombinator.com"
    RFS_URL = f"{BASE_URL}/rfs"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

    def scrape_rfs(self) -> List[Dict]:
        """
        Scrape YC Requests for Startups page
        Returns list of RFS items with title, description, url
        """
        try:
            logger.info("Scraping YC RFS page...")
            response = self.session.get(self.RFS_URL, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")
            rfs_items = []

            # YC RFS structure: look for main content sections
            # Note: Actual HTML structure may vary, adjust selectors as needed
            content_sections = soup.find_all(["h2", "h3"])

            for section in content_sections:
                # Extract title
                title = section.get_text(strip=True)
                if not title or len(title) < 10:
                    continue

                # Extract description (next siblings until next heading)
                description_parts = []
                for sibling in section.find_next_siblings():
                    if sibling.name in ["h2", "h3", "h4"]:
                        break
                    if sibling.name == "p":
                        description_parts.append(sibling.get_text(strip=True))

                description = " ".join(description_parts)

                if description:
                    rfs_items.append({
                        "title": title,
                        "description": description,
                        "url": self.RFS_URL,
                        "source_type": "yc_rfs",
                        "scraped_at": datetime.utcnow().isoformat()
                    })

            logger.info(f"✓ Scraped {len(rfs_items)} RFS items from YC")
            return rfs_items

        except Exception as e:
            logger.error(f"Error scraping YC RFS: {e}")
            return []

    def scrape_ycombinator_blog(self) -> List[Dict]:
        """
        Scrape YC blog for insights and trends
        Returns list of blog posts
        """
        try:
            blog_url = "https://www.ycombinator.com/blog"
            logger.info("Scraping YC blog...")

            response = self.session.get(blog_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")
            blog_posts = []

            # Find blog post links (structure may vary)
            articles = soup.find_all("article") or soup.find_all("div", class_="post")

            for article in articles[:10]:  # Limit to recent 10 posts
                title_elem = article.find(["h2", "h3", "a"])
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                link = title_elem.get("href") if title_elem.name == "a" else None

                # Get description/excerpt
                desc_elem = article.find("p")
                description = desc_elem.get_text(strip=True) if desc_elem else ""

                if link and not link.startswith("http"):
                    link = f"{self.BASE_URL}{link}"

                blog_posts.append({
                    "title": title,
                    "description": description,
                    "url": link,
                    "source_type": "yc_blog",
                    "scraped_at": datetime.utcnow().isoformat()
                })

            logger.info(f"✓ Scraped {len(blog_posts)} blog posts from YC")
            return blog_posts

        except Exception as e:
            logger.error(f"Error scraping YC blog: {e}")
            return []

    def get_all_sources(self) -> List[Dict]:
        """Get all YC sources (RFS + blog)"""
        rfs_items = self.scrape_rfs()
        blog_posts = self.scrape_ycombinator_blog()
        return rfs_items + blog_posts


if __name__ == "__main__":
    # Test scraper
    logging.basicConfig(level=logging.INFO)
    scraper = YCombinatorScraper()
    sources = scraper.get_all_sources()
    print(f"\nFound {len(sources)} YC sources")
    for source in sources[:3]:
        print(f"\n{source['title'][:80]}...")
        print(f"Type: {source['source_type']}")
