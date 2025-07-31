import React from 'react';
import {
  Helmet, withModulesManager, withTooltip, formatMessage, historyPush,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { GROUP_ROUTE_GROUP, RIGHT_GROUP_CREATE, RIGHT_GROUP_SEARCH } from '../constants';
import GroupSearcher from '../components/GroupSearcher';

const StyledDiv = styled('div')(({ theme }) => ({
  ...theme?.page,
  '& .fab': theme?.fab,
}));


function GroupsPage(props) {
  const {
    intl, modulesManager, history, rights,
  } = props;

  const onAdd = () => historyPush(
    modulesManager,
    history,
    GROUP_ROUTE_GROUP,
  );

  return (
    rights.includes(RIGHT_GROUP_SEARCH) && (
      <StyledDiv>
        <Helmet title={formatMessage(intl, 'individual', 'groups.pageTitle')} />
        <GroupSearcher rights={rights} isModalEnrollment={false} />
        {rights.includes(RIGHT_GROUP_CREATE)
          && withTooltip(
            <div className="fab">
              <Fab color="primary" onClick={onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, 'individual', 'createButton.tooltip'),
          )}
      </StyledDiv>
    )
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(connect(mapStateToProps)(GroupsPage)));
