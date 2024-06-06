import React from 'react';
import { Tab } from '@material-ui/core';
import {
  formatMessage, PublishedComponent,
} from '@openimis/fe-core';
import { BENEFITS_TAB_VALUE, BENEFITS_CONTRIBUTION_KEY } from '../constants';

function BenefitsGroupTabLabel({
  intl, onChange, tabStyle, isSelected, group,
}) {
  if (!group) return null;
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BENEFITS_TAB_VALUE)}
      selected={isSelected(BENEFITS_TAB_VALUE)}
      value={BENEFITS_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'benefits.label')}
    />
  );
}

function BenefitsGroupTabPanel({
  value, group, rights, classes,
}) {
  if (!group) return null;
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={BENEFITS_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        pubRef={BENEFITS_CONTRIBUTION_KEY}
        individualUuid={group?.head?.uuid}
        rights={rights}
        classes={classes}
      />
    </PublishedComponent>
  );
}

export { BenefitsGroupTabLabel, BenefitsGroupTabPanel };
