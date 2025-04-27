import { newE2EPage } from '@stencil/core/testing';

describe('x-employee-wl-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-employee-wl-list></x-employee-wl-list>');

    const element = await page.find('x-employee-wl-list');
    expect(element).toHaveClass('hydrated');
  });
});
