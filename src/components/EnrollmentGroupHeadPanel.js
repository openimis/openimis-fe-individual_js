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
import AdvancedCriteriaGroupForm from './dialogs/AdvancedCriteriaGroupForm';
import { CLEARED_STATE_FILTER } from '../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class EnrollmentGroupHeadPanel extends FormPanel {
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
    const { jsonExt } = this.props?.edited ?? {};
    try {
      const jsonData = JSON.parse(jsonExt);
      const advancedCriteria = jsonData.advanced_criteria || [];
      return advancedCriteria.map(({ custom_filter_condition }) => {
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
    } catch (error) {
      return [];
    }
  };

  setAppliedCustomFilters = (appliedCustomFilters) => {
    this.setState({ appliedCustomFilters });
  };

  setAppliedFiltersRowStructure = (appliedFiltersRowStructure) => {
    this.setState({ appliedFiltersRowStructure });
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { edited, classes, intl } = this.props;
    const enrollment = { ...edited };
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
              value={enrollment?.benefitPlan}
              type="GROUP"
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="socialProtection.BeneficiaryStatusPicker"
              required
              withNull={false}
              filterLabels={false}
              onChange={(status) => this.updateAttribute('status', status)}
              value={enrollment?.status}
            />
          </Grid>
        </Grid>
        <Divider />
        <Grid>
          <>
            <div className={classes.item}>
              {formatMessage(intl, 'individual', 'individual.enrollment.criteria')}
            </div>
            <Divider />
            <Grid container className={classes.item}>
              <AdvancedCriteriaGroupForm
                object={enrollment.benefitPlan}
                objectToSave={enrollment}
                moduleName="individual"
                objectType="Individual"
                setAppliedCustomFilters={this.setAppliedCustomFilters}
                appliedCustomFilters={appliedCustomFilters}
                appliedFiltersRowStructure={appliedFiltersRowStructure}
                setAppliedFiltersRowStructure={this.setAppliedFiltersRowStructure}
                updateAttributes={this.updateJsonExt}
                getDefaultAppliedCustomFilters={this.getDefaultAppliedCustomFilters}
                additionalParams={enrollment?.benefitPlan ? { benefitPlan: `${decodeId(enrollment.benefitPlan.id)}` } : null}
                edited={this.props.edited}
              />
            </Grid>
          </>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(EnrollmentGroupHeadPanel))));
