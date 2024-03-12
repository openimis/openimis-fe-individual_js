import React, { useEffect } from 'react';
import { SelectInput, formatMessage } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';

function WorkflowsPicker({
  intl,
  value,
  label,
  onChange,
  workflows,
  readOnly = false,
  withNull = false,
  nullLabel = null,
  withLabel = true,
}) {
  const options = Array.isArray(workflows) && workflows !== undefined ? [
    ...workflows
      .filter((workflow) => !workflow.name.includes('Valid'))
      .map((workflow) => ({
        value: { name: workflow.name, group: workflow.group },
        label: workflow.name,
      })),
  ] : [];

  useEffect(() => {
    if (withNull) {
      options.unshift({
        value: null,
        label: nullLabel || formatMessage(intl, 'bill', 'emptyLabel'),
      });
    }
  }, []);

  return (
    <SelectInput
      module="socialProtection"
      label={withLabel && label}
      options={options}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}

export default injectIntl(WorkflowsPicker);
