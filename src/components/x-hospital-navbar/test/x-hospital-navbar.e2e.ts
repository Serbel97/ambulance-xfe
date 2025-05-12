import { newE2EPage } from '@stencil/core/testing';

describe('x-hospital-navbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-hospital-navbar></x-hospital-navbar>');

    const element = await page.find('x-hospital-navbar');
    expect(element).toHaveClass('hydrated');
  });
});
