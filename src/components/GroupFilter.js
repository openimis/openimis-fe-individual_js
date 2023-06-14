import React from 'react';
import { injectIntl } from 'react-intl';
import { TextInput } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { DEFAULT_DEBOUNCE_TIME } from '../constants';
import { defaultFilterStyles } from '../util/styles';

function GroupFilter({
  classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? '';

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
          label="group.id"
          value={filterTextFieldValue('searchId')}
          onChange={onChangeStringFilter('searchId')}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="group.individual.firstName"
          value={filterTextFieldValue('firstName')}
          onChange={onChangeStringFilter('firstName')}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="group.individual.lastName"
          value={filterTextFieldValue('lastName')}
          onChange={onChangeStringFilter('lastName')}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(GroupFilter)));
