import { newE2EPage } from '@stencil/core/testing';

describe('x-hospital-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-hospital-list></x-hospital-list>');

    const element = await page.find('x-hospital-list');
    expect(element).toHaveClass('hydrated');
  });
});
