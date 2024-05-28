import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import {
  RECIPIENT_TYPE_LIST,
} from '../constants';

function GroupIndividualRecipientTypePicker(props) {
  const {
    required, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  console.log(value)
  return (
    <ConstantBasedPicker
      module="individual"
      label="groupIndividual.groupIndividualRecipientTypePicker"
      constants={RECIPIENT_TYPE_LIST}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      withNull
      nullLabel={nullLabel}
      withLabel={withLabel}
    />
  );
}

export default GroupIndividualRecipientTypePicker;
