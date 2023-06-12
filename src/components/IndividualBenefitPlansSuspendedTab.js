import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { BENEFICIARY_STATUS, INDIVIDUAL_BENEFIT_PLANS_SUSPENDED_TAB_VALUE } from '../constants';

function IndividualBenefitPlansSuspendedTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUAL_BENEFIT_PLANS_SUSPENDED_TAB_VALUE)}
      selected={isSelected(INDIVIDUAL_BENEFIT_PLANS_SUSPENDED_TAB_VALUE)}
      value={INDIVIDUAL_BENEFIT_PLANS_SUSPENDED_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'benefitPlansSuspended.label')}
    />
  );
}

function IndividualBenefitPlansSuspendedTabPanel({ value, rights, individual }) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUAL_BENEFIT_PLANS_SUSPENDED_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        beneficiaryStatus={BENEFICIARY_STATUS.SUSPENDED}
        individualId={individual?.id}
        pubRef="socialProtection.BenefitPlanSearcher"
      />
    </PublishedComponent>
  );
}

export { IndividualBenefitPlansSuspendedTabLabel, IndividualBenefitPlansSuspendedTabPanel };
