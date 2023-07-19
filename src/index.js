// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import flatten from 'flat';
import messages_en from './translations/en.json';
import reducer from './reducer';
import IndividualsMainMenu from './menus/IndividualsMainMenu';
import IndividualsPage from './pages/IndividualsPage';
import IndividualPage from './pages/IndividualPage';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';
import { IndividualsListTabLabel, IndividualsListTabPanel } from './components/IndividualsListTab';
import getBenefitPlansListTab from './contributions/getBenefitPlansListTab';
import GroupIndividualSearcher from './components/GroupIndividualSearcher';
import { downloadIndividuals, fetchIndividuals } from './actions';

const ROUTE_INDIVIDUALS = 'individuals';
const ROUTE_INDIVIDUAL = 'individuals/individual';
const ROUTE_INDIVIDUAL_FROM_GROUP = 'groups/group/individuals/individual';
const ROUTE_GROUPS = 'groups';
const ROUTE_GROUP = 'groups/group';

const BENEFIT_PLAN_TABS_LABEL_REF_KEY = 'socialProtection.BenefitPlansListTabLabel';
const BENEFIT_PLAN_TABS_PANEL_REF_KEY = 'socialProtection.BenefitPlansListTabPanel';
const { BenefitPlansListTabLabel, BenefitPlansListTabPanel } = getBenefitPlansListTab();

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: 'individual', reducer }],
  'core.MainMenu': [IndividualsMainMenu],
  'core.Router': [
    { path: ROUTE_INDIVIDUALS, component: IndividualsPage },
    { path: ROUTE_GROUPS, component: GroupsPage },
    { path: `${ROUTE_INDIVIDUAL}/:individual_uuid?`, component: IndividualPage },
    { path: `${ROUTE_INDIVIDUAL_FROM_GROUP}/:individual_uuid?`, component: IndividualPage },
    { path: `${ROUTE_GROUP}/:group_uuid?`, component: GroupPage },
  ],
  refs: [
    { key: 'individual.route.individual', ref: ROUTE_INDIVIDUAL },
    { key: 'individual.route.group', ref: ROUTE_GROUP },
    { key: 'individual.GroupIndividualSearcher', ref: GroupIndividualSearcher },
    { key: 'individual.actions.fetchIndividuals', ref: fetchIndividuals },
    { key: 'individual.actions.downloadIndividuals', ref: downloadIndividuals },
  ],
  'individual.TabPanel.label': [
    IndividualsListTabLabel,
    BenefitPlansListTabLabel,
  ],
  'individual.TabPanel.panel': [
    IndividualsListTabPanel,
    BenefitPlansListTabPanel,
  ],
  'individual.BenefitPlansListTabLabel': [BENEFIT_PLAN_TABS_LABEL_REF_KEY],
  'individual.BenefitPlansListTabPanel': [BENEFIT_PLAN_TABS_PANEL_REF_KEY],
};

export const IndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
