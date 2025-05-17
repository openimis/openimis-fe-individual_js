/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import VisibilityIcon from '@material-ui/icons/Visibility';
import AddIcon from '@material-ui/icons/Add';
import { Divider, Grid } from '@material-ui/core';
import {
  decodeId,
  formatMessage,
  formatMessageWithValues,
  fetchCustomFilter,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AdvancedCriteriaRowValue from './AdvancedCriteriaRowValue';
import {
  CLEARED_STATE_FILTER,
  INDIVIDUAL,
  DEFAULT_BENEFICIARY_STATUS,
} from '../../constants';
import { isBase64Encoded, isEmptyObject, capitalize } from '../../utils';
import { confirmEnrollment, fetchIndividualEnrollmentSummary } from '../../actions';
import IndividualPreviewEnrollmentDialog from './IndividualPreviewEnrollmentDialog';
import ErrorSnackbar from './ErrorSnackbar';
import SummaryCard from '../generics/SummaryCard';

const styles = (theme) => ({
  item: theme.paper.item,
});

function AdvancedCriteriaForm({
  intl,
  classes,
  benefitPlan,
  fetchCustomFilter,
  customFilters,
  moduleName,
  objectType,
  setAppliedCustomFilters,
  // eslint-disable-next-line no-unused-vars
  appliedFiltersRowStructure,
  setAppliedFiltersRowStructure,
  updateAttributes,
  getDefaultAppliedCustomFilters,
  additionalParams,
  fetchIndividualEnrollmentSummary,
  enrollmentSummary,
  fetchedEnrollmentSummary,
  confirmEnrollment,
  confirmed,
  clearConfirm,
  coreConfirm,
  rights,
  editedEnrollmentParams,
}) {
  // eslint-disable-next-line no-unused-vars
  const [currentFilter, setCurrentFilter] = useState({
    field: '', filter: '', type: '', value: '', amount: '',
  });
  const [filters, setFilters] = useState(getDefaultAppliedCustomFilters());
  const [filtersToApply, setFiltersToApply] = useState(null);
  const status = editedEnrollmentParams?.status;
  const [enrollmentSummaryParams, setEnrollmentSummaryParams] = useState(null);
  const [summaryMatchesEditedParams, setSummaryMatchesEditedParams] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const getBenefitPlanDefaultCriteria = () => {
    const jsonExt = benefitPlan?.jsonExt ?? '{}';
    const jsonData = JSON.parse(jsonExt);

    // Note: advanced_criteria is migrated from [filters] to {status: filters}
    // For backward compatibility default status take on the old filters
    let criteria = jsonData?.advanced_criteria || {};
    if (Array.isArray(criteria)) {
      criteria = { [DEFAULT_BENEFICIARY_STATUS]: criteria };
    }

    return criteria[status] || [];
  };

  useEffect(() => {
    const defaultAppliedCustomFilters = getDefaultAppliedCustomFilters();
    if (!defaultAppliedCustomFilters.length) {
      setFilters(getBenefitPlanDefaultCriteria());
    } else {
      setFilters(defaultAppliedCustomFilters);
    }
  }, [editedEnrollmentParams]);

  useEffect(() => {
    const stringFilters = filters.map(({
      filter, value, field, type,
    }) => (`"${field}__${filter}__${type}=${value}"`));

    const isMatch = (
      enrollmentSummaryParams && benefitPlan && status
      && decodeId(enrollmentSummaryParams.benefitPlan.id) === decodeId(benefitPlan?.id)
      && `[${enrollmentSummaryParams.customFilters}]` === `[${stringFilters}]`
      && enrollmentSummaryParams.status === editedEnrollmentParams.status
    );

    setSummaryMatchesEditedParams(isMatch);
  }, [benefitPlan?.id, filters, editedEnrollmentParams?.status]);

  const createParams = (moduleName, objectTypeName, uuidOfObject = null, additionalParams = null) => {
    const params = [
      `moduleName: "${moduleName}"`,
      `objectTypeName: "${objectTypeName}"`,
    ];
    if (uuidOfObject) {
      params.push(`uuidOfObject: "${uuidOfObject}"`);
    }
    if (additionalParams) {
      params.push(`additionalParams: ${JSON.stringify(JSON.stringify(additionalParams))}`);
    }
    return params;
  };

  const fetchFilters = (params) => {
    fetchCustomFilter(params);
  };

  const handleClose = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
  };

  const handleAddFilter = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setFilters([...filters, CLEARED_STATE_FILTER]);
  };

  function updateJsonExt(inputJsonExt, outputFilters) {
    const existingData = JSON.parse(inputJsonExt || '{}');
    const filterData = JSON.parse(outputFilters);

    const advancedCriteria = existingData?.advanced_criteria || {};
    const updatedAdvancedCriteria = { ...advancedCriteria, [status]: filterData };
    existingData.advanced_criteria = updatedAdvancedCriteria;

    const updatedJsonExt = JSON.stringify(existingData);
    return updatedJsonExt;
  }

  const handleRemoveFilter = () => {
    setCurrentFilter(CLEARED_STATE_FILTER);
    setAppliedFiltersRowStructure([CLEARED_STATE_FILTER]);
    setFilters([CLEARED_STATE_FILTER]);
  };

  const saveCriteria = () => {
    setAppliedFiltersRowStructure(filters);
    const outputFilters = JSON.stringify(
      filters.map(({
        filter, value, field, type,
      }) => ({
        custom_filter_condition: `${field}__${filter}__${type}=${value}`,
      })),
    );
    const jsonExt = updateJsonExt(editedEnrollmentParams.jsonExt, outputFilters);
    updateAttributes(jsonExt);
    setAppliedCustomFilters(outputFilters);

    // Parse the jsonExt string to extract advanced_criteria
    const jsonData = JSON.parse(jsonExt);
    const advancedCriteria = jsonData.advanced_criteria?.[status] || [];

    // Extract custom_filter_condition values and construct customFilters array
    const customFilters = advancedCriteria.map((criterion) => `"${criterion.custom_filter_condition}"`);
    setFiltersToApply(customFilters);
    const params = [
      `customFilters: [${customFilters}]`,
      `benefitPlanId: "${decodeId(benefitPlan.id)}"`,
      `status: "${status}"`,
    ];
    fetchIndividualEnrollmentSummary(params);

    setEnrollmentSummaryParams({
      ...enrollmentSummaryParams,
      customFilters,
      benefitPlan,
      status,
    });

    setSummaryMatchesEditedParams(true);

    handleClose();
  };

  useEffect(() => {
    setSnackbarOpen(enrollmentSummary?.maxActiveBeneficiariesExceeded);
  }, [enrollmentSummary]);

  useEffect(() => {
    if (benefitPlan && isEmptyObject(benefitPlan) === false) {
      let paramsToFetchFilters = [];
      if (objectType === INDIVIDUAL) {
        paramsToFetchFilters = createParams(
          moduleName,
          objectType,
          isBase64Encoded(benefitPlan.id) ? decodeId(benefitPlan.id) : benefitPlan.id,
          additionalParams,
        );
      } else {
        paramsToFetchFilters = createParams(
          moduleName,
          objectType,
          additionalParams,
        );
      }
      fetchFilters(paramsToFetchFilters);
    }
  }, [benefitPlan]);

  useEffect(() => {}, [filters]);

  const openConfirmEnrollmentDialog = () => {
    coreConfirm(
      formatMessage(intl, 'individual', 'individual.enrollment.confirmTitle'),
      formatMessageWithValues(intl, 'individual', 'individual.enrollment.confirmMessageDialog', { benefitPlanName: benefitPlan.name }),
    );
  };

  useEffect(() => {
    if (confirmed) {
      const outputFilters = JSON.stringify(
        filters.map(({
          filter, value, field, type,
        }) => ({
          custom_filter_condition: `${field}__${filter}__${type}=${value}`,
        })),
      );
      const jsonExt = updateJsonExt(editedEnrollmentParams.jsonExt, outputFilters);
      const jsonData = JSON.parse(jsonExt);
      const advancedCriteria = jsonData.advanced_criteria?.[status] || [];

      // Extract custom_filter_condition values and construct customFilters array
      const customFilters = advancedCriteria.map((criterion) => `"${criterion.custom_filter_condition}"`);
      setFiltersToApply(customFilters);
      const params = {
        customFilters: `[${customFilters}]`,
        benefitPlanId: `"${decodeId(benefitPlan.id)}"`,
        status: `"${status}"`,
      };
      confirmEnrollment(
        params,
        formatMessage(intl, 'individual', 'individual.enrollment.mutationLabel'),
      );
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  return (
    <>
      {filters.map((filter, index) => (
        <AdvancedCriteriaRowValue
          customFilters={customFilters}
          currentFilter={filter}
          setCurrentFilter={setCurrentFilter}
          index={index}
          filters={filters}
          setFilters={setFilters}
          readOnly={confirmed}
        />
      ))}
      <Grid
        container
        item
        direction="row"
        spacing={2}
        style={{ margin: '0px', marginBottom: '8px' }}
      >
        <Grid item>
          <Button
            onClick={handleAddFilter}
            variant="text"
            disabled={confirmed}
            startIcon={<AddIcon />}
          >
            {formatMessage(intl, 'individual', 'individual.enrollment.addFilters')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={handleRemoveFilter}
            variant="text"
            disabled={confirmed}
          >
            {formatMessage(intl, 'individual', 'individual.enrollment.clearAllFilters')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={saveCriteria}
            variant="contained"
            color="primary"
            autoFocus
            disabled={!benefitPlan || confirmed}
            startIcon={<VisibilityIcon />}
          >
            {formatMessage(intl, 'individual', 'individual.enrollment.previewEnrollment')}
          </Button>
        </Grid>
        {(fetchedEnrollmentSummary && summaryMatchesEditedParams) && (
          <Grid item xs="auto">
            <IndividualPreviewEnrollmentDialog
              rights={rights}
              classes={classes}
              advancedCriteria={filtersToApply}
              benefitPlanToEnroll={enrollmentSummaryParams.benefitPlan.id}
              enrollmentSummary={enrollmentSummary}
              confirmed={confirmed}
              startIcon={<VisibilityIcon />}
            />
          </Grid>
        )}
      </Grid>
      {(fetchedEnrollmentSummary && summaryMatchesEditedParams) && (
      <div>
        <Divider style={{ width: '100%' }} />
        <div className={classes.item}>
          {formatMessage(intl, 'individual', 'individual.enrollment.summary')}
        </div>
        <Grid container spacing={2} style={{ padding: '10px 0px' }}>
          <Grid item xs={12}>
            <SummaryCard
              title={formatMessage(intl, 'individual', 'individual.enrollment.totalNumberOfIndividuals')}
              number={enrollmentSummary.totalNumberOfIndividuals}
            />
          </Grid>
          <Grid item xs={12}>
            <SummaryCard
              title={formatMessage(intl, 'individual', 'individual.enrollment.numberOfSelectedIndividuals')}
              number={enrollmentSummary.numberOfSelectedIndividuals}
            />
          </Grid>
          <Grid item xs={12}>
            <SummaryCard
              title={formatMessageWithValues(intl, 'individual', 'individual.enrollment.numberOfIndividualsToUpload', { benefitPlanName: benefitPlan?.name })}
              number={enrollmentSummary.numberOfIndividualsToUpload}
            />
          </Grid>
          <Grid item xs={12}>
            <SummaryCard
              title={formatMessageWithValues(intl, 'individual', 'individual.enrollment.numberOfIndividualsAssignedToSelectedProgrammeAndStatus', { selectedStatus: capitalize(editedEnrollmentParams?.status), benefitPlanName: benefitPlan?.name })}
              number={enrollmentSummary.numberOfIndividualsAssignedToSelectedProgrammeAndStatus}
            />
          </Grid>
          <Grid item xs={12}>
            <SummaryCard
              title={formatMessageWithValues(intl, 'individual', 'individual.enrollment.numberOfIndividualsWithStatusPostEnrollment', { selectedStatus: capitalize(editedEnrollmentParams?.status), benefitPlanName: benefitPlan?.name })}
              number={enrollmentSummary.numberOfIndividualsToUpload + enrollmentSummary.numberOfIndividualsAssignedToSelectedProgrammeAndStatus}
              errorNumber={enrollmentSummary.maxActiveBeneficiariesExceeded}
            />
          </Grid>
          <ErrorSnackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={snackbarOpen}
            setOpen={setSnackbarOpen}
          >
            {formatMessageWithValues(intl, 'individual', 'individual.enrollment.warnMaxActiveBeneficiariesExceeded', { benefitPlanName: benefitPlan?.name, maxActiveBeneficiaries: benefitPlan?.maxBeneficiaries })}
          </ErrorSnackbar>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs />
          <Grid item xs="auto">
            <Button
              onClick={() => openConfirmEnrollmentDialog()}
              variant="contained"
              color="primary"
              autoFocus
              disabled={!benefitPlan || confirmed || enrollmentSummary.numberOfIndividualsToUpload === '0' || enrollmentSummary.maxActiveBeneficiariesExceeded}
            >
              {formatMessage(intl, 'individual', 'individual.enrollment.confirmEnrollment')}
            </Button>
          </Grid>
        </Grid>
      </div>
      )}
    </>
  );
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  confirmed: state.core.confirmed,
  fetchingCustomFilters: state.core.fetchingCustomFilters,
  errorCustomFilters: state.core.errorCustomFilters,
  fetchedCustomFilters: state.core.fetchedCustomFilters,
  customFilters: state.core.customFilters,
  fetchingEnrollmentSummary: state.individual.fetchingEnrollmentSummary,
  errorEnrollmentSummary: state.individual.errorEnrollmentSummary,
  fetchedEnrollmentSummary: state.individual.fetchedEnrollmentSummary,
  enrollmentSummary: state.individual.enrollmentSummary,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchCustomFilter,
  fetchIndividualEnrollmentSummary,
  confirmEnrollment,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default injectIntl(
  withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AdvancedCriteriaForm))),
);
