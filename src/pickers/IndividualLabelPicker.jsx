import React, { useMemo } from 'react';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';

// Works on label codes, which is what individuals store; options are keyed by code for the same reason.
function IndividualLabelPicker({
  value, onChange, readOnly = false, withLabel = true, withPlaceholder = false, label,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const { isLoading, data, error } = useGraphqlQuery(
    `
    query IndividualLabelPicker {
      individualLabel(isDeleted: false) {
        edges { node { code name } }
      }
    }
    `,
    {},
  );

  const options = useMemo(
    () => data?.individualLabel?.edges.map(({ node }) => ({ id: node.code, ...node })) ?? [],
    [data],
  );
  // The core Autocomplete remounts whenever the value identity changes, so keep it stable.
  const selected = useMemo(() => (value ?? []).map(
    (code) => options.find((option) => option.code === code) ?? { id: code, code, name: code },
  ), [value, options]);

  return (
    <Autocomplete
      multiple
      readOnly={readOnly}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      label={label ?? formatMessage('individual.labels')}
      error={error}
      options={options}
      isLoading={isLoading}
      value={selected}
      getOptionLabel={(option) => option?.name ?? ''}
      onChange={(chosen) => onChange((chosen ?? []).map((option) => option.code))}
      onInputChange={() => {}}
      filterSelectedOptions
    />
  );
}

export default IndividualLabelPicker;
