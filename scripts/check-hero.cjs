const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{
const page=await browser.newPage({deviceScaleFactor:1});
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
for(const [width,height,name] of [[1440,1000,'desktop'],[1900,960,'wide'],[1366,768,'laptop'],[390,844,'mobile'],[375,667,'short-mobile'],[320,812,'narrow'],[768,1024,'tablet']]){
await page.setViewportSize({width,height});
await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.hero-image img').decode();window.scrollTo(0,0)});
const boxes=await page.evaluate(()=>Object.fromEntries(['.hero-screen','.hero','.hero-heading','.hero-image','.search-shell','.search-submit'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [s,{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}]})));
if(width<768){
assert(boxes['.hero'].height<height*.8,`${name} compact hero`);
assert(boxes['.search-shell'].y>boxes['.hero'].bottom,`${name} search outside hero`);
}else{
assert(Math.abs(boxes['.hero-screen'].height-height)<1,`${name} screen height`);
assert(Math.abs(boxes['.hero'].height-height)<1,`${name} hero itself fills screen`);
assert(Math.abs(boxes['.hero-image'].height-height)<1,`${name} photo fills hero`);
assert(boxes['.search-shell'].bottom<=height,`${name} search fits`);
assert(boxes['.search-shell'].bottom<=boxes['.hero-image'].bottom,`${name} search completely overlays photo`);
assert(boxes['.search-shell'].y<boxes['.hero'].bottom,`${name} overlap`);
}
assert(boxes['.search-shell'].y>boxes['.hero-heading'].bottom,`${name} search clears heading`);
assert(await page.locator('.site-header .brand-logo img').evaluate(el=>el.complete&&el.naturalWidth>0),'Restored logo loads');
assert(await page.locator('.hero-aside p').isVisible(),`${name} supporting text remains visible`);
assert(await page.locator('.hero-cta').isVisible(),`${name} hero action remains visible`);
assert(await page.locator('.hero-cta').evaluate(el=>{const s=getComputedStyle(el);return s.backgroundColor!==s.color&&el.getBoundingClientRect().height>=44;}),'Hero action has a contrasting background and usable target');
assert.equal(boxes['.hero-image'].width,width,`${name} full bleed`);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflow`);
await page.screenshot({path:`qa/screenshots/${name}-hero.png`});
console.log(name,JSON.stringify(boxes));
}
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
await page.setViewportSize(viewport);
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
await page.locator('.hero-cta').click();
assert.equal(new URL(page.url()).hash,'#search');
await page.locator('#tab-rent').click();
const heroHeight=await page.locator('.hero').evaluate(el=>el.getBoundingClientRect().height);
if(viewport.width>=768)assert.equal(await page.locator('.hero-screen').evaluate(el=>Math.round(el.getBoundingClientRect().height)),viewport.height,'Changing tabs retains one-screen desktop layout');
await page.locator('#filter-toggle').click();
assert(await page.locator('#extra-filters').isVisible(),'Advanced filters open');
assert(await page.evaluate(()=>document.querySelector('.search-shell').getBoundingClientRect().bottom<=document.querySelector('#featured').getBoundingClientRect().top),'Expanded filters do not cover listings');
await page.locator('#filter-toggle').click();
assert.equal(await page.locator('.hero').evaluate(el=>el.getBoundingClientRect().height),heroHeight,'Filter toggles preserve hero height');
if(viewport.width<768)assert(await page.evaluate(()=>document.querySelector('.search-shell').getBoundingClientRect().top>document.querySelector('.hero').getBoundingClientRect().bottom),'Mobile search stays outside hero');
else assert.equal(await page.locator('.hero-screen').evaluate(el=>Math.round(el.getBoundingClientRect().height)),viewport.height,'Closing filters restores one-screen desktop layout');
}
console.log('Hero link, tab switching, and advanced-filter layout passed.');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
