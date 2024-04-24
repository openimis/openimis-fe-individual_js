export const CONTAINS_LOOKUP = 'Icontains';
export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 10;
export const EMPTY_STRING = '';
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const RIGHT_INDIVIDUAL_SEARCH = 159001;
export const RIGHT_INDIVIDUAL_CREATE = 159002;
export const RIGHT_INDIVIDUAL_UPDATE = 159003;
export const RIGHT_INDIVIDUAL_DELETE = 159004;

export const RIGHT_GROUP_INDIVIDUAL_SEARCH = RIGHT_INDIVIDUAL_SEARCH;
export const RIGHT_GROUP_INDIVIDUAL_CREATE = RIGHT_INDIVIDUAL_CREATE;
export const RIGHT_GROUP_INDIVIDUAL_UPDATE = RIGHT_INDIVIDUAL_UPDATE;
export const RIGHT_GROUP_INDIVIDUAL_DELETE = RIGHT_INDIVIDUAL_DELETE;

export const RIGHT_GROUP_SEARCH = 180001;
export const RIGHT_GROUP_CREATE = 180002;
export const RIGHT_GROUP_UPDATE = 180003;
export const RIGHT_GROUP_DELETE = 180004;

export const RIGHT_SCHEMA_SEARCH = 171001;

export const BENEFIT_PLANS_LIST_TAB_VALUE = 'BenefitPlansListTab';
export const INDIVIDUALS_LIST_TAB_VALUE = 'IndividualsListTab';
export const INDIVIDUAL_CHANGELOG_TAB_VALUE = 'IndividualChangelogTab';
export const INDIVIDUAL_TASK_TAB_VALUE = 'IndividualTaskTab';
export const GROUP_CHANGELOG_TAB_VALUE = 'GroupChangelogTab';
export const GROUP_INDIVIDUAL_HISTORY_TAB_VALUE = 'GroupIndividualHistoryTab';
export const GROUP_TASK_TAB_VALUE = 'GroupTaskTab';
export const BENEFITS_TAB_VALUE = 'BenefitTaskTab';
export const INDIVIDUAL_TABS_LABEL_CONTRIBUTION_KEY = 'individual.TabPanel.label';
export const INDIVIDUAL_TABS_PANEL_CONTRIBUTION_KEY = 'individual.TabPanel.panel';

export const GROUPS_TABS_LABEL_CONTRIBUTION_KEY = 'group.TabPanel.label';
export const GROUPS_TABS_PANEL_CONTRIBUTION_KEY = 'group.TabPanel.panel';

export const BENEFIT_PLAN_TABS_LABEL_CONTRIBUTION_KEY = 'individual.BenefitPlansListTabLabel';
export const BENEFIT_PLAN_TABS_PANEL_CONTRIBUTION_KEY = 'individual.BenefitPlansListTabPanel';
export const TASK_CONTRIBUTION_KEY = 'tasksManagement.tasks';
export const BENEFITS_CONTRIBUTION_KEY = 'payroll.benefitConsumptionPayrollSearcher';

export const BENEFICIARY_STATUS = {
  POTENTIAL: 'POTENTIAL',
  ACTIVE: 'ACTIVE',
  GRADUATED: 'GRADUATED',
  SUSPENDED: 'SUSPENDED',
};

export const GROUP_INDIVIDUAL_ROLES = {
  HEAD: 'HEAD',
  RECIPIENT: 'RECIPIENT',
};

export const GROUP_INDIVIDUAL_ROLES_LIST = [
  GROUP_INDIVIDUAL_ROLES.HEAD, GROUP_INDIVIDUAL_ROLES.RECIPIENT,
];

export const BENEFIT_PLAN_LABEL = 'BenefitPlan';
export const INDIVIDUAL_LABEL = 'Individual';
export const GROUP_LABEL = 'Group';
export const BENEFITS_LABEL = 'Benefits';

export const INDIVIDUAL_MODULE_NAME = 'individual';

export const FETCH_BENEFIT_PLAN_SCHEMA_FIELDS_REF = 'socialProtection.fetchBenefitPlanSchemaFields';
export const INDIVIDUAL_ENROLMENT_DIALOG_CONTRIBUTION_KEY = 'individual.IndividualsEnrolmentDialog';
export const INDIVIDUALS_UPLOAD_FORM_CONTRIBUTION_KEY = 'individual.IndividualsUploadDialog';
export const CLEARED_STATE_FILTER = {
  field: '', filter: '', type: '', value: '',
};
export const INDIVIDUAL = 'Individual';
export const INTEGER = 'integer';
export const STRING = 'string';
export const BOOLEAN = 'boolean';
export const DATE = 'date';
export const BOOL_OPTIONS = [
  { value: 'True', label: 'True' },
  { value: 'False', label: 'False' },
];
export const UPLOAD_STATUS = {
  PENDING: 'PENDING',
  TRIGGERED: 'TRIGGERED',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
  WAITING_FOR_VERIFICATION: 'WAITING_FOR_VERIFICATION',
  FAIL: 'FAIL',
};
export const INDIVIDUALS_QUANTITY_LIMIT = 15;
