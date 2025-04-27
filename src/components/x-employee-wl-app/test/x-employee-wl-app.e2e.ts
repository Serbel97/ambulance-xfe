import { newE2EPage } from '@stencil/core/testing';

describe('x-employee-wl-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-employee-wl-app></x-employee-wl-app>');

    const element = await page.find('x-employee-wl-app');
    expect(element).toHaveClass('hydrated');
  });
});
