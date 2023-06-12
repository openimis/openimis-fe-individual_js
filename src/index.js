// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import flatten from 'flat';
import messages_en from './translations/en.json';
import reducer from './reducer';
import BeneficiaryMainMenu from './menus/BeneficiaryMainMenu';
import IndividualsPage from './pages/IndividualsPage';
import IndividualPage from './pages/IndividualPage';
import {
  IndividualBenefitPlansListTabLabel,
  IndividualBenefitPlansListTabPanel,
} from './components/IndividualBenefitPlansListTab';
import {
  IndividualBenefitPlansActiveTabLabel,
  IndividualBenefitPlansActiveTabPanel,
} from './components/IndividualBenefitPlansActiveTab';
import {
  IndividualBenefitPlansGraduatedTabLabel,
  IndividualBenefitPlansGraduatedTabPanel,
} from './components/IndividualBenefitPlansGraduatedTab';
import {
  IndividualBenefitPlansPotentialTabLabel,
  IndividualBenefitPlansPotentialTabPanel,
} from './components/IndividualBenefitPlansPotentialTab';
import {
  IndividualBenefitPlansSuspendedTabLabel,
  IndividualBenefitPlansSuspendedTabPanel,
} from './components/IndividualBenefitPlansSuspendedTab';
import GroupsPage from './pages/GroupsPage';

const ROUTE_INDIVIDUALS = 'individuals';
const ROUTE_INDIVIDUAL = 'individuals/individual';
const ROUTE_GROUPS = 'groups';
// const ROUTE_GROUP = 'groups/group';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: 'individual', reducer }],
  'core.MainMenu': [BeneficiaryMainMenu],
  'core.Router': [
    { path: ROUTE_INDIVIDUALS, component: IndividualsPage },
    { path: ROUTE_GROUPS, component: GroupsPage },
    { path: `${ROUTE_INDIVIDUAL}/:individual_uuid?`, component: IndividualPage },
    // { path: `${ROUTE_GROUP}/:group_uuid?`, component: GroupPage },
  ],
  refs: [
    { key: 'individual.route.individual', ref: ROUTE_INDIVIDUAL },
    // { key: 'individual.route.group', ref: ROUTE_GROUP },
  ],
  'individual.TabPanel.label': [
    IndividualBenefitPlansListTabLabel,
    IndividualBenefitPlansActiveTabLabel,
    IndividualBenefitPlansGraduatedTabLabel,
    IndividualBenefitPlansPotentialTabLabel,
    IndividualBenefitPlansSuspendedTabLabel,
  ],
  'individual.TabPanel.panel': [
    IndividualBenefitPlansListTabPanel,
    IndividualBenefitPlansActiveTabPanel,
    IndividualBenefitPlansGraduatedTabPanel,
    IndividualBenefitPlansPotentialTabPanel,
    IndividualBenefitPlansSuspendedTabPanel,
  ],
};

export const IndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
