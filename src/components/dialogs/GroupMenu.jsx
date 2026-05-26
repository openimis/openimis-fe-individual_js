import React from 'react';
import {
  MenuItem,
} from '@mui/material';
import { injectIntl } from 'react-intl';
import {
  useModulesManager,
  formatMessage,
  coreAlert,
  withHistory,
  historyPush,
} from '@openimis/fe-core';
import { useTheme, styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchWorkflows } from '../../actions';


const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  ...theme?.paper?.item,
  fontWeight: 600
}));

function GroupMenu({
  intl,
  history,
}) {
  const theme = useTheme();
  const modulesManager = useModulesManager();

  function enrollmentGroupPageUrl() {
    return `${modulesManager.getRef('individual.route.groupEnrollment')}`;
  }

  return (
    <StyledMenuItem
      onClick={() => historyPush(modulesManager, history, "individual.route.groupEnrollment")}
    >
      {formatMessage(intl, 'individual', 'individual.enrollment.buttonLabel')}
    </StyledMenuItem>
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

export { StyledMenuItem };
export default injectIntl(
  withHistory(connect(mapStateToProps, mapDispatchToProps)(GroupMenu))
);
