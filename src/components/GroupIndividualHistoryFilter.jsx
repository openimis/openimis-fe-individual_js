import React, { useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { formatMessage } from '@openimis/fe-core';
import { Grid } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import _debounce from 'lodash/debounce';
import { DEFAULT_DEBOUNCE_TIME } from '../constants';
import { defaultFilterStyles } from '../util/styles';
import GroupIndividualRolePicker from '../pickers/GroupIndividualRolePicker';
import GroupPicker from '../pickers/GroupPicker';

const StyledGrid = styled(Grid)(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

function GroupIndividualHistoryFilter({
  intl, filters, onChangeFilters, groupId,
}) {
  const theme = useTheme();
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
    <StyledGrid container className="form">
      <StyledGrid size={2} className="item">
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
      </StyledGrid>
      <StyledGrid size={2} className="item">
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
      </StyledGrid>
    </StyledGrid>
  );
}

export { StyledGrid };
export default injectIntl(GroupIndividualHistoryFilter);
