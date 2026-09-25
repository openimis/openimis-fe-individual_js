import React from 'react';
import { Grid } from '@mui/material';
import Filter from './Filter';
import IndividualLabelPicker from '../pickers/IndividualLabelPicker';
import { CONTAINS_LOOKUP } from '../constants';

const NO_LABELS = [];

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

  const onChangeLabels = (codes) => onChangeFilters([{
    id: 'labels',
    value: codes.length ? codes : null,
    filter: `labels: ${JSON.stringify(codes)}`,
  }]);

  return (
    <>
      <Filter
        intl={intl}
        classes={classes}
        filters={filters}
        onChangeFilters={onChangeFilters}
        filterFields={filterFields}
        checkboxFields={checkboxFields}
      />
      <Grid container>
        <Grid size={6} sx={{ padding: 1 }}>
          <IndividualLabelPicker value={filters?.labels?.value ?? NO_LABELS} onChange={onChangeLabels} />
        </Grid>
      </Grid>
    </>
  );
}

export default IndividualFilter;
