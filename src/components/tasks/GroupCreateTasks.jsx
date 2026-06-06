import React from 'react';
import { FormattedMessage } from '@openimis/fe-core';

const GroupCreateTaskTableHeaders = () => [
  <FormattedMessage module="individual" id="group.id" />,
  <FormattedMessage module="individual" id="group.members" />,
];

const GroupCreateTaskItemFormatters = () => [
  (group) => group?.id,
  (group) => group?.group_individual_id,
];

export { GroupCreateTaskTableHeaders, GroupCreateTaskItemFormatters };
