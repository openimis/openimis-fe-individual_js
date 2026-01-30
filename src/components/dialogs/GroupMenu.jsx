import React from 'react';
import {
  MenuItem,
} from '@mui/material';
import { injectIntl } from 'react-intl';
import {
  useModulesManager,
  formatMessage,
  coreAlert,
} from '@openimis/fe-core';
import { useTheme, styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchWorkflows } from '../../actions';


const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  ...theme?.paper?.item,
}));

function GroupMenu({
  intl,
}) {
  const theme = useTheme();
  const modulesManager = useModulesManager();

  function enrollmentGroupPageUrl() {
    return `${modulesManager.getRef('individual.route.groupEnrollment')}`;
  }

  return (
    <StyledMenuItem>
      <a href={enrollmentGroupPageUrl()} style={{ color: 'inherit', textDecoration: 'none' }}>
        {formatMessage(intl, 'individual', 'individual.enrollment.buttonLabel')}
      </a>
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
  connect(mapStateToProps, mapDispatchToProps)(GroupMenu)
);
