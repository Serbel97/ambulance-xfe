import {Component, Event, EventEmitter, h, Host, Prop, State} from '@stencil/core';
import {
  HospitalRolesApi,
  HospitalEmployeeListApi,
  Role,
  Configuration,
  EmployeeListEntry
} from '../../api/hospital';

@Component({
  tag: 'x-hospital-editor',
  styleUrl: 'x-hospital-editor.css',
  shadow: true,
})
export class XHospitalEditor {
  @Prop() entryId: string;
  @Prop() hospitalId: string;
  @Prop() apiBase: string;

  @Event({eventName: "editor-closed"}) editorClosed: EventEmitter<string>;

  @State() entry: EmployeeListEntry;
  @State() roles: Role[];
  @State() errorMessage: string;
  @State() isValid: boolean;
  @State() dataLoading: boolean = true; // New state for loading

  private formElement: HTMLFormElement;

  async componentWillLoad() {
    console.log('x-hospital-editor: componentWillLoad', {
      entryId: this.entryId,
      hospitalId: this.hospitalId,
      apiBase: this.apiBase
    });

    await this.getEmployeeEntryAsync();
    await this.getRoles();
    this.dataLoading = false;

    console.log('x-hospital-editor: componentWillLoad completed', {
      entryLoaded: !!this.entry,
      rolesLoaded: this.roles?.length,
      isValid: this.isValid
    });
  }

  componentDidLoad() {
    console.log('x-hospital-editor: componentDidLoad', {
      entryId: this.entryId,
      isValid: this.isValid,
      hasError: !!this.errorMessage
    });
  }

  componentDidUpdate() {
    console.log('x-hospital-editor: componentDidUpdate', {
      entryId: this.entryId,
      isValid: this.isValid,
      hasError: !!this.errorMessage
    });
  }

  private async getEmployeeEntryAsync(): Promise<EmployeeListEntry> {
    console.log('x-hospital-editor: getEmployeeEntryAsync - starting', { entryId: this.entryId });

    if (this.entryId === "@new") {
      console.log('x-hospital-editor: getEmployeeEntryAsync - creating new entry');
      this.isValid = false;
      //TODO: create entry
      this.entry = {
        id: "@new",
      };
      return this.entry;
    }

    if (!this.entryId) {
      console.log('x-hospital-editor: getEmployeeEntryAsync - no entryId provided');
      this.isValid = false;
      return undefined
    }

    try {
      console.log('x-hospital-editor: getEmployeeEntryAsync - fetching entry', {
        apiBase: this.apiBase,
        hospitalId: this.hospitalId,
        entryId: this.entryId
      });

      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      console.log('x-hospital-editor: getEmployeeEntryAsync - sending request');
      const response = await employeeListApi.getEmployeeListEntryRaw({
        hospitalId: this.hospitalId,
        entryId: this.entryId
      });
      console.log('x-hospital-editor: getEmployeeEntryAsync - received response', {
        status: response.raw.status,
        statusText: response.raw.statusText
      });

      if (response.raw.status < 299) {
        this.entry = await response.value();
        this.isValid = true;
        console.log('x-hospital-editor: getEmployeeEntryAsync - entry loaded successfully', {
          entry: this.entry
        });
      } else {
        this.errorMessage = `Cannot retrieve list of employees: ${response.raw.statusText}`;
        console.error('x-hospital-editor: getEmployeeEntryAsync - error response', {
          status: response.raw.status,
          statusText: response.raw.statusText
        });
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of employees: ${err.message || "unknown"}`;
      console.error('x-hospital-editor: getEmployeeEntryAsync - exception', {
        message: err.message,
        error: err
      });
    }
    return undefined;
  }

  private async getRoles(): Promise<Role[]> {
    console.log('x-hospital-editor: getRoles - starting', {
      apiBase: this.apiBase,
      hospitalId: this.hospitalId
    });

    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const rolesApi = new HospitalRolesApi(configuration);

      console.log('x-hospital-editor: getRoles - sending request');
      const response = await rolesApi.getRolesRaw({hospitalId: this.hospitalId});
      console.log('x-hospital-editor: getRoles - received response', {
        status: response.raw.status,
        statusText: response.raw.statusText
      });

      if (response.raw.status < 299) {
        this.roles = await response.value();
        console.log('x-hospital-editor: getRoles - roles loaded successfully', {
          rolesCount: this.roles?.length
        });
      } else {
        console.warn('x-hospital-editor: getRoles - error response', {
          status: response.raw.status,
          statusText: response.raw.statusText
        });
      }
    } catch (err: any) {
      // no strong dependency on roles
      console.warn('x-hospital-editor: getRoles - exception (non-critical)', {
        message: err.message,
        error: err
      });
    }

    // always have some fallback role
    if (!this.roles || this.roles.length === 0) {
      console.log('x-hospital-editor: getRoles - using fallback role');
      this.roles = [{
        code: "fallback",
        value: "You did not set employee`s role",
      }];
    }

