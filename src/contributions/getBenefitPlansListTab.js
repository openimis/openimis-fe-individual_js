/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { Contributions } from '@openimis/fe-core';
import { BENEFIT_PLAN_TABS_LABEL_CONTRIBUTION_KEY, BENEFIT_PLAN_TABS_PANEL_CONTRIBUTION_KEY } from '../constants';

function BenefitPlansListTabLabel(props) {
  return (
    <Contributions
      contributionKey={BENEFIT_PLAN_TABS_LABEL_CONTRIBUTION_KEY}
      {...props}
    />
  );
}

function BenefitPlansListTabPanel(props) {
  return (
    <Contributions
      contributionKey={BENEFIT_PLAN_TABS_PANEL_CONTRIBUTION_KEY}
      {...props}
    />
  );
}

const getBenefitPlansListTab = () => ({ BenefitPlansListTabLabel, BenefitPlansListTabPanel });

export default getBenefitPlansListTab;
