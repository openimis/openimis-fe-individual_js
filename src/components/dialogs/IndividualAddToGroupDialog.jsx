import React, { useState } from 'react';
import { injectIntl } from 'react-intl';

import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';
import { useTranslations, useModulesManager } from '@openimis/fe-core';
import IndividualAddToGroupPicker from '../../pickers/IndividualAddToGroupPicker';

const styles = (theme) => ({
  primaryButton: theme.dialog.primaryButton,
  secondaryButton: theme.dialog.secondaryButton,
});

function IndividualAddToGroupDialog({
  classes,
  confirmState,
  onClose,
  onConfirm,
  setEditedGroupIndividual,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const [individualToBeChanged, setIndividualToBeAdded] = useState(null);

  const handleConfirm = () => {
    onConfirm(individualToBeChanged);
    onClose();
  };

  const onCancel = () => {
    onClose();
    setEditedGroupIndividual(null);
  };

  return (
    <Dialog
      open={confirmState}
      onClose={onClose}
      PaperProps={{
        style: {
          width: 600,
          maxWidth: 1000,
        },
      }}
    >
      <DialogTitle>
        {formatMessage('addToNewGroup')}
      </DialogTitle>
      <DialogContent>
        <IndividualAddToGroupPicker
          onChange={setIndividualToBeAdded}
        />
      </DialogContent>
      <DialogActions
        style={{
          display: 'inline',
          paddingLeft: '10px',
          marginTop: '25px',
          marginBottom: '15px',
        }}
      >
        <div style={{ maxWidth: '1000px' }}>
          <div style={{ float: 'left' }}>
            <Button
              onClick={onCancel}
              variant="outlined"
              autoFocus
              style={{
                margin: '0 16px',
                marginBottom: '15px',
              }}
            >
              {formatMessage('cancel')}
            </Button>
          </div>
          <div style={{ float: 'right', paddingRight: '16px' }}>
            <Button
              onClick={handleConfirm}
              autoFocus
              className={classes.primaryButton}
              disabled={!individualToBeChanged}
            >
              {formatMessage('confirm')}
            </Button>
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(withTheme(withStyles(styles)(IndividualAddToGroupDialog)));
