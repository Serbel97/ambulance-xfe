import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'x-ambulance-wl-list',
  styleUrl: 'x-ambulance-wl-list.css',
  shadow: true,
})

export class XAmbulanceWlList {
  waitingPatients: any[];

  private async getWaitingPatientsAsync(){
    return await Promise.resolve(
      [{
        name: 'Jožko Púčik',
        patientId: '10001',
        estimatedStart: new Date(Date.now() + 65 * 60),
        estimatedDurationMinutes: 15,
        condition: 'Kontrola'
      }, {
        name: 'Bc. August Cézar',
        patientId: '10096',
        estimatedStart: new Date(Date.now() + 30 * 60),
        estimatedDurationMinutes: 20,
        condition: 'Teploty'
      }, {
        name: 'Ing. Ferdinand Trety',
        patientId: '10028',
        estimatedStart: new Date(Date.now() + 5 * 60),
        estimatedDurationMinutes: 15,
        condition: 'Bolesti hrdla'
      }]
    );
  }

  async componentWillLoad() {
    this.waitingPatients = await this.getWaitingPatientsAsync();
  }

  render() {
    return (
      <Host>
        <md-list>
          <p>Neda sa svietit!</p>
        </md-list>
      </Host>
    );
  }
}
