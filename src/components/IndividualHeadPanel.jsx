import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  formatMessage,
  FormattedMessage,
  PublishedComponent,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { useTheme, styled } from '@mui/material/styles';
import AdditionalFieldsDialog from './dialogs/AdditionalFieldsDialog';

const StyledGrid = styled(Grid)(({ theme }) => ({
  ...theme?.table?.title,
  '& .item': theme?.paper?.item,
  '& .fullHeight': {
    height: '100%',
  },
}));

class IndividualHeadPanel extends FormPanel {
  render() {
    const {
      intl, edited, mandatoryFieldsEmpty,
    } = this.props;
    const individual = { ...edited };
    const currentDate = new Date();
    const locReadOnly = individual.groupindividuals?.edges?.length > 0;
    const locTitle = locReadOnly ? formatMessage(intl, 'individual', 'individual.locationEditDisabledTitle') : '';

    return (
      <>
        <StyledGrid container className="tableTitle">
          <StyledGrid>
            <StyledGrid
              container
              align="center"
              justify="center"
              direction="column"
              className="fullHeight"
            >
              <StyledGrid>
                <Typography>
                  <FormattedMessage module="individual" id="individual.headPanelTitle" />
                </Typography>
              </StyledGrid>
            </StyledGrid>
          </StyledGrid>
        </StyledGrid>
        <Divider />
        {mandatoryFieldsEmpty && (
          <>
            <div className="item">
              <FormattedMessage module="individual" id="individual.mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </>
        )}
        <StyledGrid container className="item">
          <StyledGrid size={3} className="item">
            <TextInput
              module="individual"
              label="individual.firstName"
              required
              onChange={(v) => this.updateAttribute('firstName', v)}
              value={individual?.firstName}
            />
          </StyledGrid>
          <StyledGrid size={3} className="item">
            <TextInput
              module="individual"
              label="individual.lastName"
              required
              onChange={(v) => this.updateAttribute('lastName', v)}
              value={individual?.lastName}
            />
          </StyledGrid>
          <StyledGrid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="individual"
              label="individual.dob"
              required
              onChange={(v) => this.updateAttribute('dob', v)}
              value={individual?.dob}
              maxDate={currentDate}
            />
          </StyledGrid>
          <StyledGrid size={3} className="item">
            <AdditionalFieldsDialog
              individualJsonExt={individual?.jsonExt}
            />
          </StyledGrid>
          <StyledGrid size={12}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              required={false}
              readOnly={locReadOnly}
              value={!edited ? null : edited.location}
              onChange={(v) => this.updateAttribute('location', v)}
              filterLabels={false}
              title={locTitle}
            />
          </StyledGrid>
        </StyledGrid>
      </>
    );
  }
}

export { StyledGrid };
export default withModulesManager(injectIntl(IndividualHeadPanel));
