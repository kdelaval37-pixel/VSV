export async function navigate(page,id){
 const button=page.locator(`#main-navigation [data-nav="${id}"]`);
 if(await page.locator('#main-navigation').evaluate(e=>e.inert))await page.locator('#menu-toggle').click();
 const group=button.locator('..');if(await group.evaluate(e=>e.tagName==='DETAILS'&&!e.open))await group.locator('summary').click();
 await button.click();
}
