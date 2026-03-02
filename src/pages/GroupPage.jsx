import React, { useState, useRef, useEffect } from 'react';
import {
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { RIGHT_GROUP_CREATE, RIGHT_GROUP_SEARCH, RIGHT_GROUP_UPDATE } from '../constants';
import {
  deleteGroup, updateGroup, createGroupAndMoveIndividual,
  createGroup, creteGroupIndividual,
} from '../actions';
import GroupForm from '../components/GroupForm';
import IndividualAddToGroupDialog from '../components/dialogs/IndividualAddToGroupDialog';

function GroupPage({
  intl,
  rights,
  history,
  groupUuid,
  group,
  deleteGroup,
  createGroup,
  updateGroup,
  coreConfirm,
  clearConfirm,
  confirmed,
  createGroupAndMoveIndividual,
  groupIndividuals,
  creteGroupIndividual,
}) {
  const [editedGroupIndividual, setEditedGroupIndividual] = useState(null);
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const [groupIndividualIds, setGroupIndividualIds] = useState([]);
  const [isAddIndividualToGroupModalOpen, setIsAddIndividualToGroupModalOpen] = useState(false);

  useEffect(() => {
    if (groupIndividuals) {
      const ids = groupIndividuals.map((groupIndividual) => groupIndividual.id);
      setGroupIndividualIds(ids);
    }
  }, [groupIndividuals]);

  useEffect(() => {
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  const back = () => {
    setEditedGroupIndividual(null);
    return history.goBack();
  };

  const save = (editedGroup) => {
    if (groupUuid) {
      updateGroup(
        editedGroup,
        formatMessageWithValues(intl, 'individual', 'group.update.mutationLabel', {
          id: group?.id,
        }),
      );
    } else if (editedGroupIndividual?.id) {
      createGroupAndMoveIndividual(
        editedGroup,
        editedGroupIndividual.id,
        formatMessageWithValues(intl, 'individual', 'group.createGroupAndMoveIndividual.mutationLabel'),
      );
    } else {
      createGroup(
        editedGroup,
        formatMessageWithValues(intl, 'socialProtection', 'group.create.mutationLabel', { id: editedGroup?.code }),
      );
    }
  };

  const deleteGroupCallback = () => deleteGroup(
    group,
    formatMessageWithValues(intl, 'individual', 'group.delete.mutationLabel', {
      id: group?.id,
    }),
  );

  const openDeleteGroupConfirmDialog = () => {
    setConfirmedAction(() => deleteGroupCallback);
    coreConfirm(
      formatMessageWithValues(intl, 'individual', 'group.delete.confirm.title', {
        id: group?.id,
      }),
      formatMessage(intl, 'individual', 'group.delete.confirm.message'),
    );
  };

  const actions = [
    !!group && {
      doIt: openDeleteGroupConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage(intl, 'individual', 'deleteButtonTooltip'),
    },
    groupUuid && {
      doIt: () => setIsAddIndividualToGroupModalOpen(true),
      icon: <AddIcon />,
      tooltip: formatMessage(intl, 'individual', 'addButtonTooltip'),
    },
  ].filter(Boolean);

  const onAddIndividualConfirm = (individualToBeChanged) => {
    const addIndividualToGroup = {
      ...editedGroupIndividual,
      group: group,
      individual: individualToBeChanged,
      role: null,
      recipientType: null,
    };
    creteGroupIndividual(
      addIndividualToGroup,
      formatMessageWithValues(intl, 'individual', 'individual.groupChange.confirm.message', {
        individualId: addIndividualToGroup?.individual?.id,
        groupId: group?.id,
      }),
    );
  };

  const readOnly = !!groupUuid && !rights.includes(RIGHT_GROUP_UPDATE);
  const isUpdatable = !group?.isDeleted ?? true;
  const saveTooltip = formatMessage(intl, 'individual', 'saveButton.tooltip.enabled');

  return (
    rights.includes(RIGHT_GROUP_SEARCH) && (
      <>
        {groupUuid && (
          <IndividualAddToGroupDialog
            confirmState={isAddIndividualToGroupModalOpen}
            onClose={() => setIsAddIndividualToGroupModalOpen(false)}
            onConfirm={onAddIndividualConfirm}
            setEditedGroupIndividual={setEditedGroupIndividual}
          />
        )}
        <GroupForm
          groupUuid={groupUuid}
          back={back}
          save={save}
          rights={rights}
          setConfirmedAction={setConfirmedAction}
          actions={actions}
          saveTooltip={saveTooltip}
          groupIndividualIds={groupIndividualIds}
          editedGroupIndividual={editedGroupIndividual}
          setEditedGroupIndividual={setEditedGroupIndividual}
          readOnly={readOnly}
          isUpdatable={isUpdatable}
        />
      </>
    )
  );
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  groupUuid: props.match.params.group_uuid,
  confirmed: state.core.confirmed,
  group: state.individual.group,
  groupIndividuals: state?.individual?.groupIndividuals,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  deleteGroup,
  createGroup,
  updateGroup,
  createGroupAndMoveIndividual,
  creteGroupIndividual,
  coreConfirm,
  clearConfirm,
}, dispatch);
export default withHistory(
  injectIntl(connect(mapStateToProps, mapDispatchToProps)(GroupPage))
);
