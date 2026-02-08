"""
Core scanning service that orchestrates data collection and idea generation
"""
import logging
from typing import List, Dict
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.database import Idea, Trend, Source, ScanJob
from app.scrapers.yc_scraper import YCombinatorScraper
from app.scrapers.a16z_scraper import A16ZScraper
from app.scrapers.product_hunt_scraper import ProductHuntScraper
from app.scrapers.trends_analyzer import TrendsAnalyzer
from app.analyzers.idea_generator import IdeaGenerator

logger = logging.getLogger(__name__)


class ShapeXScanner:
    """Main scanner orchestrating all data collection and analysis"""

    def __init__(self, db: Session, config: Dict = None):
        self.db = db
        self.config = config or {}

        # Initialize scrapers
        self.yc_scraper = YCombinatorScraper()
        self.a16z_scraper = A16ZScraper()
        self.ph_scraper = ProductHuntScraper(
            api_key=self.config.get("product_hunt_api_key")
        )
        self.trends_analyzer = TrendsAnalyzer()
        self.idea_generator = IdeaGenerator(
            api_key=self.config.get("anthropic_api_key")
        )

        # Configuration
        self.min_feasibility = float(self.config.get("min_feasibility_score", 6.0))
        self.min_monetization = float(self.config.get("min_monetization_score", 7.0))
        self.ideas_per_scan = int(self.config.get("ideas_per_scan", 10))
        self.max_per_channel = int(self.config.get("max_ideas_per_channel", 5))

    def run_full_scan(self, job_type: str = "manual") -> Dict:
        """
        Run a complete scan: collect data, analyze trends, generate ideas
        Args:
            job_type: "manual", "daily", or "weekly"
        Returns:
            Scan results summary
        """
        logger.info(f"Starting {job_type} scan...")

        # Create scan job
        job = ScanJob(
            job_type=job_type,
            status="running",
            started_at=datetime.utcnow()
        )
        self.db.add(job)
        self.db.commit()

        try:
            # Step 1: Collect data from sources
            logger.info("Step 1: Collecting data from sources...")
            vc_sources = self._collect_vc_sources()
            product_hunt_data = self._collect_product_hunt_data()

            # Step 2: Analyze trends
            logger.info("Step 2: Analyzing market trends...")
            trends = self._analyze_trends()

            # Step 3: Generate strategic ideas
            logger.info("Step 3: Generating strategic ideas...")
            strategic_ideas = self.idea_generator.generate_strategic_ideas(
                vc_sources=vc_sources,
                trends=trends,
                count=self.max_per_channel
            )

            # Step 4: Generate quick-win ideas
            logger.info("Step 4: Generating quick-win ideas...")
            quick_win_ideas = self.idea_generator.generate_quick_win_ideas(
                product_hunt_data=product_hunt_data,
                trends=trends,
                count=self.max_per_channel
            )

            # Step 5: Filter and save ideas
            logger.info("Step 5: Filtering and saving ideas...")
            all_ideas = strategic_ideas + quick_win_ideas
            saved_ideas = self._save_ideas(all_ideas)

            # Update job status
            job.status = "completed"
            job.ideas_generated = len(saved_ideas)
            job.sources_scraped = len(vc_sources) + len(product_hunt_data)
            job.trends_analyzed = len(trends)
            job.completed_at = datetime.utcnow()
            job.duration_seconds = (job.completed_at - job.started_at).total_seconds()
            self.db.commit()

            logger.info(f"✓ Scan completed: {len(saved_ideas)} ideas generated")

            return {
                "success": True,
                "job_id": job.id,
                "ideas_generated": len(saved_ideas),
                "sources_scraped": job.sources_scraped,
                "trends_analyzed": job.trends_analyzed,
                "duration_seconds": job.duration_seconds,
                "top_ideas": [
                    {
                        "id": idea.id,
                        "title": idea.title,
                        "score": idea.overall_score,
                        "channel": idea.channel
                    }
                    for idea in sorted(saved_ideas, key=lambda x: x.overall_score, reverse=True)[:5]
                ]
            }

        except Exception as e:
            logger.error(f"Scan failed: {e}")
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()

            return {
                "success": False,
                "error": str(e)
            }

    def _collect_vc_sources(self) -> List[Dict]:
        """Collect data from YC and A16Z"""
        sources = []

        # YC data
        if self.config.get("enable_yc_scraper", True):
            try:
                yc_sources = self.yc_scraper.get_all_sources()
                sources.extend(yc_sources)
                logger.info(f"✓ Collected {len(yc_sources)} YC sources")
            except Exception as e:
                logger.error(f"YC scraper failed: {e}")

        # A16Z data
        if self.config.get("enable_a16z_scraper", True):
            try:
                a16z_sources = self.a16z_scraper.get_all_sources()
                sources.extend(a16z_sources)
                logger.info(f"✓ Collected {len(a16z_sources)} A16Z sources")
            except Exception as e:
                logger.error(f"A16Z scraper failed: {e}")

        # Save to database
        for source_data in sources:
            source = Source(
                source_type=source_data.get("source_type"),
                title=source_data.get("title"),
                url=source_data.get("url"),
                content=source_data.get("description"),
                scraped_at=datetime.utcnow()
            )
            self.db.add(source)

        self.db.commit()
        return sources

    def _collect_product_hunt_data(self) -> List[Dict]:
        """Collect trending products from Product Hunt"""
        if not self.config.get("enable_product_hunt", True):
            return []

        try:
            products = self.ph_scraper.get_trending_products(limit=20)
            logger.info(f"✓ Collected {len(products)} Product Hunt products")
            return products
        except Exception as e:
            logger.error(f"Product Hunt scraper failed: {e}")
            return []

    def _analyze_trends(self) -> List[Dict]:
        """Analyze market trends using Google Trends"""
        if not self.config.get("enable_google_trends", True):
            return []

        trends = []

        try:
            # Keywords to track (can be expanded or made dynamic)
            keywords = [
                "AI automation",
                "no-code tools",
                "SaaS",
                "productivity tools",
                "remote work",
                "API integration",
                "developer tools",
                "fintech",
                "healthtech",
                "climate tech"
            ]

            # Analyze trends
            trend_results = self.trends_analyzer.batch_analyze(keywords, delay=2.0)

            for trend_data in trend_results:
                if "error" in trend_data:
                    continue

                # Save to database
                trend = Trend(
                    keyword=trend_data["keyword"],
                    source="google_trends",
                    growth_rate=trend_data.get("growth_rate", 0),
                    momentum_score=trend_data.get("momentum_score", 0),
                    related_keywords=trend_data.get("related_keywords", []),
                    time_series_data=trend_data.get("time_series", []),
                    detected_at=datetime.utcnow()
                )
                self.db.add(trend)
                trends.append(trend_data)

            self.db.commit()
            logger.info(f"✓ Analyzed {len(trends)} trends")

        except Exception as e:
            logger.error(f"Trends analysis failed: {e}")

        return trends

    def _save_ideas(self, ideas: List[Dict]) -> List[Idea]:
        """Filter and save generated ideas to database"""
        saved_ideas = []

        logger.info(f"Filtering {len(ideas)} generated ideas (min_feasibility={self.min_feasibility}, min_monetization={self.min_monetization})")

        for idea_data in ideas:
            # Apply filters
            if idea_data["feasibility_score"] < self.min_feasibility:
                logger.info(f"Filtered out (low feasibility {idea_data['feasibility_score']}): {idea_data['title']}")
                continue

            if idea_data["monetization_score"] < self.min_monetization:
                logger.info(f"Filtered out (low monetization {idea_data['monetization_score']}): {idea_data['title']}")
                continue

            # Create Idea object
            idea = Idea(
                title=idea_data["title"],
                description=idea_data["description"],
                category=idea_data["category"],
                channel=idea_data["channel"],
                feasibility_score=idea_data["feasibility_score"],
                market_demand_score=idea_data["market_demand_score"],
                monetization_score=idea_data["monetization_score"],
                competition_score=idea_data["competition_score"],
                risk_score=idea_data["risk_score"],
                overall_score=idea_data["overall_score"],
                target_market=idea_data["target_market"],
                revenue_model=idea_data["revenue_model"],
                estimated_time_to_build=idea_data["estimated_time_to_build"],
                estimated_startup_cost=idea_data["estimated_startup_cost"],
                key_features=idea_data["key_features"],
                competitors=idea_data["competitors"],
                differentiation=idea_data["differentiation"],
                ai_reasoning=idea_data["ai_reasoning"],
                status="new",
                created_at=datetime.utcnow()
            )

            self.db.add(idea)
            saved_ideas.append(idea)

        self.db.commit()
        logger.info(f"✓ Saved {len(saved_ideas)} ideas to database")

        return saved_ideas
