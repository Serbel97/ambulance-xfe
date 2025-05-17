import {newSpecPage} from '@stencil/core/testing';
import {XHospitalApp} from '../x-hospital-app';

describe('x-hospital-app', () => {

  it('always renders navbar as first child', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/',
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/" api-base="http://localhost/api" hospital-id="hospital-ba"></x-hospital-app>`
    });

    const first = page.root.shadowRoot!.firstElementChild!;
    expect(first.tagName.toLowerCase()).toBe('x-hospital-navbar');
  });

  it('always renders list as second child', async () => {
    const page = await newSpecPage({
      url: 'http://localhost/hospital/',
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/hospital/" api-base="http://localhost/api" hospital-id="hospital-ba"></x-hospital-app>`
    });

    const second = page.root.shadowRoot!.children[1];
    expect(second.tagName.toLowerCase()).toBe('x-hospital-list');
  });
});
