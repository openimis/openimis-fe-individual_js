import React, { useMemo, useRef, useState } from 'react';
import {
  Autocomplete, useModulesManager, useTranslations, useGraphqlQuery,
} from '@openimis/fe-core';

// Works on label codes, which is what individuals store; options are keyed by code for the same reason.
function IndividualLabelPicker({
  value, onChange, readOnly = false, withLabel = true, withPlaceholder = false, label,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const [search, setSearch] = useState('');
  const { isLoading, data, error } = useGraphqlQuery(
    `
    query IndividualLabelPicker($search: String) {
      individualLabel(isDeleted: false, name_Icontains: $search, orderBy: ["name"]) {
        edges { node { code name } }
      }
    }
    `,
    { search },
  );

  // Names of labels seen in any earlier search, so selected chips keep their names while the options change.
  const seen = useRef(new Map());
  const options = useMemo(() => {
    const found = data?.individualLabel?.edges.map(({ node }) => ({ id: node.code, ...node })) ?? [];
    found.forEach((option) => seen.current.set(option.code, option));
    return found;
  }, [data]);
  // The core Autocomplete remounts, dropping typed text, whenever the value identity changes: rebuild it
  // only when the selection changes or a selected label's name first becomes known, not on every search.
  const selectedNames = (value ?? []).map((code) => seen.current.get(code)?.name ?? code).join('\n');
  const selected = useMemo(() => (value ?? []).map(
    (code) => seen.current.get(code) ?? { id: code, code, name: code },
  ), [value, selectedNames]);

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
      onInputChange={(text) => setSearch(text ?? '')}
      filterSelectedOptions
    />
  );
}

export default IndividualLabelPicker;
