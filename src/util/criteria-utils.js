// Criteria rows that can be turned into a custom filter. An empty row was sent as
// "____=", a filter that matches nothing, so the enrolment selected no one (OP-3251).
// eslint-disable-next-line import/prefer-default-export
export function completeCriteria(filters = []) {
  return filters.filter((row) => row?.field && row?.filter);
}
