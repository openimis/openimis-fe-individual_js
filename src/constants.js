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
export const GROUP_ROUTE_GROUP = 'individual.route.group';

export const BENEFICIARY_STATUS = {
  POTENTIAL: 'POTENTIAL',
  ACTIVE: 'ACTIVE',
  GRADUATED: 'GRADUATED',
  SUSPENDED: 'SUSPENDED',
};

export const DEFAULT_BENEFICIARY_STATUS = 'POTENTIAL';

export const GROUP_INDIVIDUAL_ROLES = {
  HEAD: 'HEAD',
  SPOUSE: 'SPOUSE',
  SON: 'SON',
  DAUGHTER: 'DAUGHTER',
  GRANDFATHER: 'GRANDFATHER',
  GRANDMOTHER: 'GRANDMOTHER',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
};

export const RECIPIENT_TYPE = {
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY',
};

export const GROUP_INDIVIDUAL_ROLES_LIST = [
  GROUP_INDIVIDUAL_ROLES.HEAD,
  GROUP_INDIVIDUAL_ROLES.SPOUSE,
  GROUP_INDIVIDUAL_ROLES.SON,
  GROUP_INDIVIDUAL_ROLES.DAUGHTER,
  GROUP_INDIVIDUAL_ROLES.GRANDFATHER,
  GROUP_INDIVIDUAL_ROLES.GRANDMOTHER,
  GROUP_INDIVIDUAL_ROLES.MOTHER,
  GROUP_INDIVIDUAL_ROLES.FATHER,
];

export const RECIPIENT_TYPE_LIST = [
  RECIPIENT_TYPE.PRIMARY,
  RECIPIENT_TYPE.SECONDARY,
];

export const BENEFIT_PLAN_LABEL = 'BenefitPlan';
export const INDIVIDUAL_LABEL = 'Individual';
export const GROUP_LABEL = 'Group';
export const BENEFITS_LABEL = 'Benefits';

export const INDIVIDUAL_MODULE_NAME = 'individual';

export const FETCH_BENEFIT_PLAN_SCHEMA_FIELDS_REF = 'socialProtection.fetchBenefitPlanSchemaFields';
export const INDIVIDUAL_ENROLMENT_DIALOG_CONTRIBUTION_KEY = 'individual.IndividualsEnrolmentDialog';
export const INDIVIDUALS_UPLOAD_FORM_CONTRIBUTION_KEY = 'individual.IndividualsUploadDialog';
export const INDIVIDUAL_GROUP_MENU_CONTRIBUTION_KEY = 'individual.group.GroupMenu';
export const CLEARED_STATE_FILTER = {
  field: '', filter: '', type: '', value: '',
};
export const INDIVIDUAL = 'Individual';
export const GROUP = 'Group';
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
export const PYTHON_DEFAULT_IMPORT_WORKFLOW = 'Python Import Individuals';
export const PYTHON_PIPELINE_IMPORT_WORKFLOW = 'Python Pipeline Import Individuals';
// Workflows whose upload can build groups from a column of the file.
export const GROUPING_IMPORT_WORKFLOWS = [PYTHON_DEFAULT_IMPORT_WORKFLOW, PYTHON_PIPELINE_IMPORT_WORKFLOW];
// An upload in one of these states is still being processed: the history polls it.
export const RUNNING_UPLOAD_STATUSES = [UPLOAD_STATUS.PENDING, UPLOAD_STATUS.TRIGGERED, UPLOAD_STATUS.IN_PROGRESS];
// The history refreshes these: the running ones, and one waiting for verification,
// which can be approved from another screen while the dialog is open.
export const POLLED_UPLOAD_STATUSES = [...RUNNING_UPLOAD_STATUSES, UPLOAD_STATUS.WAITING_FOR_VERIFICATION];
export const UPLOAD_POLL_INTERVAL_MS = 3000;

export const TASK_STATUS = {
  RECEIVED: 'RECEIVED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export const APPROVED = 'APPROVED';
export const FAILED = 'FAILED';
export const ACCEPT = 'ACCEPT';
export const REJECT = 'REJECT';
