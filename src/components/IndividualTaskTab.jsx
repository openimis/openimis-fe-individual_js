import React from 'react';
import { Tab } from '@material-ui/core';
import {
  formatMessage, PublishedComponent,
  useModulesManager,
} from '@openimis/fe-core';
import { INDIVIDUAL_LABEL, INDIVIDUAL_TASK_TAB_VALUE, TASK_CONTRIBUTION_KEY } from '../constants';

function IndividalTaskTabLabel({
  intl, onChange, tabStyle, isSelected, individual,
}) {
  if (!individual) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUAL_TASK_TAB_VALUE)}
      selected={isSelected(INDIVIDUAL_TASK_TAB_VALUE)}
      value={INDIVIDUAL_TASK_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'individualTasks.label')}
    />
  );
}

function IndividalTaskTabPanel({
  value, individual, rights, classes,
}) {
  if (!individual) return null;
  const modulesManager = useModulesManager();
  const contributions = modulesManager.getContribs(TASK_CONTRIBUTION_KEY);
  if (contributions === undefined) {
    return null;
  }
  const filteredContribution = contributions.find((contribution) => contribution?.taskCode === INDIVIDUAL_LABEL);
  if (!filteredContribution) {
    return null;
  }
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUAL_TASK_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        pubRef="tasksManagement.taskSearcher"
        entityId={individual?.id}
        rights={rights}
        classes={classes}
        contribution={filteredContribution}
      />
    </PublishedComponent>
  );
}

export { IndividalTaskTabLabel, IndividalTaskTabPanel };
