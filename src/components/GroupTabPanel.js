import React, { useState } from 'react';
import { Paper, Grid } from '@material-ui/core';
import { Contributions } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  BENEFIT_PLANS_LIST_TAB_VALUE,
  GROUPS_TABS_LABEL_CONTRIBUTION_KEY,
  GROUPS_TABS_PANEL_CONTRIBUTION_KEY, INDIVIDUALS_LIST_TAB_VALUE,
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

function GroupTabPanel({
  intl,
  rights,
  classes,
  individual,
  setConfirmedAction,
  group, editedGroupIndividual,
  setEditedGroupIndividual,
  groupIndividualIds,
  groupId,
}) {
  const [activeTab, setActiveTab] = useState(individual ? BENEFIT_PLANS_LIST_TAB_VALUE : INDIVIDUALS_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? classes.selectedTab : classes.unselectedTab);

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <Paper className={classes.paper}>
      <Grid container className={`${classes.tableTitle} ${classes.tabs}`}>
        <Contributions
          contributionKey={GROUPS_TABS_LABEL_CONTRIBUTION_KEY}
          intl={intl}
          rights={rights}
          value={activeTab}
          onChange={handleChange}
          isSelected={isSelected}
          tabStyle={tabStyle}
          group={group}
          groupId={groupId}
          individual={individual}
          editedGroupIndividual={editedGroupIndividual}
          setEditedGroupIndividual={setEditedGroupIndividual}
        />
      </Grid>
      <Contributions
        contributionKey={GROUPS_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        individual={individual}
        group={group}
        groupId={groupId}
        groupIndividualIds={groupIndividualIds}
        setConfirmedAction={setConfirmedAction}
        editedGroupIndividual={editedGroupIndividual}
        setEditedGroupIndividual={setEditedGroupIndividual}
      />
    </Paper>
  );
}

export default injectIntl(withTheme(withStyles(styles)(GroupTabPanel)));
