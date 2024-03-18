import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  formatMessage,
  renderInputComponent,
  createFieldsBasedOnJSON,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { INDIVIDUAL_MODULE_NAME } from '../../constants';

const styles = (theme) => ({
  item: theme.paper.item,
});

function AdditionalFieldsDialog({
  intl,
  classes,
  individualJsonExt,
}) {
  if (!individualJsonExt) return null;
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const jsonExtFields = createFieldsBasedOnJSON(individualJsonExt);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
        color="#DFEDEF"
        className={classes.button}
        style={{
          border: '0px',
          marginTop: '6px',
        }}
      >
        {formatMessage(intl, 'individual', 'individual.additonalFields.showAdditionalFields')}
      </Button>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 1200,
            maxWidth: 1200,
            maxHeight: 1200,
          },
        }}
      >
        <form noValidate>
          <DialogTitle
            style={{
              marginTop: '10px',
            }}
          >
            {formatMessage(intl, 'individual', 'individual.additonalFields.label')}
          </DialogTitle>
          <DialogContent>
            <div
              style={{ backgroundColor: '#DFEDEF', paddingLeft: '10px', paddingBottom: '10px' }}
            >
              <Grid container className={classes.item}>
                {jsonExtFields?.map((jsonExtField) => (
                  <Grid item xs={6} className={classes.item}>
                    {renderInputComponent(INDIVIDUAL_MODULE_NAME, jsonExtField)}
                  </Grid>
                ))}
              </Grid>
            </div>
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
                  onClick={handleClose}
                  variant="outlined"
                  autoFocus
                  style={{
                    margin: '0 16px',
                    marginBottom: '15px',
                  }}
                >
                  {formatMessage(intl, 'individual', 'individual.additonalFields.close')}
                </Button>
              </div>
              <div style={{ float: 'right', paddingRight: '16px' }} />
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(AdditionalFieldsDialog),
    ),
  ),
);
