import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Helmet,
  withHistory,
  formatMessage,
  formatMessageWithValues,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withTheme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { RIGHT_GROUP_UPDATE } from '../constants';
import { fetchGroup, deleteGroup, updateGroup } from '../actions';
import GroupHeadPanel from '../components/GroupHeadPanel';
import IndividualTabPanel from '../components/IndividualTabPanel';
import { ACTION_TYPE } from '../reducer';

const styles = (theme) => ({
  page: theme.page,
});

function GroupPage({
  intl,
  classes,
  rights,
  history,
  groupUuid,
  group,
  fetchGroup,
  deleteGroup,
  updateGroup,
  coreConfirm,
  clearConfirm,
  confirmed,
  submittingMutation,
  mutation,
  journalize,
}) {
  const [editedGroup, setEditedGroup] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (groupUuid) {
      fetchGroup([`id: "${groupUuid}"`]);
    }
  }, [groupUuid]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  const back = () => history.goBack();

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_GROUP) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedGroup(group), [group]);

  const titleParams = (group) => ({
    id: group?.id,
  });

  const isMandatoryFieldsEmpty = () => {
    if (editedGroup === undefined || editedGroup === null) {
      return false;
    }
    if (
      editedGroup.id
    ) {
      return false;
    }
    return true;
  };

  const doesGroupChange = () => {
    if (_.isEqual(group, editedGroup)) {
      return false;
    }
    return true;
  };

  const canSave = () => !isMandatoryFieldsEmpty() && doesGroupChange();

  const handleSave = () => {
    updateGroup(
      editedGroup,
      formatMessageWithValues(intl, 'individual', 'group.update.mutationLabel', {
        id: group?.id,
      }),
    );
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
  ];

  return (
    rights.includes(RIGHT_GROUP_UPDATE) && (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues(intl, 'group', 'pageTitle', titleParams(group))} />
      <Form
        module="group"
        title="pageTitle"
        titleParams={titleParams(group)}
        openDirty
        group={editedGroup}
        edited={editedGroup}
        onEditedChanged={setEditedGroup}
        back={back}
        mandatoryFieldsEmpty={!isMandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={GroupHeadPanel}
        Panels={[IndividualTabPanel]}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        saveTooltip={formatMessage(intl, 'individual', `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
      />
    </div>
    )
  );
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  groupUuid: props.match.params.group_uuid,
  confirmed: state.core.confirmed,
  fetchingGroups: state.individual.fetchingGroups,
  fetchedGroups: state.individual.fetchedGroups,
  group: state.individual.group,
  errorGroup: state.individual.errorGroup,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGroup,
  deleteGroup,
  updateGroup,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default withHistory(
  injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(GroupPage)))),
);
