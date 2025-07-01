import React from 'react';
import { injectIntl } from 'react-intl';
import { TextInput, PublishedComponent, formatMessage } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING } from '../constants';
import { defaultFilterStyles } from '../util/styles';
import GroupIndividualRolePicker from '../pickers/GroupIndividualRolePicker';

function GroupIndividualFilter({
  intl, classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    if (lookup) {
      debouncedOnChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}_${lookup}: "${value}"`,
        },
      ]);
    } else {
      onChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}: "${value}"`,
        },
      ]);
    }
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="individual.firstName"
          value={filterTextFieldValue('individual_FirstName')}
          onChange={onChangeStringFilter('individual_FirstName', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="individual.lastName"
          value={filterTextFieldValue('individual_LastName')}
          onChange={onChangeStringFilter('individual_LastName', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="individual"
          label="individual.dob"
          value={filterValue('individual_Dob')}
          onChange={(v) => onChangeFilters([
            {
              id: 'individual_Dob',
              value: v,
              filter: `individual_Dob: "${v}"`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <GroupIndividualRolePicker
          withNull
          nullLabel={formatMessage(intl, 'individual', 'any')}
          value={filterValue('role')}
          onChange={(value) => onChangeFilters([
            {
              id: 'role',
              value,
              filter: `role: ${value}`,
            },
          ])}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(GroupIndividualFilter)));
