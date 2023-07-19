// Rules disabled due to core architecture
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Person, People } from '@material-ui/icons';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import { INDIVIDUALS_MAIN_MENU_CONTRIBUTION_KEY } from '../constants';

function IndividualsMainMenu(props) {
  const entries = [
    {
      text: formatMessage(props.intl, 'individual', 'menu.individuals'),
      icon: <Person />,
      route: '/individuals',
    },
    {
      text: formatMessage(props.intl, 'individual', 'menu.groups'),
      icon: <People />,
      route: '/groups',
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(INDIVIDUALS_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'individual', 'mainMenuIndividuals')}
      entries={entries}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(IndividualsMainMenu)));
