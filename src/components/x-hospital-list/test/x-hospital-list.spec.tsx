import {newSpecPage} from '@stencil/core/testing';
import {XHospitalList} from '../x-hospital-list';
import {EmployeeListEntry} from '../../../api/hospital/models';
import fetchMock from 'jest-fetch-mock';

describe('x-hospital-list', () => {
  const sampleEntries: EmployeeListEntry[] = [
    {
      id: "entry-1",
      name: "Juraj Prvý",
    },
    {
      id: "entry-2",
      name: "James Druhý",
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
      components: [XHospitalList],
      html: `<x-hospital-list hospital-id="test-hospital" api-base="http://test/api"></x-hospital-list>`,
    });

    const wlList = page.rootInstance as XHospitalList;
    const expectedPatients = wlList?.employees?.length

    await page.waitForChanges();

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");

    expect(expectedPatients).toEqual(sampleEntries.length);
    expect(items.length).toEqual(expectedPatients);
  });

  it('renders error message on network issues', async () => {
    // Mock the network error
    fetchMock.mockRejectOnce(new Error('Network Error'));

    const page = await newSpecPage({
      components: [XHospitalList],
      html: `<x-hospital-list hospital-id="test-hospital" api-base="http://test/api"></x-hospital-list>`,
    });

    const wlList = page.rootInstance as XHospitalList;
    const expectedPatients = wlList?.employees?.length;

    // Wait for the DOM to update
    await page.waitForChanges();

    // Query the DOM for error message and list items
    const errorMessage = page.root.shadowRoot.querySelectorAll(".error");
    const items = page.root.shadowRoot.querySelectorAll("md-list-item");

    // Assert that the error message is displayed and no patients are listed
    expect(errorMessage.length).toBeGreaterThanOrEqual(1);
    expect(expectedPatients).toEqual(0);
    expect(items.length).toEqual(expectedPatients);
  });

});
