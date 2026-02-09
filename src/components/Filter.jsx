import React from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  formatMessage,
  GRID_RESPONSIVE_SMALL,
  PublishedComponent,
  TextInput,
} from '@openimis/fe-core';
import _debounce from 'lodash/debounce';
import { injectIntl } from 'react-intl';
import { INDIVIDUAL_MODULE_NAME } from '../constants';
import { defaultFilterStyles } from '../util/styles';

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .form': {
    padding: 0,
  },
  '& .item': {
    padding: theme.spacing(1),
  },
  ...defaultFilterStyles(theme),
}));

export const useFilterChangeHandler = (onChangeFilters) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, 300);

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    const filterValue = lookup
      ? `${filterName}_${lookup}: "${value}"`
      : `${filterName}: "${value}"`;
    debouncedOnChangeFilters([
      { id: filterName, value, filter: filterValue },
    ]);
  };

  const onChangeFilter = (k, v) => {
    onChangeFilters([{ id: k, value: v, filter: `${k}: ${v}` }]);
  };

  return { onChangeStringFilter, onChangeFilter };
};

function FilterTextInput({
  module, label, value, onChange,
}) {
  return (
    <Grid size={GRID_RESPONSIVE_SMALL} className="item">
      <TextInput
        module={module}
        label={label}
        value={value}
        onChange={onChange}
      />
    </Grid>
  );
}

function FilterCheckbox({
  checked, onChange, label, intl, filterName,
}) {
  return (
    <Grid size={GRID_RESPONSIVE_SMALL} className="item">
      <FormControlLabel
        control={
          <Checkbox checked={checked} onChange={onChange} name={filterName} />
        }
        label={formatMessage(intl, INDIVIDUAL_MODULE_NAME, label)}
      />
    </Grid>
  );
}

function Filter({
  intl,
  filters,
  onChangeFilters,
  filterFields,
  checkboxFields,
}) {
  const { onChangeStringFilter, onChangeFilter } = useFilterChangeHandler(onChangeFilters);

  return (
    <StyledGrid container className="form">
      {filterFields.map((field) => (
        <FilterTextInput
          key={field.name}
          module={INDIVIDUAL_MODULE_NAME}
          label={field.label}
          value={filters?.[field.name]?.value ?? ''}
          onChange={onChangeStringFilter(field.name, field.lookup)}
        />
      ))}

      {checkboxFields.map((field) => (
        <FilterCheckbox
          key={field.name}
          checked={filters?.[field.name]?.value ?? false}
          onChange={(event) => onChangeFilter(field.name, event.target.checked)}
          label={field.label}
          intl={intl}
          moduleName={INDIVIDUAL_MODULE_NAME}
          filterName={field.name}
        />
      ))}

      <Grid size={12}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
          split
        />
      </Grid>
    </StyledGrid>
  );
}

export { StyledGrid };
export default injectIntl(Filter);
