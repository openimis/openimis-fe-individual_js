import React from 'react';
import { FormattedMessage } from '@openimis/fe-core';

const IndividualUpdateTaskTableHeaders = () => [
  <FormattedMessage module="individual" id="individual.firstName" />,
  <FormattedMessage module="individual" id="individual.lastName" />,
  <FormattedMessage module="individual" id="individual.dob" />,
];

const IndividualUpdateTaskItemFormatters = () => [
  (individual) => individual?.first_name,
  (individual) => individual?.last_name,
  (individual) => individual?.dob,
];

export { IndividualUpdateTaskTableHeaders, IndividualUpdateTaskItemFormatters };
