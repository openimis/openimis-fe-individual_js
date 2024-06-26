import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { GROUP_INDIVIDUAL_HISTORY_TAB_VALUE } from '../constants';

function GroupIndividualHistoryTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(GROUP_INDIVIDUAL_HISTORY_TAB_VALUE)}
      selected={isSelected(GROUP_INDIVIDUAL_HISTORY_TAB_VALUE)}
      value={GROUP_INDIVIDUAL_HISTORY_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'groupIndividualHistory.label')}
    />
  );
}

function GroupIndividualHistoryTabPanel({
  value, rights, individual,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={GROUP_INDIVIDUAL_HISTORY_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        individualId={individual?.id}
        pubRef="individual.GroupIndividualHistorySearcher"
      />
    </PublishedComponent>
  );
}

export { GroupIndividualHistoryTabLabel, GroupIndividualHistoryTabPanel };