    return this.roles;
  }

  render() {
    console.log('x-hospital-editor: render', {
      hasError: !!this.errorMessage,
      isLoading: this.dataLoading,
      entryId: this.entryId,
      isValid: this.isValid
    });

    if (this.errorMessage) {
      console.log('x-hospital-editor: render - showing error message', { errorMessage: this.errorMessage });
      return (
        <Host>
          <div class="error">{this.errorMessage}</div>
        </Host>
      )
    }

    return (
      <Host>
        {this.dataLoading ? (
          <div class="loading">Loading data...</div>
        ) : (
          <div>
            {/* Render the form fields */}
            <form ref={el => this.formElement = el}>
              <md-filled-text-field label="Name & Surname"
                                    required value={this.entry?.name}
                                    oninput={(ev: InputEvent) => {
                                      console.log('x-hospital-editor: name field input event');
                                      if (this.entry) {
                                        this.entry.name = this.handleInputEvent(ev);
                                        console.log('x-hospital-editor: name updated', {
                                          newName: this.entry.name,
                                          isValid: this.isValid
                                        });
                                      }
                                    }}>
                <md-icon slot="leading-icon">person</md-icon>
              </md-filled-text-field>

              {/*<md-filled-text-field label="Registračné číslo pacienta"*/}
              {/*                      required value={this.entry?.patientId}*/}
              {/*                      oninput={(ev: InputEvent) => {*/}
              {/*                        if (this.entry) {*/}
              {/*                          this.entry.patientId = this.handleInputEvent(ev)*/}
              {/*                        }*/}
              {/*                      }}>*/}

              {/*  <md-icon slot="leading-icon">fingerprint</md-icon>*/}
              {/*</md-filled-text-field>*/}

              {/*<md-filled-text-field disabled label="Čakáte od"*/}
              {/*                      value={new Date(this.entry?.employeeSince || Date.now()).toLocaleTimeString()}>*/}
              {/*  <md-icon slot="leading-icon">watch_later</md-icon>*/}
              {/*</md-filled-text-field>*/}
              {/*<md-filled-text-field disabled*/}
              {/*                      value={new Date(this.entry?.estimatedStart || Date.now()).toLocaleTimeString()}>*/}
              {/*  label="Predpokladaný čas vyšetrenia"*/}
              {/*  <md-icon slot="leading-icon">login</md-icon>*/}
              {/*</md-filled-text-field>*/}

              {this.renderRoles()}

            </form>

            {/*<div class="duration-slider">*/}
            {/*  <span class="label">Predpokladaná doba trvania:&nbsp; </span>*/}
            {/*  <span class="label">{this.duration}</span>*/}
            {/*  <span class="label">&nbsp;minút</span>*/}
            {/*  <md-slider*/}
            {/*    min="2" max="45" value={this.entry?.estimatedDurationMinutes || 15} ticks labeled*/}
            {/*    oninput={(ev: InputEvent) => {*/}
            {/*      if (this.entry) {*/}
            {/*        this.entry.estimatedDurationMinutes*/}
            {/*          = Number.parseInt(this.handleInputEvent(ev))*/}
            {/*      }*/}
            {/*      ;*/}
            {/*      this.handleSliderInput(ev)*/}
            {/*    }}></md-slider>*/}
            {/*</div>*/}

            <md-divider></md-divider>
            <div class="actions">
              <md-filled-tonal-button id="delete" disabled={!this.entry || this.entry?.id === "@new"}
                                      onClick={() => {
                                        console.log('x-hospital-editor: Delete button clicked', {
                                          entryId: this.entryId,
                                          isDisabled: !this.entry || this.entry?.id === "@new"
                                        });
                                        this.deleteEntry();
                                      }}>
                <md-icon slot="icon">delete</md-icon>
                Zmazať
              </md-filled-tonal-button>
              <span class="stretch-fill"></span>
              <md-outlined-button id="cancel" onClick={() => {
                console.log('x-hospital-editor: Cancel button clicked');
                try {
                  this.editorClosed.emit("cancel");
                  console.log('x-hospital-editor: editorClosed event emitted with "cancel"');
                } catch (err) {
                  console.error('x-hospital-editor: Error emitting editorClosed event', err);
                }
              }}>
                Zrušiť
              </md-outlined-button>
              <md-filled-button id="confirm" disabled={!this.isValid} onClick={() => {
                console.log('x-hospital-editor: Save button clicked', {
                  isValid: this.isValid,
                  isDisabled: !this.isValid
                });
                this.updateEntry();
              }}>
                <md-icon slot="icon">save</md-icon>
                Uložiť
              </md-filled-button>
            </div>

            {this.errorMessage && (
              <div class="error">{this.errorMessage}</div>
            )}
          </div>
        )}
      </Host>
    );
  }

  private renderRoles() {
    console.log('x-hospital-editor: renderRoles - starting', {
      rolesCount: this.roles?.length,
      entryHasRole: !!this.entry?.role
    });

    let roles = this.roles || [];
    // we want to have this.entry`s role in the selection list
    if (this.entry?.role) {
      const index = roles.findIndex(role => role.code === this.entry.role.code)
      console.log('x-hospital-editor: renderRoles - checking if entry role exists in roles list', {
        roleCode: this.entry.role.code,
        roleExists: index >= 0
      });

      if (index < 0) {
        console.log('x-hospital-editor: renderRoles - adding entry role to roles list');
        roles = [this.entry.role, ...roles]
      }
    }

    console.log('x-hospital-editor: renderRoles - rendering select with roles', {
      finalRolesCount: roles.length,
      selectedRole: this.entry?.role?.code
    });

    return (
      <md-filled-select label="Emplyees position"
                        display-text={this.entry?.role?.value}
                        oninput={(ev: InputEvent) => this.handleRole(ev)}>
        <md-icon slot="leading-icon">sick</md-icon>
        {/*{this.entry?.role?.reference ?*/}
        {/*  <md-icon slot="trailing-icon" class="link"*/}
        {/*           onclick={() => window.open(this.entry.role.reference, "_blank")}>*/}
        {/*    open_in_new*/}
        {/*  </md-icon>*/}
        {/*  : undefined*/}
        {/*}*/}
        {roles.map(role => {
          console.log('x-hospital-editor: renderRoles - rendering role option', {
            code: role.code,
            value: role.value,
            isSelected: role.code === this.entry?.role?.code
          });

          return (
            <md-select-option
              value={role.code}
              selected={role.code === this.entry?.role?.code}>
              <div slot="headline">{role.value}</div>
            </md-select-option>
          )
        })}
      </md-filled-select>
    );
  }

  private handleRole(ev: InputEvent) {
    console.log('x-hospital-editor: handleRole - role selection changed');
    if (this.entry) {
      const code = this.handleInputEvent(ev);
      console.log('x-hospital-editor: handleRole - looking for role with code', { code });
      const role = this.roles.find(role => role.code === code);
      if (role) {
        this.entry.role = Object.assign({}, role);
        console.log('x-hospital-editor: handleRole - role updated', {
          code: role.code,
          value: role.value
        });
      } else {
        console.warn('x-hospital-editor: handleRole - role not found for code', { code });
      }
    } else {
      console.warn('x-hospital-editor: handleRole - entry is null or undefined');
    }
  }

  private handleInputEvent(ev: InputEvent): string {
    console.log('x-hospital-editor: handleInputEvent - input event received');
    const target = ev.target as HTMLInputElement;

    // check validity of elements
    this.isValid = true;
    for (let i = 0; i < this.formElement.children.length; i++) {
      const element = this.formElement.children[i]
      if ("reportValidity" in element) {
        const valid = (element as HTMLInputElement).reportValidity();
        this.isValid &&= valid;
        if (!valid) {
          console.log('x-hospital-editor: handleInputEvent - invalid element found', {
            element: element.tagName,
            index: i
          });
        }
      }
    }

    console.log('x-hospital-editor: handleInputEvent - form validity checked', {
      isValid: this.isValid,
      value: target.value
    });

    return target.value;
  }

  private async updateEntry() {
    console.log('x-hospital-editor: updateEntry - starting', {
      entryId: this.entryId,
      isNew: this.entryId === "@new",
      entry: this.entry
    });

    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      console.log('x-hospital-editor: updateEntry - sending request', {
        isNew: this.entryId === "@new",
        apiBase: this.apiBase,
        hospitalId: this.hospitalId
      });

      const response = this.entryId == "@new" ?
        await employeeListApi.createEmployeeListEntryRaw({
          hospitalId: this.hospitalId,
          employeeListEntry: this.entry
        }) :
        await employeeListApi.updateEmployeeListEntryRaw({
          hospitalId: this.hospitalId,
          entryId: this.entryId,
          employeeListEntry: this.entry
        });

      console.log('x-hospital-editor: updateEntry - received response', {
        status: response.raw.status,
        statusText: response.raw.statusText
      });

      if (response.raw.status < 299) {
        console.log('x-hospital-editor: updateEntry - success, emitting editor-closed event');
        this.editorClosed.emit("store");
      } else {
        this.errorMessage = `Cannot store entry: ${response.raw.statusText}`;
        console.error('x-hospital-editor: updateEntry - error response', {
          status: response.raw.status,
          statusText: response.raw.statusText
        });
      }
    } catch (err: any) {
      this.errorMessage = `Cannot store entry: ${err.message || "unknown"}`;
      console.error('x-hospital-editor: updateEntry - exception', {
        message: err.message,
        error: err
      });
    }
  }

  private async deleteEntry() {
    console.log('x-hospital-editor: deleteEntry - starting', {
      entryId: this.entryId,
      hospitalId: this.hospitalId
    });

    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      console.log('x-hospital-editor: deleteEntry - sending request');
      const response = await employeeListApi.deleteEmployeeListEntryRaw({
        hospitalId: this.hospitalId,
        entryId: this.entryId
      });
      console.log('x-hospital-editor: deleteEntry - received response', {
        status: response.raw.status,
        statusText: response.raw.statusText
      });

      if (response.raw.status < 299) {
        console.log('x-hospital-editor: deleteEntry - success, emitting editor-closed event');
        this.editorClosed.emit("delete");
      } else {
        this.errorMessage = `Cannot delete entry: ${response.raw.statusText}`;
        console.error('x-hospital-editor: deleteEntry - error response', {
          status: response.raw.status,
          statusText: response.raw.statusText
        });
      }
    } catch (err: any) {
      this.errorMessage = `Cannot delete entry: ${err.message || "unknown"}`;
      console.error('x-hospital-editor: deleteEntry - exception', {
        message: err.message,
        error: err
      });
    }
  }
}
