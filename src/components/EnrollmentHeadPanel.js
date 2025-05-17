/* eslint-disable max-len */
/* eslint-disable camelcase */
import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid, Divider } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  decodeId,
  FormPanel,
  PublishedComponent,
  formatMessage,
  withModulesManager,
} from '@openimis/fe-core';
import AdvancedCriteriaForm from './dialogs/AdvancedCriteriaForm';
import { CLEARED_STATE_FILTER } from '../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class EnrollmentHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      appliedCustomFilters: [CLEARED_STATE_FILTER],
      appliedFiltersRowStructure: [CLEARED_STATE_FILTER],
    };
  }

  updateJsonExt = (value) => {
    this.updateAttributes({
      jsonExt: value,
    });
  };

  getDefaultAppliedCustomFilters = () => {
    const editedEnrollmentParams = this.props?.edited;
    const jsonExt = editedEnrollmentParams?.jsonExt ?? '{}';
    const status = editedEnrollmentParams?.status;
    const jsonData = JSON.parse(jsonExt);
    const filters = jsonData.advanced_criteria?.[status] || [];
    return filters.map(({ custom_filter_condition }) => {
      const [field, filter, typeValue] = custom_filter_condition.split('__');
      const [type, value] = typeValue.split('=');
      return {
        custom_filter_condition,
        field,
        filter,
        type,
        value,
      };
    });
  };

  setAppliedCustomFilters = (appliedCustomFilters) => {
    this.setState({ appliedCustomFilters });
  };

  setAppliedFiltersRowStructure = (appliedFiltersRowStructure) => {
    this.setState({ appliedFiltersRowStructure });
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { edited: editedEnrollmentParams, classes, intl } = this.props;
    const { appliedCustomFilters, appliedFiltersRowStructure } = this.state;
    return (
      <>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="socialProtection.BenefitPlanPicker"
              withNull
              required
              filterLabels={false}
              onChange={(benefitPlan) => this.updateAttribute('benefitPlan', benefitPlan)}
              value={editedEnrollmentParams?.benefitPlan}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="socialProtection.BeneficiaryStatusPicker"
              required
              withNull={false}
              filterLabels={false}
              onChange={(status) => this.updateAttribute('status', status)}
              value={editedEnrollmentParams?.status}
            />
          </Grid>
        </Grid>
        <Grid>
          <>
            <Grid container className={classes.item}>
              <Divider style={{ width: '100%' }} />
              <div className={classes.item}>
                {formatMessage(intl, 'individual', 'individual.enrollment.criteria')}
              </div>
              <Divider />
            </Grid>
            <Grid container className={classes.item}>
              <AdvancedCriteriaForm
                benefitPlan={editedEnrollmentParams.benefitPlan}
                moduleName="individual"
                objectType="Individual"
                setAppliedCustomFilters={this.setAppliedCustomFilters}
                appliedCustomFilters={appliedCustomFilters}
                appliedFiltersRowStructure={appliedFiltersRowStructure}
                setAppliedFiltersRowStructure={this.setAppliedFiltersRowStructure}
                updateAttributes={this.updateJsonExt}
                getDefaultAppliedCustomFilters={this.getDefaultAppliedCustomFilters}
                additionalParams={editedEnrollmentParams?.benefitPlan ? { benefitPlan: `${decodeId(editedEnrollmentParams.benefitPlan.id)}` } : null}
                editedEnrollmentParams={editedEnrollmentParams}
              />
            </Grid>
          </>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(EnrollmentHeadPanel))));
