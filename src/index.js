// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import flatten from 'flat';
import { FormattedMessage } from '@openimis/fe-core';
import React from 'react';
import { Person, People } from '@material-ui/icons';
import messages_en from './translations/en.json';
import reducer from './reducer';
import IndividualsPage from './pages/IndividualsPage';
import IndividualPage from './pages/IndividualPage';
import EnrollmentPage from './pages/EnrollmentPage';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';
import { IndividualsListTabLabel, IndividualsListTabPanel } from './components/IndividualsListTab';
import {
  IndividalChangelogTabLabel,
  IndividalChangelogTabPanel,
} from './components/IndividualChangelogTab';
import {
  IndividalTaskTabLabel,
  IndividalTaskTabPanel,
} from './components/IndividualTaskTab';
import getBenefitPlansListTab from './contributions/getBenefitPlansListTab';
import GroupIndividualSearcher from './components/GroupIndividualSearcher';
import { clearIndividualExport, downloadIndividuals, fetchIndividuals } from './actions';
import IndividualHistorySearcher from './components/IndividualHistorySearcher';
import {
  IndividualTaskItemFormatters,
  IndividualTaskTableHeaders,
} from './components/tasks/IndividualTasks';
import GroupHistorySearcher from './components/GroupHistorySearcher';
import { GroupChangelogTabLabel, GroupChangelogTabPanel } from './components/GroupChangelogTab';
import { GroupTaskTabLabel, GroupTaskTabPanel } from './components/GroupTaskTab';
import {
  GroupIndividualUpdateTaskItemFormatters,
  GroupIndividualUpdateTaskTableHeaders,
} from './components/tasks/GroupIndividualUpdateTasks';
import {
  GROUP_LABEL,
  INDIVIDUAL_LABEL,
  INDIVIDUAL_MODULE_NAME,
  RIGHT_GROUP_SEARCH,
  RIGHT_INDIVIDUAL_SEARCH,
} from './constants';
import { GroupCreateTaskItemFormatters, GroupCreateTaskTableHeaders } from './components/tasks/GroupCreateTasks';
import IndividualsUploadDialog from './components/dialogs/IndividualsUploadDialog';
import { BenefitsTabLabel, BenefitsTabPanel } from './components/BenefitsTab';
import GroupIndividualHistorySearcher from './components/GroupIndividualHistorySearcher';
import {
  GroupIndividualHistoryTabLabel,
  GroupIndividualHistoryTabPanel,
} from './components/GroupIndividualHistoryTab';
import AdvancedCriteriaRowValue from './components/dialogs/AdvancedCriteriaRowValue';
import IndividualPicker from './pickers/IndividualPicker';
import {
  GroupUploadConfirmationPanel,
  GroupUploadResolutionItemFormatters,
  GroupUploadResolutionTaskTableHeaders
} from "./components/tasks/GroupImportTasks";
import EnrollmentGroupPage from './pages/EnrollmentGroupPage';
import GroupMenu from './components/dialogs/GroupMenu';

const ROUTE_INDIVIDUALS = 'individuals';
const ROUTE_INDIVIDUAL = 'individuals/individual';
const ROUTE_INDIVIDUAL_FROM_GROUP = 'groups/group/individuals/individual';
const ROUTE_GROUPS = 'groups';
const ROUTE_GROUP = 'groups/group';
const ROUTE_ENROLLMENT = 'individuals/enrollment';
const ROUTE_GROUP_ENROLLMENT = 'groups/enrollment';

