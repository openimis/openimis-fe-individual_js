import React from 'react';
import {
  Helmet, withModulesManager, withTooltip, formatMessage, historyPush,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { GROUP_ROUTE_GROUP, RIGHT_GROUP_CREATE, RIGHT_GROUP_SEARCH } from '../constants';
import GroupSearcher from '../components/GroupSearcher';

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

function GroupsPage(props) {
  const {
    intl, classes, modulesManager, history, rights,
  } = props;

  const onAdd = () => historyPush(
    modulesManager,
    history,
    GROUP_ROUTE_GROUP,
  );

  return (
    rights.includes(RIGHT_GROUP_SEARCH) && (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, 'individual', 'groups.pageTitle')} />
      <GroupSearcher rights={rights} isModalEnrollment={false} />
      {rights.includes(RIGHT_GROUP_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onAdd}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage(intl, 'individual', 'createButton.tooltip'),
        )}
    </div>
    )
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps)(GroupsPage)))));
