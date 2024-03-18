import React from 'react';
import { Grid, Divider, Typography } from '@material-ui/core';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
  PublishedComponent,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import AdditionalFieldsDialog from './dialogs/AdditionalFieldsDialog';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class IndividualHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, mandatoryFieldsEmpty,
    } = this.props;
    const individual = { ...edited };
    const currentDate = new Date();
    return (
      <>
        <Grid container className={classes.tableTitle}>
          <Grid item>
            <Grid
              container
              align="center"
              justify="center"
              direction="column"
              className={classes.fullHeight}
            >
              <Grid item>
                <Typography>
                  <FormattedMessage module="individual" id="individual.headPanelTitle" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        {mandatoryFieldsEmpty && (
        <>
          <div className={classes.item}>
            <FormattedMessage module="individual" id="individual.mandatoryFieldsEmptyError" />
          </div>
          <Divider />
        </>
        )}
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="individual"
              label="individual.firstName"
              required
              onChange={(v) => this.updateAttribute('firstName', v)}
              value={individual?.firstName}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="individual"
              label="individual.lastName"
              required
              onChange={(v) => this.updateAttribute('lastName', v)}
              value={individual?.lastName}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="individual"
              label="individual.dob"
              required
              onChange={(v) => this.updateAttribute('dob', v)}
              value={individual?.dob}
              maxDate={currentDate}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <AdditionalFieldsDialog
              individualJsonExt={individual?.jsonExt}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(IndividualHeadPanel))));
