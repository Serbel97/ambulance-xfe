import { newSpecPage } from '@stencil/core/testing';
import { XAmbulanceWlList } from '../x-ambulance-wl-list';

describe('x-ambulance-wl-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XAmbulanceWlList],
      html: `<x-ambulance-wl-list></x-ambulance-wl-list>`,
    });
    expect(page.root).toEqualHtml(`
      <x-ambulance-wl-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </x-ambulance-wl-list>
    `);
  });
});
