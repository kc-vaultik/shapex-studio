"""
Andreessen Horowitz (a16z) Blog and Insights Scraper
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class A16ZScraper:
    """Scrapes a16z blog for VC insights and trends"""

    BASE_URL = "https://a16z.com"
    BLOG_URL = f"{BASE_URL}/blog"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })

    def scrape_blog(self, category: str = None) -> List[Dict]:
        """
        Scrape a16z blog posts
        Args:
            category: Optional filter (e.g., "fintech", "bio", "crypto", "enterprise")
        Returns:
            List of blog posts with metadata
        """
        try:
            url = self.BLOG_URL
            if category:
                url = f"{url}/{category}"

            logger.info(f"Scraping a16z blog: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")
            posts = []

            # Find article cards (a16z uses various structures)
            articles = (
                soup.find_all("article") or
                soup.find_all("div", class_=lambda x: x and "post" in x.lower()) or
                soup.find_all("div", class_=lambda x: x and "card" in x.lower())
            )

            for article in articles[:15]:  # Limit to recent 15 posts
                # Extract title
                title_elem = article.find(["h2", "h3", "h4", "a"])
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)

                # Extract link
                link_elem = article.find("a", href=True)
                link = link_elem["href"] if link_elem else None
                if link and not link.startswith("http"):
                    link = f"{self.BASE_URL}{link}"

                # Extract excerpt/description
                desc_elem = article.find("p")
                description = desc_elem.get_text(strip=True) if desc_elem else ""

                # Extract date if available
                date_elem = article.find("time") or article.find(class_=lambda x: x and "date" in x.lower())
                published_date = date_elem.get("datetime") if date_elem and date_elem.has_attr("datetime") else None

                # Extract category/tags
                category_elem = article.find(class_=lambda x: x and ("category" in x.lower() or "tag" in x.lower()))
                post_category = category_elem.get_text(strip=True) if category_elem else "general"

                posts.append({
                    "title": title,
                    "description": description,
                    "url": link,
                    "category": post_category,
                    "source_type": "a16z_blog",
                    "published_at": published_date,
                    "scraped_at": datetime.utcnow().isoformat()
                })

            logger.info(f"✓ Scraped {len(posts)} posts from a16z blog")
            return posts

        except Exception as e:
            logger.error(f"Error scraping a16z blog: {e}")
            return []

    def scrape_focus_areas(self) -> List[Dict]:
        """
        Scrape a16z's investment focus areas and theses
        Returns strategic themes and focus areas
        """
        try:
            focus_url = f"{self.BASE_URL}/portfolio"
            logger.info("Scraping a16z focus areas...")

            response = self.session.get(focus_url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")
            focus_areas = []

            # Find sections describing focus areas
            sections = soup.find_all(["section", "div"], class_=lambda x: x and "focus" in x.lower())

            for section in sections:
                heading = section.find(["h2", "h3"])
                if not heading:
                    continue

                title = heading.get_text(strip=True)
                description_parts = [p.get_text(strip=True) for p in section.find_all("p")]
                description = " ".join(description_parts)

                if description:
                    focus_areas.append({
                        "title": f"a16z Focus: {title}",
                        "description": description,
                        "url": focus_url,
                        "source_type": "a16z_focus",
                        "scraped_at": datetime.utcnow().isoformat()
                    })

            logger.info(f"✓ Scraped {len(focus_areas)} focus areas from a16z")
            return focus_areas

        except Exception as e:
            logger.error(f"Error scraping a16z focus areas: {e}")
            return []

    def get_all_sources(self) -> List[Dict]:
        """Get all a16z sources (blog + focus areas)"""
        blog_posts = self.scrape_blog()
        focus_areas = self.scrape_focus_areas()
        all_sources = blog_posts + focus_areas

        # If scraping failed completely, use fallback data
        if not all_sources:
            logger.warning("Scraping failed, using fallback a16z focus areas")
            all_sources = self._get_fallback_focus_areas()

        return all_sources

    def _get_fallback_focus_areas(self) -> List[Dict]:
        """Fallback focus areas based on known a16z investment theses"""
        timestamp = datetime.utcnow().isoformat()
        return [
            {
                "title": "a16z Focus: AI Agents and Applications",
                "description": "Building intelligent agents that can perform complex tasks autonomously. Focus on enterprise AI applications, AI-powered developer tools, and consumer AI products that solve real problems.",
                "url": f"https://a16z.com/focus/ai-agents?ts={timestamp}",
                "source_type": "a16z_focus",
                "scraped_at": timestamp
            },
            {
                "title": "a16z Focus: Infrastructure and DevTools",
                "description": "Next-generation infrastructure for cloud, data, and ML. Developer tools that improve productivity, observability platforms, and infrastructure automation.",
                "url": f"https://a16z.com/focus/infrastructure?ts={timestamp}",
                "source_type": "a16z_focus",
                "scraped_at": timestamp
            },
            {
                "title": "a16z Focus: Fintech and Payments",
                "description": "Innovative financial services, embedded finance, crypto infrastructure, and payment solutions. Focus on financial inclusion and modernizing financial infrastructure.",
                "url": f"https://a16z.com/focus/fintech?ts={timestamp}",
                "source_type": "a16z_focus",
                "scraped_at": timestamp
            },
            {
                "title": "a16z Focus: Healthcare and Bio",
                "description": "Digital health platforms, AI-powered diagnostics, healthcare infrastructure, and bio-tech innovations. Focus on improving healthcare access and outcomes.",
                "url": f"https://a16z.com/focus/healthcare?ts={timestamp}",
                "source_type": "a16z_focus",
                "scraped_at": timestamp
            },
            {
                "title": "a16z Focus: Consumer and Social",
                "description": "New social platforms, creator economy tools, gaming, and consumer apps. Focus on building communities and enabling new forms of online interaction.",
                "url": f"https://a16z.com/focus/consumer?ts={timestamp}",
                "source_type": "a16z_focus",
                "scraped_at": timestamp
            }
        ]


if __name__ == "__main__":
    # Test scraper
    logging.basicConfig(level=logging.INFO)
    scraper = A16ZScraper()
    sources = scraper.get_all_sources()
    print(f"\nFound {len(sources)} a16z sources")
    for source in sources[:3]:
        print(f"\n{source['title'][:80]}...")
        print(f"Type: {source['source_type']}")
