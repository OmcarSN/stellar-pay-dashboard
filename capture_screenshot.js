import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    
    // Set a good desktop viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to DApp...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait for elements to load, specifically some main content
    await new Promise(r => setTimeout(r, 2000)); // Wait for animations or initial renders
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'public/dapp-screenshot.png', fullPage: false });
    
    await browser.close();
    console.log('Screenshot saved to public/dapp-screenshot.png');
})();
