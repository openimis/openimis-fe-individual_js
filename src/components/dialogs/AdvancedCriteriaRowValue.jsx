/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { injectIntl } from 'react-intl';
import {
  PublishedComponent,
  TextInput,
  NumberInput,
  SelectInput,
  CustomFilterTypeStatusPicker,
  CustomFilterFieldStatusPicker,
} from '@openimis/fe-core';
import { Grid } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import {
  BOOLEAN,
  INTEGER,
  STRING,
  CLEARED_STATE_FILTER,
  DATE,
  BOOL_OPTIONS,
} from '../../constants';

// Styled component replacing withStyles/styles object
const StyledGrid = styled(Grid)(({ theme }) => ({
  ...theme?.paper?.item,
}));

function AdvancedCriteriaRowValue({
  // eslint-disable-next-line no-unused-vars
  intl,
  customFilters,
  currentFilter,
  setCurrentFilter,
  index,
  filters,
  setFilters,
  readOnly,
}) {
  const theme = useTheme();
  const onAttributeChange = (attribute) => (value) => {
    let updatedFilter = { ...currentFilter };

    if (attribute === 'field') {
      updatedFilter = {
        ...{
          filter: '', value: '', type: value.type,
        },
      };
    }

    const attributeValue = attribute === 'field' ? value.field : value;
    updatedFilter = {
      ...updatedFilter,
      [attribute]: attributeValue,
      ...(attribute === 'filter' && { value: '' }),
    };

    setCurrentFilter(updatedFilter);

    setFilters((prevFilters) => {
      const updatedRows = [...prevFilters];
      updatedRows[index] = { ...updatedFilter };
      return updatedRows;
    });
  };

  const removeFilter = () => {
    const newArray = [...filters];
    newArray.splice(index, 1);
    setFilters(newArray.length === 0 ? [CLEARED_STATE_FILTER] : newArray);
  };

  const renderInputBasedOnType = (type) => {
    const commonProps = {
      module: 'paymentPlan',
      label: 'paymentPlan.advancedCriteria.value',
      value: currentFilter.value,
      onChange: onAttributeChange('value'),
    };

    switch (type) {
      case BOOLEAN:
        return (
          <SelectInput
            options={BOOL_OPTIONS}
            readOnly={readOnly}
            {...commonProps}
          />
        );
      case INTEGER:
        return (
          <NumberInput
            min={0}
            displayZero
            readOnly={readOnly}
            {...commonProps}
          />
        );
      case STRING:
      default:
        if (currentFilter.field.toLowerCase().includes(DATE)) {
          return (
            <PublishedComponent
              pubRef="core.DatePicker"
              readOnly={readOnly}
              {...commonProps}
            />
          );
        }
        return (
          <TextInput
            readOnly={readOnly}
            {...commonProps}
          />
        );
    }
  };

  return (
    <StyledGrid
      container
      direction="row"
      className="item"
      style={{ backgroundColor: '#DFEDEF' }}
    >
      {filters.length > 0 && !readOnly ? (
        <div style={{
          backgroundColor: '#DFEDEF', width: '10px', height: '25px', marginTop: '25px',
        }}
        >
          <span
            style={{
              transform: 'translate(-50%, -50%)',
              fontSize: '16px',
              color: '#006273',
            }}
            onClick={removeFilter}
          >
            &#x2716;
          </span>
        </div>
      ) : (<></>)}
      <StyledGrid size={3} className="item">
        <CustomFilterFieldStatusPicker
          module="paymentPlan"
          label="paymentPlan.advancedCriteria.field"
          value={{ field: currentFilter.field, type: currentFilter.type }}
          onChange={onAttributeChange('field')}
          customFilters={customFilters}
          readOnly={readOnly}
        />
      </StyledGrid>
      {currentFilter.field !== '' ? (
        <StyledGrid size={3} className="item">
          <CustomFilterTypeStatusPicker
            module="paymentPlan"
            label="paymentPlan.advancedCriteria.filter"
            value={currentFilter.filter}
            onChange={onAttributeChange('filter')}
            customFilters={customFilters}
            customFilterField={currentFilter.field}
            readOnly={readOnly}
          />
        </StyledGrid>
      ) : (<></>)}
      {currentFilter.field !== '' && currentFilter.filter !== '' ? (
        <StyledGrid size={3} className="item">
          {renderInputBasedOnType(currentFilter.type)}
        </StyledGrid>
      ) : (<></>)}
    </StyledGrid>
  );
}

export { StyledGrid };
export default injectIntl(connect(null, null)(AdvancedCriteriaRowValue));
