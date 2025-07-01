import React from 'react';
import Filter from './Filter';
import { CONTAINS_LOOKUP } from '../constants';

function IndividualFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const filterFields = [
    { name: 'firstName', label: 'individual.firstName', lookup: CONTAINS_LOOKUP },
    { name: 'lastName', label: 'individual.lastName', lookup: CONTAINS_LOOKUP },
  ];

  const checkboxFields = [
    { name: 'isDeleted', label: 'isDeleted' },
    { name: 'location_Isnull', label: 'hasNoLocation' },
  ];

  return (
    <Filter
      intl={intl}
      classes={classes}
      filters={filters}
      onChangeFilters={onChangeFilters}
      filterFields={filterFields}
      checkboxFields={checkboxFields}
    />
  );
}

export default IndividualFilter;
