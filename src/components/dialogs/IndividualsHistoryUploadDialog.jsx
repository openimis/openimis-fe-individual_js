import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { injectIntl } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import {
  formatMessage,
  formatDateTimeFromISO,
  ProgressOrError,
  withModulesManager,
} from '@openimis/fe-core';
import {
  TableHead,
  TableBody,
  Table,
  TableCell,
  TableRow,
  TableFooter,
  TableContainer,
  Paper,
  MenuItem,
} from '@mui/material';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CollapsableErrorList from '../CollapsableErrorList';
import { fetchUploadHistory } from '../../actions';
import { downloadIndividualUploadFile, downloadInvalidItems } from '../../utils';
import { POLLED_UPLOAD_STATUSES, UPLOAD_POLL_INTERVAL_MS, UPLOAD_STATUS } from '../../constants';
import UploadProgress from '../UploadProgress';

// Styled component replacing withStyles/styles object
const StyledTableHead = styled(TableHead)(({ theme }) => ({
  ...theme?.paper?.item,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  ...theme?.paper?.item,
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  ...theme?.paper?.item,
}));

// A poll returns only the newest uploads: keep the older rows it did not reach.
function mergePolledRows(previous, polled) {
  const polledIds = new Set(polled.map((item) => item.id));
  const oldestPolled = polled[polled.length - 1]?.dataUpload?.dateCreated;
  return [
    ...polled,
    ...previous.filter((item) => !polledIds.has(item.id) && item.dataUpload.dateCreated < oldestPolled),
  ];
}

function IndividualsUploadHistoryDialog({
  modulesManager,
  intl,
  fetchUploadHistory,
  history,
  fetchedHistory,
  fetchingHistory,
  errorHistory,
}) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState([]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const downloadInvalidItemsFromUpload = (uploadId) => {
    downloadInvalidItems(uploadId);
  };

  const downloadFile = (filename) => {
    downloadIndividualUploadFile(filename);
  };

  // `first` bounds a poll to the newest uploads, which the rows are sorted by.
  const polledFirst = useRef(null);
  const fetchHistory = useCallback((first = null) => {
    polledFirst.current = first;
    fetchUploadHistory(['orderBy: ["-dateCreated"]', ...(first ? [`first: ${first}`] : [])]);
  }, [fetchUploadHistory]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  // Keep showing the previous rows while a refresh is in flight: the reducer
  // empties the list on every request.
  useEffect(() => {
    if (fetchedHistory) {
      setRecords((previous) => (polledFirst.current ? mergePolledRows(previous, history) : history));
    }
  }, [fetchedHistory, history]);

  // While the dialog is open and an upload is still running or waiting for
  // verification, refresh the uploads down to the oldest such one. The timer is
  // re-armed whenever a request ends, so a failed refresh is retried.
  useEffect(() => {
    const polledCount = records.reduce(
      (count, item, index) => (POLLED_UPLOAD_STATUSES.includes(item?.dataUpload?.status) ? index + 1 : count),
      0,
    );
    if (!isOpen || fetchingHistory || !polledCount) return undefined;
    const timer = setTimeout(() => fetchHistory(polledCount), UPLOAD_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [isOpen, records, fetchingHistory, fetchHistory]);

  return (
    <>
      <StyledMenuItem
        onClick={handleOpen}
      >
        {formatMessage(intl, 'individual', 'individual.upload.uploadHistoryTable.buttonLabel')}
      </StyledMenuItem>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '85%',
            maxWidth: '85%',
            maxHeight: '75%',
          },
        }}
      >
        <DialogTitle
          style={{
            marginTop: '10px',
          }}
        >
          {formatMessage(intl, 'individual', 'individual.upload.uploadHistoryTable.label')}
        </DialogTitle>
        <DialogContent>
          <div
            style={{ backgroundColor: '#DFEDEF' }}
          >

            <TableContainer component={Paper}>
              <Table size="small">
                <StyledTableHead className="header">
                  <StyledTableRow className="headerTitle">
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.workflow',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.dateCreated',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.sourceType',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.sourceName',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.status',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.userCreated',
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMessage(
                        intl,
                        'individual',
                        'individual.upload.uploadHistoryTable.error',
                      )}
                    </TableCell>
                    <TableCell />
                  </StyledTableRow>
                </StyledTableHead>
                <TableBody>
                  <ProgressOrError progress={fetchingHistory && !records.length} error={errorHistory} />
                  {records.map((item) => (
                    <TableRow key={item?.id}>
                      <TableCell>
                        {item.workflow}
                      </TableCell>
                      <TableCell>
                        {formatDateTimeFromISO(modulesManager, intl, item.dataUpload.dateCreated)}
                      </TableCell>
                      <TableCell>
                        {item.dataUpload.sourceType}
                      </TableCell>
                      <TableCell>
                        {item.dataUpload.sourceName}
                      </TableCell>
                      <TableCell>
                        {item.dataUpload.status}
                        <UploadProgress status={item.dataUpload.status} progress={item.dataUpload.progress} />
                      </TableCell>
                      <TableCell>
                        {item.userCreated.username}
                      </TableCell>
                      <TableCell>
                        <CollapsableErrorList errors={item.dataUpload.error} />
                      </TableCell>
                      <TableCell>
                        {[
                          UPLOAD_STATUS.WAITING_FOR_VERIFICATION,
                          UPLOAD_STATUS.PARTIAL_SUCCESS,
                        ].includes(item.dataUpload.status) ? (
                          <Button
                            onClick={() => downloadInvalidItemsFromUpload(item.dataUpload.uuid)}
                            variant="outlined"
                            autoFocus
                            style={{
                              margin: '0 16px',
                              marginBottom: '15px',
                            }}
                          >
                            {formatMessage(
                              intl,
                              'individual',
                              'individual.upload.uploadHistoryTable.downloadInvalidItems',
                            )}
                          </Button>
                        ) : (
                          <div style={{ width: '120px' }} /> // Render a blank placeholder
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => downloadFile(item.dataUpload.sourceName)}
                          variant="outlined"
                          autoFocus
                          style={{
                            margin: '0 16px',
                            marginBottom: '15px',
                          }}
                        >
                          {formatMessage(
                            intl,
                            'individual',
                            'individual.upload.uploadHistoryTable.downloadUploadFile',
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter />
              </Table>
            </TableContainer>
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
                Close
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
  history: state.individual.individualDataUploadHistory,
  fetchedHistory: state.individual.fetchedIndividualDataUploadHistory,
  fetchingHistory: state.individual.fetchingIndividualDataUploadHistory,
  errorHistory: state.individual.errorIndividualDataUploadHistory,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUploadHistory,
}, dispatch);

// The unconnected dialog is exported for its tests.
export { StyledTableHead, IndividualsUploadHistoryDialog };
export default injectIntl(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(IndividualsUploadHistoryDialog)
  )
);
