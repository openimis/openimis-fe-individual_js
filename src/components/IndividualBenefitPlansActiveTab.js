import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { BENEFICIARY_STATUS, INDIVIDUAL_BENEFIT_PLANS_ACTIVE_TAB_VALUE } from '../constants';

function IndividualBenefitPlansActiveTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUAL_BENEFIT_PLANS_ACTIVE_TAB_VALUE)}
      selected={isSelected(INDIVIDUAL_BENEFIT_PLANS_ACTIVE_TAB_VALUE)}
      value={INDIVIDUAL_BENEFIT_PLANS_ACTIVE_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'benefitPlansActive.label')}
    />
  );
}

function IndividualBenefitPlansActiveTabPanel({ value, rights, individual }) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUAL_BENEFIT_PLANS_ACTIVE_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        beneficiaryStatus={BENEFICIARY_STATUS.ACTIVE}
        individualId={individual?.id}
        pubRef="socialProtection.BenefitPlanSearcher"
      />
    </PublishedComponent>
  );
}

export { IndividualBenefitPlansActiveTabLabel, IndividualBenefitPlansActiveTabPanel };
