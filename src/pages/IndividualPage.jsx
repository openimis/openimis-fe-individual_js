import React from 'react';
import {
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
  GetIconComponent,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const DeleteIcon = GetIconComponent("Delete");
const UndoIcon = GetIconComponent("Undo");
import { RIGHT_INDIVIDUAL_UPDATE } from '../constants';
import {
  deleteIndividual, updateIndividual, undoDeleteIndividual,
} from '../actions';
import IndividualForm from '../components/IndividualForm';



function IndividualPage({
  intl,
  rights,
  history,
  individualUuid,
  individual,
  updateIndividual,
  coreConfirm,
  confirmed,
  clearConfirm,
  setConfirmedAction,
}) {
  const back = () => history.goBack();

  const save = (individual) => {
    updateIndividual(
      individual,
      formatMessageWithValues(intl, 'individual', 'individual.update.mutationLabel', {
        id: individual?.id,
      }),
    );
  };

  const deleteIndividualCallback = () => {
    const deleteIndividual = require('../actions').deleteIndividual;
    deleteIndividual(
      individual,
      formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
        id: individual?.id,
      }),
    );
  };

  const undoDeleteIndividualCallback = () => {
    const undoDeleteIndividual = require('../actions').undoDeleteIndividual;
    undoDeleteIndividual(
      individual,
      formatMessageWithValues(intl, 'individual', 'individual.undo.mutationLabel', {
        id: individual?.id,
      }),
    );
  };

  const openDeleteIndividualConfirmDialog = () => {
    setConfirmedAction(() => deleteIndividualCallback);
    coreConfirm(
      formatMessageWithValues(intl, 'individual', 'individual.delete.confirm.title', {
        firstName: individual?.firstName,
        lastName: individual?.lastName,
      }),
      formatMessage(intl, 'individual', 'individual.delete.confirm.message'),
    );
  };

  const openUndoIndividualConfirmDialog = () => {
    setConfirmedAction(() => undoDeleteIndividualCallback);
    coreConfirm(
      formatMessageWithValues(intl, 'individual', 'individual.undo.confirm.title', {
        firstName: individual?.firstName,
        lastName: individual?.lastName,
      }),
      formatMessage(intl, 'individual', 'individual.undo.confirm.message'),
    );
  };

  const actions = [
    {
      doIt: openDeleteIndividualConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage(intl, 'individual', 'deleteButtonTooltip'),
      disabled: individual?.isDeleted,
    },
    {
      doIt: openUndoIndividualConfirmDialog,
      icon: <UndoIcon />,
      tooltip: formatMessage(intl, 'individual', 'undoButtonTooltip'),
      disabled: !individual?.isDeleted,
    },
  ];

  const saveTooltip = formatMessage(intl, 'individual', 'saveButton.tooltip.enabled'); // simplified

  return (
    rights.includes(RIGHT_INDIVIDUAL_UPDATE) && (
      <IndividualForm
        individualUuid={individualUuid}
        back={back}
        save={save}
        rights={rights}
        setConfirmedAction={setConfirmedAction}
        actions={actions}
        saveTooltip={saveTooltip}
      />
    )
  );
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  individualUuid: props.match.params.individual_uuid,
  confirmed: state.core.confirmed,
  fetchingIndividuals: state.individual.fetchingIndividuals,
  fetchedIndividuals: state.individual.fetchedIndividuals,
  individual: state.individual.individual,
  errorIndividual: state.individual.errorIndividual,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  deleteIndividual,
  updateIndividual,
  undoDeleteIndividual,
  coreConfirm,
  clearConfirm,
}, dispatch);
export default withHistory(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualPage))
);
