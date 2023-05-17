import { graphql, formatPageQuery, formatPageQueryWithCount, formatMutation, formatGQLString } from "@openimis/fe-core";
import { ACTION_TYPE } from "./reducer";
import { ERROR, REQUEST, SUCCESS } from "./util/action-type";

const INDIVIDUAL_FULL_PROJECTION = [
  "id",
  "isDeleted",
  "dateCreated",
  "dateUpdated",
  "dateValidFrom",
  "dateValidTo",
  "replacementUuid",
  "firstName",
  "lastName",
  "dob",
  "jsonExt"
];

export function fetchIndividuals(params) {
  const payload = formatPageQueryWithCount("individual", params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.SEARCH_INDIVIDUALS);
}
  
export function fetchIndividual(params) {
  const payload = formatPageQuery("individual", params, INDIVIDUAL_FULL_PROJECTION);
  return graphql(payload, ACTION_TYPE.GET_INDIVIDUAL);
}

export function deleteIndividual(individual, clientMutationLabel) {
    const individualUuids = `uuids: ["${individual?.id}"]`;
    const mutation = formatMutation("deleteIndividual", individualUuids, clientMutationLabel);
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

function dateTimeToDate(date) {
  return date.split('T')[0];
}

function formatIndividualGQL(individual) {
  return `
    ${!!individual.id ? `id: "${decodeId(individual.id)}"` : ""}
    ${!!individual.firstName ? `code: "${formatGQLString(individual.firstName)}"` : ""}
    ${!!individual.lastName ? `tradeName: "${formatGQLString(individual.lastName)}"` : ""}
    ${!!individual.jsonExt ? `jsonExt: ${JSON.stringify(individual.jsonExt)}` : ""}
    ${!!individual.dob ? `dob: "${dateTimeToDate(individual.dob)}"` : ""}
    ${!!individual.dateValidFrom ? `dateValidFrom: "${dateTimeToDate(individual.dateValidFrom)}"` : ""}
    ${!!individual.dateValidTo ? `dateValidTo: "${dateTimeToDate(individual.dateValidTo)}"` : ""}`;
}