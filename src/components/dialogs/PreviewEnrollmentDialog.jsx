import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { INDIVIDUAL_MODULE_NAME } from '../../constants';

/*
 * The "preview" button of the enrollment forms and the dialog it opens, which
 * lists through `Searcher` the records the enrollment would take in.
 * GroupPreviewEnrollmentDialog and IndividualPreviewEnrollmentDialog differ
 * only in that searcher, the label and the summary count they check.
 */
function PreviewEnrollmentDialog({
  Searcher,
  previewLabelKey,
  nothingToEnroll,
  classes,
  rights,
  advancedCriteria,
  benefitPlanToEnroll,
  enrollmentConfirmed,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations(INDIVIDUAL_MODULE_NAME, modulesManager);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        color="primary"
        className={classes?.button}
        style={{ marginLeft: '16px' }}
        disabled={!benefitPlanToEnroll || nothingToEnroll || enrollmentConfirmed}
      >
        {formatMessage(previewLabelKey)}
      </Button>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: '75%',
              maxWidth: '75%',
            },
          }
        }}
      >
        <DialogTitle
          style={{
            marginTop: '10px',
          }}
        >
          {formatMessage(previewLabelKey)}
        </DialogTitle>
        <DialogContent>
          <div
            style={{ backgroundColor: '#DFEDEF' }}
          >
            <Searcher
              rights={rights}
              isModalEnrollment
              advancedCriteria={advancedCriteria}
              benefitPlanToEnroll={benefitPlanToEnroll}
            />
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: 'inline',
            paddingLeft: '10px',
            marginTop: '25px',
            marginBottom: '15px',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '3000px' }}>
            <div style={{ float: 'left' }} />
            <div style={{
              float: 'right',
              paddingRight: '16px',
            }}
            >
              <Button
                onClick={handleClose}
                variant="outlined"
                autoFocus
                style={{ margin: '0 16px' }}
              >
                {formatMessage('individual.enrollment.close')}
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

// Gives a preview dialog the user's rights from the store.
export const connectPreviewDialog = (Component) => connect(mapStateToProps, mapDispatchToProps)(Component);

export default PreviewEnrollmentDialog;
