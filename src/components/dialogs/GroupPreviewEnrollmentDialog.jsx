/* eslint-disable max-len */
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { INDIVIDUAL_MODULE_NAME } from '../../constants';
import GroupSearcher from '../GroupSearcher';

function GroupPreviewEnrollmentDialog({
  classes,
  rights,
  advancedCriteria,
  benefitPlanToEnroll,
  enrollmentSummary,
  confirmed,
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
        className={classes.button}
        style={{ marginLeft: '16px' }}
        disabled={enrollmentSummary?.numberOfIndividualsToUpload === '0' || confirmed}
      >
        {formatMessage('individual.enrollment.previewGroups')}
      </Button>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '75%',
            maxWidth: '75%',
          },
        }}
      >
        <DialogTitle
          style={{
            marginTop: '10px',
          }}
        >
          {formatMessage('individual.enrollment.previewGroups')}
        </DialogTitle>
        <DialogContent>
          <div
            style={{ backgroundColor: '#DFEDEF' }}
          >
            <GroupSearcher
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
  confirmed: state.core.confirmed,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GroupPreviewEnrollmentDialog);
