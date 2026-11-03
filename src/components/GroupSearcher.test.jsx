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
  deleteGroup: vi.fn(),
  downloadGroups: vi.fn(),
  fetchGroups: vi.fn(),
  clearGroupExport: vi.fn(),
}));

vi.mock('./GroupFilter', () => ({ default: () => null }));

const { GroupSearcher } = await import('./GroupSearcher');
const { RIGHT_GROUP_DELETE } = await import('../constants');

const GROUP = { id: 'group-1', code: 'G1', head: null, location: null };

const renderSearcher = () => {
  const props = {
    intl: {},
    modulesManager: { getRef: () => null },
    history: {},
    rights: [RIGHT_GROUP_DELETE],
    groups: [GROUP],
    isModalEnrollment: false,
    fetchGroups: vi.fn(),
    deleteGroup: vi.fn(),
    coreConfirm: vi.fn(),
    coreAlert: vi.fn(),
    journalize: vi.fn(),
    clearConfirm: vi.fn(),
    confirmed: null,
  };
  const view = render(<GroupSearcher {...props} />);
  // Stands in for any other dialog in the app being answered.
  const setConfirmed = (confirmed) => view.rerender(<GroupSearcher {...props} confirmed={confirmed} />);
  return { props, setConfirmed };
};

const clickDelete = () => fireEvent.click(screen.getByText('Delete').closest('button'));

describe('GroupSearcher delete', () => {
  it('deletes once and greys the row when its own dialog is confirmed', () => {
    const { props } = renderSearcher();

    clickDelete();
    expect(props.deleteGroup).not.toHaveBeenCalled();
    act(() => props.coreConfirm.mock.calls.at(-1)?.[2]?.onConfirm());

    expect(props.deleteGroup).toHaveBeenCalledTimes(1);
    expect(props.deleteGroup.mock.calls[0][0]).toEqual(GROUP);
    expect(screen.getByTestId('row-group-1').dataset.disabled).toBe('true');
  });

  it('does not delete when another dialog in the app is answered "Yes"', () => {
    const { props, setConfirmed } = renderSearcher();

    clickDelete();
    act(() => setConfirmed(true));

    expect(props.deleteGroup).not.toHaveBeenCalled();
  });
});
