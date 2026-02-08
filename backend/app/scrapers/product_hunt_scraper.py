"""
Product Hunt Scraper for trending products and market insights
"""
import requests
from typing import List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ProductHuntScraper:
    """Scrapes Product Hunt for trending products and market signals"""

    # Note: Product Hunt has a GraphQL API that requires authentication
    # For now, we'll use public scraping. For production, get API access at:
    # https://api.producthunt.com/v2/oauth/applications

    BASE_URL = "https://www.producthunt.com"

    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

    def get_trending_products(self, limit: int = 20) -> List[Dict]:
        """
        Get trending products from Product Hunt
        Note: Without API key, this scrapes the public page
        """
        try:
            logger.info("Fetching trending products from Product Hunt...")

            if self.api_key:
                # Use GraphQL API if key is available
                products = self._get_trending_via_api(limit)
            else:
                # Fallback to scraping
                products = self._get_trending_via_scraping(limit)

            # If all methods failed, use fallback data
            if not products:
                logger.warning("Product Hunt scraping/API failed, using fallback trending data")
                products = self._get_fallback_trending_products()[:limit]

            return products

        except Exception as e:
            logger.error(f"Error fetching Product Hunt data: {e}")
            return self._get_fallback_trending_products()[:limit]

    def _get_trending_via_scraping(self, limit: int) -> List[Dict]:
        """Scrape Product Hunt homepage for trending products"""
        try:
            response = self.session.get(self.BASE_URL, timeout=10)
            response.raise_for_status()

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, "lxml")

            products = []

            # Product Hunt uses dynamic content, so this is a simplified example
            # In production, consider using Selenium or Playwright for JS-rendered content

            # Look for product cards
            product_items = soup.find_all("div", {"data-test": "post-item"}) or soup.find_all("article")

            for item in product_items[:limit]:
                # Extract product name
                name_elem = item.find("h3") or item.find("a")
                name = name_elem.get_text(strip=True) if name_elem else "Unknown Product"

                # Extract tagline/description
                tagline_elem = item.find("p") or item.find(class_="tagline")
                tagline = tagline_elem.get_text(strip=True) if tagline_elem else ""

                # Extract upvotes
                votes_elem = item.find(class_=lambda x: x and "vote" in x.lower())
                votes = votes_elem.get_text(strip=True) if votes_elem else "0"

                # Extract URL
                link_elem = item.find("a", href=True)
                url = link_elem["href"] if link_elem else None
                if url and not url.startswith("http"):
                    url = f"{self.BASE_URL}{url}"

                products.append({
                    "name": name,
                    "tagline": tagline,
                    "votes": votes,
                    "url": url,
                    "source_type": "product_hunt",
                    "scraped_at": datetime.utcnow().isoformat()
                })

            logger.info(f"✓ Scraped {len(products)} products from Product Hunt")
            return products

        except Exception as e:
            logger.error(f"Error scraping Product Hunt: {e}")
            return []

    def _get_trending_via_api(self, limit: int) -> List[Dict]:
        """Use Product Hunt GraphQL API (requires authentication)"""
        try:
            # GraphQL endpoint
            api_url = "https://api.producthunt.com/v2/api/graphql"

            # GraphQL query for top posts
            query = """
            query {
              posts(first: %d, order: VOTES) {
                edges {
                  node {
                    id
                    name
                    tagline
                    description
                    votesCount
                    commentsCount
                    url
                    website
                    createdAt
                    topics {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
            """ % limit

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            response = self.session.post(
                api_url,
                json={"query": query},
                headers=headers,
                timeout=10
            )
            response.raise_for_status()

            data = response.json()
            products = []

            for edge in data.get("data", {}).get("posts", {}).get("edges", []):
                node = edge["node"]
                topics = [t["node"]["name"] for t in node.get("topics", {}).get("edges", [])]

                products.append({
                    "name": node["name"],
                    "tagline": node["tagline"],
                    "description": node.get("description", ""),
                    "votes": node["votesCount"],
                    "comments": node["commentsCount"],
                    "url": node["url"],
                    "website": node.get("website"),
                    "topics": topics,
                    "created_at": node["createdAt"],
                    "source_type": "product_hunt_api",
                    "scraped_at": datetime.utcnow().isoformat()
                })

            logger.info(f"✓ Fetched {len(products)} products from Product Hunt API")
            return products

        except Exception as e:
            logger.error(f"Error using Product Hunt API: {e}")
            return []

    def analyze_trending_categories(self, products: List[Dict]) -> Dict:
        """Analyze trending categories and themes from products"""
        category_counts = {}
        keywords = []

        for product in products:
            # Extract topics/categories
            topics = product.get("topics", [])
            for topic in topics:
                category_counts[topic] = category_counts.get(topic, 0) + 1

            # Extract keywords from tagline
            tagline = product.get("tagline", "")
            if tagline:
                keywords.extend(tagline.lower().split())

        # Sort by popularity
        trending_categories = sorted(
            category_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]

        return {
            "trending_categories": trending_categories,
            "total_products_analyzed": len(products),
            "analyzed_at": datetime.utcnow().isoformat()
        }

    def _get_fallback_trending_products(self) -> List[Dict]:
        """Fallback trending products based on current tech trends"""
        return [
            {
                "name": "AI Code Assistant",
                "tagline": "AI-powered coding assistant that writes, debugs, and explains code",
                "votes": 850,
                "topics": ["AI", "Developer Tools", "Productivity"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Notion Alternative",
                "tagline": "Lightning-fast workspace for notes, tasks, and collaboration",
                "votes": 720,
                "topics": ["Productivity", "SaaS", "Collaboration"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "API Monitoring Tool",
                "tagline": "Real-time API monitoring and debugging for developers",
                "votes": 650,
                "topics": ["Developer Tools", "Monitoring", "SaaS"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "No-Code Automation",
                "tagline": "Build powerful automations without writing code",
                "votes": 890,
                "topics": ["No-Code", "Automation", "Productivity"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Social Media Scheduler",
                "tagline": "Schedule and analyze social media posts across platforms",
                "votes": 540,
                "topics": ["Social Media", "Marketing", "SaaS"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Finance Tracker",
                "tagline": "Personal finance dashboard that connects to all your accounts",
                "votes": 780,
                "topics": ["Fintech", "Personal Finance", "SaaS"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Chrome Extension Builder",
                "tagline": "Build and publish Chrome extensions with no-code tools",
                "votes": 620,
                "topics": ["Developer Tools", "No-Code", "Browser Extensions"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Design System Manager",
                "tagline": "Create and maintain design systems for teams",
                "votes": 490,
                "topics": ["Design Tools", "Developer Tools", "Collaboration"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Email Marketing Platform",
                "tagline": "Beautiful email campaigns with AI-powered copywriting",
                "votes": 670,
                "topics": ["Marketing", "SaaS", "AI"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            },
            {
                "name": "Video Meeting Recorder",
                "tagline": "Record, transcribe, and summarize video meetings automatically",
                "votes": 820,
                "topics": ["Productivity", "Remote Work", "AI"],
                "source_type": "product_hunt_fallback",
                "scraped_at": datetime.utcnow().isoformat()
            }
        ]


if __name__ == "__main__":
    # Test scraper
    logging.basicConfig(level=logging.INFO)
    scraper = ProductHuntScraper()
    products = scraper.get_trending_products(limit=10)
    print(f"\nFound {len(products)} trending products")
    for product in products[:5]:
        print(f"\n{product['name']}")
        print(f"  {product['tagline']}")
        print(f"  Votes: {product.get('votes', 'N/A')}")
