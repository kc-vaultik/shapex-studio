/**
 * Automated UI Test - Check what's actually rendering
 */

const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting UI Test...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // Show browser so we can see
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await puppeteer.newPage();

    // Listen to console logs
    page.on('console', msg => {
      console.log(`[Browser Console ${msg.type()}]:`, msg.text());
    });

    // Listen to errors
    page.on('pageerror', error => {
      console.error(`[Browser Error]:`, error.message);
    });

    console.log('📱 Opening http://localhost:3002...\n');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0', timeout: 10000 });

    // Wait a moment for React to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to test-screenshot.png\n');

    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        hasRoot: !!document.getElementById('root'),
        rootContent: document.getElementById('root')?.innerHTML?.substring(0, 500),
        hasShowcase: !!document.querySelector('[class*="LiveAgentShowcase"]') ||
                     document.body.innerText.includes('Watch AI Agents') ||
                     document.body.innerText.includes('Researcher') ||
                     document.body.innerText.includes('Validator') ||
                     document.body.innerText.includes('Strategist'),
        bodyText: document.body.innerText.substring(0, 1000),
        hasModal: !!document.querySelector('[class*="fixed"][class*="inset-0"]'),
        errors: []
      };
    });

    console.log('📊 Page Analysis:');
    console.log('─'.repeat(60));
    console.log('Title:', pageContent.title);
    console.log('Has Root Element:', pageContent.hasRoot);
    console.log('Has Modal:', pageContent.hasModal);
    console.log('Has Showcase:', pageContent.hasShowcase);
    console.log('\nVisible Text (first 500 chars):');
    console.log(pageContent.bodyText.substring(0, 500));
    console.log('─'.repeat(60));

    if (!pageContent.hasShowcase) {
      console.log('\n❌ PROBLEM: LiveAgentShowcase is NOT visible!');
      console.log('\nRoot content:');
      console.log(pageContent.rootContent);
    } else {
      console.log('\n✅ LiveAgentShowcase is visible!');
    }

    // Wait 5 seconds to watch animations
    console.log('\n⏳ Watching for 5 seconds...');
    await page.waitForTimeout(5000);

    // Check again after animations
    const afterWait = await page.evaluate(() => {
      return {
        showcaseVisible: document.body.innerText.includes('Researcher'),
        progressBars: document.querySelectorAll('[role="progressbar"]').length,
        agents: ['Researcher', 'Validator', 'Strategist'].map(name => ({
          name,
          visible: document.body.innerText.includes(name)
        }))
      };
    });

    console.log('\nAfter 5 seconds:');
    console.log('Showcase still visible:', afterWait.showcaseVisible);
    console.log('Agents visible:', afterWait.agents);

    console.log('\n✅ Test complete! Check test-screenshot.png for visual confirmation.');

    // Keep browser open for 10 seconds so you can see it
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
