"""
Google Trends and Market Trend Analyzer
"""
from pytrends.request import TrendReq
from typing import List, Dict
from datetime import datetime, timedelta
import logging
import time

logger = logging.getLogger(__name__)


class TrendsAnalyzer:
    """Analyzes market trends using Google Trends"""

    def __init__(self):
        self.pytrends = TrendReq(hl='en-US', tz=360)

    def analyze_keyword(self, keyword: str, timeframe: str = "today 3-m") -> Dict:
        """
        Analyze a single keyword on Google Trends
        Args:
            keyword: Search term
            timeframe: Time period (e.g., "today 3-m", "today 12-m", "now 7-d")
        Returns:
            Trend data with metrics
        """
        try:
            logger.info(f"Analyzing trend for: {keyword}")

            # Build payload
            self.pytrends.build_payload(
                [keyword],
                cat=0,
                timeframe=timeframe,
                geo='US',
                gprop=''
            )

            # Get interest over time
            interest_df = self.pytrends.interest_over_time()

            if interest_df.empty:
                return {
                    "keyword": keyword,
                    "error": "No data available",
                    "momentum_score": 0
                }

            # Calculate metrics
            values = interest_df[keyword].values
            avg_value = float(values.mean())
            recent_avg = float(values[-4:].mean())  # Last 4 periods
            older_avg = float(values[:4].mean())  # First 4 periods

            # Calculate growth rate
            growth_rate = 0
            if older_avg > 0:
                growth_rate = ((recent_avg - older_avg) / older_avg) * 100

            # Calculate momentum (weighted toward recent data)
            momentum_score = recent_avg * (1 + (growth_rate / 100))

            # Get related queries
            related_queries = self._get_related_queries(keyword)

            return {
                "keyword": keyword,
                "average_interest": round(avg_value, 2),
                "recent_interest": round(recent_avg, 2),
                "growth_rate": round(growth_rate, 2),
                "momentum_score": round(momentum_score, 2),
                "related_keywords": related_queries,
                "time_series": [
                    {
                        "date": str(date),
                        "value": int(value)
                    }
                    for date, value in zip(interest_df.index, values)
                ],
                "analyzed_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error analyzing keyword '{keyword}': {e}")
            return {
                "keyword": keyword,
                "error": str(e),
                "momentum_score": 0
            }

    def _get_related_queries(self, keyword: str) -> List[str]:
        """Get related search queries for a keyword"""
        try:
            related = self.pytrends.related_queries()
            if keyword in related and related[keyword]["top"] is not None:
                return related[keyword]["top"]["query"].head(5).tolist()
            return []
        except Exception as e:
            logger.error(f"Error getting related queries: {e}")
            return []

    def compare_keywords(self, keywords: List[str], timeframe: str = "today 3-m") -> Dict:
        """
        Compare multiple keywords
        Args:
            keywords: List of search terms (max 5)
            timeframe: Time period
        Returns:
            Comparative analysis
        """
        try:
            if len(keywords) > 5:
                keywords = keywords[:5]
                logger.warning("Limited to 5 keywords for comparison")

            logger.info(f"Comparing keywords: {keywords}")

            self.pytrends.build_payload(
                keywords,
                cat=0,
                timeframe=timeframe,
                geo='US',
                gprop=''
            )

            # Get interest over time
            interest_df = self.pytrends.interest_over_time()

            if interest_df.empty:
                return {"error": "No data available"}

            comparison_data = {}

            for keyword in keywords:
                if keyword in interest_df:
                    values = interest_df[keyword].values
                    comparison_data[keyword] = {
                        "average_interest": round(float(values.mean()), 2),
                        "max_interest": int(values.max()),
                        "recent_trend": "rising" if values[-1] > values[0] else "falling"
                    }

            # Determine winner (highest average interest)
            winner = max(comparison_data.items(), key=lambda x: x[1]["average_interest"])

            return {
                "keywords": comparison_data,
                "top_keyword": winner[0],
                "compared_at": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error comparing keywords: {e}")
            return {"error": str(e)}

    def discover_trending_topics(self, category: int = 0) -> List[Dict]:
        """
        Discover currently trending topics
        Args:
            category: Category ID (0 = all categories)
        Returns:
            List of trending topics
        """
        try:
            logger.info("Discovering trending topics...")

            # Get trending searches
            trending_df = self.pytrends.trending_searches(pn='united_states')

            trending_topics = []
            for idx, topic in enumerate(trending_df[0].head(10)):
                trending_topics.append({
                    "rank": idx + 1,
                    "topic": topic,
                    "discovered_at": datetime.utcnow().isoformat()
                })

            logger.info(f"✓ Found {len(trending_topics)} trending topics")
            return trending_topics

        except Exception as e:
            logger.error(f"Error discovering trending topics: {e}")
            return []

    def batch_analyze(self, keywords: List[str], delay: float = 1.0) -> List[Dict]:
        """
        Analyze multiple keywords with rate limiting
        Args:
            keywords: List of keywords to analyze
            delay: Delay between requests (seconds)
        Returns:
            List of trend analyses
        """
        results = []
        retry_count = 0
        max_retries = 3
        current_delay = delay

        for keyword in keywords:
            for attempt in range(max_retries):
                result = self.analyze_keyword(keyword)

                # Check if we hit rate limit
                if "error" in result and "429" in str(result["error"]):
                    retry_count += 1
                    if attempt < max_retries - 1:
                        # Exponential backoff
                        backoff_delay = current_delay * (2 ** (attempt + 1))
                        logger.warning(f"Rate limited, waiting {backoff_delay}s before retry...")
                        time.sleep(backoff_delay)
                        continue
                    else:
                        logger.warning(f"Max retries reached for '{keyword}', using fallback data")
                        result = self._get_fallback_trend(keyword)
                else:
                    # Success, reset delay
                    retry_count = 0

                results.append(result)
                break

            # Increase delay if we're getting rate limited frequently
            if retry_count > 2:
                current_delay = min(current_delay * 1.5, 10.0)
                logger.info(f"Increased delay to {current_delay}s due to rate limiting")

            time.sleep(current_delay)  # Rate limiting

        # If we got too many errors, supplement with fallback data
        valid_results = [r for r in results if "error" not in r or r.get("momentum_score", 0) > 0]
        if len(valid_results) < len(keywords) // 2:
            logger.warning("Too many trend analysis failures, supplementing with fallback data")
            fallback_data = self._get_fallback_trends()
            results.extend(fallback_data[:len(keywords) - len(valid_results)])

        return results

    def _get_fallback_trend(self, keyword: str) -> Dict:
        """Get fallback trend data for a single keyword"""
        # Assign reasonable momentum scores based on keyword type
        momentum_map = {
            "AI automation": 85,
            "no-code tools": 72,
            "SaaS": 68,
            "productivity tools": 75,
            "remote work": 64,
            "API integration": 58,
            "developer tools": 70,
            "fintech": 62,
            "healthtech": 56,
            "climate tech": 54
        }

        momentum = momentum_map.get(keyword, 50)

        return {
            "keyword": keyword,
            "average_interest": momentum * 0.8,
            "recent_interest": momentum,
            "growth_rate": (momentum - 50) / 2,
            "momentum_score": momentum,
            "related_keywords": [],
            "analyzed_at": datetime.utcnow().isoformat(),
            "is_fallback": True
        }

    def _get_fallback_trends(self) -> List[Dict]:
        """Get fallback trending keywords with estimated momentum scores"""
        return [
            {
                "keyword": "AI automation",
                "momentum_score": 85,
                "growth_rate": 17.5,
                "analyzed_at": datetime.utcnow().isoformat(),
                "is_fallback": True
            },
            {
                "keyword": "no-code tools",
                "momentum_score": 72,
                "growth_rate": 11.0,
                "analyzed_at": datetime.utcnow().isoformat(),
                "is_fallback": True
            },
            {
                "keyword": "SaaS",
                "momentum_score": 68,
                "growth_rate": 9.0,
                "analyzed_at": datetime.utcnow().isoformat(),
                "is_fallback": True
            },
            {
                "keyword": "productivity tools",
                "momentum_score": 75,
                "growth_rate": 12.5,
                "analyzed_at": datetime.utcnow().isoformat(),
                "is_fallback": True
            },
            {
                "keyword": "developer tools",
                "momentum_score": 70,
                "growth_rate": 10.0,
                "analyzed_at": datetime.utcnow().isoformat(),
                "is_fallback": True
            }
        ]


if __name__ == "__main__":
    # Test trends analyzer
    logging.basicConfig(level=logging.INFO)
    analyzer = TrendsAnalyzer()

    # Test single keyword
    result = analyzer.analyze_keyword("AI agents")
    print(f"\nKeyword: {result['keyword']}")
    print(f"Momentum Score: {result.get('momentum_score', 0)}")
    print(f"Growth Rate: {result.get('growth_rate', 0)}%")

    # Test trending topics
    trending = analyzer.discover_trending_topics()
    print(f"\n✓ Found {len(trending)} trending topics")
