import React from 'react';
import { FormattedMessage } from '@openimis/fe-core';

const IndividualTaskTableHeaders = () => [
  <FormattedMessage module="individual" id="individual.firstName" />,
  <FormattedMessage module="individual" id="individual.lastName" />,
  <FormattedMessage module="individual" id="individual.dob" />,
];

const IndividualTaskItemFormatters = () => [
  (individual) => individual?.first_name,
  (individual) => individual?.last_name,
  (individual) => individual?.dob,
];

export { IndividualTaskTableHeaders, IndividualTaskItemFormatters };
