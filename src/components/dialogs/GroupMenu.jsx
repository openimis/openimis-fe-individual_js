import React from 'react';
import {
  MenuItem,
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import {
  useModulesManager,
  formatMessage,
  coreAlert,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchWorkflows } from '../../actions';

const styles = (theme) => ({
  item: theme.paper.item,
});

function GroupMenu({
  intl,
}) {
  const modulesManager = useModulesManager();

  function enrollmentGroupPageUrl() {
    return `${modulesManager.getRef('individual.route.groupEnrollment')}`;
  }

  return (
    <MenuItem>
      <a href={enrollmentGroupPageUrl()} style={{ color: 'inherit', textDecoration: 'none' }}>
        {formatMessage(intl, 'individual', 'individual.enrollment.buttonLabel')}
      </a>
    </MenuItem>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  confirmed: state.core.confirmed,
  workflows: state.socialProtection.workflows,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkflows,
  coreAlert,
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(GroupMenu),
    ),
  ),
);
