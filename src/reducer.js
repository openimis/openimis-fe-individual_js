// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  parseData,
  pageInfo,
  decodeId,
} from '@openimis/fe-core';
import { REQUEST, SUCCESS, ERROR } from './util/action-type';

export const ACTION_TYPE = {
  MUTATION: 'INDIVIDUAL_MUTATION',
  SEARCH_INDIVIDUALS: 'INDIVIDUAL_INDIVIDUALS',
  SEARCH_GROUPS: 'GROUP_GROUPS',
  GET_INDIVIDUAL: 'INDIVIDUAL_INDIVIDUAL',
  GET_GROUP: 'GROUP_GROUP',
  DELETE_INDIVIDUAL: 'INDIVIDUAL_DELETE_INDIVIDUAL',
  DELETE_GROUP: 'GROUP_DELETE_GROUP',
  UPDATE_INDIVIDUAL: 'INDIVIDUAL_UPDATE_INDIVIDUAL',
  UPDATE_GROUP: 'GROUP_UPDATE_GROUP',
  GROUP_EXPORT: 'GROUP_EXPORT',
};

function reducer(
  state = {
    submittingMutation: false,
    mutation: {},
    fetchingIndividuals: false,
    errorIndividuals: null,
    fetchedIndividuals: false,
    individuals: [],
    individualsPageInfo: {},
    individualsTotalCount: 0,
    fetchingIndividual: false,
    errorIndividual: null,
    fetchedIndividual: false,
    individual: null,
    fetchingGroups: false,
    errorGroups: null,
    fetchedGroups: false,
    groups: [],
    groupsPageInfo: {},
    groupsTotalCount: 0,
    fetchingGroup: false,
    errorGroup: null,
    fetchedGroup: false,
    group: null,
    fetchingGroupBsExport: true,
    fetchedGroupsExport: false,
    groupsExport: null,
    groupsExportPageInfo: {},
    errorGroupsExport: null,
  },
  action,
) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_INDIVIDUALS):
      return {
        ...state,
        fetchingIndividuals: true,
        fetchedIndividuals: false,
        individuals: [],
        individualsPageInfo: {},
        individualsTotalCount: 0,
        errorIndividuals: null,
      };
    case REQUEST(ACTION_TYPE.SEARCH_GROUPS):
      return {
        ...state,
        fetchingGroups: true,
        fetchedGroups: false,
        groups: [],
        groupsPageInfo: {},
        groupsTotalCount: 0,
        errorGroups: null,
      };
    case REQUEST(ACTION_TYPE.GET_INDIVIDUAL):
      return {
        ...state,
        fetchingIndividual: true,
        fetchedIndividual: false,
        individual: null,
        errorIndividual: null,
      };
    case REQUEST(ACTION_TYPE.GET_GROUP):
      return {
        ...state,
        fetchingGroup: true,
        fetchedGroup: false,
        group: null,
        errorGroup: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_INDIVIDUALS):
      return {
        ...state,
        fetchingIndividuals: false,
        fetchedIndividuals: true,
        individuals: parseData(action.payload.data.individual)?.map((individual) => ({
          ...individual,
          id: decodeId(individual.id),
        })),
        individualsPageInfo: pageInfo(action.payload.data.individual),
        individualsTotalCount: action.payload.data.individual ? action.payload.data.individual.totalCount : null,
        errorIndividuals: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.SEARCH_GROUPS):
      return {
        ...state,
        fetchingGroups: false,
        fetchedGroups: true,
        groups: parseData(action.payload.data.group)?.map((group) => ({
          ...group,
          id: decodeId(group.id),
        })),
        groupsPageInfo: pageInfo(action.payload.data.individual),
        groupsTotalCount: action.payload.data.group ? action.payload.data.group.totalCount : null,
        errorGroups: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GET_INDIVIDUAL):
      return {
        ...state,
        fetchingIndividual: false,
        fetchedIndividual: true,
        individual: parseData(action.payload.data.individual).map((individual) => ({
          ...individual,
          id: decodeId(individual.id),
        }))?.[0],
        errorIndividual: null,
      };
    case SUCCESS(ACTION_TYPE.GET_GROUP):
      return {
        ...state,
        fetchingGroup: false,
        fetchedIGroup: true,
        group: parseData(action.payload.data.group).map((group) => ({
          ...group,
          id: decodeId(group.id),
        }))?.[0],
        errorGroup: null,
      };
    case ERROR(ACTION_TYPE.SEARCH_INDIVIDUALS):
      return {
        ...state,
        fetchingIndividuals: false,
        errorIndividuals: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.SEARCH_GROUPS):
      return {
        ...state,
        fetchingGroups: false,
        errorGroups: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_INDIVIDUAL):
      return {
        ...state,
        fetchingIndividual: false,
        errorIndividual: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_GROUP):
      return {
        ...state,
        fetchingGroup: false,
        errorGroup: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupsExport: true,
        fetchedGroupsExport: false,
        groupsExport: null,
        groupsExportPageInfo: {},
        errorGroupsExport: null,
      };
    case SUCCESS(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupsExport: false,
        fetchedGroupsExport: true,
        groupsExport: action.payload.data.groupsExport,
        groupsExportPageInfo: pageInfo(action.payload.data.groupsExportPageInfo),
        errorGroupsExport: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupsExport: false,
        errorGroupsExport: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDIVIDUAL):
      return dispatchMutationResp(state, 'deleteIndividual', action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL):
      return dispatchMutationResp(state, 'updateIndividual', action);
    case SUCCESS(ACTION_TYPE.DELETE_GROUP):
      return dispatchMutationResp(state, 'deleteGroup', action);
    case SUCCESS(ACTION_TYPE.UPDATE_GROUP):
      return dispatchMutationResp(state, 'updateGroup', action);
    default:
      return state;
  }
}

export default reducer;
