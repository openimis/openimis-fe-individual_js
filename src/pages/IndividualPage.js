import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Helmet,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  journalize,
} from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { RIGHT_INDIVIDUAL_UPDATE } from "../constants";
import { fetchIndividual, deleteIndividual, updateIndividual } from "../actions";
import IndividualHeadPanel from "../components/IndividualHeadPanel";
import DeleteIcon from "@material-ui/icons/Delete";
import { ACTION_TYPE } from "../reducer";
import { isJsonString } from "../util/json-validate";

const styles = (theme) => ({
  page: theme.page,
});

const IndividualPage = ({
  intl,
  classes,
  rights,
  history,
  individualUuid,
  individual,
  fetchIndividual,
  deleteIndividual,
  updateIndividual,
  coreConfirm,
  confirmed,
  submittingMutation,
  mutation,
  journalize,
}) => {
  const [editedIndividual, setEditedIndividual] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (!!individualUuid) {
        fetchIndividual([`id: "${individualUuid}"`]);
    }
  }, [individualUuid]);

  useEffect(() => confirmed && confirmedAction(), [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      mutation?.actionType === ACTION_TYPE.DELETE_INDIVIDUAL && back();
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedIndividual(individual), [individual]);

  const back = () => history.goBack();

  const titleParams = (individual) => ({ 
    firstName: individual?.firstName,
    lastName: individual?.lastName
  });

  const isMandatoryFieldsEmpty = () => {
    if (editedIndividual === undefined || editedIndividual === null){ 
      return false; 
    }
    if (
      !!editedIndividual.firstName &&
      !!editedIndividual.lastName &&
      !!editedIndividual.dob
    ) {
      return false;
    }
    return true;
  }

  const canSave = () => !isMandatoryFieldsEmpty() && isJsonString(editedIndividual?.jsonExt);

  const handleSave = () => {
    updateIndividual(
      editedIndividual,
      formatMessageWithValues(intl, "individual", "individual.update.mutationLabel", {
        firstName: individual?.firstName,
        lastName: individual?.lastName
      }),
    );
  };

  const deleteIndividualCallback = () => deleteIndividual(
    individual,
    formatMessageWithValues(intl, "individual", "individual.delete.mutationLabel", {
        firstName: individual?.firstName,
        lastName: individual?.lastName
    }),
  );

  const openDeleteIndividualConfirmDialog = () => {
    setConfirmedAction(() => deleteIndividualCallback);
    coreConfirm(
      formatMessageWithValues(intl, "individual", "individual.delete.confirm.title", {
        firstName: individual?.firstName,
        lastName: individual?.lastName
      }),
      formatMessage(intl, "individual", "individual.delete.confirm.message"),
    );
  };

  const actions = [
    !!individual && {
        doIt: openDeleteIndividualConfirmDialog,
        icon: <DeleteIcon />,
        tooltip: formatMessage(intl, "individual", "deleteButtonTooltip"),
      },
  ];

  return (
    rights.includes(RIGHT_INDIVIDUAL_UPDATE) && (
      <div className={classes.page}>
        <Helmet title={formatMessageWithValues(intl, "individual", "pageTitle", titleParams(individual))} />
        <Form
          module="individual"
          title="pageTitle"
          titleParams={titleParams(individual)}
          openDirty={true}
          individual={editedIndividual}
          edited={editedIndividual}
          onEditedChanged={setEditedIndividual}
          back={back}
          mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={IndividualHeadPanel}
          Panels={[]}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage(intl, "individual", `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
        />
      </div>
    )
  );
};

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  individualUuid: props.match.params.individual_uuid,
  confirmed: state.core.confirmed,
  fetchingIndividuals: state.individual.fetchingIndividuals,
  fetchedIndividuals: state.individual.fetchedIndividuals,
  individual: state.individual.individual,
  errorIndividual: state.individual.errorIndividual,
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchIndividual, deleteIndividual, updateIndividual, coreConfirm, journalize }, dispatch);
};

export default withHistory(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(IndividualPage)))),
);
