import { newE2EPage } from '@stencil/core/testing';

describe('x-hospital-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-hospital-app></x-hospital-app>');

    const element = await page.find('x-hospital-app');
    expect(element).toHaveClass('hydrated');
  });
});
