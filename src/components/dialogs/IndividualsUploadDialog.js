import React, { useEffect, useState } from 'react';
import { Input, Grid, MenuItem } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  apiHeaders,
  baseApiUrl,
  useModulesManager,
  formatMessage,
  coreAlert,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import WorkflowsPicker from '../../pickers/WorkflowsPicker';
import { fetchWorkflows } from '../../actions';
import IndividualsHistoryUploadDialog from './IndividualsHistoryUploadDialog';
import { EMPTY_STRING } from '../../constants';

const styles = (theme) => ({
  item: theme.paper.item,
});

function IndividualsUploadDialog({
  intl,
  workflows,
  fetchWorkflows,
  coreAlert,
}) {
  const modulesManager = useModulesManager();
  const [isOpen, setIsOpen] = useState(false);
  const [forms, setForms] = useState({});

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setForms({});
    setIsOpen(false);
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleFieldChange = (formName, fieldName, value) => {
    setForms({
      ...forms,
      [formName]: {
        ...(forms[formName] ?? {}),
        [fieldName]: value,
      },
    });
  };

  const getFieldValue = () => forms?.workflows?.values?.workflow?.label ?? {};

  const onSubmit = async (values) => {
    const fileFormat = values.file.type;
    const formData = new FormData();

    formData.append('file', values.file);

    let urlImport;
    if (fileFormat.includes('/csv')) {
      formData.append('workflow_name', values.workflow.name);
      formData.append('workflow_group', values.workflow.group);
      urlImport = `${baseApiUrl}/individual/import_individuals/`;
    }

    try {
      const response = await fetch(urlImport, {
        headers: apiHeaders,
        body: formData,
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        handleClose();
        return;
      }

      const errorHeader = formatMessage(intl, 'individual', 'individual.upload.alert.header');
      const errorMessage = response.status === 409
        ? formatMessage(intl, 'individual', 'individual.upload.alert.sameFileName')
        : EMPTY_STRING;

      coreAlert(errorHeader, errorMessage);
    } catch (error) {
      handleClose();
    }
  };

  function enrollmentPageUrl() {
    return `${modulesManager.getRef('individual.route.enrollment')}`;
  }

  return (
    <>
      <MenuItem>
        <a href={enrollmentPageUrl()} style={{ color: 'inherit', textDecoration: 'none' }}>
          {formatMessage(intl, 'individual', 'individual.enrollment.buttonLabel')}
        </a>
      </MenuItem>
      <MenuItem
        onClick={handleOpen}
      >
        {formatMessage(intl, 'individual', 'individual.upload.buttonLabel')}
      </MenuItem>
      <IndividualsHistoryUploadDialog />
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 600,
            maxWidth: 1000,
          },
        }}
      >
        <form noValidate>
          <DialogTitle
            style={{
              marginTop: '10px',
            }}
          >
            {formatMessage(intl, 'individual', 'individual.upload.label')}
          </DialogTitle>
          <DialogContent>
            <div
              style={{ backgroundColor: '#DFEDEF', paddingLeft: '10px', paddingBottom: '10px' }}
            >
              <Grid item>
                <Grid container spacing={4} direction="column">
                  <Grid item>
                    <Input
                      onChange={(event) => handleFieldChange('workflows', 'file', event.target.files[0])}
                      required
                      id="import-button"
                      inputProps={{
                        accept: '.csv, application/csv, text/csv',
                      }}
                      type="file"
                    />
                  </Grid>
                  <Grid item>
                    <WorkflowsPicker
                      module="individual"
                      label="workflowPicker"
                      onChange={(value) => handleFieldChange('workflows', 'workflow', value)}
                      value={() => getFieldValue()}
                      workflows={workflows}
                      required
                    />
                  </Grid>
                </Grid>
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
                  {formatMessage(intl, 'individual', 'individual.upload.cancel')}
                </Button>
              </div>
              <div style={{ float: 'right', paddingRight: '16px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSubmit(forms.workflows)}
                  disabled={
                    !(
                      forms.workflows?.file
                      && forms.workflows?.workflow
                    )
                  }
                >
                  {formatMessage(intl, 'individual', 'individual.upload.label')}
                </Button>
              </div>
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  confirmed: state.core.confirmed,
  workflows: state.socialProtection.workflows,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchWorkflows,
  coreAlert,
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(IndividualsUploadDialog),
    ),
  ),
);
