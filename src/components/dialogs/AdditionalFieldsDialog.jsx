import React, { useState } from 'react';
import { Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { injectIntl } from 'react-intl';
import {
  formatMessage,
  renderInputComponent,
  createFieldsBasedOnJSON,
} from '@openimis/fe-core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { INDIVIDUAL_MODULE_NAME } from '../../constants';

// Styled component replacing withStyles/styles object
const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme?.paper?.paper,
  '& .title': theme?.paper?.title,
  '& .item': theme?.paper?.item,
}));

function AdditionalFieldsDialog({ intl, individualJsonExt }) {
  const theme = useTheme();
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
        className="button"
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
            maxHeight: 900,
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
            <StyledPaper style={{ backgroundColor: '#DFEDEF', paddingLeft: '10px', paddingBottom: '10px' }}>
              <Grid container className="item">
                {jsonExtFields?.map((jsonExtField, index) => (
                  <Grid size={6} className="item" key={index}>
                    {renderInputComponent(INDIVIDUAL_MODULE_NAME, jsonExtField)}
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>
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

export { StyledPaper };
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(AdditionalFieldsDialog)
);
