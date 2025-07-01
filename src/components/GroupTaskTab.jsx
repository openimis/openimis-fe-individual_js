import React from 'react';
import { Tab } from '@material-ui/core';
import {
  formatMessage, PublishedComponent,
  useModulesManager,
} from '@openimis/fe-core';
import { GROUP_TASK_TAB_VALUE, GROUP_LABEL, TASK_CONTRIBUTION_KEY } from '../constants';

function GroupTaskTabLabel({
  intl, onChange, tabStyle, isSelected, group,
}) {
  if (!group) return null;
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
  value, group, rights, classes, groupIndividualIds,
}) {
  if (!group) return null;
  const modulesManager = useModulesManager();
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
      <PublishedComponent
        pubRef="tasksManagement.taskSearcher"
        entityIds={groupIndividualIds}
        rights={rights}
        classes={classes}
        contribution={filteredContribution}
      />
    </PublishedComponent>
  );
}

export { GroupTaskTabLabel, GroupTaskTabPanel };
