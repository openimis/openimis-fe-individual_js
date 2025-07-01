import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { injectIntl } from 'react-intl';

import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';
import { useTranslations, useModulesManager, useHistory } from '@openimis/fe-core';
import GroupPicker from '../pickers/GroupPicker';
import { setNewGroupIndividual } from '../actions';

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

function GroupChangeDialog({
  classes,
  confirmState,
  onClose,
  onConfirm,
  groupIndividual,
  setEditedGroupIndividual,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const dispatch = useDispatch();
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);
  const [groupToBeChanged, setGroupToBeChanged] = useState(null);

  const handleConfirm = () => {
    onConfirm(groupToBeChanged);
    onClose();
  };

  const onMoveToNewGroup = () => {
    history.push(`/${modulesManager.getRef('individual.route.group')}`);
    onClose();
    dispatch(setNewGroupIndividual(groupIndividual));
  };

  const onCancel = () => {
    onClose();
    setEditedGroupIndividual(null);
  };

  return (
    <Dialog open={confirmState} onClose={onClose}>
      <DialogTitle>
        {formatMessageWithValues('groupChangeDialog.confirmTitle', {
          firstName: groupIndividual?.individual?.firstName, lastName: groupIndividual?.individual?.lastName,
        })}
      </DialogTitle>
      <DialogContent>
        <GroupPicker
          groupIndividual={groupIndividual}
          onChange={setGroupToBeChanged}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onMoveToNewGroup} className={classes.secondaryButton} disabled={groupToBeChanged}>
          {formatMessage('moveToNewGroup')}
        </Button>
        <Button
          onClick={handleConfirm}
          autoFocus
          className={classes.primaryButton}
          disabled={!groupToBeChanged}
        >
          {formatMessage('confirm')}
        </Button>
        <Button onClick={onCancel} className={classes.secondaryButton}>
          {formatMessage('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(withTheme(withStyles(styles)(GroupChangeDialog)));
