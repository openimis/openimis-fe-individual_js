import React, { useState } from 'react';
import { TextField, Tooltip } from '@material-ui/core';

import {
  Autocomplete, useModulesManager,
  useTranslations, useGraphqlQuery,
  decodeId,
} from '@openimis/fe-core';
import { INDIVIDUALS_QUANTITY_LIMIT } from '../constants';

function IndividualPicker(props) {
  const {
    multiple,
    required,
    label,
    nullLabel,
    withLabel = false,
    placeholder,
    withPlaceholder = false,
    readOnly,
    value,
    onChange,
    filter,
    filterSelectedOptions,
    benefitPlan = null,
  } = props;

  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({ isDeleted: false });
  const [currentString, setCurrentString] = useState('');
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);

  if (benefitPlan) {
    const decodedBenefitPlanId = decodeId(benefitPlan.id);
    const { isLoading, data, error } = useGraphqlQuery(
      `
    query IndividualPicker(
      $decodedBenefitPlanId: String, $search: String, $first: Int, $isDeleted: Boolean
    ) {
        individual(
          lastName_Icontains: $search, 
          first: $first, 
          isDeleted: $isDeleted,
          ${decodedBenefitPlanId ? 'benefitPlanId: $decodedBenefitPlanId' : ''},
        ) {
        edges {
          node {
            id,isDeleted,dateCreated,dateUpdated,firstName,lastName,dob,jsonExt,version,userUpdated {username}
          }
        }
      }}
    `,
      { decodedBenefitPlanId },
      filters,
      { skip: true },
    );
    const individuals = data?.individual?.edges.map((edge) => edge.node) ?? [];
    const shouldShowTooltip = individuals?.length >= INDIVIDUALS_QUANTITY_LIMIT && !value && !currentString;

    return (
      <Autocomplete
        multiple={multiple}
        error={error}
        readOnly={readOnly}
        options={individuals ?? []}
        isLoading={isLoading}
        value={value}
        getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.dob}`}
        onChange={(value) => onChange(value, value ? `${value.firstName} ${value.lastName} ${value.dob}` : null)}
        setCurrentString={setCurrentString}
        filterOptions={filter}
        filterSelectedOptions={filterSelectedOptions}
        onInputChange={(search) => setFilters({ search, isDeleted: false })}
        renderInput={(inputProps) => (
          <Tooltip
            title={
            shouldShowTooltip
              ? formatMessageWithValues('IndividualsPicker.aboveLimit', { limit: INDIVIDUALS_QUANTITY_LIMIT })
              : ''
          }
          >
            <TextField
            /* eslint-disable-next-line react/jsx-props-no-spreading */
              {...inputProps}
              required={required}
              label={(withLabel && (label || nullLabel)) || formatMessage('Individual')}
              placeholder={(withPlaceholder && placeholder) || formatMessage('IndividualPicker.placeholder')}
            />
          </Tooltip>
        )}
      />
    );
  }
  const { isLoading, data, error } = useGraphqlQuery(
    `
        query IndividualPicker(
          $search: String, $first: Int, $isDeleted: Boolean
        ) {
          individual(
            lastName_Icontains: $search, 
            first: $first, 
            isDeleted: $isDeleted
        ) {
          edges {
            node {
              id,isDeleted,dateCreated,dateUpdated,firstName,lastName,dob,jsonExt,version,userUpdated {username}
            }
          }
        }}
      `,
    filters,
    { skip: true },
  );
  const individuals = data?.individual?.edges.map((edge) => edge.node) ?? [];
  const shouldShowTooltip = individuals?.length >= INDIVIDUALS_QUANTITY_LIMIT && !value && !currentString;

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={individuals ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.firstName} ${option.lastName} ${option.dob}`}
      onChange={(value) => onChange(value, value ? `${value.firstName} ${value.lastName} ${value.dob}` : null)}
      setCurrentString={setCurrentString}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ search, isDeleted: false })}
      renderInput={(inputProps) => (
        <Tooltip
          title={
            shouldShowTooltip
              ? formatMessageWithValues('IndividualsPicker.aboveLimit', { limit: INDIVIDUALS_QUANTITY_LIMIT })
              : ''
          }
        >
          <TextField
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...inputProps}
            required={required}
            label={(withLabel && (label || nullLabel)) || formatMessage('Individual')}
            placeholder={(withPlaceholder && placeholder) || formatMessage('IndividualPicker.placeholder')}
          />
        </Tooltip>
      )}
    />
  );
}

export default IndividualPicker;
