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
  BenefitPlansListTabLabel,
  BenefitPlansListTabPanel,
} from './components/BenefitPlansListTab';
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
  ],
  'individual.TabPanel.label': [
    BenefitPlansListTabLabel,
  ],
  'individual.TabPanel.panel': [
    BenefitPlansListTabPanel,
  ],
};

export const IndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
