import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { IndividualsUploadHistoryDialog } from './IndividualsHistoryUploadDialog';
import { UPLOAD_POLL_INTERVAL_MS } from '../../constants';

vi.mock('@openimis/fe-core', () => ({
  formatMessage: (intl, module, key) => key,
  formatDateTimeFromISO: (mm, intl, date) => date,
  ProgressOrError: ({ progress, error }) => (
    <tr><td>{progress ? 'loading' : error?.message ?? ''}</td></tr>
  ),
  withModulesManager: (component) => component,
}));
vi.mock('../CollapsableErrorList', () => ({ default: () => null }));
vi.mock('../UploadProgress', () => ({ default: () => null }));
vi.mock('../../actions', () => ({ fetchUploadHistory: vi.fn() }));
vi.mock('../../utils', () => ({ downloadIndividualUploadFile: vi.fn(), downloadInvalidItems: vi.fn() }));

const row = (id, status, dateCreated = `2026-10-2${id}T10:00:00`) => ({
  id,
  workflow: 'Python Pipeline Import Individuals',
  userCreated: { username: 'admin' },
  dataUpload: { uuid: `u${id}`, dateCreated, sourceType: 'csv', sourceName: `file${id}.csv`, status, error: {} },
});

const idle = { history: [], fetchedHistory: false, fetchingHistory: false, errorHistory: null };

describe('IndividualsUploadHistoryDialog polling', () => {
  let fetchUploadHistory;
  let utils;
  let props;

  const update = (changes) => {
    props = { ...props, ...changes };
    act(() => utils.rerender(<IndividualsUploadHistoryDialog {...props} />));
  };
  // The reducer empties the list on every request, then fills it on success.
  const respond = (history) => {
    update({ ...idle, fetchingHistory: true });
    update({ ...idle, history, fetchedHistory: true });
  };
  const fail = (message) => {
    update({ ...idle, fetchingHistory: true });
    update({ ...idle, errorHistory: { message } });
  };
  const tick = () => act(() => { vi.advanceTimersByTime(UPLOAD_POLL_INTERVAL_MS); });

  beforeEach(() => {
    vi.useFakeTimers();
    fetchUploadHistory = vi.fn();
    props = { intl: {}, modulesManager: {}, fetchUploadHistory, ...idle };
    utils = render(<IndividualsUploadHistoryDialog {...props} />);
    fireEvent.click(screen.getByText('individual.upload.uploadHistoryTable.buttonLabel'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('polls while an upload is running', () => {
    expect(fetchUploadHistory).toHaveBeenCalledTimes(1);
    respond([row(2, 'IN_PROGRESS'), row(1, 'SUCCESS')]);

    tick();

    expect(fetchUploadHistory).toHaveBeenCalledTimes(2);
  });

  it('stops polling once every upload reached a final state', () => {
    respond([row(2, 'IN_PROGRESS'), row(1, 'SUCCESS')]);
    tick();
    respond([row(2, 'SUCCESS'), row(1, 'SUCCESS')]);

    tick();
    tick();

    expect(fetchUploadHistory).toHaveBeenCalledTimes(2);
  });

  it('keeps the rows on screen while a refresh is in flight', () => {
    respond([row(2, 'IN_PROGRESS')]);
    tick();

    update({ ...idle, fetchingHistory: true });

    expect(screen.getByText('file2.csv')).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });

  it('keeps polling after a failed refresh', () => {
    respond([row(2, 'IN_PROGRESS')]);
    tick();
    fail('Bad Gateway');

    tick();

    expect(fetchUploadHistory).toHaveBeenCalledTimes(3);
  });

  it('shows the error of a failed refresh next to the last rows', () => {
    respond([row(2, 'IN_PROGRESS')]);
    tick();

    fail('Bad Gateway');

    expect(screen.getByText('Bad Gateway')).toBeInTheDocument();
    expect(screen.getByText('file2.csv')).toBeInTheDocument();
  });

  it('polls an upload waiting for verification, which can be approved elsewhere', () => {
    respond([row(1, 'WAITING_FOR_VERIFICATION')]);

    tick();

    expect(fetchUploadHistory).toHaveBeenCalledTimes(2);
  });

  it('refreshes only the newest uploads, down to the oldest one still running', () => {
    expect(fetchUploadHistory).toHaveBeenLastCalledWith(['orderBy: ["-dateCreated"]']);
    respond([row(3, 'SUCCESS'), row(2, 'IN_PROGRESS'), row(1, 'SUCCESS')]);

    tick();

    expect(fetchUploadHistory).toHaveBeenLastCalledWith(['orderBy: ["-dateCreated"]', 'first: 2']);
    // A new upload arrived meanwhile: the two newest come back, the older rows stay.
    respond([row(4, 'TRIGGERED'), row(3, 'SUCCESS')]);
    expect(screen.getAllByText(/^file\d\.csv$/).map((cell) => cell.textContent))
      .toEqual(['file4.csv', 'file3.csv', 'file2.csv', 'file1.csv']);
  });
});
