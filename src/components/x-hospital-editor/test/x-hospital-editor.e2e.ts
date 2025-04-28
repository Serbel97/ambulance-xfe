import { newE2EPage } from '@stencil/core/testing';

describe('x-hospital-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<x-hospital-editor></x-hospital-editor>');

    const element = await page.find('x-hospital-editor');
    expect(element).toHaveClass('hydrated');
  });
});
