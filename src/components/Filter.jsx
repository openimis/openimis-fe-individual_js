import React from 'react';
import {
  FormControlLabel,
  Checkbox,
  Grid,
  withTheme,
  withStyles,
} from '@material-ui/core';
import {
  formatMessage,
  TextInput,
  PublishedComponent,
} from '@openimis/fe-core';
import _debounce from 'lodash/debounce';
import { injectIntl } from 'react-intl';
import { INDIVIDUAL_MODULE_NAME } from '../constants';
import { defaultFilterStyles } from '../util/styles';

export const useFilterChangeHandler = (onChangeFilters) => {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, 300);

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    const filterValue = lookup ? `${filterName}_${lookup}: "${value}"` : `${filterName}: "${value}"`;
    debouncedOnChangeFilters([{ id: filterName, value, filter: filterValue }]);
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
    <Grid item xs={2}>
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
    <Grid item xs={2}>
      <FormControlLabel
        control={(
          <Checkbox
            checked={checked}
            onChange={onChange}
            name={filterName}
          />
        )}
        label={formatMessage(intl, INDIVIDUAL_MODULE_NAME, label)}
      />
    </Grid>
  );
}

function Filter({
  intl, classes, filters, onChangeFilters, filterFields, checkboxFields,
}) {
  const { onChangeStringFilter, onChangeFilter } = useFilterChangeHandler(onChangeFilters);

  return (
    <Grid container className={classes.form}>
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

      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.DetailedLocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(Filter)));
