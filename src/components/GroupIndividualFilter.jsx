import React from 'react';
import { injectIntl } from 'react-intl';
import { TextInput, PublishedComponent, formatMessage, GRID_RESPONSIVE_STANDARD } from '@openimis/fe-core';
import { Grid } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import _debounce from 'lodash/debounce';
import { CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING } from '../constants';
import { defaultFilterStyles } from '../util/styles';
import GroupIndividualRolePicker from '../pickers/GroupIndividualRolePicker';

const StyledGrid = styled(Grid)(({ theme }) => ({
  ...defaultFilterStyles(theme),
}));

function GroupIndividualFilter({
  intl, filters, onChangeFilters,
}) {
  const theme = useTheme();
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
    <StyledGrid container className="form">
      <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
        <TextInput
          module="individual"
          label="individual.firstName"
          value={filterTextFieldValue('individual_FirstName')}
          onChange={onChangeStringFilter('individual_FirstName', CONTAINS_LOOKUP)}
        />
      </StyledGrid>
      <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
        <TextInput
          module="individual"
          label="individual.lastName"
          value={filterTextFieldValue('individual_LastName')}
          onChange={onChangeStringFilter('individual_LastName', CONTAINS_LOOKUP)}
        />
      </StyledGrid>
      <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
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
      </StyledGrid>
      <StyledGrid size={GRID_RESPONSIVE_STANDARD} className="item">
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
export default injectIntl(GroupIndividualFilter);
