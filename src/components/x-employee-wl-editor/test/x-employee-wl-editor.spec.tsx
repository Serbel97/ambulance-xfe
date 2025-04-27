import { newSpecPage } from '@stencil/core/testing';
import { XEmployeeWlEditor } from '../x-employee-wl-editor';
import fetchMock from 'jest-fetch-mock';
import {Role, EmployeeListEntry} from '../../../api/employee-wl';

describe('x-employee-wl-editor', () => {
  const sampleEntry: EmployeeListEntry = {
    id: "entry-1",
    name: "Juraj Prvý",
    role: {
      value: "Nurse",
      code: "nausea",
    }
  };

  const sampleConditions: Role[] = [
    {
      value: "Doctor",
      code: "subfebrilia",
    },
    {
      value: "Nurse",
      code: "nausea",
    },
  ];

  let delay = async (milliseconds: number) => await new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  it('buttons shall be of different type', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(sampleEntry), {status: 200}],
      [JSON.stringify(sampleConditions), {status: 200}]
    );

    const page = await newSpecPage({
      components: [XEmployeeWlEditor],
      html: `<x-employee-wl-editor entry-id="test-entry" hospital-id="test-employee" api-base="http://sample.test/api"></x-employee-wl-editor>`,
    });

    await delay(300);
    await page.waitForChanges();

    const items: any = await page.root.shadowRoot.querySelectorAll("md-filled-button");
    expect(items.length).toEqual(1);
    // Continue with other assertions...
  });

  it('first text field is patient name', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(sampleEntry), {status: 200}],
      [JSON.stringify(sampleConditions), {status: 200}]
    );

    const page = await newSpecPage({
      components: [XEmployeeWlEditor],
      html: `<x-employee-wl-editor entry-id="test-entry" hospital-id="test-employee" api-base="http://sample.test/api"></x-employee-wl-editor>`,
    });

    await delay(300);
    await page.waitForChanges();

    const items: any = await page.root.shadowRoot.querySelectorAll("md-filled-text-field");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].getAttribute("value")).toEqual(sampleEntry.name);
  });
});
