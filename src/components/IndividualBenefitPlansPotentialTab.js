import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import {
  BENEFICIARY_STATUS,
  INDIVIDUAL_BENEFIT_PLANS_POTENTIAL_TAB_VALUE,
} from '../constants';

function IndividualBenefitPlansPotentialTabLabel({
  intl, onChange, tabStyle, isSelected,
}) {
  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUAL_BENEFIT_PLANS_POTENTIAL_TAB_VALUE)}
      selected={isSelected(INDIVIDUAL_BENEFIT_PLANS_POTENTIAL_TAB_VALUE)}
      value={INDIVIDUAL_BENEFIT_PLANS_POTENTIAL_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'benefitPlansPotential.label')}
    />
  );
}

function IndividualBenefitPlansPotentialTabPanel({ value, rights, individual }) {
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUAL_BENEFIT_PLANS_POTENTIAL_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        beneficiaryStatus={BENEFICIARY_STATUS.POTENTIAL}
        individualId={individual?.id}
        pubRef="socialProtection.BenefitPlanSearcher"
      />
    </PublishedComponent>
  );
}

export { IndividualBenefitPlansPotentialTabLabel, IndividualBenefitPlansPotentialTabPanel };
