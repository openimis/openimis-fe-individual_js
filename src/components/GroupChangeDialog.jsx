import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { injectIntl } from 'react-intl';

import { useTheme, styled } from '@mui/material/styles';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@mui/material';
import { useTranslations, useModulesManager, useHistory } from '@openimis/fe-core';
import GroupPicker from '../pickers/GroupPicker';
import { setNewGroupIndividual } from '../actions';

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme?.dialog?.primaryButton,
}));

const StyledSecondaryButton = styled(Button)(({ theme }) => ({
  ...theme?.dialog?.secondaryButton,
}));

function GroupChangeDialog({
  confirmState,
  onClose,
  onConfirm,
  groupIndividual,
  setEditedGroupIndividual,
}) {
  const theme = useTheme();
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
        <StyledSecondaryButton onClick={onMoveToNewGroup} disabled={groupToBeChanged}>
          {formatMessage('moveToNewGroup')}
        </StyledSecondaryButton>
        <StyledButton
          onClick={handleConfirm}
          autoFocus
          disabled={!groupToBeChanged}
        >
          {formatMessage('confirm')}
        </StyledButton>
        <StyledSecondaryButton onClick={onCancel}>
          {formatMessage('cancel')}
        </StyledSecondaryButton>
      </DialogActions>
    </Dialog>
  );
}

export { StyledButton };
export default injectIntl(GroupChangeDialog);
