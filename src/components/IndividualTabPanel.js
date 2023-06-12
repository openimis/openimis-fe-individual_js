import React, { useState } from 'react';
import { Paper, Grid } from '@material-ui/core';
import { Contributions } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  INDIVIDUAL_BENEFIT_PLANS_LIST_TAB_VALUE,
  INDIVIDUAL_TABS_LABEL_CONTRIBUTION_KEY,
  INDIVIDUAL_TABS_PANEL_CONTRIBUTION_KEY,
} from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  tabs: {
    display: 'flex',
    alignItems: 'center',
  },
  selectedTab: {
    borderBottom: '4px solid white',
  },
  unselectedTab: {
    borderBottom: '4px solid transparent',
  },
  button: {
    marginLeft: 'auto',
    padding: theme.spacing(1),
    fontSize: '0.875rem',
    textTransform: 'none',
  },
});

function IndividualTabPanel({
  intl, rights, classes, individual, beneficiaryStatus, setConfirmedAction,
}) {
  const [activeTab, setActiveTab] = useState(INDIVIDUAL_BENEFIT_PLANS_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <Contributions
          contributionKey={INDIVIDUAL_TABS_LABEL_CONTRIBUTION_KEY}
          intl={intl}
          rights={rights}
          value={activeTab}
          onChange={handleChange}
          isSelected={isSelected}
          tabStyle={tabStyle}
        />
      </Grid>
      <Contributions
        contributionKey={INDIVIDUAL_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        individual={individual}
        beneficiaryStatus={beneficiaryStatus}
        setConfirmedAction={setConfirmedAction}
      />
    </Paper>
  );
}

export default injectIntl(withTheme(withStyles(styles)(IndividualTabPanel)));
