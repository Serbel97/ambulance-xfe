import {Component, Event, EventEmitter, Host, Prop, State, h} from '@stencil/core';
import {HospitalEmployeeListApi, EmployeeListEntry, Configuration} from '../../api/hospital';

@Component({
  tag: 'x-hospital-list',
  styleUrl: 'x-hospital-list.css',
  shadow: true,
})

export class XHospitalList {
  @Event({eventName: "entry-clicked"}) entryClicked: EventEmitter<string>;
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
        {this.errorMessage
          ? <div class="error">{this.errorMessage}</div>
          :
          <md-list>
            {this.employees.map((patient) =>
              <md-list-item onClick={() => this.entryClicked.emit(patient.id)}>
                <div slot="headline">{patient.name}</div>
                <md-icon slot="start">person</md-icon>
              </md-list-item>
            )}
          </md-list>
        }
        <md-filled-icon-button className="add-button" onclick={() => this.entryClicked.emit("@new")}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}
