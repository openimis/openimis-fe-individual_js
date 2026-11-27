import React from 'react';
import { formatMessage, PublishedComponent, Tab } from '@openimis/fe-core';
import { GROUP_CHANGELOG_TAB_VALUE } from '../constants';

function GroupChangelogTabLabel({
  intl, onChange, tabStyle, isSelected, group,
}) {
  if (!group?.id) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(GROUP_CHANGELOG_TAB_VALUE)}
      selected={isSelected(GROUP_CHANGELOG_TAB_VALUE)}
      value={GROUP_CHANGELOG_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'groupChangelog.label')}
    />
  );
}

function GroupChangelogTabPanel({
  value, group,
}) {
  if (!group?.id) return null;
  return (
    <PublishedComponent
      pubRef="core.TabPanel"
      module="individual"
      index={GROUP_CHANGELOG_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        pubRef="individual.GroupHistorySearcher"
        groupId={group?.id}
      />
    </PublishedComponent>
  );
}

export { GroupChangelogTabLabel, GroupChangelogTabPanel };
