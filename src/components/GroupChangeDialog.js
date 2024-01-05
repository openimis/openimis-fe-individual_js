import React, { useState } from 'react';
import { injectIntl } from 'react-intl';

import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';
import { useTranslations, useModulesManager } from '@openimis/fe-core';
import GroupPicker from '../pickers/GroupPicker';

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
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);
  const [groupToBeChanged, setGroupToBeChanged] = useState(null);

  const handleConfirm = (groupToBeChanged) => {
    onConfirm(groupToBeChanged);
    onClose();
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
        <Button
          onClick={() => handleConfirm(groupToBeChanged)}
          autoFocus
          className={classes.primaryButton}
          disabled={!groupToBeChanged}
        >
          {formatMessage('confirm')}
        </Button>
        <Button onClick={onClose} className={classes.secondaryButton}>
          {formatMessage('cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(withTheme(withStyles(styles)(GroupChangeDialog)));
