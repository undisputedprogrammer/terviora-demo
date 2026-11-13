const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4173';
const viewports = [
  [1440, 900, 'desktop'], [1900, 960, 'wide'], [1366, 768, 'laptop'],
  [390, 844, 'mobile'], [375, 667, 'short-mobile'], [320, 812, 'narrow'], [768, 1024, 'tablet']
];

function geometry(page) {
  return page.evaluate(() => Object.fromEntries(
    ['.hero-screen', '.hero', '.hero-heading', '.hero-media', '#search', '#featured'].map(selector => {
      const { y, width, height, bottom } = document.querySelector(selector).getBoundingClientRect();
      return [selector, { y, width, height, bottom }];
    })
  ));
}

async function checkComposition(browser) {
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(baseUrl);
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height, name] of viewports) {
    await page.setViewportSize({ width, height });
    const boxes = await geometry(page);
    const hero = boxes['.hero'];
    assert.equal(boxes['.hero-media'].width, width, `${name} full-bleed footage`);
    assert.equal(boxes['.hero-media'].height, hero.height, `${name} footage fills hero`);
    assert(boxes['#search'].y > boxes['.hero-screen'].bottom, `${name} search below the entire hero`);
    assert.equal(boxes['.hero-screen'].height, hero.height, `${name} reduced motion removes pinning`);
    assert(width < 768 ? hero.height < height * .81 : Math.abs(hero.height - height) < 1, `${name} hero height`);
    assert(boxes['.hero-heading'].bottom <= hero.bottom + 1, `${name} copy fits in the hero`);
    assert(await page.locator('.site-header .brand-logo img').evaluate(img => img.complete && img.naturalWidth > 0));
    assert(await page.locator('.hero-copy-opening .hero-description').isVisible(), `${name} supporting copy is visible`);
    assert(!(await page.locator('.hero-copy-followup').isVisible()), `${name} shows the opening message with reduced motion`);
    assert(await page.locator('.hero-cta').evaluate(el => {
      const style = getComputedStyle(el);
      return style.backgroundColor !== style.color && el.getBoundingClientRect().height >= 44;
    }), `${name} hero action has a contrasting background and a usable target`);
    assert.equal(await page.locator('#hero-video').getAttribute('src'), null, `${name} reduced motion avoids downloading video`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} no horizontal overflow`);
  }
  await page.close();
}

async function checkScrubbing(browser, viewport, name) {
  const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.motion-arrival-home .motion-arrival-brand img').waitFor({ state: 'visible' });
  await page.locator('.motion-arrival-home').waitFor({ state: 'detached' });
  await page.locator('#hero-video.has-frame').waitFor();
  await page.evaluate(() => document.fonts.ready);

  const boxes = await geometry(page);
  const travel = name === 'mobile' ? boxes['.hero'].height * .75 :
    boxes['.hero-screen'].height - boxes['.hero'].height;
  assert(travel > 0, `${name} camera has scroll travel`);
  assert(boxes['#search'].y > boxes['.hero-screen'].bottom, `${name} search follows the pinned sequence`);
  assert.match(await page.locator('#hero-video').getAttribute('src'),
    name === 'mobile' ? /-mobile\.mp4$/ : /-scroll\.mp4$/);

  async function seek(progress) {
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), travel * progress);
    await page.waitForFunction(progress => {
      const video = document.querySelector('#hero-video');
      return video.paused && !video.seeking && Math.abs(video.currentTime / video.duration - progress) < .025;
    }, progress);
  }

  const opening = page.locator('.hero-copy-opening');
  const followup = page.locator('.hero-copy-followup');
  const opacity = locator => locator.evaluate(el => Number(getComputedStyle(el).opacity));
  await seek(.55);
  const heroTop = (await geometry(page))['.hero'].y;
  assert(name === 'mobile' ? heroTop < 0 : Math.abs(heroTop) < 1, `${name} scroll treatment`);
  assert.equal(await opacity(opening), 0, `${name} opening message fades out`);
  assert(await followup.isVisible(), `${name} followup is visible`);
  assert.equal(await opacity(followup), 1, `${name} followup fades in`);
  assert(await followup.getByRole('heading').evaluate(el => {
    const { top, bottom } = el.getBoundingClientRect();
    return top >= 0 && bottom <= innerHeight;
  }), `${name} followup heading is on screen`);
  await seek(.15);
  const openingOpacity = await opacity(opening);
  assert(openingOpacity > 0 && openingOpacity < 1, `${name} opening copy reappears on reverse scroll`);
  assert(!(await followup.isVisible()), `${name} followup fades out on reverse scroll`);
  await seek(0);
  await page.waitForFunction(() => !document.querySelector('.hero').classList.contains('hero-copy-faded'));
  await page.locator('.hero-cta').click();
  await page.waitForURL('**/#search');
  await page.waitForFunction(() => {
    const search = document.querySelector('#search').getBoundingClientRect();
    return search.top >= 0 && search.top < innerHeight / 3;
  });
  assert.equal(await page.evaluate(() => document.activeElement.id), 'search', `${name} search receives focus`);
  await page.locator('#tab-rent').click();
  assert.equal(await page.locator('#tab-rent').getAttribute('aria-selected'), 'true');
  await page.locator('#filter-toggle').click();
  assert(await page.locator('#extra-filters').isVisible());
  const expanded = await geometry(page);
  assert(expanded['#search'].bottom <= expanded['#featured'].y, `${name} filters do not cover listings`);
  assert.equal(expanded['.hero-screen'].height, boxes['.hero-screen'].height, `${name} filters preserve hero geometry`);
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  try {
    await checkComposition(browser);
    await checkScrubbing(browser, { width: 1440, height: 900 }, 'desktop');
    await checkScrubbing(browser, { width: 390, height: 844 }, 'mobile');
    console.log('Hero composition passed at seven viewport sizes. Logo intro, forward and reverse scrubbing, and search interactions passed on desktop and mobile.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
