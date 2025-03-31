import { newSpecPage } from '@stencil/core/testing';
import { XAmbulanceWlList } from '../x-ambulance-wl-list';

describe('x-ambulance-wl-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XAmbulanceWlList],
      html: `<x-ambulance-wl-list></x-ambulance-wl-list>`,
    });
    const wlList = page.rootInstance as XAmbulanceWlList;
    const expectedPatients = wlList?.waitingPatients?.length

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");
    expect(items.length).toEqual(0);
  });
});
