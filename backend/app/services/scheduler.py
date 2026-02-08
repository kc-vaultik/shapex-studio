"""
Scheduled task manager for ShapeX
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
import os

from app.models.database import SessionLocal
from app.services.scanner import ShapeXScanner

logger = logging.getLogger(__name__)


class ShapeXScheduler:
    """Manages scheduled scans and reports"""

    def __init__(self, config: dict = None):
        self.config = config or {}
        self.scheduler = BackgroundScheduler()
        self.enabled = self.config.get("enable_scheduled_scans", True)

    def start(self):
        """Start the scheduler"""
        if not self.enabled:
            logger.info("Scheduled scans are disabled")
            return

        # Daily scan (default: 9 AM)
        daily_time = self.config.get("daily_scan_time", "09:00")
        hour, minute = map(int, daily_time.split(":"))

        self.scheduler.add_job(
            self._run_daily_scan,
            CronTrigger(hour=hour, minute=minute),
            id="daily_scan",
            name="Daily Scan",
            replace_existing=True
        )

        # Weekly report (default: Friday 5 PM)
        weekly_day = self.config.get("weekly_report_day", "friday")
        weekly_time = self.config.get("weekly_report_time", "17:00")
        hour, minute = map(int, weekly_time.split(":"))

        day_of_week = {
            "monday": 0, "tuesday": 1, "wednesday": 2,
            "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6
        }.get(weekly_day.lower(), 4)

        self.scheduler.add_job(
            self._run_weekly_report,
            CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute),
            id="weekly_report",
            name="Weekly Report",
            replace_existing=True
        )

        self.scheduler.start()
        logger.info(f"✓ Scheduler started - Daily scan at {daily_time}, Weekly report on {weekly_day} at {weekly_time}")

    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("✓ Scheduler stopped")

    def _run_daily_scan(self):
        """Execute daily scan"""
        logger.info("Running scheduled daily scan...")
        db = SessionLocal()

        try:
            scanner = ShapeXScanner(db=db, config=self.config)
            result = scanner.run_full_scan(job_type="daily")

            if result["success"]:
                logger.info(f"✓ Daily scan completed: {result['ideas_generated']} ideas generated")

                # Send notification if enabled
                if self.config.get("enable_telegram", False):
                    self._send_telegram_notification(result, "daily")
            else:
                logger.error(f"Daily scan failed: {result.get('error')}")

        except Exception as e:
            logger.error(f"Error in daily scan: {e}")
        finally:
            db.close()

    def _run_weekly_report(self):
        """Generate and send weekly report"""
        logger.info("Generating weekly report...")
        db = SessionLocal()

        try:
            # Run a full scan
            scanner = ShapeXScanner(db=db, config=self.config)
            result = scanner.run_full_scan(job_type="weekly")

            if result["success"]:
                logger.info(f"✓ Weekly report generated: {result['ideas_generated']} ideas")

                # Send detailed report if enabled
                if self.config.get("enable_telegram", False):
                    self._send_telegram_notification(result, "weekly")
            else:
                logger.error(f"Weekly report failed: {result.get('error')}")

        except Exception as e:
            logger.error(f"Error in weekly report: {e}")
        finally:
            db.close()

    def _send_telegram_notification(self, scan_result: dict, scan_type: str):
        """Send Telegram notification about scan results"""
        try:
            from telegram import Bot
            import asyncio

            bot_token = self.config.get("telegram_bot_token")
            user_id = self.config.get("telegram_user_id")

            if not bot_token or not user_id:
                logger.debug("Telegram credentials not configured")
                return

            bot = Bot(token=bot_token)

            # Format message
            if scan_type == "daily":
                message = self._format_daily_message(scan_result)
            else:
                message = self._format_weekly_message(scan_result)

            # Send message
            asyncio.run(bot.send_message(chat_id=user_id, text=message, parse_mode="Markdown"))
            logger.info("✓ Telegram notification sent")

        except Exception as e:
            logger.error(f"Error sending Telegram notification: {e}")

    def _format_daily_message(self, result: dict) -> str:
        """Format daily scan message for Telegram"""
        message = f"""
🚀 *ShapeX Daily Scan Complete*

📊 *Results:*
• Ideas Generated: {result['ideas_generated']}
• Sources Scraped: {result['sources_scraped']}
• Trends Analyzed: {result['trends_analyzed']}
• Duration: {result['duration_seconds']:.1f}s

🏆 *Top Ideas:*
"""
        for idx, idea in enumerate(result.get('top_ideas', [])[:3], 1):
            message += f"\n{idx}. *{idea['title']}* "
            message += f"(Score: {idea['score']:.1f}/10, {idea['channel']})"

        message += "\n\n💡 View all ideas on the ShapeX dashboard"
        return message

    def _format_weekly_message(self, result: dict) -> str:
        """Format weekly report message for Telegram"""
        message = f"""
📈 *ShapeX Weekly Report*

This week's scan discovered {result['ideas_generated']} new startup opportunities!

🏆 *Top 5 Ideas:*
"""
        for idx, idea in enumerate(result.get('top_ideas', [])[:5], 1):
            message += f"\n{idx}. *{idea['title']}*"
            message += f"\n   Score: {idea['score']:.1f}/10 | {idea['channel']}"

        message += f"""

📊 *This Week's Stats:*
• Sources Analyzed: {result['sources_scraped']}
• Market Trends: {result['trends_analyzed']}
• Processing Time: {result['duration_seconds']:.1f}s

🔍 Review detailed insights on the ShapeX dashboard
"""
        return message

    def get_scheduled_jobs(self):
        """Get list of scheduled jobs"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None
            })
        return jobs


if __name__ == "__main__":
    # Test scheduler
    logging.basicConfig(level=logging.INFO)

    config = {
        "enable_scheduled_scans": True,
        "daily_scan_time": "09:00",
        "weekly_report_day": "friday",
        "weekly_report_time": "17:00"
    }

    scheduler = ShapeXScheduler(config=config)
    scheduler.start()

    print("\n✓ Scheduler started")
    print("\nScheduled jobs:")
    for job in scheduler.get_scheduled_jobs():
        print(f"  - {job['name']}: {job['next_run']}")

    input("\nPress Enter to stop scheduler...")
    scheduler.stop()
