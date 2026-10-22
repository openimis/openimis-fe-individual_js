/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import {
  describe, expect, it, vi,
} from 'vitest';

vi.mock('@openimis/fe-core', () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  formatMessage: (intl, module, key) => key,
  formatMessageWithValues: (intl, module, key) => key,
  decodeId: (id) => id,
  fetchCustomFilter: vi.fn(() => ({ type: 'FETCH_CUSTOM_FILTER' })),
  coreConfirm: vi.fn(() => ({ type: 'CORE_CONFIRM' })),
}));

vi.mock('../../actions', () => ({
  confirmEnrollment: vi.fn(() => ({ type: 'CONFIRM_ENROLLMENT' })),
  fetchIndividualEnrollmentSummary: vi.fn(() => ({ type: 'FETCH_SUMMARY' })),
  confirmGroupEnrollment: vi.fn(() => ({ type: 'CONFIRM_GROUP_ENROLLMENT' })),
  fetchGroupEnrollmentSummary: vi.fn(() => ({ type: 'FETCH_GROUP_SUMMARY' })),
}));

vi.mock('./AdvancedCriteriaRowValue', () => ({ default: () => null }));
vi.mock('./IndividualPreviewEnrollmentDialog', () => ({ default: () => null }));
vi.mock('./GroupPreviewEnrollmentDialog', () => ({ default: () => null }));

const { coreConfirm } = await import('@openimis/fe-core');
const actions = await import('../../actions');
const { default: AdvancedCriteriaForm } = await import('./AdvancedCriteriaForm');
const { default: AdvancedCriteriaGroupForm } = await import('./AdvancedCriteriaGroupForm');

const FORMS = [
  {
    name: 'AdvancedCriteriaForm',
    Form: AdvancedCriteriaForm,
    enroll: actions.confirmEnrollment,
    summary: actions.fetchIndividualEnrollmentSummary,
    individual: { fetchedEnrollmentSummary: true, enrollmentSummary: { numberOfIndividualsToUpload: '3' } },
  },
  {
    name: 'AdvancedCriteriaGroupForm',
    Form: AdvancedCriteriaGroupForm,
    enroll: actions.confirmGroupEnrollment,
    summary: actions.fetchGroupEnrollmentSummary,
    individual: { fetchedEnrollmentGroupSummary: true, enrollmentGroupSummary: { numberOfGroupsToUpload: '3' } },
  },
];

// `SET_CONFIRMED` stands in for any other dialog in the app being answered.
const coreReducer = (state = { confirmed: null }, action) => (
  action.type === 'SET_CONFIRMED' ? { ...state, confirmed: action.payload } : state);

const renderForm = ({ Form, individual }, { confirmed = null, criteria = null } = {}) => {
  const store = createStore(
    combineReducers({ core: coreReducer, individual: (state = individual) => state }),
    { core: { confirmed } },
  );
  render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <Form
          object={{ id: 'plan-1', name: 'Plan' }}
          objectToSave={{ jsonExt: '{}' }}
          edited={criteria
            ? { status: 'ACTIVE', benefitPlan: { jsonExt: JSON.stringify({ advanced_criteria: { ACTIVE: criteria } }) } }
            : { status: 'ACTIVE' }}
          moduleName="individual"
          objectType="INDIVIDUAL"
          getDefaultAppliedCustomFilters={() => []}
          setAppliedCustomFilters={vi.fn()}
          setAppliedFiltersRowStructure={vi.fn()}
          updateAttributes={vi.fn()}
        />
      </Provider>
    </IntlProvider>,
  );
  return store;
};

const button = (key) => screen.getByText(key).closest('button');

const VALID = {
  field: 'number_of_children', filter: 'lt', type: 'integer', value: '6',
};
const EMPTY = {
  field: '', filter: '', type: '', value: '',
};

describe.each(FORMS)('$name enrolment', (form) => {
  it('does not enrol on mount when a stale "Yes" is already in the store', () => {
    renderForm(form, { confirmed: true });

    expect(form.enroll).not.toHaveBeenCalled();
    expect(button('individual.enrollment.previewEnrollment').disabled).toBe(false);
  });

  it('does not enrol when another dialog in the app is answered "Yes"', () => {
    const store = renderForm(form);

    fireEvent.click(button('individual.enrollment.confirmEnrollment'));
    act(() => { store.dispatch({ type: 'SET_CONFIRMED', payload: true }); });

    expect(form.enroll).not.toHaveBeenCalled();
  });

  it('enrols once and locks the form when its own dialog is confirmed', () => {
    renderForm(form);

    fireEvent.click(button('individual.enrollment.confirmEnrollment'));
    expect(form.enroll).not.toHaveBeenCalled();
    act(() => coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(form.enroll).toHaveBeenCalledTimes(1);
    expect(form.enroll.mock.calls[0][0]).toMatchObject({ benefitPlanId: '"plan-1"', status: '"ACTIVE"' });
    expect(button('individual.enrollment.previewEnrollment').disabled).toBe(true);
    expect(button('individual.enrollment.confirmEnrollment').disabled).toBe(true);
  });

  // OP-3251: an empty row stored with the programme's criteria was sent as "____=",
  // a filter that matches nothing, so the preview and the enrolment selected no one.
  it('previews and enrols with the complete criteria rows only', () => {
    renderForm(form, { criteria: [VALID, EMPTY] });

    fireEvent.click(button('individual.enrollment.previewEnrollment'));
    expect(form.summary).toHaveBeenCalledTimes(1);
    expect(form.summary.mock.calls[0][0]).toContain('customFilters: ["number_of_children__lt__integer=6"]');

    fireEvent.click(button('individual.enrollment.confirmEnrollment'));
    act(() => coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());
    expect(form.enroll.mock.calls[0][0].customFilters).toBe('["number_of_children__lt__integer=6"]');
  });
});
