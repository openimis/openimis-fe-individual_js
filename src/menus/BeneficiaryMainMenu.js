import React from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { Person } from "@material-ui/icons";
import { formatMessage, MainMenuContribution, withModulesManager } from "@openimis/fe-core";
import { BENEFICIARY_MAIN_MENU_CONTRIBUTION_KEY } from "../constants";

const BeneficiaryMainMenu = (props) => {
  const entries = [
    {
      text: formatMessage(props.intl, "individual", "menu.individuals"),
      icon: <Person />,
      route: "/individuals",
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(BENEFICIARY_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(props.rights)),
  );

  return (
    <MainMenuContribution {...props} header={formatMessage(props.intl, "individual", "mainMenuBeneficiary")} entries={entries} />
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export default injectIntl(withModulesManager(connect(mapStateToProps)(BeneficiaryMainMenu)));
