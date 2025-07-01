import React from 'react';
import Filter from './Filter';

function GroupFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const filterFields = [
    { name: 'code_Icontains', label: 'group.code' },
    { name: 'firstName', label: 'group.individual.firstName' },
    { name: 'lastName', label: 'group.individual.lastName' },
  ];

  const checkboxFields = [
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

export default GroupFilter;
