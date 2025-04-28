import {newSpecPage} from '@stencil/core/testing';
import {XHospitalApp} from '../x-hospital-app';

describe('x-hospital-app', () => {

  it('renders editor', async () => {
    const page = await newSpecPage({
      url: `http://localhost/entry/@new`,
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/"></x-hospital-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("x-hospital-editor");

  });

  it('renders list', async () => {
    const page = await newSpecPage({
      url: `http://localhost/hospital-wl/`,
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/hospital-wl/"></x-hospital-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("x-hospital-list");
  });
});
