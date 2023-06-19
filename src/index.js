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
import GroupPage from './pages/GroupPage';
import { IndividualsListTabLabel, IndividualsListTabPanel } from './components/IndividualsListTab';
import IndividualSearcher from './components/IndividualSearcher';
import { downloadIndividuals, fetchIndividuals } from './actions';

const ROUTE_INDIVIDUALS = 'individuals';
const ROUTE_INDIVIDUAL = 'individuals/individual';
const ROUTE_GROUPS = 'groups';
const ROUTE_GROUP = 'groups/group';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: 'individual', reducer }],
  'core.MainMenu': [BeneficiaryMainMenu],
  'core.Router': [
    { path: ROUTE_INDIVIDUALS, component: IndividualsPage },
    { path: ROUTE_GROUPS, component: GroupsPage },
    { path: `${ROUTE_INDIVIDUAL}/:individual_uuid?`, component: IndividualPage },
    { path: `${ROUTE_GROUP}/:group_uuid?`, component: GroupPage },
  ],
  refs: [
    { key: 'individual.route.individual', ref: ROUTE_INDIVIDUAL },
    { key: 'individual.route.group', ref: ROUTE_GROUP },
    { key: 'individual.IndividualSearcher', ref: IndividualSearcher },
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
};

export const IndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
