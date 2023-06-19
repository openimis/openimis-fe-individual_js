import {
  graphql,
  formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
} from '@openimis/fe-core';
import { ACTION_TYPE } from './reducer';
import { ERROR, REQUEST, SUCCESS } from './util/action-type';

const INDIVIDUAL_FULL_PROJECTION = [
  'id',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'firstName',
  'lastName',
  'dob',
  'jsonExt',
];

const GROUP_FULL_PROJECTION = [
  'id',
  'isDeleted',
  'dateCreated',
  'dateUpdated',
  'jsonExt',
];

export function fetchIndividuals(params) {
  const payload = formatPageQueryWithCount('individual', params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUALS);
}

export function fetchGroups(params) {
  const payload = formatPageQueryWithCount('group', params, GROUP_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_GROUPS);
}

export function fetchIndividual(params) {
  const payload = formatPageQuery('individual', params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL);
}

export function fetchGroup(params) {
  const payload = formatPageQuery('group', params, GROUP_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_GROUP);
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

function formatIndividualGQL(individual) {
  return `
    ${individual.id ? `id: "${individual.id}"` : ''}
    ${individual.firstName ? `firstName: "${formatGQLString(individual.firstName)}"` : ''}
    ${individual.lastName ? `lastName: "${formatGQLString(individual.lastName)}"` : ''}
    ${individual.jsonExt ? `jsonExt: ${JSON.stringify(individual.jsonExt)}` : ''}
    ${individual.dob ? `dob: "${dateTimeToDate(individual.dob)}"` : ''}`;
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

export function updateGroup(group, clientMutationLabel) {
  const mutation = formatMutation('updateGroup', formatIndividualGQL(group), clientMutationLabel);
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
