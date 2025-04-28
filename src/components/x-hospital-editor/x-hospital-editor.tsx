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
    await this.getEmployeeEntryAsync();
    this.getRoles();
    this.dataLoading = false;
  }

  private async getEmployeeEntryAsync(): Promise<EmployeeListEntry> {
    if (this.entryId === "@new") {
      this.isValid = false;
      //TODO: create entry
      this.entry = {
        id: "@new",
      };
      return this.entry;
    }
    if (!this.entryId) {
      this.isValid = false;
      return undefined
    }
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      const response = await employeeListApi.getEmployeeListEntryRaw({
        hospitalId: this.hospitalId,
        entryId: this.entryId
      });

      if (response.raw.status < 299) {
        this.entry = await response.value();
        this.isValid = true;
      } else {
        this.errorMessage = `Cannot retrieve list of employees: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of employees: ${err.message || "unknown"}`
    }
    return undefined;
  }

  private async getRoles(): Promise<Role[]> {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const rolesApi = new HospitalRolesApi(configuration);

      const response = await rolesApi.getRolesRaw({hospitalId: this.hospitalId})
      if (response.raw.status < 299) {
        this.roles = await response.value();
      }
    } catch (err: any) {
      // no strong dependency on roles
    }
    // always have some fallback role
    return this.roles || [{
      code: "fallback",
      value: "You did not set employee`s role",
    }];
  }

  render() {
    if (this.errorMessage) {
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
                                      if (this.entry) {
                                        this.entry.name = this.handleInputEvent(ev)
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
                                      onClick={() => this.deleteEntry()}>
                <md-icon slot="icon">delete</md-icon>
                Zmazať
              </md-filled-tonal-button>
              <span class="stretch-fill"></span>
              <md-outlined-button id="cancel" onClick={() => this.editorClosed.emit("cancel")}>
                Zrušiť
              </md-outlined-button>
              <md-filled-button id="confirm" disabled={!this.isValid} onClick={() => this.updateEntry()}>
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
    let roles = this.roles || [];
    // we want to have this.entry`s role in the selection list
    if (this.entry?.role) {
      const index = roles.findIndex(role => role.code === this.entry.role.code)
      if (index < 0) {
        roles = [this.entry.role, ...roles]
      }
    }
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
    if (this.entry) {
      const code = this.handleInputEvent(ev)
      const role = this.roles.find(role => role.code === code);
      this.entry.role = Object.assign({}, role);
    }
  }

  private handleInputEvent(ev: InputEvent): string {
    const target = ev.target as HTMLInputElement;
    // check validity of elements
    this.isValid = true;
    for (let i = 0; i < this.formElement.children.length; i++) {
      const element = this.formElement.children[i]
      if ("reportValidity" in element) {
        const valid = (element as HTMLInputElement).reportValidity();
        this.isValid &&= valid;
      }
    }
    return target.value
  }

  private async updateEntry() {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      const response = this.entryId == "@new" ?
        await employeeListApi.createEmployeeListEntryRaw({hospitalId: this.hospitalId, employeeListEntry: this.entry}) :
        await employeeListApi.updateEmployeeListEntryRaw({
          hospitalId: this.hospitalId,
          entryId: this.entryId,
          employeeListEntry: this.entry
        });
      if (response.raw.status < 299) {
        this.editorClosed.emit("store")
      } else {
        this.errorMessage = `Cannot store entry: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot store entry: ${err.message || "unknown"}`
    }
  }

  private async deleteEntry() {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);

      const response = await employeeListApi.deleteEmployeeListEntryRaw({
        hospitalId: this.hospitalId,
        entryId: this.entryId
      });
      if (response.raw.status < 299) {
        this.editorClosed.emit("delete")
      } else {
        this.errorMessage = `Cannot delete entry: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot delete entry: ${err.message || "unknown"}`
    }
  }
}
