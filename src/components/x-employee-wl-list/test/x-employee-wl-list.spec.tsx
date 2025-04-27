import {newSpecPage} from '@stencil/core/testing';
import {XEmployeeWlList} from '../x-employee-wl-list';
import {EmployeeListEntry} from '../../../api/employee-wl/models';
import fetchMock from 'jest-fetch-mock';

describe('x-employee-wl-list', () => {
  const sampleEntries: EmployeeListEntry[] = [
    {
      id: "entry-1",
      name: "Juraj Prvý",
      // patientId: "p-1",
      // waitingSince: new Date("20240203T12:00"),
      // estimatedDurationMinutes: 20
    },
    {
      id: "entry-2",
      name: "James Druhý",
      // patientId: "p-2",
      // waitingSince: new Date("20240203T12:00"),
      // estimatedDurationMinutes: 5
    }
  ];

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  it('renders sample entries', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleEntries));
    const page = await newSpecPage({
      components: [XEmployeeWlList],
      html: `<x-employee-wl-list hospital-id="test-employee" api-base="http://test/api"></x-employee-wl-list>`,
    });

    const wlList = page.rootInstance as XEmployeeWlList;
    const expectedEmployees = wlList?.employees?.length

    await page.waitForChanges();

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");

    expect(expectedEmployees).toEqual(sampleEntries.length);
    expect(items.length).toEqual(expectedEmployees);
  });

  it('renders error message on network issues', async () => {
    // Mock the network error
    fetchMock.mockRejectOnce(new Error('Network Error'));

    const page = await newSpecPage({
      components: [XEmployeeWlList],
      html: `<x-employee-wl-list employee-id="test-employee" api-base="http://test/api"></x-employee-wl-list>`,
    });

    const wlList = page.rootInstance as XEmployeeWlList;
    const expectedEmployees = wlList?.employees?.length;

    // Wait for the DOM to update
    await page.waitForChanges();

    // Query the DOM for error message and list items
    const errorMessage = page.root.shadowRoot.querySelectorAll(".error");
    const items = page.root.shadowRoot.querySelectorAll("md-list-item");

    // Assert that the error message is displayed and no patients are listed
    expect(errorMessage.length).toBeGreaterThanOrEqual(1);
    expect(expectedEmployees).toEqual(0);
    expect(items.length).toEqual(expectedEmployees);
  });
});
