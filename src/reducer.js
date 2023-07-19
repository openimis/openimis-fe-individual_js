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
import {
  REQUEST, SUCCESS, ERROR, CLEAR,
} from './util/action-type';

export const ACTION_TYPE = {
  MUTATION: 'INDIVIDUAL_MUTATION',
  SEARCH_INDIVIDUALS: 'INDIVIDUAL_INDIVIDUALS',
  SEARCH_GROUP_INDIVIDUALS: 'GROUP_INDIVIDUAL_GROUP_INDIVIDUALS',
  SEARCH_GROUPS: 'GROUP_GROUPS',
  GET_INDIVIDUAL: 'INDIVIDUAL_INDIVIDUAL',
  GET_GROUP: 'GROUP_GROUP',
  DELETE_INDIVIDUAL: 'INDIVIDUAL_DELETE_INDIVIDUAL',
  DELETE_GROUP_INDIVIDUAL: 'GROUP_INDIVIDUAL_DELETE_GROUP_INDIVIDUAL',
  DELETE_GROUP: 'GROUP_DELETE_GROUP',
  UPDATE_INDIVIDUAL: 'INDIVIDUAL_UPDATE_INDIVIDUAL',
  UPDATE_GROUP_INDIVIDUAL: 'GROUP_INDIVIDUAL_UPDATE_GROUP_INDIVIDUAL',
  UPDATE_GROUP: 'GROUP_UPDATE_GROUP',
  GROUP_EXPORT: 'GROUP_EXPORT',
  INDIVIDUAL_EXPORT: 'INDIVIDUAL_EXPORT',
  GROUP_INDIVIDUAL_EXPORT: 'GROUP_INDIVIDUAL_EXPORT',
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
    fetchingGroupIndividuals: false,
    errorGroupIndividuals: null,
    fetchedGroupIndividuals: false,
    groupIndividuals: [],
    groupIndividualsPageInfo: {},
    groupIndividualsTotalCount: 0,
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
    fetchingGroupsExport: true,
    fetchedGroupsExport: false,
    groupsExport: null,
    groupsExportPageInfo: {},
    errorGroupsExport: null,
    fetchingIndividualsExport: true,
    fetchedIndividualsExport: false,
    individualsExport: null,
    individualsExportPageInfo: {},
    errorIndividualsExport: null,
    fetchingGroupIndividualsExport: true,
    fetchedGroupIndividualsExport: false,
    groupIndividualsExport: null,
    groupIndividualsExportPageInfo: {},
    errorGroupIndividualsExport: null,
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
    case REQUEST(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS):
      return {
        ...state,
        fetchingGroupIndividuals: true,
        fetchedGroupIndividuals: false,
        groupIndividuals: [],
        groupIndividualsPageInfo: {},
        groupIndividualsTotalCount: 0,
        errorGroupIndividuals: null,
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
    case SUCCESS(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS):
      return {
        ...state,
        fetchingGroupIndividuals: false,
        fetchedGroupIndividuals: true,
        groupIndividuals: parseData(action.payload.data.groupIndividual)?.map((groupIndividual) => {
          const response = ({
            ...groupIndividual,
            id: decodeId(groupIndividual.id),
          });
          if (response?.individual?.id) {
            response.individual = ({
              ...response.individual,
              id: decodeId(response.individual.id),
            });
          }
          if (response?.group?.id) {
            response.group = ({
              ...response.group,
              id: decodeId(response.group.id),
            });
          }
          return response;
        }),
        groupIndividualsPageInfo: pageInfo(action.payload.data.groupIndividual),
        groupIndividualsTotalCount: action.payload.data.groupIndividual
          ? action.payload.data.groupIndividual.totalCount
          : null,
        errorGroupIndividuals: formatGraphQLError(action.payload),
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
        groupsPageInfo: pageInfo(action.payload.data.group),
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
    case ERROR(ACTION_TYPE.SEARCH_GROUP_INDIVIDUALS):
      return {
        ...state,
        fetchingGroupIndividuals: false,
        errorGroupIndividuals: formatServerError(action.payload),
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
        fetchingGroupExport: true,
        fetchedGroupExport: false,
        groupExport: null,
        groupExportPageInfo: {},
        errorGroupExport: null,
      };
    case SUCCESS(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupExport: false,
        fetchedGroupExport: true,
        groupExport: action.payload.data.groupExport,
        groupExportPageInfo: pageInfo(action.payload.data.groupExportPageInfo),
        errorGroupExport: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupExport: false,
        errorGroupExport: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingIndividualExport: true,
        fetchedIndividualExport: false,
        individualExport: null,
        individualExportPageInfo: {},
        errorIndividualExport: null,
      };
    case REQUEST(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingGroupIndividualExport: true,
        fetchedGroupIndividualExport: false,
        groupIndividualExport: null,
        groupIndividualExportPageInfo: {},
        errorGroupIndividualExport: null,
      };
    case SUCCESS(ACTION_TYPE.INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingIndividualsExport: false,
        fetchedIndividualsExport: true,
        individualExport: action.payload.data.individualExport,
        individualExportPageInfo: pageInfo(action.payload.data.individualExportPageInfo),
        errorIndividualExport: formatGraphQLError(action.payload),
      };
    case SUCCESS(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingGroupIndividualsExport: false,
        fetchedGroupIndividualsExport: true,
        groupIndividualExport: action.payload.data.groupIndividualExport,
        groupIndividualExportPageInfo: pageInfo(action.payload.data.groupIndividualExportPageInfo),
        errorGroupIndividualExport: formatGraphQLError(action.payload),
      };
    case ERROR(ACTION_TYPE.INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingIndividualExport: false,
        errorIndividualExport: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingGroupIndividualExport: false,
        errorGroupIndividualExport: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GROUP_EXPORT):
      return {
        ...state,
        fetchingGroupExport: false,
        fetchedGroupExport: false,
        groupExport: null,
        groupExportPageInfo: {},
        errorGroupExport: null,
      };
    case CLEAR(ACTION_TYPE.GROUP_INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingGroupIndividualExport: false,
        fetchedGroupIndividualExport: false,
        groupIndividualExport: null,
        groupIndividualExportPageInfo: {},
        errorGroupIndividualExport: null,
      };
    case CLEAR(ACTION_TYPE.INDIVIDUAL_EXPORT):
      return {
        ...state,
        fetchingIndividualExport: false,
        fetchedIndividualExport: false,
        individualExport: null,
        individualExportPageInfo: {},
        errorIndividualExport: null,
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDIVIDUAL):
      return dispatchMutationResp(state, 'deleteIndividual', action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL):
      return dispatchMutationResp(state, 'updateIndividual', action);
    case SUCCESS(ACTION_TYPE.DELETE_GROUP_INDIVIDUAL):
      return dispatchMutationResp(state, 'removeIndividualFromGroup', action);
    case SUCCESS(ACTION_TYPE.UPDATE_GROUP_INDIVIDUAL):
      return dispatchMutationResp(state, 'editIndividualInGroup', action);
    case SUCCESS(ACTION_TYPE.DELETE_GROUP):
      return dispatchMutationResp(state, 'deleteGroup', action);
    case SUCCESS(ACTION_TYPE.UPDATE_GROUP):
      return dispatchMutationResp(state, 'updateGroup', action);
    default:
      return state;
  }
}

export default reducer;
