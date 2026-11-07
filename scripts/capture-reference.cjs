async function choose(page,selector,value){
 const field=page.locator(selector);
 const label=await field.evaluate((el,v)=>el.options.find(o=>o.value===v).label,value);
 await field.getByRole('combobox').click();
 await field.getByRole('option',{name:label,exact:true}).click();
}
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:962,height:718},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  await page.screenshot({path:'qa/screenshots/reference-hero.png'});
  for(const [selector,name] of [['.search-section','reference-search'],['#how-it-works','reference-process'],['#owners','reference-owner']]){
   await page.locator(selector).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
   await page.screenshot({path:`qa/screenshots/${name}.png`});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('.search-section').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
  await page.screenshot({path:'qa/screenshots/desktop-search.png'});
  await page.locator('#how-it-works').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
  await page.screenshot({path:'qa/screenshots/desktop-process.png'});
  await page.setViewportSize({width:390,height:844});
  await page.locator('.search-section').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
  await page.screenshot({path:'qa/screenshots/mobile-search.png'});
  await choose(page,'#quick-area','3000');await page.locator('.search-submit').click();
  if(await page.locator('#results-grid .property-card').count()!==1)throw new Error('Quick area filter failed');
  console.log('Reference-size screenshots captured. Quick-area filter passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
