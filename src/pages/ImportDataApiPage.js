import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';

import { makeStyles } from '@material-ui/styles';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
} from '@material-ui/core';
import {
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  Helmet,
  ProgressOrError,
} from '@openimis/fe-core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { confirmPullingDataFromApiEtl, fetchApiEtlServices, fetchMutationByLabel } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  footer: {
    marginInline: 16,
    marginBlock: 12,
  },
  headerTitle: theme.table.title,
  actionCell: {
    width: 60,
  },
  header: theme.table.header,
}));

const API_WORKFLOW_HEADERS = [
  'ImportPageAPI.apiSelection',
  'ImportPageAPI.triggerImport',
];

// eslint-disable-next-line no-empty-pattern
function ImportDataApiPage({
  confirmPullingDataFromApiEtl,
  mutations,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const {
    fetchingApiEtlServices, apiEtlServices, errorApiEtlServices,
  } = useSelector((store) => store.individual);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToPullData, setServiceToPullData] = useState(null);

  const confirmPullingData = (etlService) => {
    setServiceToPullData(etlService);
    setOpenConfirmDialog(true);
  };

  const handlePullingData = () => {
    confirmPullingDataFromApiEtl(
      serviceToPullData,
      formatMessage('ImportPageAPI.confirmPullingData'),
    );
    setOpenConfirmDialog(false);
    setServiceToPullData(null);
  };

  useEffect(() => {
    dispatch(fetchApiEtlServices());
    dispatch(fetchMutationByLabel(formatMessage('ImportPageAPI.confirmPullingData')));
  }, []);

  useEffect(() => {
    dispatch(fetchMutationByLabel(formatMessage('ImportPageAPI.confirmPullingData')));
  }, [serviceToPullData]);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('ImportPageAPI.ImportPage')} />
      <div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead className={classes.header}>
              <TableRow className={classes.headerTitle}>
                {API_WORKFLOW_HEADERS.map((header) => (
                  <TableCell key={header}>
                    {formatMessage(header)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <ProgressOrError progress={fetchingApiEtlServices} error={errorApiEtlServices} />
              {apiEtlServices.map((etlService) => (
                <TableRow key={etlService.nameOfService}>
                  <TableCell>
                    {etlService.nameOfService}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={formatMessage('ImportPageAPI.triggerImport')}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => confirmPullingData(etlService.nameOfService)}
                        disabled={mutations.length > 0}
                      >
                        {formatMessage('ImportPageAPI.triggerImport')}
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
        >
          <DialogTitle>{formatMessage('ImportPageAPI.confirmPullingData.title')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {formatMessage('ImportPageAPI.confirmPullingData.message')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
              {formatMessage('ImportPageAPI.confirmPullingData.cancel')}
            </Button>
            <Button onClick={() => handlePullingData()} color="#DFEDEF" autoFocus>
              {formatMessage('ImportPageAPI.confirmPullingData.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
  confirmPullingDataFromApiEtl,
}, dispatch);

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutations: state.individual.mutations,
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportDataApiPage);
