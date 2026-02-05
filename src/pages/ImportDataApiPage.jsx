import React, { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';

import { styled } from '@mui/material/styles';

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
} from '@mui/material';
import {
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  Helmet,
  ProgressOrError,
} from '@openimis/fe-core';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {
  confirmPullingDataFromApiEtl,
  fetchApiEtlServices,
  fetchMutationByLabel,
} from '../actions';

const StyledDiv = styled('div')(({ theme }) => ({
  ...theme?.page,
  padding: '24px',
  '& .tableContainer': {
    marginTop: '24px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  '& .headerCell': {
    ...theme?.table?.title,
    fontWeight: 'bold',
    fontSize: '1rem',
    padding: '16px',
  },
  '& .row': {
    ...theme?.table?.row,
    '&:hover': {
      backgroundColor: theme?.palette?.action?.hover || 'rgba(0, 0, 0, 0.04)',
    },
  },
  '& .cell': {
    padding: '16px',
    fontSize: '0.9rem',
  },
  '& .actionCell': {
    width: 350,
    textAlign: 'center',
    paddingLeft: '32px !important',
    paddingRight: '32px !important',
    whiteSpace: 'nowrap',
  },
}));

const API_WORKFLOW_HEADERS = [
  'ImportPageAPI.apiSelection',
  'ImportPageAPI.triggerImport',
];

// eslint-disable-next-line no-empty-pattern
function ImportDataApiPage({ confirmPullingDataFromApiEtl, mutations }) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const { fetchingApiEtlServices, apiEtlServices, errorApiEtlServices } = useSelector((store) => store.individual);
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
    dispatch(
      fetchMutationByLabel(formatMessage('ImportPageAPI.confirmPullingData')),
    );
  }, []);

  useEffect(() => {
    dispatch(
      fetchMutationByLabel(formatMessage('ImportPageAPI.confirmPullingData')),
    );
  }, [serviceToPullData]);

  return (
    <StyledDiv>
      <Helmet title={formatMessage('ImportPageAPI.ImportPage')} />
      <div>
        <TableContainer component={Paper} className="tableContainer">
          <Table>
            <TableHead>
              <TableRow>
                {API_WORKFLOW_HEADERS.map((header, index) => (
                  <TableCell
                    key={header}
                    className={`headerCell ${index === 1 ? 'actionCell' : ''}`}
                  >
                    {formatMessage(header)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(fetchingApiEtlServices || errorApiEtlServices) && (
                <TableRow>
                  <TableCell colSpan={API_WORKFLOW_HEADERS.length}>
                    <ProgressOrError
                      progress={fetchingApiEtlServices}
                      error={errorApiEtlServices}
                    />
                  </TableCell>
                </TableRow>
              )}
              {apiEtlServices.map((etlService) => (
                <TableRow key={etlService.nameOfService} className="row">
                  <TableCell className="cell">
                    {etlService.nameOfService}
                  </TableCell>
                  <TableCell className="cell actionCell">
                    <Tooltip
                      title={formatMessage('ImportPageAPI.triggerImport')}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => confirmPullingData(etlService.nameOfService)}
                        disabled={mutations.length > 0}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          padding: '8px 32px',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                          },
                        }}
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
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {formatMessage('ImportPageAPI.confirmPullingData.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {formatMessage('ImportPageAPI.confirmPullingData.message')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button
              onClick={() => setOpenConfirmDialog(false)}
              variant="outlined"
              color="primary"
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              {formatMessage('ImportPageAPI.confirmPullingData.cancel')}
            </Button>
            <Button
              onClick={() => handlePullingData()}
              variant="contained"
              color="primary"
              autoFocus
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              {formatMessage('ImportPageAPI.confirmPullingData.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </StyledDiv>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    coreConfirm,
    clearConfirm,
    journalize,
    confirmPullingDataFromApiEtl,
  },
  dispatch,
);

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutations: state.individual.mutations,
});

export { StyledDiv };
export default connect(mapStateToProps, mapDispatchToProps)(ImportDataApiPage);
