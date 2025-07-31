import React from 'react';
import { Helmet, withModulesManager, formatMessage } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import { connect } from 'react-redux';
import { RIGHT_INDIVIDUAL_SEARCH } from '../constants';
import IndividualSearcher from '../components/IndividualSearcher';

const StyledDiv = styled('div')(({ theme }) => ({
  ...theme?.page,
  '& .fab': theme?.fab,
}));

function IndividualsPage(props) {
  const { intl, rights } = props;

  return (
    rights.includes(RIGHT_INDIVIDUAL_SEARCH) && (
      <StyledDiv>
        <Helmet title={formatMessage(intl, 'individual', 'individuals.pageTitle')} />
        <IndividualSearcher rights={rights} isModalEnrollment={false} />
      </StyledDiv>
    )
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default withModulesManager(injectIntl(connect(mapStateToProps)(IndividualsPage)));
