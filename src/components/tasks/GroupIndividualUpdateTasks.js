import React from 'react';
import { FormattedMessage } from '@openimis/fe-core';

const GroupIndividualUpdateTaskTableHeaders = () => [
  <FormattedMessage module="individual" id="groupIndividual.individual.groupId" />,
  <FormattedMessage module="individual" id="groupIndividual.individual.individualId" />,
  <FormattedMessage module="individual" id="groupIndividual.individual.role" />,
  <FormattedMessage module="individual" id="groupIndividual.individual.recipientType" />,
];

const GroupIndividualUpdateTaskItemFormatters = () => [
  (groupIndividual) => groupIndividual?.group ?? groupIndividual?.group_id,
  (groupIndividual) => groupIndividual?.id,
  (groupIndividual) => groupIndividual?.role,
  (groupIndividual) => groupIndividual?.recipient_type,
];

export { GroupIndividualUpdateTaskTableHeaders, GroupIndividualUpdateTaskItemFormatters };
