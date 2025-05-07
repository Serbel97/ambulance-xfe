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

  componentWillLoad() {
    console.log('x-hospital-app: componentWillLoad', {
      basePath: this.basePath,
      apiBase: this.apiBase,
      hospitalId: this.hospitalId
    });
  }

  componentDidLoad() {
    console.log('x-hospital-app: componentDidLoad');
  }

  componentDidUpdate() {
    console.log('x-hospital-app: componentDidUpdate', {
      isModalOpen: this.isModalOpen,
      modalEntryId: this.modalEntryId
    });
  }

  render() {
    console.log("x-hospital-app: render", {
      isModalOpen: this.isModalOpen,
      modalEntryId: this.modalEntryId,
      apiBase: this.apiBase,
      hospitalId: this.hospitalId
    });

    const handleEntryClicked = (ev: CustomEvent<string>) => {
      console.log('x-hospital-app: handleEntryClicked event received', {
        detail: ev.detail,
        currentModalState: this.isModalOpen
      });

      try {
        // Open modal for both new and existing patients
        this.isModalOpen = true;
        this.modalEntryId = ev.detail;
        console.log('x-hospital-app: Modal state updated', {
          isModalOpen: this.isModalOpen,
          modalEntryId: this.modalEntryId
        });
      } catch (err) {
        console.error('x-hospital-app: Error handling entry clicked event', err);
      }
    };

    const handleEditorClosed = (ev: CustomEvent<string>) => {
      console.log('x-hospital-app: handleEditorClosed event received', {
        detail: ev.detail,
        currentModalState: this.isModalOpen
      });

      try {
        // Close the modal
        this.isModalOpen = false;
        console.log('x-hospital-app: Modal closed');
      } catch (err) {
        console.error('x-hospital-app: Error handling editor closed event', err);
      }
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
