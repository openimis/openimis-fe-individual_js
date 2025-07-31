/* eslint-disable max-len */
/* eslint-disable camelcase */
import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid, Divider } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';

import {
  decodeId,
  FormPanel,
  PublishedComponent,
  formatMessage,
  withModulesManager,
} from '@openimis/fe-core';
import AdvancedCriteriaForm from './dialogs/AdvancedCriteriaForm';
import { CLEARED_STATE_FILTER } from '../constants';

const StyledGrid = styled(Grid)(({ theme }) => ({
  ...theme?.table?.title,
  '& .item': theme?.paper?.item,
  '& .fullHeight': {
    height: '100%',
  },
}));

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
    const benefitPlan = this.props?.edited;
    const jsonExt = benefitPlan?.jsonExt ?? '{}';
    const status = benefitPlan?.status;
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
    const { edited, intl } = this.props;
    const { appliedCustomFilters, appliedFiltersRowStructure } = this.state;
    return (
      <>
        <StyledGrid container className="item">
          <StyledGrid item xs={3} className="item">
            <PublishedComponent
              pubRef="socialProtection.BenefitPlanPicker"
              withNull
              required
              filterLabels={false}
              onChange={(benefitPlan) => this.updateAttribute('benefitPlan', benefitPlan)}
              value={edited?.benefitPlan}
            />
          </StyledGrid>
          <StyledGrid item xs={3} className="item">
            <PublishedComponent
              pubRef="socialProtection.BeneficiaryStatusPicker"
              required
              withNull={false}
              filterLabels={false}
              onChange={(status) => this.updateAttribute('status', status)}
              value={edited?.status}
            />
          </StyledGrid>
        </StyledGrid>
        <Divider />
        <StyledGrid>
          <>
            <div className="item">
              {formatMessage(intl, 'individual', 'individual.enrollment.criteria')}
            </div>
            <Divider />
            <StyledGrid container className="item">
              <AdvancedCriteriaForm
                object={edited.benefitPlan}
                objectToSave={edited}
                moduleName="individual"
                objectType="Individual"
                setAppliedCustomFilters={this.setAppliedCustomFilters}
                appliedCustomFilters={appliedCustomFilters}
                appliedFiltersRowStructure={appliedFiltersRowStructure}
                setAppliedFiltersRowStructure={this.setAppliedFiltersRowStructure}
                updateAttributes={this.updateJsonExt}
                getDefaultAppliedCustomFilters={this.getDefaultAppliedCustomFilters}
                additionalParams={edited?.benefitPlan ? { benefitPlan: `${decodeId(edited.benefitPlan.id)}` } : null}
                edited={edited}
              />
            </StyledGrid>
          </>
        </StyledGrid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(EnrollmentHeadPanel));
