import React from 'react';
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
import { EMPTY_STRING } from '../constants';

const StyledGrid = styled(Grid)(({ theme }) => ({
  ...theme?.table?.title,
  '& .item': theme?.paper?.item,
  '& .fullHeight': {
    height: '100%',
  },
}));

class GroupHeadPanel extends FormPanel {
  render() {
    const {
      edited, mandatoryFieldsEmpty, readOnly, groupId,
    } = this.props;
    const group = { ...edited };
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
                  <FormattedMessage module="individual" id="group.headPanelTitle" />
                </Typography>
              </StyledGrid>
            </StyledGrid>
          </StyledGrid>
        </StyledGrid>
        <Divider />
        {mandatoryFieldsEmpty && (
          <>
            <div className="item">
              <FormattedMessage module="individual" id="group.mandatoryFieldsEmptyError" />
            </div>
            <Divider />
          </>
        )}
        <StyledGrid container className="item">
          <StyledGrid size={3} className="item">
            <TextInput
              readOnly={!!groupId}
              module="individual"
              label="group.code"
              onChange={(v) => this.updateAttribute('code', v)}
              value={group?.code ?? EMPTY_STRING}
            />
          </StyledGrid>
          <StyledGrid size={12}>
            <PublishedComponent
              pubRef="location.DetailedLocation"
              withNull
              readOnly={readOnly}
              required={false}
              value={!edited ? null : edited.location}
              onChange={(v) => this.updateAttribute('location', v)}
              filterLabels={false}
            />
          </StyledGrid>
        </StyledGrid>
      </>
    );
  }
}

export { StyledGrid };
export default withModulesManager(injectIntl(GroupHeadPanel));
