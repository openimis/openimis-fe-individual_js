import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { INDIVIDUAL_CHANGELOG_TAB_VALUE } from '../constants';

function IndividalChangelogTabLabel({
  intl, onChange, tabStyle, isSelected, individual,
}) {
  if (!individual) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUAL_CHANGELOG_TAB_VALUE)}
      selected={isSelected(INDIVIDUAL_CHANGELOG_TAB_VALUE)}
      value={INDIVIDUAL_CHANGELOG_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'individualChangelog.label')}
    />
  );
}

function IndividalChangelogTabPanel({
  value, individual,
}) {
  if (!individual) return null;
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUAL_CHANGELOG_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        pubRef="individual.IndividualHistorySearcher"
        individualId={individual?.id}
      />
    </PublishedComponent>
  );
}

export { IndividalChangelogTabLabel, IndividalChangelogTabPanel };
