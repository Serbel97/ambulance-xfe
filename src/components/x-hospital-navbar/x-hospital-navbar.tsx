import {Host, Component, Prop, State, h} from '@stencil/core';
import {HospitalsApi, Hospital, Configuration} from '../../api/hospital';

@Component({
  tag: 'x-hospital-navbar',
  styleUrl: 'x-hospital-navbar.css',
  shadow: true,
})
export class XHospitalNavbar {
  @Prop() apiBase!: string;
  @Prop({mutable: true}) hospitalId!: string;
  @Prop() basePath: string = '/employee-list/';

  @State() hospitalName: string = '';
  @State() hospitals: Hospital[] = [];
  @State() selectedHospitalId: string = '';

  async componentWillLoad() {
    const config = new Configuration({basePath: this.apiBase});
    const api = new HospitalsApi(config);
    try {
      const listResponse = await api.getHospitalRaw();
      if (listResponse.raw.status < 300) {
        this.hospitals = await listResponse.value();

        this.selectedHospitalId = this.hospitalId || window.location.pathname.split('/').filter(Boolean).slice(-2)[0] || '';
        const current = this.hospitals.find(h => h.id === this.selectedHospitalId);
        this.hospitalName = current?.name || this.selectedHospitalId;
      }
    } catch (e) {
      console.error('x-hospital-navbar: failed to load hospitals', e);
    }
  }

  private handleEmployeesClick() {
    window.dispatchEvent(new CustomEvent('view-changed', {detail: 'employees'}));
  }

  private handleClinicsClick() {
    // no action
  }

  private async handleHospitalChange(newId: string) {
    console.log('Navbar → selected hospital', newId);
    this.selectedHospitalId = newId;
    this.hospitalName = this.hospitals.find(h => h.id === newId)?.name ?? newId;

    // push a new URL
    const newPath = `${this.basePath}${encodeURIComponent(newId)}/entries`;
    history.pushState(null, '', newPath);

    // let the app catch it
    window.dispatchEvent(new CustomEvent('hospital-changed', {detail: newId}));
  }


  render() {
    return (
      <Host>
        <nav class="navbar">
          <div class="navbar-brand">{this.hospitalName}</div>
          <div class="navbar-items">
            <md-filled-button onClick={() => this.handleEmployeesClick()}>
              Employees
            </md-filled-button>
            <md-filled-button onClick={() => this.handleClinicsClick()}>
              Clinics
            </md-filled-button>
            <md-filled-select
              label="Hospitals"
              value={this.selectedHospitalId}
              onInput={(ev: InputEvent) => {
                const select = ev.target as HTMLInputElement;
                const newId = select.value;
                this.handleHospitalChange(newId);
              }}
            >
              {this.hospitals.map(x => (
                <md-select-option value={x.id} selected={x.id === this.selectedHospitalId}>
                  <div slot="headline">{x.name}</div>
                </md-select-option>
              ))}
            </md-filled-select>

          </div>
        </nav>
      </Host>
    );
  }
}
