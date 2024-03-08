import React, { useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
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
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CollapsableErrorList from '../CollapsableErrorList';
import { fetchUploadHistory } from '../../actions';
import { downloadIndividualUploadFile, downloadInvalidItems } from '../../utils';
import { UPLOAD_STATUS } from '../../constants';

const styles = (theme) => ({
  item: theme.paper.item,
});

function IndividualsUploadHistoryDialog({
  modulesManager,
  intl,
  classes,
  fetchUploadHistory,
  history,
  fetchedHistory,
  fetchingHistory,
}) {
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

  useEffect(() => {
    if (isOpen) {
      const params = [
        'orderBy: ["-dateCreated"]',
      ];
      fetchUploadHistory(params);
    }
  }, [isOpen]);

  useEffect(() => {
    setRecords(history);
  }, [fetchedHistory]);

  return (
    <>
      <MenuItem
        onClick={handleOpen}
      >
        {formatMessage(intl, 'individual', 'individual.upload.uploadHistoryTable.buttonLabel')}
      </MenuItem>
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
                <TableHead className={classes.header}>
                  <TableRow className={classes.headerTitle}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  <ProgressOrError progress={fetchingHistory} error={fetchedHistory} />
                  {records.map((item) => (
                    <TableRow key={item?.id}>
                      <TableCell>
                        { item.workflow }
                      </TableCell>
                      <TableCell>
                        { formatDateTimeFromISO(modulesManager, intl, item.dataUpload.dateCreated) }
                      </TableCell>
                      <TableCell>
                        { item.dataUpload.sourceType}
                      </TableCell>
                      <TableCell>
                        { item.dataUpload.sourceName}
                      </TableCell>
                      <TableCell>
                        { item.dataUpload.status}
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
  confirmed: state.core.confirmed,
  history: state.individual.individualDataUploadHistory,
  fetchedHistory: state.individual.fetchedIndividualDataUploadHistory,
  fetchingHistory: state.individual.fetchingIndividualDataUploadHistory,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUploadHistory,
}, dispatch);

export default injectIntl(
  withModulesManager(withTheme(
    withStyles(styles)(
      connect(mapStateToProps, mapDispatchToProps)(IndividualsUploadHistoryDialog),
    ),
  )),
);
