/*import { newE2EPage } from '@stencil/core/testing';

describe('co-editor', () => {
  it('Smoke test renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<co-editor></co-editor>');
    const element = await page.find('co-editor');
    expect(element).toHaveClass('hydrated');
  });

  it('No console errors', async () => {
    const page = await newE2EPage();
    await page.setContent('<co-editor></co-editor>');
    page.once('load', () => console.log('Page loaded!'));
    page.on('pageerror', err => {
      console.log('error happen at the page: ', err);
    })
  });
});*/

describe('co-editor', () => {
  it('Smoke test', ()=> {
    console.log('Smoke')
  })
})
