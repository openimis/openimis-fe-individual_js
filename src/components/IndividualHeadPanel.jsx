import React, { Fragment } from "react";
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
import { RIGHT_INDIVIDUAL_UPDATE } from '../constants';
import AdditionalFieldsDialog from './dialogs/AdditionalFieldsDialog';

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .tableTitle': theme.table?.title ?? {},
  '& .item': theme.paper?.item ?? {},
  '& .fullHeight': {
    height: "100%",
  },
}));

class IndividualHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.updatableFields = [
      "firstName",
      "lastName",
      "dob",
      "location",
    ];
  }

  setReadOnlyFields = () =>
    this.props.setReadOnlyFields(
      this.updatableFields.filter((f) => this.isReadOnly(f))
    );

  isReadOnly = (field) => {
    const { rights, isUpdatable } = this.props;
    if (!rights?.includes(RIGHT_INDIVIDUAL_UPDATE) || !isUpdatable) return true;
    switch (field) {
      case "location":
        return this.props.edited?.groupindividuals?.edges?.length > 0;
      default:
        return false;
    }
  };

  componentDidMount() {
    this.setReadOnlyFields();
  }

  render() {
    const {
      intl, edited, mandatoryFieldsEmpty, readOnlyFields, readOnly, isUpdatable,
    } = this.props;
    const individual = { ...edited };
    const currentDate = new Date();
    const locReadOnly = individual.groupindividuals?.edges?.length > 0;
    const locTitle = locReadOnly ? formatMessage(intl, 'individual', 'individual.locationEditDisabledTitle') : '';

    return (
      <Fragment>
        <StyledGrid container className="tableTitle">
          <Grid>
            <Grid
              container
              align="center"
              justify="center"
              direction="column"
              className="fullHeight"
            >
              <Grid>
                <Typography>
                  <FormattedMessage module="individual" id="individual.headPanelTitle" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </StyledGrid>
        <Divider />
        {mandatoryFieldsEmpty && !readOnly && (
          <Fragment>
            <div className="item">
              <FormattedMessage module="individual" id="individual.mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </Fragment>
        )}
        <StyledGrid container className="item">
          <Grid size={3} className="item">
            <TextInput
              module="individual"
              label="individual.firstName"
              required
              readOnly={readOnlyFields.includes("firstName")}
              onChange={(v) => this.updateAttribute('firstName', v)}
              value={individual?.firstName}
            />
          </Grid>
          <Grid size={3} className="item">
            <TextInput
              module="individual"
              label="individual.lastName"
              required
              readOnly={readOnlyFields.includes("lastName")}
              onChange={(v) => this.updateAttribute('lastName', v)}
              value={individual?.lastName}
            />
          </Grid>
          <Grid size={3} className="item">
            <PublishedComponent
              pubRef="core.DatePicker"
              module="individual"
              label="individual.dob"
              required
              readOnly={readOnlyFields.includes("dob")}
              onChange={(v) => this.updateAttribute('dob', v)}
              value={individual?.dob}
              maxDate={currentDate}
            />
          </Grid>
          <Grid size={3} className="item">
            <AdditionalFieldsDialog
              individualJsonExt={individual?.jsonExt}
            />
          </Grid>
          <Grid size={12}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              required={false}
              readOnly={readOnlyFields.includes("location")}
              value={!edited ? null : edited.location}
              onChange={(v) => this.updateAttribute('location', v)}
              filterLabels={false}
              title={locTitle}
            />
          </Grid>
        </StyledGrid>
      </Fragment>
    );
  }
}

export { StyledGrid };
export default withModulesManager(injectIntl(IndividualHeadPanel));
