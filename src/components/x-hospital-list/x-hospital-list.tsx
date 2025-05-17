import {Component, Event, EventEmitter, Host, Prop, State, h, Method, Watch} from '@stencil/core';
import {HospitalEmployeeListApi, EmployeeListEntry, Configuration} from '../../api/hospital';

@Component({
  tag: 'x-hospital-list',
  styleUrl: 'x-hospital-list.css',
  shadow: true,
})

export class XHospitalList {
  @Event({eventName: "entry-clicked", composed: true}) entryClicked: EventEmitter<string>;
  @Prop() apiBase: string;
  @Prop() hospitalId!: string;
  @State() errorMessage: string;

  @State() employees: EmployeeListEntry[] = [];

  async componentWillLoad() {
    console.log('x-hospital-list: componentWillLoad', {apiBase: this.apiBase, hospitalId: this.hospitalId});
    return this.getEmployeeAsync();
  }

  @Watch('hospitalId')
  async hospitalChanged(newId: string) {
    console.log('x-hospital-list: hospitalId changed → reloading', {newId});
    console.log('📋 List reloading for hospital', newId);
    this.employees = await this.getEmployeeAsync();
  }

  async componentDidLoad() {
    console.log('x-hospital-list: componentDidLoad', {employeesCount: this.employees?.length});
  }

  async componentDidUpdate() {
    console.log('x-hospital-list: componentDidUpdate', {employeesCount: this.employees?.length});
  }

  private async getEmployeeAsync(): Promise<EmployeeListEntry[]> {
    console.log('x-hospital-list: getEmployeeAsync - starting API request', {
      apiBase: this.apiBase,
      hospitalId: this.hospitalId
    });
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const employeeListApi = new HospitalEmployeeListApi(configuration);
      console.log('x-hospital-list: getEmployeeAsync - sending request');
      const response = await employeeListApi.getEmployeeListEntriesRaw({hospitalId: this.hospitalId})
      console.log('x-hospital-list: getEmployeeAsync - received response', {
        status: response.raw.status,
        statusText: response.raw.statusText
      });

      if (response.raw.status < 299) {
        const data = await response.value();
        console.log('x-hospital-list: getEmployeeAsync - parsed response data', {count: data.length});
        this.employees = data;
        return data;
      } else {
        this.errorMessage = `Cannot retrieve list of employees: ${response.raw.statusText}`;
        console.error('x-hospital-list: getEmployeeAsync - error response', {
          status: response.raw.status,
          statusText: response.raw.statusText
        });
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of employees: ${err.message || "unknown"}`;
      console.error('x-hospital-list: getEmployeeAsync - exception', {message: err.message, error: err});
    }
    this.employees = [];
    return [];
  }

  private handleAddClick = () => {
    console.log('x-hospital-list: Add button clicked');
    try {
      this.entryClicked.emit("@new");
      console.log('x-hospital-list: entryClicked event emitted with @new');
    } catch (err) {
      console.error('x-hospital-list: Error emitting entryClicked event', err);
    }
  }

  private handleEmployeeClick = (employeeId: string) => {
    console.log('x-hospital-list: Employee item clicked', {employeeId});
    try {
      this.entryClicked.emit(employeeId);
      console.log('x-hospital-list: entryClicked event emitted with employeeId', {employeeId});
    } catch (err) {
      console.error('x-hospital-list: Error emitting entryClicked event', err);
    }
  }

  @Method()
  async reload() {
    this.employees = await this.getEmployeeAsync();
  }

  render() {
    console.log('x-hospital-list: render', {
      hasError: !!this.errorMessage,
      employeesCount: this.employees?.length
    });

    return (
      <Host>
        <div class="list-header">
          <h2>List of employees</h2>
          <md-filled-button class="add-button" onclick={this.handleAddClick}>
            <md-icon slot="icon">add</md-icon>
            Add employee
          </md-filled-button>
        </div>

        {this.errorMessage
          ? <div class="error">{this.errorMessage}</div>
          :
          <div class="list-container">
            <md-list>
              {this.employees && this.employees.map((employee) =>
                <md-list-item onClick={() => this.handleEmployeeClick(employee.id)}>

                  <div slot="headline">{employee.name}</div>
                  <md-icon slot="start">person</md-icon>
                  {employee.role &&
                    <div slot="supporting-text">{employee.role.value}</div>
                  }
                </md-list-item>
              )}
            </md-list>
          </div>
        }
      </Host>
    );
  }
}
