/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
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
  withModulesManager: (component) => component,
  withHistory: (component) => component,
  historyPush: vi.fn(),
  downloadExport: vi.fn(),
  decodeId: (id) => id,
  coreConfirm: vi.fn(),
  coreAlert: vi.fn(),
  journalize: vi.fn(),
  formatDateFromISO: () => '',
  CLEARED_STATE_FILTER: {},
  // One row per item, each cell from the searcher's formatters.
  Searcher: function Searcher({ items, itemFormatters, rowDisabled }) {
    return (
      <table>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} data-testid={`row-${item.id}`} data-disabled={String(!!rowDisabled(null, item))}>
              {itemFormatters().map((format, i) => <td key={i}>{format(item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock('../actions', () => ({
  fetchIndividuals: vi.fn(),
  deleteIndividual: vi.fn(),
  downloadIndividuals: vi.fn(),
  clearIndividualExport: vi.fn(),
  undoDeleteIndividual: vi.fn(),
}));

vi.mock('./IndividualFilter', () => ({ default: () => null }));

const { IndividualSearcher } = await import('./IndividualSearcher');
const { RIGHT_INDIVIDUAL_DELETE } = await import('../constants');

const ACTIVE = { id: 'ind-1', firstName: 'Ada', lastName: 'L', isDeleted: false };
const DELETED = { id: 'ind-2', firstName: 'Bob', lastName: 'M', isDeleted: true };
const store = createStore((state = {}) => state);

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_INDIVIDUAL_DELETE],
    individuals: [ACTIVE, DELETED],
    isModalEnrollment: false,
    fetchedFieldsFromBfSchema: true,
    fieldsFromBfSchema: [],
    fetchIndividuals: vi.fn(),
    deleteIndividual: vi.fn(),
    undoDeleteIndividual: vi.fn(),
    coreConfirm: vi.fn(),
    coreAlert: vi.fn(),
    journalize: vi.fn(),
    clearConfirm: vi.fn(),
    confirmed: null,
  };
  const ui = (extra) => <Provider store={store}><IndividualSearcher {...props} {...extra} /></Provider>;
  const view = render(ui());
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(ui({ confirmed }));
  return { props, setConfirmed };
};

const click = (icon) => fireEvent.click(screen.getByText(icon).closest('button'));
const confirmOwnDialog = (props) => act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

describe('IndividualSearcher delete and undo', () => {
  it('deletes once and greys the row when its own dialog is confirmed', () => {
    const { props } = renderSearcher();

    click('Delete');
    expect(props.deleteIndividual).not.toHaveBeenCalled();
    confirmOwnDialog(props);

    expect(props.deleteIndividual).toHaveBeenCalledTimes(1);
    expect(props.deleteIndividual.mock.calls[0][0]).toEqual(ACTIVE);
    expect(screen.getByTestId('row-ind-1').dataset.disabled).toBe('true');
  });

  it('does not delete when another dialog in the app is answered "Yes"', () => {
    const { props, setConfirmed } = renderSearcher();

    click('Delete');
    act(() => setConfirmed(true));

    expect(props.deleteIndividual).not.toHaveBeenCalled();
  });

  it('restores once when its own undo dialog is confirmed', () => {
    const { props } = renderSearcher();

    click('Undo');
    expect(props.undoDeleteIndividual).not.toHaveBeenCalled();
    confirmOwnDialog(props);

    expect(props.undoDeleteIndividual).toHaveBeenCalledTimes(1);
    expect(props.undoDeleteIndividual.mock.calls[0][0]).toEqual(DELETED);
    expect(props.deleteIndividual).not.toHaveBeenCalled();
  });

  it('does not restore when another dialog in the app is answered "Yes"', () => {
    const { props, setConfirmed } = renderSearcher();

    click('Undo');
    act(() => setConfirmed(true));

    expect(props.undoDeleteIndividual).not.toHaveBeenCalled();
  });
});
