import {Component, Host, Prop, State, h} from '@stencil/core';

declare global {
  interface Window {
    navigation: any;
  }
}

@Component({
  tag: 'x-hospital-app',
  styleUrl: 'x-hospital-app.css',
  shadow: true,
})

export class XHospitalApp {
  @State() private isModalOpen = false;
  @State() private modalEntryId = "@new";
  @Prop() basePath: string = "";
  @Prop() apiBase: string;
  @Prop() hospitalId: string;

  render() {
    console.debug("x-hospital-app.render()");

    const handleEntryClicked = (ev: CustomEvent<string>) => {
      // Open modal for both new and existing patients
      this.isModalOpen = true;
      this.modalEntryId = ev.detail;
    };

    const handleEditorClosed = (source: string) => {
      // Close the modal
      this.isModalOpen = false;
    };

    return (
      <Host>
        <x-hospital-list hospital-id={this.hospitalId} api-base={this.apiBase} onentry-clicked={handleEntryClicked}>
        </x-hospital-list>

        {this.isModalOpen && (
          <div class="modal-overlay" onClick={() => this.isModalOpen = false}>
            <div class="modal-container" onClick={(e) => e.stopPropagation()}>
              <x-hospital-editor entry-id={this.modalEntryId}
                hospital-id={this.hospitalId} api-base={this.apiBase}
                oneditor-closed={handleEditorClosed}>
              </x-hospital-editor>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
