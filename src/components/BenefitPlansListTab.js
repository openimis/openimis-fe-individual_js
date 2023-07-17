import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { BENEFIT_PLANS_LIST_TAB_VALUE } from '../constants';

function BenefitPlansListTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(BENEFIT_PLANS_LIST_TAB_VALUE)}
      selected={isSelected(BENEFIT_PLANS_LIST_TAB_VALUE)}
      value={BENEFIT_PLANS_LIST_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'benefitPlansList.label')}
    />
  );
}

function BenefitPlansListTabPanel({
  value, rights, individual, group,
}) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={BENEFIT_PLANS_LIST_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        individualId={individual?.id}
        groupId={group?.id}
        pubRef="socialProtection.BenefitPlanSearcherForEntities"
      />
    </PublishedComponent>
  );
}

export { BenefitPlansListTabLabel, BenefitPlansListTabPanel };
