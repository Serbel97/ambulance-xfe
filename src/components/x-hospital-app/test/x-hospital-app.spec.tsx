import {newSpecPage} from '@stencil/core/testing';
import {XHospitalApp} from '../x-hospital-app';

describe('x-hospital-app', () => {

  it('renders editor in modal when URL has entry/@new', async () => {
    const page = await newSpecPage({
      url: `http://localhost/entry/@new`,
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/"></x-hospital-app>`,
    });
    page.win.navigation = new EventTarget()

    // Simulate clicking on the "Add" button to open the modal
    const app = page.rootInstance;
    app.isModalOpen = true;
    app.modalEntryId = "@new";
    await page.waitForChanges();

    // Check if the modal contains the editor
    const modalContainer = page.root.shadowRoot.querySelector('.modal-container');
    expect(modalContainer).not.toBeNull();

    const editor = modalContainer.querySelector('x-hospital-editor');
    expect(editor).not.toBeNull();
    expect(editor.getAttribute('entry-id')).toEqual('@new');
  });

  it('renders list', async () => {
    const page = await newSpecPage({
      url: `http://localhost/hospital/`,
      components: [XHospitalApp],
      html: `<x-hospital-app base-path="/hospital/"></x-hospital-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual("x-hospital-list");
  });
});
