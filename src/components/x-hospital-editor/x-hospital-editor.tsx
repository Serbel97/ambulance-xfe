import {Component, Event, EventEmitter, h, Host, Prop, State} from '@stencil/core';
import {
  Configuration,
  EmployeeListEntry,
  Hospital,
  HospitalEmployeeListApi,
  HospitalRolesApi,
  HospitalsApi,
  PerformanceEntry,
  Role
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
  @State() hospitals: Hospital[];
  @State() view: 'edit' | 'transfer' | 'performance' = 'edit';
  @State() targetHospitalId: string;
  @State() errorMessage: string;
  @State() isValid: boolean;
  @State() dataLoading: boolean = true;
  @State() editingPerformance: PerformanceEntry;
  @State() selectedPerformanceId: string;

  private formElement: HTMLFormElement;

  get isNewEntry() {
    return this.entryId === '@new';
  }

  async componentWillLoad() {
    console.log('x-hospital-editor: componentWillLoad', {
      entryId: this.entryId,
      hospitalId: this.hospitalId,
      apiBase: this.apiBase
    });

    await this.getEmployeeEntryAsync();
    await this.getRoles();
    await this.getHospitals();
    this.targetHospitalId = this.hospitalId;
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

  render() {
    console.log('x-hospital-editor: render', {
      hasError: !!this.errorMessage,
      isLoading: this.dataLoading,
      entryId: this.entryId,
      isValid: this.isValid
    });

    if (this.errorMessage) {
      console.log('x-hospital-editor: render - showing error message', {errorMessage: this.errorMessage});
      return (
        <Host>
          <div class="error">{this.errorMessage}</div>
        </Host>
      )
    }
    if (this.dataLoading) {
      return (<Host>
        <div class="loading">Loading...</div>
      </Host>);
    }
    return (
      <Host>
        {!this.isNewEntry && (
          <div class="editor-menu">
            <button class={this.view === 'edit' ? 'active' : ''} onClick={() => this.view = 'edit'}>
              User data
            </button>
            <button class={this.view === 'transfer' ? 'active' : ''} onClick={() => this.view = 'transfer'}>
              Transfer
            </button>
            <button class={this.view === 'performance' ? 'active' : ''} onClick={() => this.view = 'performance'}>
              Performance details
            </button>
          </div>
        )}
        {this.view === 'edit'
          ? this.renderEdit()
          : this.view === 'transfer'
            ? this.renderTransfer()
            : this.renderPerformance()}
      </Host>
    );
  }

  private async getHospitals() {
    try {
      const cfg = new Configuration({basePath: this.apiBase});
      const hospApi = new HospitalsApi(cfg);
      const resp = await hospApi.getHospitalRaw();
      this.hospitals = await resp.value();
    } catch (err) {
      console.error('Failed to load hospitals', err);
      this.hospitals = [];
    }
  }

  private async transferEntry() {
    try {
      const cfg = new Configuration({basePath: this.apiBase});
      const empApi = new HospitalEmployeeListApi(cfg);
      const body = {targetHospitalId: this.targetHospitalId};
      const resp = await empApi.transferEmployeeListEntryRaw({
        hospitalId: this.hospitalId,
        entryId: this.entryId,
        transferEmployeeListEntryRequest: body
      });
      if (resp.raw.status < 299) {
        this.editorClosed.emit('transfer');
      } else {
        this.errorMessage = `Transfer failed: ${resp.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Transfer error: ${err.message}`;
    }
  }

  private async getEmployeeEntryAsync(): Promise<EmployeeListEntry> {
    console.log('x-hospital-editor: getEmployeeEntryAsync - starting', {entryId: this.entryId});

    if (this.entryId === "@new") {
      console.log('x-hospital-editor: getEmployeeEntryAsync - creating new entry');
      this.isValid = false;
      //TODO: create entry
      this.entry = {
        id: "@new",
        performance: 0,
        performances: []
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
      console.warn('x-hospital-editor: getRoles - exception (non-critical)', {
        message: err.message,
        error: err
      });
    }

    if (!this.roles || this.roles.length === 0) {
      console.log('x-hospital-editor: getRoles - using fallback role');
      this.roles = [{
        code: "fallback",
        value: "You did not set employee`s role",
      }];
    }

    return this.roles;
  }

  private renderEdit() {
    return (
      <div>

        <form ref={el => this.formElement = el}>
          <md-filled-text-field label="Name & Surname"
                                required="" value={this.entry?.name}
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
          {this.renderRoles()}
          <md-filled-text-field label="Performance Rating (0-10)"
                                type="number"
                                min="0"
                                max="10"
                                value={this.entry?.performance !== undefined ? this.entry.performance.toString() : "0"}
                                oninput={(ev: InputEvent) => {
                                  console.log('x-hospital-editor: performance field input event');
                                  if (this.entry) {
                                    const value = this.handleInputEvent(ev);
                                    const numValue = parseInt(value);
                                    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                                      this.entry.performance = numValue;
                                      console.log('x-hospital-editor: performance updated', {
                                        newPerformance: this.entry.performance,
                                        isValid: this.isValid
                                      });
                                    }
                                  }
                                }}>
            <md-icon slot="leading-icon">star</md-icon>
          </md-filled-text-field>
        </form>
        <md-divider></md-divider>
        <div class="actions">
          {!this.isNewEntry && (
            <md-filled-tonal-button
              id="delete"
              onClick={() => this.deleteEntry()}
            >
              <md-icon slot="icon">delete</md-icon>
              Delete
            </md-filled-tonal-button>
          )}
          <span class="stretch-fill"></span>
          <md-outlined-button id="cancel" onClick={() => this.editorClosed.emit("cancel")}>
            Cancel
          </md-outlined-button>
          <md-filled-button
            id="confirm"
            disabled={!this.isValid}
            onClick={() => this.updateEntry()}
          >
            <md-icon slot="icon">save</md-icon>
            {this.isNewEntry ? 'Create' : 'Save'}
          </md-filled-button>
        </div>

        {this.errorMessage && (
          <div class="error">{this.errorMessage}</div>
        )}
      </div>

    )
  }

  private renderTransfer() {
    return (
      <div class="transfer-view">
        <form>
          {this.hospitals.map(x => (
            <label>
              <input type="radio"
                     name="targetHospital"
                     value={x.id}
                     checked={x.id === this.targetHospitalId}
                     onInput={(ev: any) => this.targetHospitalId = ev.target.value}/>
              {x.name}
            </label>
          ))}
        </form>
        <div class="actions">
          <button onClick={() => {
            this.editorClosed.emit('cancel');
          }}>Cancel
          </button>
          <button onClick={() => this.transferEntry()}>Submit</button>
        </div>
        {this.errorMessage && <div class="error">{this.errorMessage}</div>}
      </div>
    );
  }

  private renderPerformance() {
    if (!this.entry.performances) {
      this.entry.performances = [];
    }

    return (
      <div class="performance-view">
        {this.entry.performances.length === 0 ? (
          <div class="empty-performance">
            No performance entries yet. Add one below.
          </div>
        ) : (
          this.entry.performances.map((performance) => (
            <div class="performance-entry">
              <div class="performance-entry-row">
                <div><strong>Activity:</strong> {performance.activityType}</div>
                <div><strong>Patient:</strong> {performance.patientName}</div>
                <div><strong>Date:</strong> {performance.activityDate}</div>
              </div>
              <div>
                <strong>Details:</strong>
                <p>{performance.details}</p>
              </div>
              <div class="performance-actions">
                <button
                  onClick={async () => await this.editPerformance(performance.id)}
                  disabled={this.selectedPerformanceId !== undefined}
                >
                  Edit
                </button>
                <button
                  onClick={async () => await this.deletePerformance(performance.id)}
                  disabled={this.selectedPerformanceId !== undefined}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        {this.renderPerformanceForm()}

        <div class="actions">
          <md-outlined-button id="cancel" onClick={() => this.editorClosed.emit("cancel")}>
            Cancel
          </md-outlined-button>
          <md-filled-button
            id="confirm"
            onClick={() => this.updateEntry(true)}
          >
            <md-icon slot="icon">save</md-icon>
            Save
          </md-filled-button>
        </div>

        {this.errorMessage && <div class="error">{this.errorMessage}</div>}
      </div>
    );
  }

  private renderPerformanceForm() {
    const isEditing = !!this.selectedPerformanceId;
    const emptyPerformance: PerformanceEntry = {
      id: crypto.randomUUID(),
      activityType: 'examination',
      patientName: '',
      activityDate: '',
      details: ''
    };

    const performance = this.editingPerformance || emptyPerformance;
    const detailsLength = performance.details?.length || 0;

    return (
      <div class="performance-entry">
        <h3>{isEditing ? 'Edit Performance Entry' : 'Add New Performance Entry'}</h3>
        <div class="performance-entry-form">
          <div class="performance-entry-row">
            <md-filled-select
              label="Activity Type"
              value={performance.activityType}
              onInput={(ev: InputEvent) => this.handlePerformanceInput(ev, 'activityType')}
            >
              <md-select-option value="examination" selected={performance.activityType === 'examination'}>
                <div slot="headline">Examination</div>
              </md-select-option>
              <md-select-option value="surgery" selected={performance.activityType === 'surgery'}>
                <div slot="headline">Surgery</div>
              </md-select-option>
              <md-select-option value="preoperative consultation" selected={performance.activityType === 'preoperative consultation'}>
                <div slot="headline">Preoperative Consultation</div>
              </md-select-option>
              <md-select-option value="checkup" selected={performance.activityType === 'checkup'}>
                <div slot="headline">Checkup</div>
              </md-select-option>
            </md-filled-select>

            <md-filled-text-field
              label="Patient Name"
              placeholder="Name of patient"
              value={performance.patientName}
              onInput={(ev: InputEvent) => this.handlePerformanceInput(ev, 'patientName')}
            ></md-filled-text-field>

            <md-filled-text-field
              label="Date of Action"
              placeholder="DD/MM/YY"
              value={performance.activityDate}
              onInput={(ev: InputEvent) => this.handlePerformanceInput(ev, 'activityDate')}
            ></md-filled-text-field>
          </div>

          <div>
            <textarea
              class="details-textarea"
              placeholder="Details of operation"
              maxlength="255"
              value={performance.details}
              onInput={(ev: InputEvent) => this.handlePerformanceInput(ev, 'details')}
            ></textarea>
            <div class="char-counter">{detailsLength}/255</div>
          </div>

          <div class="performance-actions">
            {isEditing && (
              <button onClick={() => this.cancelEditPerformance()}>
                Cancel Edit
              </button>
            )}
            <button
              onClick={async () => await this.savePerformance()}
              disabled={!performance.patientName || !performance.activityDate}
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderRoles() {
    console.log('x-hospital-editor: renderRoles - starting', {
      rolesCount: this.roles?.length,
      entryHasRole: !!this.entry?.role
    });

    let roles = this.roles || [];
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
      console.log('x-hospital-editor: handleRole - looking for role with code', {code});
      const role = this.roles.find(role => role.code === code);
      if (role) {
        this.entry.role = Object.assign({}, role);
        console.log('x-hospital-editor: handleRole - role updated', {
          code: role.code,
          value: role.value
        });
      } else {
        console.warn('x-hospital-editor: handleRole - role not found for code', {code});
      }
    } else {
      console.warn('x-hospital-editor: handleRole - entry is null or undefined');
    }
  }

  private handleInputEvent(ev: InputEvent): string {
    console.log('x-hospital-editor: handleInputEvent - input event received');
    const target = ev.target as HTMLInputElement;

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
      entry: this.entry,
      closeEditor: closeEditor
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
        if (closeEditor) {
          console.log('x-hospital-editor: updateEntry - success, emitting editor-closed event');
          this.editorClosed.emit("store");
        } else {
          console.log('x-hospital-editor: updateEntry - success, not closing editor');
        }
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

  
  private handlePerformanceInput(ev: InputEvent, field: keyof PerformanceEntry) {
    const target = ev.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = target.value;

    if (!this.editingPerformance) {
      this.editingPerformance = {
        id: crypto.randomUUID(),
        activityType: 'examination',
        patientName: '',
        activityDate: '',
        details: ''
      };
    }

    this.editingPerformance = {
      ...this.editingPerformance,
      [field]: value
    };
  }

  private async savePerformance() {
    if (!this.entry.performances) {
      this.entry.performances = [];
    }

    if (this.selectedPerformanceId) {
      // Update existing performance
      const index = this.entry.performances.findIndex(p => p.id === this.selectedPerformanceId);
      if (index !== -1 && this.editingPerformance) {
        this.entry.performances[index] = this.editingPerformance;
      }
    } else {
      // Add new performance
      if (this.editingPerformance) {
        this.entry.performances.push(this.editingPerformance);
      }
    }

    // Reset editing state
    this.selectedPerformanceId = undefined;
    this.editingPerformance = undefined;

     // Save changes to the backend without closing the editor
    await this.updateEntry(false);
  }

  private async editPerformance(id: string) {
    if (!this.entry.performances) return;

    const performance = this.entry.performances.find(p => p.id === id);
    if (performance) {
      this.selectedPerformanceId = id;
      this.editingPerformance = { ...performance };

      // Save changes to the backend
      await this.updateEntry();
    }
  }

  private async deletePerformance(id: string) {
    if (!this.entry.performances) return;

    const index = this.entry.performances.findIndex(p => p.id === id);
    if (index !== -1) {
      this.entry.performances.splice(index, 1);
      // Force re-render
      this.entry = { ...this.entry };

      // Save changes to the backend
      await this.updateEntry(false);
    }
  }

  private cancelEditPerformance() {
    this.selectedPerformanceId = undefined;
    this.editingPerformance = undefined;
  }
}
