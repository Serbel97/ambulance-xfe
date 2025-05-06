import {Component, Event, EventEmitter, Host, Prop, State, h} from '@stencil/core';
import {HospitalEmployeeListApi, EmployeeListEntry, Configuration} from '../../api/hospital';

@Component({
  tag: 'x-hospital-list',
  styleUrl: 'x-hospital-list.css',
  shadow: true,
})

export class XHospitalList {
  @Event({eventName: "entry-clicked", composed: true}) entryClicked: EventEmitter<string>;
  @Prop() apiBase: string;
  @Prop() hospitalId: string;
  @State() errorMessage: string;

  employees: EmployeeListEntry[];

  private async getEmployeeAsync(): Promise<EmployeeListEntry[]> {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);
      const response = await employeeListApi.getEmployeeListEntriesRaw({hospitalId: this.hospitalId})
      if (response.raw.status < 299) {
        return await response.value();
      } else {
        this.errorMessage = `Cannot retrieve list of employees: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of employees: ${err.message || "unknown"}`
    }
    return [];
  }

  async componentWillLoad() {
    this.employees = await this.getEmployeeAsync();
  }

  render() {
    return (
      <Host>
        <div class="list-header">
          <h2>List of employees</h2>
          <md-filled-button class="add-button" onclick={() => this.entryClicked.emit("@new")}>
            <md-icon slot="icon">add</md-icon>
            Add employee
          </md-filled-button>
        </div>

        {this.errorMessage
          ? <div class="error">{this.errorMessage}</div>
          :
          <div class="list-container">
            <md-list>
              {this.employees.map((employee) =>
                <md-list-item onClick={() => this.entryClicked.emit(employee.id)}>
                  <div slot="headline">{employee.name}</div>
                  <md-icon slot="start">person</md-icon>
                </md-list-item>
              )}
            </md-list>
          </div>
        }
      </Host>
    );
  }
}