const BENEFIT_PLAN_TABS_LABEL_REF_KEY = 'socialProtection.BenefitPlansListTabLabel';
const BENEFIT_PLAN_TABS_PANEL_REF_KEY = 'socialProtection.BenefitPlansListTabPanel';
const { BenefitPlansListTabLabel, BenefitPlansListTabPanel } = getBenefitPlansListTab();

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: flatten(messages_en) }],
  reducers: [{ key: 'individual', reducer }],
  'core.Router': [
    { path: ROUTE_INDIVIDUALS, component: IndividualsPage },
    { path: ROUTE_GROUPS, component: GroupsPage },
    { path: ROUTE_ENROLLMENT, component: EnrollmentPage },
    { path: ROUTE_GROUP_ENROLLMENT, component: EnrollmentGroupPage },
    { path: `${ROUTE_INDIVIDUAL}/:individual_uuid?`, component: IndividualPage },
    { path: `${ROUTE_INDIVIDUAL_FROM_GROUP}/:individual_uuid?`, component: IndividualPage },
    { path: `${ROUTE_GROUP}/:group_uuid?`, component: GroupPage },
  ],
  'socialProtection.MainMenu': [
    {
      text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="menu.individuals" />,
      icon: <Person />,
      route: `/${ROUTE_INDIVIDUALS}`,
      filter: (rights) => rights.includes(RIGHT_INDIVIDUAL_SEARCH),
    },
    {
      text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="menu.groups" />,
      icon: <People />,
      route: `/${ROUTE_GROUPS}`,
      filter: (rights) => rights.includes(RIGHT_GROUP_SEARCH),
    },
  ],
  refs: [
    { key: 'individual.route.individual', ref: ROUTE_INDIVIDUAL },
    { key: 'individual.route.enrollment', ref: ROUTE_ENROLLMENT },
    { key: 'individual.route.groupEnrollment', ref: ROUTE_GROUP_ENROLLMENT },
    { key: 'individual.route.group', ref: ROUTE_GROUP },
    { key: 'individual.GroupIndividualSearcher', ref: GroupIndividualSearcher },
    { key: 'individual.actions.fetchIndividuals', ref: fetchIndividuals },
    { key: 'individual.actions.downloadIndividuals', ref: downloadIndividuals },
    { key: 'individual.actions.clearIndividualExport', ref: clearIndividualExport },
    { key: 'individual.IndividualHistorySearcher', ref: IndividualHistorySearcher },
    { key: 'individual.GroupHistorySearcher', ref: GroupHistorySearcher },
    { key: 'individual.IndividualsUploadDialog', ref: IndividualsUploadDialog },
    { key: 'individual.GroupIndividualHistorySearcher', ref: GroupIndividualHistorySearcher },
    { key: 'individual.AdvancedCriteriaRowValue', ref: AdvancedCriteriaRowValue },
    { key: 'individual.IndividualPicker', ref: IndividualPicker },
    { key: 'individual.group.GroupMenu', ref: GroupMenu },
  ],
  'individual.IndividualsUploadDialog': IndividualsUploadDialog,
  'individual.group.GroupMenu': GroupMenu,
  'individual.TabPanel.label': [
    BenefitPlansListTabLabel,
    IndividalChangelogTabLabel,
    IndividalTaskTabLabel,
    BenefitsTabLabel,
    GroupIndividualHistoryTabLabel,
  ],
  'individual.TabPanel.panel': [
    BenefitPlansListTabPanel,
    IndividalChangelogTabPanel,
    IndividalTaskTabPanel,
    BenefitsTabPanel,
    GroupIndividualHistoryTabPanel,
  ],
  'group.TabPanel.label': [
    IndividualsListTabLabel,
    BenefitPlansListTabLabel,
    GroupChangelogTabLabel,
    GroupTaskTabLabel,
  ],
  'group.TabPanel.panel': [
    IndividualsListTabPanel,
    BenefitPlansListTabPanel,
    GroupChangelogTabPanel,
    GroupTaskTabPanel,
  ],
  'individual.BenefitPlansListTabLabel': [BENEFIT_PLAN_TABS_LABEL_REF_KEY],
  'individual.BenefitPlansListTabPanel': [BENEFIT_PLAN_TABS_PANEL_REF_KEY],
  'tasksManagement.tasks': [{
    text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="individual.tasks.title" />,
    tableHeaders: IndividualTaskTableHeaders,
    itemFormatters: IndividualTaskItemFormatters,
    taskSource: ['IndividualService'],
    taskCode: INDIVIDUAL_LABEL,
  },
  {
    text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="groupIndividual.tasks.update.title" />,
    tableHeaders: GroupIndividualUpdateTaskTableHeaders,
    itemFormatters: GroupIndividualUpdateTaskItemFormatters,
    taskSource: ['GroupIndividualService'],
    taskCode: GROUP_LABEL,
  },
  {
    text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="group.tasks.create.title" />,
    tableHeaders: GroupCreateTaskTableHeaders,
    itemFormatters: GroupCreateTaskItemFormatters,
    taskSource: ['CreateGroupAndMoveIndividualService'],
    taskCode: GROUP_LABEL,
  },
  {
    text: <FormattedMessage module={INDIVIDUAL_MODULE_NAME} id="validation_import_group_valid_items.tasks.title" />,
    tableHeaders: GroupUploadResolutionTaskTableHeaders,
    itemFormatters: GroupUploadResolutionItemFormatters,
    taskSource: ['import_group_valid_items'],
    confirmationPanel: GroupUploadConfirmationPanel,
  },
  ],
};

export const IndividualModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
