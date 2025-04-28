import { newE2EPage } from '@stencil/core/testing';

describe('x-ambulance-wl-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-ambulance-wl-list></x-ambulance-wl-list>');

    const element = await page.find('x-ambulance-wl-list');
    expect(element).toHaveClass('hydrated');
  });
});
