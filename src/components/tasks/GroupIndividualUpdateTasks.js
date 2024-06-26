import React from 'react';
import { FormattedMessage } from '@openimis/fe-core';

const GroupIndividualUpdateTaskTableHeaders = () => [
  <FormattedMessage module="individual" id="groupIndividual.individual.groupId" />,
  <FormattedMessage module="individual" id="groupIndividual.individual.individualId" />,
  <FormattedMessage module="individual" id="groupIndividual.individual.role" />,
];

const GroupIndividualUpdateTaskItemFormatters = () => [
  (groupIndividual) => groupIndividual?.group ?? groupIndividual?.group_id,
  (groupIndividual) => groupIndividual?.id,
  (groupIndividual) => groupIndividual?.role,
];

export { GroupIndividualUpdateTaskTableHeaders, GroupIndividualUpdateTaskItemFormatters };
