/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
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
  clearGroupIndividualExport: vi.fn(),
  clearGroupIndividuals: vi.fn(),
  deleteGroupIndividual: vi.fn(),
  downloadGroupIndividuals: vi.fn(),
  fetchGroupIndividuals: vi.fn(),
  updateGroupIndividual: vi.fn(),
}));

vi.mock('./GroupIndividualFilter', () => ({ default: () => null }));
vi.mock('./GroupChangeDialog', () => ({ default: () => null }));
vi.mock('../pickers/GroupIndividualRolePicker', () => ({ default: () => null }));
vi.mock('../pickers/GroupIndividualRecipientTypePicker', () => ({ default: () => null }));

const { GroupIndividualSearcher } = await import('./GroupIndividualSearcher');
const { RIGHT_GROUP_INDIVIDUAL_DELETE } = await import('../constants');

const MEMBER = { id: 'member-1', individual: { id: 'ind-1', firstName: 'Ada', lastName: 'L' } };

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_GROUP_INDIVIDUAL_DELETE],
    groupIndividuals: [MEMBER],
    groupId: 'group-1',
    fetchGroupIndividuals: vi.fn(),
    deleteGroupIndividual: vi.fn(),
    clearGroupIndividuals: vi.fn(),
    coreConfirm: vi.fn(),
    journalize: vi.fn(),
    clearConfirm: vi.fn(),
    confirmed: null,
  };
  const view = render(<GroupIndividualSearcher {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<GroupIndividualSearcher {...props} confirmed={confirmed} />);
  return { props, setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText('Delete').closest('button'));

describe('GroupIndividualSearcher delete', () => {
  it('removes the member once and greys the row when its own dialog is confirmed', () => {
    const { props } = renderSearcher();

    clickDelete();
    expect(props.deleteGroupIndividual).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(props.deleteGroupIndividual).toHaveBeenCalledTimes(1);
    expect(props.deleteGroupIndividual.mock.calls[0][0]).toEqual(MEMBER);
    expect(screen.getByTestId('row-member-1').dataset.disabled).toBe('true');
  });

  it('does not remove the member when another dialog in the app is answered "Yes"', () => {
    const { props, setConfirmed } = renderSearcher();

    clickDelete();
    act(() => setConfirmed(true));

    expect(props.deleteGroupIndividual).not.toHaveBeenCalled();
  });
});
