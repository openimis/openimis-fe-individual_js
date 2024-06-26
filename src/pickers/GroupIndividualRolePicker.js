import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import {
  GROUP_INDIVIDUAL_ROLES_LIST,
} from '../constants';

function GroupIndividualRolePicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="individual"
      label="groupIndividual.groupIndividualRolePicker"
      constants={GROUP_INDIVIDUAL_ROLES_LIST}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      withNull={withNull}
      nullLabel={nullLabel}
      withLabel={withLabel}
    />
  );
}

export default GroupIndividualRolePicker;
