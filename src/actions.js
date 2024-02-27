import {
  graphql,
  formatPageQuery,
  formatQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import {
  CLEAR, ERROR, REQUEST, SET, SUCCESS,
} from './util/action-type';

const WORKFLOWS_FULL_PROJECTION = () => [
  'name',
  'group',
];

const ENROLLMENT_SUMMARY_FULL_PROJECTION = () => [
  'totalNumberOfIndividuals',
  'numberOfSelectedIndividuals',
  'numberOfIndividualsAssignedToProgramme',
  'numberOfIndividualsNotAssignedToProgramme',
  'numberOfIndividualsAssignedToSelectedProgramme',
  'numberOfIndividualsToUpload',
];

export function fetchWorkflows() {
  const payload = formatQuery(
    'workflow',
    [],
    WORKFLOWS_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.GET_WORKFLOWS);
}

const INDIVIDUAL_FULL_PROJECTION = [
  'id',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'firstName',
  'lastName',
  'dob',
  'jsonExt',
  'version',
  'userUpdated {username}',
];

const GROUP_INDIVIDUAL_FULL_PROJECTION = [
  'id',
  'individual {id, firstName, lastName, dob}',
  'group {id}',
  'role',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
];

const GROUP_FULL_PROJECTION = [
  'id',
  'isDeleted',
  'head {firstName, lastName}',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
  'version',
  'userUpdated {username}',
];

const GROUP_HISTORY_FULL_PROJECTION = GROUP_FULL_PROJECTION.filter(
  (item) => item !== 'head {firstName, lastName}',
);

const UPLOAD_HISTORY_FULL_PROJECTION = () => [
  'id',
  'uuid',
  'workflow',
  'dataUpload {uuid, dateCreated, dateUpdated, sourceName, sourceType, status, error }',
  'userCreated {username}',
];

export function fetchIndividualEnrollmentSummary(params) {
  const payload = formatQuery(
    'individualEnrollmentSummary',
    params,
    ENROLLMENT_SUMMARY_FULL_PROJECTION(),
  );
  return graphql(payload, ACTION_TYPE.ENROLLMENT_SUMMARY);
}

export function fetchIndividuals(params) {
  const payload = formatPageQueryWithCount('individual', params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUALS);
}

export function fetchGroupIndividuals(params) {
  const payload = formatPageQueryWithCount('groupIndividual', params, GROUP_INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS);
}

export function fetchGroups(params) {
  const payload = formatPageQueryWithCount('group', params, GROUP_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUPS);
}

export function fetchIndividual(params) {
  const payload = formatPageQuery('individual', params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL);
}

export function fetchIndividualHistory(params) {
  const payload = formatPageQueryWithCount('individualHistory', params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUAL_HISTORY);
}

export function fetchGroup(params) {
  const payload = formatPageQuery('group', params, GROUP_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_GROUP);
}

export function fetchGroupHistory(params) {
  const payload = formatPageQueryWithCount('groupHistory', params, GROUP_HISTORY_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUP_HISTORY);
}

export function fetchUploadHistory(params) {
  const payload = formatPageQueryWithCount('individualDataUploadHistory', params, UPLOAD_HISTORY_FULL_PROJECTION());
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL_UPLOAD_HISTORY);
}

export function deleteIndividual(individual, clientMutationLabel) {
  const individualUuids = `ids: ["${individual?.id}"]`;
  const mutation = formatMutation('deleteIndividual', individualUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteGroupIndividual(groupIndividual, clientMutationLabel) {
  const groupIndividualUuids = `ids: ["${groupIndividual?.id}"]`;
  const mutation = formatMutation('removeIndividualFromGroup', groupIndividualUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_GROUP_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_GROUP_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deleteGroup(group, clientMutationLabel) {
  const groupUuids = `ids: ["${group?.id}"]`;
  const mutation = formatMutation('deleteGroup', groupUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

function dateTimeToDate(date) {
  return date.split('T')[0];
}

function formatGroupGQL(group, groupIndividualId = null) {
  return `
    ${group?.id ? `id: "${group.id}"` : ''}
    ${groupIndividualId ? `groupIndividualId: "${groupIndividualId}"` : ''}`;
}

function formatIndividualGQL(individual) {
  return `
    ${individual?.id ? `id: "${individual.id}"` : ''}
    ${individual?.firstName ? `firstName: "${formatGQLString(individual.firstName)}"` : ''}
    ${individual?.lastName ? `lastName: "${formatGQLString(individual.lastName)}"` : ''}
    ${individual?.jsonExt ? `jsonExt: ${JSON.stringify(individual.jsonExt)}` : ''}
    ${individual?.dob ? `dob: "${dateTimeToDate(individual.dob)}"` : ''}`;
}

function formatGroupIndividualGQL(groupIndividual) {
  return `
    ${groupIndividual?.id ? `id: "${groupIndividual.id}"` : ''}
    ${groupIndividual?.role ? `role: ${groupIndividual.role}` : ''}
    ${groupIndividual?.individual.id ? `individualId: "${groupIndividual.individual.id}"` : ''}
    ${groupIndividual?.group.id ? `groupId: "${groupIndividual.group.id}"` : ''}`;
}

function formatConfirmEnrollmentGQL(params) {
  return `
    ${params?.customFilters ? `customFilters: ${params.customFilters}` : ''}
    ${params?.benefitPlanId ? `benefitPlanId: ${params.benefitPlanId}` : ''}
    ${params?.status ? `status: ${params.status}` : ''}`;
}

export function updateIndividual(individual, clientMutationLabel) {
  const mutation = formatMutation('updateIndividual', formatIndividualGQL(individual), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function confirmEnrollment(params, clientMutationLabel) {
  // eslint-disable-next-line max-len
  const mutation = formatMutation('confirmIndividualEnrollment', formatConfirmEnrollmentGQL(params), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CONFIRM_ENROLLMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateGroupIndividual(groupIndividual, clientMutationLabel) {
  const mutation = formatMutation(
    'editIndividualInGroup',
    formatGroupIndividualGQL(groupIndividual),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createGroupAndMoveIndividual(group, individualIds, clientMutationLabel) {
  const mutation = formatMutation(
    'createGroupAndMoveIndividual',
    formatGroupGQL(group, individualIds),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_GROUP_AND_MOVE_INDIVIDUAL,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateGroup(group, clientMutationLabel) {
  const mutation = formatMutation('updateGroup', formatGroupGQL(group), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function downloadGroups(params) {
  const payload = `
    {
      groupExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.GROUP_EXPORT);
}

export function downloadIndividuals(params) {
  const payload = `
    {
      individualExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.INDIVIDUAL_EXPORT);
}

export function downloadGroupIndividuals(params) {
  const payload = `
    {
      groupIndividualExport${!!params && params.length ? `(${params.join(',')})` : ''}
    }`;
  return graphql(payload, ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT);
}

export const setNewGroupIndividual = (groupIndividual) => (dispatch) => {
  dispatch({
    type: SET(ACTION_TYPE.SET_GROUP_INDIVIDUAL), payload: groupIndividual,
  });
};

export const clearGroupIndividualExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT),
  });
};

export const clearIndividualExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.INDIVIDUAL_EXPORT),
  });
};

export const clearGroupExport = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GROUP_EXPORT),
  });
};

export const clearGroup = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GET_GROUP),
  });
};

export const clearGroupIndividuals = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS),
  });
};
