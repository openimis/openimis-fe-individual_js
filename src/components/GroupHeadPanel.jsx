import React, { Fragment } from "react";
import { Grid, Divider, Typography } from '@mui/material';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
  PublishedComponent,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { useTheme, styled } from '@mui/material/styles';
import { EMPTY_STRING, RIGHT_GROUP_UPDATE } from '../constants';

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .tableTitle': theme.table?.title ?? {},
  '& .item': theme.paper?.item ?? {},
  '& .fullHeight': {
    height: "100%",
  },
}));

class GroupHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.updatableFields = [
      "code",
      "location",
    ];
  }

  isReadOnly = (field) => {
    const { rights, isUpdatable } = this.props;
    if (!rights?.includes(RIGHT_GROUP_UPDATE) || !isUpdatable) return true;
    switch (field) {
      case "code":
        return !!this.props.groupId;
      case "location":
        return this.props.readOnly;
      default:
        return false;
    }
  };

  render() {
    const {
      edited, mandatoryFieldsEmpty, groupId, isUpdatable,
    } = this.props;
    const group = { ...edited };
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
                  <FormattedMessage module="individual" id="group.headPanelTitle" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </StyledGrid>
        <Divider />
        {mandatoryFieldsEmpty && (
          <Fragment>
            <div className="item">
              <FormattedMessage module="individual" id="group.mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </Fragment>
        )}
        <StyledGrid container className="item">
          <Grid size={3} className="item">
            <TextInput
              readOnly={this.isReadOnly("code")}
              module="individual"
              label="group.code"
              onChange={(v) => this.updateAttribute('code', v)}
              value={group?.code ?? EMPTY_STRING}
            />
          </Grid>
          <Grid size={12}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              readOnly={this.isReadOnly("location")}
              required={true}
              value={!edited ? null : edited.location}
              onChange={(v) => this.updateAttribute('location', v)}
              filterLabels={false}
            />
          </Grid>
        </StyledGrid>
      </Fragment>
    );
  }
}

export { StyledGrid };
export default withModulesManager(injectIntl(GroupHeadPanel));
