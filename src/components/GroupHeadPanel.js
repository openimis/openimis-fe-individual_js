import React from 'react';
import { Grid, Divider, Typography } from '@material-ui/core';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class GroupHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, mandatoryFieldsEmpty,
    } = this.props;
    const group = { ...edited };
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
                  <FormattedMessage module="individual" id="group.headPanelTitle" />
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        {mandatoryFieldsEmpty && (
        <>
          <div className={classes.item}>
            <FormattedMessage module="individual" id="group.mandatoryFieldsEmptyError" />
          </div>
          <Divider />
        </>
        )}
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              readOnly
              module="individual"
              label="group.id"
              required
              onChange={(v) => this.updateAttribute('id', v)}
              value={group?.id}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(GroupHeadPanel))));
