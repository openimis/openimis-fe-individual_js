import {
  describe, expect, it, vi,
} from 'vitest';

// Only fe-core's two dispatchers are stubbed; the formatters and prepareMutation are
// real, imported from their defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({
    operation, variables, type, meta,
  })),
}));

vi.mock('@openimis/fe-core', async () => ({
  ...(await vi.importActual('@openimis/fe-core/helpers/api')),
  ...(await vi.importActual('@openimis/fe-core/actions')),
  ...core,
}));

const actions = await import('./actions');
const { ACTION_TYPE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SET, SUCCESS,
} = await import('./util/action-type');
const { globalId } = await import('@openimis/fe-core/testing');

const modulesManager = { getProjection: () => '{id, name}' };

const query = (result) => result.payload.replace(/\s+/g, ' ');
const operation = (result) => result.operation.replace(/\s+/g, ' ');

describe('individual actions', () => {
  describe('searches', () => {
    it.each([
      ['individuals', 'fetchIndividuals', ACTION_TYPE.SEARCH_INDIVIDUALS, 'individual', true],
      ['groups', 'fetchGroups', ACTION_TYPE.SEARCH_GROUPS, 'group', true],
      ['individual history', 'fetchIndividualHistory', ACTION_TYPE.SEARCH_INDIVIDUAL_HISTORY,
        'individualHistory', true],
      ['group history', 'fetchGroupHistory', ACTION_TYPE.SEARCH_GROUP_HISTORY, 'groupHistory', true],
      ['group individuals', 'fetchGroupIndividuals', ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS, 'groupIndividual', false],
      ['group individual history', 'fetchGroupIndividualHistory', ACTION_TYPE.SEARCH_GROUP_INDIVIDUAL_HISTORY,
        'groupIndividualHistory', false],
      ['upload history', 'fetchUploadHistory', ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY,
        'individualDataUploadHistory', false],
    ])('asks for a counted page of %s', (_label, creator, actionType, entity, needsModulesManager) => {
      const result = needsModulesManager
        ? actions[creator](modulesManager, ['first: 10'])
        : actions[creator](['first: 10']);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(first: 10) { totalCount`);
      expect(query(result)).toContain('edges { node {');
    });

    it('projects the location fields the location module declares', () => {
      expect(query(actions.fetchIndividuals(modulesManager, []))).toContain('location{id, name}');
      expect(query(actions.fetchGroups(modulesManager, []))).toContain('location{id, name}');
    });

    it('asks for the groups an individual belongs to only when loading one individual', () => {
      const memberships = 'groupindividuals (isDeleted: false) { edges { node { group { id } } } }';

      expect(query(actions.fetchIndividual(modulesManager, ['id: "ind-1"']))).toContain(memberships);
      expect(query(actions.fetchIndividuals(modulesManager, []))).not.toContain('groupindividuals');
    });

    it.each([
      ['fetchIndividual', ACTION_TYPE.GET_INDIVIDUAL, 'individual'],
      ['fetchGroup', ACTION_TYPE.GET_GROUP, 'group'],
    ])('asks for a single record through %s without counting', (creator, actionType, entity) => {
      const result = actions[creator](modulesManager, [`id: "${entity}-1"`]);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(id: "${entity}-1")`);
      expect(query(result)).not.toContain('totalCount');
    });

    it('restricts the workflow list to this module', () => {
      const result = actions.fetchWorkflows();

      expect(result.type).toBe(ACTION_TYPE.GET_WORKFLOWS);
      expect(query(result)).toContain('workflow(group: "individual") { name,group }');
    });

    it('asks for the etl services without filters', () => {
      const result = actions.fetchApiEtlServices();

      expect(result.type).toBe(ACTION_TYPE.API_ETL_SERVICES);
      expect(query(result)).toContain('etlServicesByServiceName { etlServices{nameOfService} }');
    });

    it.each([
      ['individual', 'fetchIndividualEnrollmentSummary', ACTION_TYPE.ENROLLMENT_SUMMARY,
        'individualEnrollmentSummary', 'numberOfIndividualsToUpload'],
      ['group', 'fetchGroupEnrollmentSummary', ACTION_TYPE.ENROLLMENT_GROUP_SUMMARY,
        'groupEnrollmentSummary', 'numberOfGroupsToUpload'],
    ])('asks for the %s enrollment summary', (_label, creator, actionType, entity, field) => {
      const result = actions[creator](['benefitPlanId: "plan-1"']);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(benefitPlanId: "plan-1")`);
      expect(query(result)).toContain(field);
      expect(query(result)).not.toContain('edges');
    });

    it('looks up the mutations still waiting to be processed', () => {
      const result = actions.fetchMutationByLabel('Update individual');

      expect(result.type).toBe(ACTION_TYPE.FETCH_ACTIVE_MUTATIONS);
      expect(query(result)).toContain('mutationLogs(clientMutationLabel: "Update individual", status: 0)');
      expect(query(result)).toContain('clientMutationId');
    });

    // Currently fails: the group history projection filters out 'head {firstName, lastName}',
    // but the group projection actually contains 'head {firstName, lastName, uuid}',
    // so the filter matches nothing and the field it meant to drop is still asked for.
    it.fails('leaves the group head out of the group history', () => {
      expect(query(actions.fetchGroupHistory(modulesManager, []))).not.toContain('head {');
    });
  });

  describe('pending group uploads', () => {
    const upload = (variables) => actions.fetchPendingGroupUploads({
      upload_Id: 'upload-1',
      group_Id_Isnull: true,
      ...variables,
    });

    it('pages forward by default', () => {
      const result = upload({ pageSize: 10 });

      expect(result.type).toBe(ACTION_TYPE.GET_PENDING_GROUPS_UPLOAD);
      expect(operation(result)).toContain('groupDataSource(');
      expect(operation(result)).toContain(',first:$pageSize');
      expect(operation(result)).not.toContain('last:$pageSize');
    });

    it('pages backwards when given a cursor to stop before', () => {
      const result = upload({ before: 'cursor-1', pageSize: 10 });

      expect(operation(result)).toContain(',before:$before, last:$pageSize');
      expect(operation(result)).not.toContain('first:$pageSize');
    });

    it('declares the deleted filter when it is set to false, not only when true', () => {
      expect(operation(upload({ isDeleted: false }))).toContain(',$isDeleted: Boolean');
      expect(operation(upload({}))).not.toContain('$isDeleted');
    });

    it('passes the variables through untouched', () => {
      expect(upload({ pageSize: 10 }).variables)
        .toEqual({ upload_Id: 'upload-1', group_Id_Isnull: true, pageSize: 10 });
    });
  });

  describe('individual mutations', () => {
    const individual = {
      id: 'ind-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      dob: '1815-12-10T00:00:00',
      jsonExt: '{}',
      location: { id: globalId('LocationType', '17') },
    };

    it('raises the request, its own success and the shared error type', () => {
      const result = actions.updateIndividual(individual, 'Update individual');

      expect(result.type).toEqual([
        REQUEST(ACTION_TYPE.MUTATION),
        SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL),
        ERROR(ACTION_TYPE.MUTATION),
      ]);
      expect(result.meta).toMatchObject({
        actionType: ACTION_TYPE.UPDATE_INDIVIDUAL,
        clientMutationLabel: 'Update individual',
      });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it('reports the same client mutation id it sent', () => {
      const result = actions.updateIndividual(individual, 'Update individual');

      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
    });

    it('sends the name, date of birth and decoded location', () => {
      const sent = query(actions.updateIndividual(individual, 'Update individual'));

      expect(sent).toContain('id: "ind-1"');
      expect(sent).toContain('firstName: "Ada"');
      expect(sent).toContain('lastName: "Lovelace"');
      expect(sent).toContain('dob: "1815-12-10"');
      expect(sent).toContain('locationId: 17');
    });

    it('omits the fields that were never filled in', () => {
      const sent = query(actions.updateIndividual({ firstName: 'Ada' }, 'Update'));

      expect(sent).not.toContain('id:');
      expect(sent).not.toContain('lastName:');
      expect(sent).not.toContain('dob:');
      expect(sent).not.toContain('locationId:');
    });

    it.each([
      ['deleteIndividual', 'deleteIndividual', ACTION_TYPE.DELETE_INDIVIDUAL],
      ['undoDeleteIndividual', 'undoDeleteIndividual', ACTION_TYPE.UNDO_DELETE_INDIVIDUAL],
    ])('addresses %s by a list of ids', (creator, mutationName, actionType) => {
      const result = actions[creator]({ id: 'ind-1' }, 'label');

      expect(result.type[1]).toBe(SUCCESS(actionType));
      expect(query(result)).toContain(`mutation ${mutationName}`);
      expect(query(result)).toContain('ids: ["ind-1"]');
      expect(result.meta.actionType).toBe(actionType);
    });
  });

  describe('group mutations', () => {
    const group = { id: 'group-1', code: 'G1', location: { id: globalId('LocationType', '17') } };

    it('sends the code and location when creating a group, with an empty member list', () => {
      const result = actions.createGroup(group, 'Create group');
      const sent = query(result);

      expect(result.type[1]).toBe(SUCCESS(ACTION_TYPE.CREATE_GROUP));
      expect(sent).toContain('code: "G1"');
      expect(sent).toContain('locationId: 17');
      expect(sent).toContain('individualsData: []');
    });

    it('sends only the id and location when updating a group', () => {
      const sent = query(actions.updateGroup(group, 'Update group'));

      expect(sent).toContain('id: "group-1"');
      expect(sent).toContain('locationId: 17');
      expect(sent).not.toContain('code:');
    });

    it('names the individual to move into the new group', () => {
      const result = actions.createGroupAndMoveIndividual(group, 'gi-1', 'Create group and move');

      expect(result.type[1]).toBe(SUCCESS(ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL));
      expect(query(result)).toContain('groupIndividualId: "gi-1"');
    });

    it('omits the member reference when there is nobody to move', () => {
      expect(query(actions.updateGroup(group, 'Update group'))).not.toContain('groupIndividualId');
    });

    it('addresses a deletion by a list of ids', () => {
      const result = actions.deleteGroup({ id: 'group-1' }, 'Delete group');

      expect(result.type[1]).toBe(SUCCESS(ACTION_TYPE.DELETE_GROUP));
      expect(query(result)).toContain('ids: ["group-1"]');
    });
  });

  describe('group membership mutations', () => {
    const membership = {
      id: 'gi-1',
      role: 'HEAD',
      recipientType: 'PRIMARY',
      individual: { id: 'ind-1' },
      group: { id: 'group-1' },
    };

    it.each([
      ['createGroupIndividual', 'addIndividualToGroup', ACTION_TYPE.CREATE_GROUP_INDIVIDUAL],
      ['updateGroupIndividual', 'editIndividualInGroup', ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL],
    ])('sends the role, recipient type and both ids through %s', (creator, mutationName, actionType) => {
      const result = actions[creator](membership, 'label');
      const sent = query(result);

      expect(result.type[1]).toBe(SUCCESS(actionType));
      expect(sent).toContain(`mutation ${mutationName}`);
      expect(sent).toContain('role: HEAD');
      expect(sent).toContain('recipientType: PRIMARY');
      expect(sent).toContain('individualId: "ind-1"');
      expect(sent).toContain('groupId: "group-1"');
      expect(result.meta.actionType).toBe(actionType);
    });

    it("removes a membership by its own id, not the individual's", () => {
      const result = actions.deleteGroupIndividual(membership, 'Remove from group');

      expect(result.type[1]).toBe(SUCCESS(ACTION_TYPE.DELETE_GROUP_INDIVIDUAL));
      expect(query(result)).toContain('mutation removeIndividualFromGroup');
      expect(query(result)).toContain('ids: ["gi-1"]');
    });
  });

  describe('enrollment confirmation', () => {
    const params = { customFilters: '["income__gt=100"]', benefitPlanId: '"plan-1"', status: 'ACTIVE' };

    it.each([
      ['confirmEnrollment', 'confirmIndividualEnrollment', ACTION_TYPE.CONFIRM_ENROLLMENT],
      ['confirmGroupEnrollment', 'confirmGroupEnrollment', ACTION_TYPE.CONFIRM_GROUP_ENROLLMENT],
    ])('sends the filters, plan and status through %s', (creator, mutationName, actionType) => {
      const result = actions[creator](params, 'Confirm enrollment');
      const sent = query(result);

      expect(result.type[1]).toBe(SUCCESS(actionType));
      expect(sent).toContain(`mutation ${mutationName}`);
      expect(sent).toContain('customFilters: ["income__gt=100"]');
      expect(sent).toContain('benefitPlanId: "plan-1"');
      expect(sent).toContain('status: ACTIVE');
    });

    it('omits the parts of the selection that were not given', () => {
      expect(query(actions.confirmEnrollment({ benefitPlanId: '"plan-1"' }, 'Confirm')))
        .not.toContain('customFilters');
    });

    // Currently fails: both confirmations label their metadata as a plain update, so
    // anything keyed on meta.actionType attributes them to the wrong operation.
    it.fails.each([
      ['confirmEnrollment', ACTION_TYPE.CONFIRM_ENROLLMENT],
      ['confirmGroupEnrollment', ACTION_TYPE.CONFIRM_GROUP_ENROLLMENT],
    ])('reports %s under its own action type', (creator, actionType) => {
      expect(actions[creator]({ benefitPlanId: '"plan-1"' }, 'Confirm').meta.actionType).toBe(actionType);
    });
  });

  describe('pulling data from an external service', () => {
    it('names the service it is pulling from', () => {
      const result = actions.confirmPullingDataFromApiEtl('openhim', 'Pull data');

      expect(result.type[1]).toBe(SUCCESS(ACTION_TYPE.PULL_API_DATA));
      expect(query(result)).toContain('mutation etlServiceMutation');
      expect(query(result)).toContain('nameOfService: "openhim"');
      expect(result.meta.actionType).toBe(ACTION_TYPE.PULL_API_DATA);
    });
  });

  describe('resolving a task', () => {
    const task = { id: 'task-1' };
    const user = { id: 'user-1' };
    const resolve = (...args) => actions.resolveTask(task, 'Resolve task', user, ...args);

    it("raises the task management triad, not this module's own mutation types", () => {
      expect(resolve('APPROVED').type)
        .toEqual(['TASK_MANAGEMENT_MUTATION_REQ', 'TASK_MANAGEMENT_MUTATION_RESP', 'TASK_MANAGEMENT_MUTATION_ERR']);
    });

    it.each(['APPROVED', 'FAILED'])('records a %s decision against the deciding user', (decision) => {
      const result = resolve(decision);

      expect(result.variables.id).toBe('task-1');
      expect(JSON.parse(result.variables.businessStatus)).toEqual({ 'user-1': decision });
    });

    it.each(['ACCEPT', 'REJECT'])('nests the extra data under a %s decision', (decision) => {
      const result = resolve(decision, { comment: 'looks right' });

      expect(JSON.parse(result.variables.businessStatus))
        .toEqual({ 'user-1': { [decision]: { comment: 'looks right' } } });
      expect(JSON.parse(result.variables.additionalData))
        .toEqual({ entries: { comment: 'looks right' }, decision: { comment: 'looks right' } });
    });

    it('rejects a decision it does not recognise', () => {
      expect(() => resolve('MAYBE')).toThrow('Invalid approveOrFail value');
    });

    it('reports the deciding user in its metadata', () => {
      expect(resolve('APPROVED').meta).toMatchObject({ userId: 'user-1', clientMutationLabel: 'Resolve task' });
    });

    // Currently fails. social_protection's resolveTask carries an identical copy
    // of this defect: the id reported in the metadata comes from a formatMutation
    // call whose payload is discarded, while the mutation sent carries the one
    // prepareMutation generated.
    it.fails('sends the client mutation id it reports', () => {
      const result = resolve('APPROVED');

      expect(result.variables.clientMutationId).toBe(result.meta.clientMutationId);
    });

    // Currently fails: the operation declares $clientMutationLabel but no such variable is
    // ever passed, so the audit label is dropped.
    it.fails('sends the label its operation declares', () => {
      expect(resolve('APPROVED').variables.clientMutationLabel).toBe('Resolve task');
    });
  });

  describe('exports', () => {
    it.each([
      ['downloadGroups', 'groupExport', ACTION_TYPE.GROUP_EXPORT],
      ['downloadIndividuals', 'individualExport', ACTION_TYPE.INDIVIDUAL_EXPORT],
      ['downloadGroupIndividuals', 'groupIndividualExport', ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT],
    ])('passes the search filters to %s', (creator, field, actionType) => {
      const result = actions[creator](['isDeleted: false', 'first: 10']);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${field}(isDeleted: false,first: 10)`);
    });

    it.each([
      ['downloadGroups', 'groupExport'],
      ['downloadIndividuals', 'individualExport'],
      ['downloadGroupIndividuals', 'groupIndividualExport'],
    ])('asks %s for everything when there is no filter', (creator, field) => {
      expect(query(actions[creator]([])).trim()).toBe(`{ ${field} }`);
      expect(query(actions[creator](undefined)).trim()).toBe(`{ ${field} }`);
    });
  });

  describe('clearing and short-circuiting state', () => {
    it.each([
      ['clearGroup', CLEAR(ACTION_TYPE.GET_GROUP)],
      ['clearGroupIndividuals', CLEAR(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS)],
      ['clearGroupExport', CLEAR(ACTION_TYPE.GROUP_EXPORT)],
      ['clearIndividualExport', CLEAR(ACTION_TYPE.INDIVIDUAL_EXPORT)],
      ['clearGroupIndividualExport', CLEAR(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT)],
    ])('%s dispatches a single plain action', (creator, type) => {
      const dispatch = vi.fn();

      actions[creator]()(dispatch);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type });
    });

    it('carries the unsaved membership in the action that stores it', () => {
      const dispatch = vi.fn();
      const membership = { role: 'HEAD', individual: { id: 'ind-1' } };

      actions.setNewGroupIndividual(membership)(dispatch);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith({
        type: SET(ACTION_TYPE.SET_GROUP_INDIVIDUAL),
        payload: membership,
      });
    });
  });
});
