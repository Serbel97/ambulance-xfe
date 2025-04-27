import { newE2EPage } from '@stencil/core/testing';

describe('x-employee-wl-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-employee-wl-editor></x-employee-wl-editor>');

    const element = await page.find('x-employee-wl-editor');
    expect(element).toHaveClass('hydrated');
  });
});
