const puppeteer = require('puppeteer');

async function scrapeHomepage(url) {
    // Ensure URL has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        throw new Error('Invalid URL provided');
    }

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.split(/\s+/).slice(0, 500).join(' ');
    });
    await browser.close();
    return content;
}

module.exports = { scrapeHomepage }; 