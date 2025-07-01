import React from 'react';
import { injectIntl } from 'react-intl';
import { TextInput, PublishedComponent } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING } from '../constants';
import { defaultFilterStyles } from '../util/styles';

function GroupHistoryFilter({
  classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);
  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const filterValue = (filterName) => filters?.[filterName]?.value;

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
          label="groupHistory.head"
          value={filterTextFieldValue('jsonExtHead')}
          onChange={onChangeStringFilter('jsonExtHead', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="individual"
          label="groupHistory.dateUpdated_Gte"
          value={filterValue('dateUpdated_Gte')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateUpdated_Gte',
              value: v,
              filter: `dateUpdated_Gte: "${v}T00:00:00.000Z"`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module="individual"
          label="groupHistory.dateUpdated_Lte"
          value={filterValue('dateUpdated_Lte')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateUpdated_Lte',
              value: v,
              filter: `dateUpdated_Lte: "${v}T00:00:00.000Z"`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={2} className={classes.item}>
        <TextInput
          module="individual"
          label="groupHistory.userUpdated"
          value={filterTextFieldValue('userUpdated_Username')}
          onChange={onChangeStringFilter('userUpdated_Username', CONTAINS_LOOKUP)}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(GroupHistoryFilter)));
