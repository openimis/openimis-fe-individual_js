import { 
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationResp,
  dispatchMutationErr,
  parseData,
  pageInfo,
  decodeId,
} from "@openimis/fe-core";
import { REQUEST, SUCCESS, ERROR } from "./util/action-type";

export const ACTION_TYPE = {
  MUTATION: "INDIVIDUAL_MUTATION",
  SEARCH_INDIVIDUALS: "INDIVIDUAL_INDIVIDUALS",
  GET_INDIVIDUAL: "INDIVIDUAL_INDIVIDUAL",
  DELETE_INDIVIDUAL: "INDIVIDUAL_DELETE_INDIVIDUAL",
  UPDATE_INDIVIDUAL: "INDIVIDUAL_UPDATE_INDIVIDUAL"
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
    individual: null
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
    case REQUEST(ACTION_TYPE.GET_INDIVIDUAL):
      return {
        ...state,
        fetchingIndividual: true,
        fetchedIndividual: false,
        individual: null,
        errorIndividual: null,
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
        individualsTotalCount: !!action.payload.data.individual ? action.payload.data.individual.totalCount : null,
        errorIndividuals: formatGraphQLError(action.payload),
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
    case ERROR(ACTION_TYPE.SEARCH_INDIVIDUALS):
      return {
        ...state,
        fetchingIndividuals: false,
        errorIndividuals: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_INDIVIDUAL):
      return {
        ...state,
        fetchingIndividual: false,
        errorIndividual: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.DELETE_INDIVIDUAL):
      return dispatchMutationResp(state, "deleteIndividual", action);
    case SUCCESS(ACTION_TYPE.UPDATE_INDIVIDUAL):
      return dispatchMutationResp(state, "updateIndividual", action);
    default:
      return state;
  }
}

export default reducer;
