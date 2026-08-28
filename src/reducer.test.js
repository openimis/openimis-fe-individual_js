import {
  describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', async () => vi.importActual('@openimis/fe-core/helpers/api'));

const { default: reducer, ACTION_TYPE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SET, SUCCESS,
} = await import('./util/action-type');
const { globalId, graphqlErrors, relayPage, serverError } = await import('@openimis/fe-core/testing');

const initial = () => reducer(undefined, { type: '@@INIT' });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, actionType, data, meta) => dispatch(state, SUCCESS(actionType), { payload: { data }, meta });
const fail = (state, actionType, payload = serverError(500, 'Internal Server Error', 'boom')) => dispatch(
  state,
  ERROR(actionType),
  { payload },
);

const id = (type, value) => globalId(type, value);
const SERVER_ERROR = { code: 500, message: 'Internal Server Error', detail: 'boom' };

describe('individual reducer', () => {
  describe('initialisation', () => {
    it('starts with nothing loaded and nothing in flight', () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.individuals).toEqual([]);
      expect(state.groups).toEqual([]);
      expect(state.groupIndividuals).toEqual([]);
      expect(state.individual).toBeNull();
      expect(state.group).toBeNull();
      expect(state.mutations).toEqual([]);
    });

    it('returns the same state object for an unrelated action', () => {
      const state = initial();

      expect(reducer(state, { type: 'SOMETHING_ELSE' })).toBe(state);
    });
  });

  describe('searches', () => {
    const SEARCHES = [
      ['individuals', ACTION_TYPE.SEARCH_INDIVIDUALS, 'individual', 'individuals'],
      ['groups', ACTION_TYPE.SEARCH_GROUPS, 'group', 'groups'],
      ['individual history', ACTION_TYPE.SEARCH_INDIVIDUAL_HISTORY, 'individualHistory', 'individualHistory'],
      ['group history', ACTION_TYPE.SEARCH_GROUP_HISTORY, 'groupHistory', 'groupHistory'],
    ];

    it.each(SEARCHES)('empties the %s list and clears the error when a search starts', (
      _label,
      actionType,
      _entity,
      field,
    ) => {
      const stale = { ...initial(), [field]: [{ id: '1' }], [`${field}TotalCount`]: 1 };
      const state = dispatch(stale, REQUEST(actionType));

      expect(state[`fetching${field.charAt(0).toUpperCase()}${field.slice(1)}`]).toBe(true);
      expect(state[field]).toEqual([]);
      expect(state[`${field}TotalCount`]).toBe(0);
    });

    it.each(SEARCHES)('decodes the ids and counts the %s page', (_label, actionType, entity, field) => {
      const state = respond(initial(), actionType, {
        [entity]: relayPage(
          [{ id: id('Type', 'row-1'), code: 'A' }, { id: id('Type', 'row-2'), code: 'B' }],
          { totalCount: 5, pageInfo: { hasNextPage: true } },
        ),
      });

      expect(state[field]).toEqual([{ id: 'row-1', code: 'A' }, { id: 'row-2', code: 'B' }]);
      expect(state[`${field}TotalCount`]).toBe(5);
      expect(state[`${field}PageInfo`]).toMatchObject({ totalCount: 5, hasNextPage: true });
    });

    it.each(SEARCHES)('reports an empty %s page rather than throwing', (_label, actionType, entity, field) => {
      const state = respond(initial(), actionType, { [entity]: null });

      expect(state[field]).toEqual([]);
      expect(state[`${field}TotalCount`]).toBeNull();
    });

    it.each(SEARCHES)('surfaces a data error from the %s search', (_label, actionType, entity, field) => {
      const state = dispatch(initial(), SUCCESS(actionType), {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors('bad filter') },
      });

      expect(state[`error${field.charAt(0).toUpperCase()}${field.slice(1)}`]).toMatchObject({ detail: 'bad filter' });
    });

    it.each(SEARCHES)('formats a transport failure of the %s search', (_label, actionType, _entity, field) => {
      expect(fail(initial(), actionType)[`error${field.charAt(0).toUpperCase()}${field.slice(1)}`])
        .toEqual(SERVER_ERROR);
    });
  });

  describe('group individual search', () => {
    it('decodes the row, the individual and the group in one pass', () => {
      const state = respond(initial(), ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS, {
        groupIndividual: relayPage([
          {
            id: id('GroupIndividualType', 'gi-1'),
            role: 'HEAD',
            individual: { id: id('IndividualType', 'ind-1'), firstName: 'Ada' },
            group: { id: id('GroupType', 'group-1'), code: 'G1' },
          },
        ]),
      });

      expect(state.groupIndividuals[0]).toEqual({
        id: 'gi-1',
        role: 'HEAD',
        individual: { id: 'ind-1', firstName: 'Ada' },
        group: { id: 'group-1', code: 'G1' },
      });
    });

    it('leaves a row without an individual or group untouched', () => {
      const state = respond(initial(), ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS, {
        groupIndividual: relayPage([{ id: id('GroupIndividualType', 'gi-1') }]),
      });

      expect(state.groupIndividuals[0]).toEqual({ id: 'gi-1' });
    });

    it('empties the list on clear', () => {
      const loaded = { ...initial(), groupIndividuals: [{ id: 'gi-1' }], groupIndividualsTotalCount: 1 };

      expect(dispatch(loaded, CLEAR(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS))).toMatchObject({
        groupIndividuals: [],
        groupIndividualsTotalCount: 0,
        fetchedGroupIndividuals: false,
        errorGroupIndividuals: null,
      });
    });

    it('holds a single unsaved membership without marking it fetched', () => {
      const state = dispatch(initial(), SET(ACTION_TYPE.SET_GROUP_INDIVIDUAL), { payload: { role: 'HEAD' } });

      expect(state.groupIndividuals).toEqual([{ role: 'HEAD' }]);
      expect(state.groupIndividualsTotalCount).toBe(1);
      expect(state.fetchedGroupIndividuals).toBe(false);
    });
  });

  describe('single individual', () => {
    it('unwraps and decodes the first node', () => {
      const state = respond(initial(), ACTION_TYPE.GET_INDIVIDUAL, {
        individual: relayPage([{ id: id('IndividualType', 'ind-1'), firstName: 'Ada' }]),
      });

      expect(state.individual).toEqual({ id: 'ind-1', firstName: 'Ada' });
      expect(state.fetchedIndividual).toBe(true);
      expect(state.errorIndividual).toBeNull();
    });

    it('forgets any previous individual while the next one loads', () => {
      const loaded = { ...initial(), individual: { id: 'ind-1' }, fetchedIndividual: true };

      expect(dispatch(loaded, REQUEST(ACTION_TYPE.GET_INDIVIDUAL))).toMatchObject({
        individual: null,
        fetchedIndividual: false,
        fetchingIndividual: true,
      });
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_INDIVIDUAL).errorIndividual).toEqual(SERVER_ERROR);
    });
  });

  describe('single group', () => {
    it('unwraps and decodes the first node', () => {
      const state = respond(initial(), ACTION_TYPE.GET_GROUP, {
        group: relayPage([{ id: id('GroupType', 'group-1'), code: 'G1' }]),
      });

      expect(state.group).toEqual({ id: 'group-1', code: 'G1' });
    });

    // Currently fails: the success case sets fetchedIGroup, so fetchedGroup — the flag
    // GroupForm watches to reset its editing state — is never true.
    it.fails('marks the group as fetched', () => {
      const state = respond(initial(), ACTION_TYPE.GET_GROUP, {
        group: relayPage([{ id: id('GroupType', 'group-1') }]),
      });

      expect(state.fetchedGroup).toBe(true);
    });

    it('forgets the group on clear', () => {
      const loaded = { ...initial(), group: { id: 'group-1' }, fetchedGroup: true };

      expect(dispatch(loaded, CLEAR(ACTION_TYPE.GET_GROUP))).toMatchObject({
        group: null,
        fetchedGroup: false,
        errorGroup: null,
      });
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_GROUP).errorGroup).toEqual(SERVER_ERROR);
    });
  });

  describe('pending group uploads', () => {
    const page = {
      groupDataSource: relayPage([{ id: id('GroupDataSourceType', 'src-1'), jsonExt: '{}' }], {
        totalCount: 3,
        pageInfo: { endCursor: 'cursor-3' },
      }),
    };

    it('decodes the rows', () => {
      const state = respond(initial(), ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD, page);

      expect(state.pendingGroups).toEqual([{ id: 'src-1', jsonExt: '{}' }]);
      expect(state.fetchedPendingGroups).toBe(true);
    });

    it('empties the list while the next page loads', () => {
      const loaded = { ...initial(), pendingGroups: [{ id: 'src-1' }] };

      expect(dispatch(loaded, REQUEST(ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD)).pendingGroups).toEqual([]);
    });

    // Currently fails: the page info is written to pendingGroupPageInfo while the initial
    // state declares — and GroupImportTasks reads — pendingGroupsPageInfo, so the
    // cursors it needs to page are never there.
    it.fails('records the cursors it was given', () => {
      const state = respond(initial(), ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD, page);

      expect(state.pendingGroupsPageInfo).toMatchObject({ totalCount: 3, endCursor: 'cursor-3' });
    });

    // Currently fails: the failure is written to errorFieldsFromBfSchema — a field this
    // module does not even have — using the GraphQL formatter, which returns null
    // for a transport payload.
    it.fails('reports its own failure', () => {
      const state = fail(initial(), ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD);

      expect(state.fetchingPendingGroups).toBe(false);
      expect(state.errorPendingGroups).toEqual(SERVER_ERROR);
    });
  });

  describe('upload history', () => {
    it('decodes the row id and parses the nested upload error', () => {
      const state = respond(initial(), ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY, {
        individualDataUploadHistory: relayPage([
          {
            id: id('UploadHistoryType', 'upload-1'),
            workflow: 'import',
            dataUpload: { sourceName: 'rows.csv', error: '{"row 2":"missing field"}' },
          },
        ]),
      });

      expect(state.individualDataUploadHistory).toEqual([
        {
          id: 'upload-1',
          workflow: 'import',
          dataUpload: { sourceName: 'rows.csv', error: { 'row 2': 'missing field' } },
        },
      ]);
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY).errorIndividualDataUploadHistory)
        .toEqual(SERVER_ERROR);
    });
  });

  describe('group individual history', () => {
    const page = {
      groupIndividualHistory: relayPage([{ id: id('GroupIndividualType', 'gi-1'), version: 2 }], {
        totalCount: 4,
        pageInfo: { endCursor: 'cursor-4' },
      }),
    };

    it('decodes and counts the rows', () => {
      const state = respond(initial(), ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY, page);

      expect(state.groupIndividualHistory).toEqual([{ id: 'gi-1', version: 2 }]);
      expect(state.groupIndividualHistoryTotalCount).toBe(4);
    });

    // Currently fails: the page info is taken from data.groupIndividualHistoryPageInfo,
    // which the query never returns — the searcher gets {} and cannot page.
    it.fails('records the cursors it was given', () => {
      expect(respond(initial(), ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY, page).groupIndividualHistoryPageInfo)
        .toMatchObject({ totalCount: 4, endCursor: 'cursor-4' });
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY).errorGroupIndividualHistory)
        .toEqual(SERVER_ERROR);
    });
  });

  describe('enrollment summaries', () => {
    it.each([
      ['individuals', ACTION_TYPE.ENROLLMENT_SUMMARY, 'individualEnrollmentSummary', 'enrollmentSummary'],
      ['groups', ACTION_TYPE.ENROLLMENT_GROUP_SUMMARY, 'groupEnrollmentSummary', 'enrollmentGroupSummary'],
    ])('stores the %s summary as the server sent it', (_label, actionType, entity, field) => {
      const summary = { totalNumberOfIndividuals: '10', numberOfIndividualsToUpload: '4' };
      const state = respond(initial(), actionType, { [entity]: summary });

      expect(state[field]).toEqual(summary);
      expect(state[`fetched${field.charAt(0).toUpperCase()}${field.slice(1)}`]).toBe(true);
      expect(state[`${field}Error`]).toBeNull();
    });

    it.each([
      ['individuals', ACTION_TYPE.ENROLLMENT_SUMMARY, 'enrollmentSummary'],
      ['groups', ACTION_TYPE.ENROLLMENT_GROUP_SUMMARY, 'enrollmentGroupSummary'],
    ])('empties the %s summary while it is recalculated', (_label, actionType, field) => {
      const loaded = { ...initial(), [field]: { totalNumberOfIndividuals: '10' } };
      const state = dispatch(loaded, REQUEST(actionType));

      expect(state[field]).toEqual({});
      expect(state[`${field}Error`]).toBeNull();
    });

    it.each([
      ['individuals', ACTION_TYPE.ENROLLMENT_SUMMARY, 'enrollmentSummaryError'],
      ['groups', ACTION_TYPE.ENROLLMENT_GROUP_SUMMARY, 'enrollmentGroupSummaryError'],
    ])('formats a failed %s summary', (_label, actionType, field) => {
      expect(fail(initial(), actionType)[field]).toEqual(SERVER_ERROR);
    });
  });

  describe('workflows', () => {
    it('stores the workflow list as returned', () => {
      const state = respond(initial(), ACTION_TYPE.GET_WORKFLOWS, {
        workflow: [{ name: 'individual-import', group: 'individual' }],
      });

      expect(state.workflows).toEqual([{ name: 'individual-import', group: 'individual' }]);
      expect(state.fetchedWorkflows).toBe(true);
    });

    it('falls back to an empty list', () => {
      expect(respond(initial(), ACTION_TYPE.GET_WORKFLOWS, {}).workflows).toEqual([]);
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_WORKFLOWS).errorWorkflows).toEqual(SERVER_ERROR);
    });
  });

  describe('etl services', () => {
    it('takes the service list out of the wrapper', () => {
      const state = respond(initial(), ACTION_TYPE.API_ETL_SERVICES, {
        etlServicesByServiceName: { etlServices: [{ nameOfService: 'openhim' }] },
      });

      expect(state.apiEtlServices).toEqual([{ nameOfService: 'openhim' }]);
      expect(state.fetchedApiEtlServices).toBe(true);
    });

    it('falls back to an empty list when the wrapper is absent', () => {
      expect(respond(initial(), ACTION_TYPE.API_ETL_SERVICES, {}).apiEtlServices).toEqual([]);
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.API_ETL_SERVICES).errorApiEtlServices).toEqual(SERVER_ERROR);
    });
  });

  describe('active mutations', () => {
    const logs = (...nodes) => ({ mutationLogs: relayPage(nodes) });
    const received = { clientMutationId: 'cmid-1', status: 0 };
    const finished = { clientMutationId: 'cmid-2', status: 1 };

    it('keeps only the mutations the server still reports as received', () => {
      const state = respond(initial(), ACTION_TYPE.FETCH_ACTIVE_MUTATIONS, logs(received, finished));

      expect(state.mutations).toEqual([received]);
      expect(state.fetchingMutations).toBe(false);
    });

    it('does not duplicate a mutation it already knew about', () => {
      const first = respond(initial(), ACTION_TYPE.FETCH_ACTIVE_MUTATIONS, logs(received));
      const second = respond(first, ACTION_TYPE.FETCH_ACTIVE_MUTATIONS, logs(received));

      expect(second.mutations).toEqual([received]);
    });

    // Currently fails: the new list is unioned with the previous one, so a mutation that
    // has finished is never dropped — and ImportDataApiPage disables its pull
    // button for as long as the list is non-empty.
    it.fails('drops a mutation once it is no longer active', () => {
      const first = respond(initial(), ACTION_TYPE.FETCH_ACTIVE_MUTATIONS, logs(received));
      const second = respond(first, ACTION_TYPE.FETCH_ACTIVE_MUTATIONS, logs());

      expect(second.mutations).toEqual([]);
    });

    it('stops fetching when the request fails', () => {
      expect(fail(initial(), ACTION_TYPE.FETCH_ACTIVE_MUTATIONS).fetchingMutations).toBe(false);
    });
  });

  describe('exports', () => {
    const EXPORTS = [
      ['groups', ACTION_TYPE.GROUP_EXPORT, 'groupExport'],
      ['individuals', ACTION_TYPE.INDIVIDUAL_EXPORT, 'individualExport'],
      ['group individuals', ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT, 'groupIndividualExport'],
    ];

    it.each(EXPORTS)('carries the %s export contents through to the searcher', (_label, actionType, field) => {
      const requested = dispatch(initial(), REQUEST(actionType));
      expect(requested[field]).toBeNull();

      const responded = respond(requested, actionType, { [field]: 'csv,contents' });
      expect(responded[field]).toBe('csv,contents');

      expect(dispatch(responded, CLEAR(actionType))[field]).toBeNull();
    });

    it.each(EXPORTS)('formats a failed %s export', (_label, actionType, field) => {
      expect(fail(initial(), actionType)[`error${field.charAt(0).toUpperCase()}${field.slice(1)}`])
        .toEqual(SERVER_ERROR);
    });

    it('clears the group export flag it set', () => {
      const requested = dispatch(initial(), REQUEST(ACTION_TYPE.GROUP_EXPORT));
      expect(requested.fetchingGroupExport).toBe(true);

      expect(respond(requested, ACTION_TYPE.GROUP_EXPORT, { groupExport: 'csv' }).fetchingGroupExport).toBe(false);
    });

    // Currently fails: these two set the singular flag on request and clear the plural one
    // on success, so the flag the request raised is never lowered. The initial
    // state seeds the plural flags true, which is what IndividualSearcher reads —
    // it believes an export is running from the moment the page loads.
    it.fails.each([
      ['individual', ACTION_TYPE.INDIVIDUAL_EXPORT, 'fetchingIndividualExport', 'individualExport'],
      [
        'group individual',
        ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT,
        'fetchingGroupIndividualExport',
        'groupIndividualExport',
      ],
    ])('clears the %s export flag it set', (_label, actionType, flag, field) => {
      const requested = dispatch(initial(), REQUEST(actionType));
      expect(requested[flag]).toBe(true);

      expect(respond(requested, actionType, { [field]: 'csv' })[flag]).toBe(false);
    });
  });

  describe('mutations', () => {
    const MUTATION_RESULTS = [
      [ACTION_TYPE.DELETE_INDIVIDUAL, 'deleteIndividual'],
      [ACTION_TYPE.UNDO_DELETE_INDIVIDUAL, 'undoDeleteIndividual'],
      [ACTION_TYPE.UPDATE_INDIVIDUAL, 'updateIndividual'],
      [ACTION_TYPE.DELETE_GROUP_INDIVIDUAL, 'removeIndividualFromGroup'],
      [ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL, 'editIndividualInGroup'],
      [ACTION_TYPE.CREATE_GROUP_INDIVIDUAL, 'addIndividualToGroup'],
      [ACTION_TYPE.DELETE_GROUP, 'deleteGroup'],
      [ACTION_TYPE.UPDATE_GROUP, 'updateGroup'],
      [ACTION_TYPE.CREATE_GROUP, 'createGroup'],
      [ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL, 'createGroupAndMoveIndividual'],
      [ACTION_TYPE.RESOLVE_TASK, 'resolveTask'],
      [ACTION_TYPE.PULL_API_DATA, 'etlServiceMutation'],
    ];

    const submitting = () => dispatch(initial(), REQUEST(ACTION_TYPE.MUTATION), {
      meta: { clientMutationId: 'cmid-1', clientMutationLabel: 'Update individual' },
    });

    it('records the request metadata while a mutation is in flight', () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: 'cmid-1', clientMutationLabel: 'Update individual' },
      });
    });

    it.each(MUTATION_RESULTS)('clears the in-flight flag and keeps the internal id of %s', (actionType, service) => {
      const state = respond(submitting(), actionType, { [service]: { internalId: 'internal-1' } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation.id).toBe('internal-1');
    });

    it('raises an alert when a mutation fails', () => {
      const state = fail(submitting(), ACTION_TYPE.MUTATION, { status: 500, statusText: 'Internal Server Error' });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: 'Internal Server Error' });
    });

    // Currently fails: both enrollment confirmations dispatch a success type no case
    // handles, so the flag REQUEST(MUTATION) raised is never cleared.
    it.fails.each([
      ['an individual enrollment', ACTION_TYPE.CONFIRM_ENROLLMENT, 'confirmIndividualEnrollment'],
      ['a group enrollment', ACTION_TYPE.CONFIRM_GROUP_ENROLLMENT, 'confirmGroupEnrollment'],
    ])('finishes confirming %s', (_label, actionType, service) => {
      const state = respond(submitting(), actionType, { [service]: { internalId: 'internal-1' } });

      expect(state.submittingMutation).toBe(false);
    });
  });

  describe('request and failure branches, one slice at a time', () => {
    it.each([
      ['group individuals', ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS, 'GroupIndividuals', 'groupIndividuals'],
      ['workflows', ACTION_TYPE.GET_WORKFLOWS, 'Workflows', 'workflows'],
      ['upload history', ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY, 'IndividualDataUploadHistory',
        'individualDataUploadHistory'],
      ['etl services', ACTION_TYPE.API_ETL_SERVICES, 'ApiEtlServices', 'apiEtlServices'],
    ])('empties the %s list and marks it in flight when its request starts', (_label, actionType, suffix, field) => {
      const stale = { ...initial(), [field]: [{ id: 'stale' }] };
      const state = dispatch(stale, REQUEST(actionType));

      expect(state[field]).toEqual([]);
      expect(state[`fetching${suffix}`]).toBe(true);
      expect(state[`fetched${suffix}`]).toBe(false);
    });

    it('marks the group individual history in flight and drops the previous rows', () => {
      const stale = { ...initial(), groupIndividualHistory: [{ id: 'stale' }], groupIndividualHistoryTotalCount: 1 };
      const state = dispatch(stale, REQUEST(ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY));

      expect(state.fetchingGroupIndividualHistory).toBe(true);
      expect(state.groupIndividualHistoryTotalCount).toBe(0);
      expect(state.groupIndividualHistory).not.toEqual([{ id: 'stale' }]);
    });

    it('marks the mutation lookup in flight without touching the list it holds', () => {
      const known = { ...initial(), mutations: [{ clientMutationId: 'cmid-1' }] };
      const state = dispatch(known, REQUEST(ACTION_TYPE.FETCH_ACTIVE_MUTATIONS));

      expect(state.fetchingMutations).toBe(true);
      expect(state.mutations).toEqual([{ clientMutationId: 'cmid-1' }]);
    });

    it('stops fetching group individuals and reports the failure', () => {
      const requested = dispatch(initial(), REQUEST(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS));
      const state = fail(requested, ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS);

      expect(state.fetchingGroupIndividuals).toBe(false);
      expect(state.errorGroupIndividuals).toEqual(SERVER_ERROR);
    });
  });

  describe('immutability', () => {
    it('does not mutate the state it was given', () => {
      const state = initial();
      const snapshot = JSON.stringify(state);

      respond(state, ACTION_TYPE.SEARCH_INDIVIDUALS, {
        individual: relayPage([{ id: id('IndividualType', 'ind-1') }]),
      });
      dispatch(state, REQUEST(ACTION_TYPE.GET_GROUP));

      expect(JSON.stringify(state)).toBe(snapshot);
    });
  });
});
