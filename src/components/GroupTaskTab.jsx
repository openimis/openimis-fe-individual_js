import React from 'react';
import { Tab } from '@mui/material';
import {
  formatMessage, PublishedComponent,
  useModulesManager,
} from '@openimis/fe-core';
import { GROUP_TASK_TAB_VALUE, GROUP_LABEL, TASK_CONTRIBUTION_KEY } from '../constants';

function GroupTaskTabLabel({
  intl, onChange, tabStyle, isSelected, group,
}) {
  if (!group?.id) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(GROUP_TASK_TAB_VALUE)}
      selected={isSelected(GROUP_TASK_TAB_VALUE)}
      value={GROUP_TASK_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'groupTasks.label')}
    />
  );
}

function GroupTaskTabPanel({
  value, group, rights, classes,
}) {
  const modulesManager = useModulesManager();
  if (!group?.id) return null;
  const contributions = modulesManager.getContribs(TASK_CONTRIBUTION_KEY);
  if (contributions === undefined) {
    return null;
  }
  const filteredContribution = contributions.find((contribution) => contribution?.taskCode === GROUP_LABEL);
  if (!filteredContribution) {
    return null;
  }
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={GROUP_TASK_TAB_VALUE}
      value={value}
    >
      {/* The group's tasks are resolved on the server: they do not depend on which
          members the members tab has loaded, and the searcher is never remounted. */}
      <PublishedComponent
        pubRef="tasksManagement.taskSearcher"
        groupId={group.id}
        rights={rights}
        classes={classes}
        contribution={filteredContribution}
      />
    </PublishedComponent>
  );
}

export { GroupTaskTabLabel, GroupTaskTabPanel };
