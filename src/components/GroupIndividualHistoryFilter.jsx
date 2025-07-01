import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { formatMessage } from '@openimis/fe-core';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import { DEFAULT_DEBOUNCE_TIME } from '../constants';
import { defaultFilterStyles } from '../util/styles';
import GroupIndividualRolePicker from '../pickers/GroupIndividualRolePicker';
import GroupPicker from '../pickers/GroupPicker';

function GroupIndividualHistoryFilter({
  intl, classes, filters, onChangeFilters, groupId,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

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

  const handleGroupId = onChangeStringFilter('group_Id');
  useEffect(() => {
    if (filters?.group_Id?.value !== groupId) {
      handleGroupId(groupId);
    }
  }, [groupId]);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <GroupPicker
          withNull
          nullLabel={formatMessage(intl, 'individual', 'any')}
          value={filterValue('group_Id')}
          onChange={(value) => onChangeFilters([
            {
              id: 'group_Id',
              value,
              filter: `group_Id: "${value}"`,
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

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(GroupIndividualHistoryFilter)));
