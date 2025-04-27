import {newSpecPage} from '@stencil/core/testing';
import {XEmployeeWlApp} from '../x-employee-wl-app';

describe('x-employee-wl-app', () => {

  it('renders editor', async () => {
    const page = await newSpecPage({
      url: `http://localhost/entry/@new`,
      components: [XEmployeeWlApp],
      html: `<x-employee-wl-app base-path="/"></x-employee-wl-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("x-employee-wl-editor");

  });

  it('renders list', async () => {
    const page = await newSpecPage({
      url: `http://localhost/employee-wl/`,
      components: [XEmployeeWlApp],
      html: `<x-employee-wl-app base-path="/employee-wl/"></x-employee-wl-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("x-employee-wl-list");
  });
});
