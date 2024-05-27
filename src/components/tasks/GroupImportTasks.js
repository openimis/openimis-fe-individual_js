/* eslint-disable no-use-before-define */

import React, { useState, useEffect } from 'react';
import {
  Paper, Fab, makeStyles, Checkbox, Divider,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  SelectDialog,
  decodeId,
  formatMessage,
  formatMessageWithValues,
} from '@openimis/fe-core';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';

import { useIntl } from 'react-intl';
import { TASK_STATUS, APPROVED, FAILED } from '../../constants';
import { fetchPendingGroupUploads, resolveTask } from '../../actions';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
  button: theme.paper.button,
  fabContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  fabHeaderContainer: {
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  fab: {
    margin: theme.spacing(1),
  },

}));

function GroupUploadTaskDisplay({
  businessData, setAdditionalData, jsonExt,
}) {
  const {
    errorPendingGroups,
    pendingGroups,
    fetchedPendingGroups,
    fetchingPendingGroups,
    pendingGroupsPageInfo,
  } = useSelector((state) => state.individual);
  const intl = useIntl();
  const [pending, setPending] = useState([]);
  const [keys, setKeys] = useState([]);
  const [state, setState] = useState({
    page: 0,
    pageSize: 10,
    afterCursor: null,
    beforeCursor: null,
  });

  const { task } = useSelector((state) => state.tasksManagement);
  const currentUser = useSelector((state) => state.core.user);

  const isTaskResolved = () => ![TASK_STATUS.RECEIVED, TASK_STATUS.ACCEPTED].includes(task?.status);
  const dispatch = useDispatch();
  const queryPrms = () => ({
    upload_Id: jsonExt?.data_upload_id,
    isDeleted: isTaskResolved() ? undefined : false,
  });

  const [selectedRecords, setSelectedRecords] = useState([]);
  const query = () => {
    const prms = queryPrms();
    if (!state.pageSize || !prms) return;
    prms.pageSize = state.pageSize;
    if (state.afterCursor) {
      prms.after = state.afterCursor;
    }
    if (state.beforeCursor) {
      prms.before = state.beforeCursor;
    }

    dispatch(fetchPendingGroupUploads(prms));
  };

  const currentPage = () => state.page;
  const currentPageSize = () => state.pageSize;

  useEffect(() => {
    query();
  }, []);

  useEffect(() => {
    query();
  }, [state]);

  const organizeData = (data) => {
    const uniqueKeys = ['code'];

    data.forEach((i) => Object.keys(i).forEach((k) => {
      if (!uniqueKeys.includes(k)) {
        uniqueKeys.push(k);
      }
    }));

    // Remove internal identifiers
    // Unnamed 0 is ordinal often found in the uploaded CSVs, it shoun't appear in new
    // version but is added for backward compatibility s
    return uniqueKeys.filter((k) => !['uuid', 'ID', 'Unnamed: 0'].includes(k));
  };

  const [storedGroups, setStoredGroups] = useState({});

  useEffect(() => {
    setPending(
      pendingGroups.map((x) => (x.jsonExt ? { ...JSON.parse(x.jsonExt), uuid: x.uuid }
        : { uuid: x.uuid })),
    );
    const withGroups = {};
    pendingGroups.forEach((x) => {
      withGroups[x.id] = x.group?.id;
    });
    setStoredGroups(withGroups);
  }, [pendingGroups]);

  useEffect(() => setKeys(organizeData(pending)), [pending]);

  const classes = useStyles();

  const headers = () => [
    task?.status === TASK_STATUS.ACCEPTED
      ? formatMessage(intl, 'socialProtection', 'selectForEvaluation')
      : formatMessage(intl, 'socialProtection', 'evaluated'),
    ...keys] || [];

  const changeCheckboxState = (pending) => {
    setSelectedRecords(selectedRecords.includes(pending.uuid)
      ? selectedRecords.filter((x) => x !== pending.uuid) : [...selectedRecords, pending.uuid]);
  };

  const itemFormatters = () => {
    const items = [
      (pending) => (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {!isTaskResolved() ? (
            <Checkbox
              color="primary"
              checked={selectedRecords.includes(pending.uuid)}
              onChange={() => changeCheckboxState(pending)}
              disabled={isRowDisabled()}
            />
          ) : (
            <Checkbox
              color="primary"
              checked={storedGroups[pending.uuid] !== undefined}
              onChange={() => {}}
              disabled
            />
          )}

        </>
      ),
    ];

    keys.forEach((key) => {
      items.push((pending) => {
        if (Object.prototype.hasOwnProperty.call(pending, key)) {
          const value = pending[key];
          // Check if the value is an array and join it into a comma-separated string
          return Array.isArray(value) ? value.join(', ') : value;
        }
        return '-';
      });
    });
    return items;
  };

  const onChangeRowsPerPage = (rows) => {
    setState({
      ...state,
      pageSize: rows,
    });
  };

  const onChangeSelection = (rows) => {
    setSelectedRecords(rows.map((row) => row.uuid));
  };

  const onChangePage = (page, nbr) => {
    const next = nbr > state.page;

    setState(
      {
        page: next ? state.page + 1 : state.page - 1,
        pageSize: state.pageSize,
        afterCursor: next ? pendingGroupsPageInfo.endCursor : null,
        beforeCursor: !next ? pendingGroupsPageInfo.startCursor : null,
      },
    );
  };

  const isCurrentUserInTaskGroup = () => {
    const taskExecutors = task?.taskGroup?.taskexecutorSet?.edges.map((edge) => decodeId(edge.node.user.id)) ?? [];
    return taskExecutors && taskExecutors.includes(currentUser?.id);
  };

  const isRowDisabled = () => !isCurrentUserInTaskGroup() || task?.status !== TASK_STATUS.ACCEPTED;

  const [approveOrFail, setApproveOrFail] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [openModal, setOpenModal] = useState(null);
  const [disabled, setDisable] = useState(false);

  const clear = () => {
    setOpenModal(null);
    setApproveOrFail('');
    setConfirmed('');
  };

  useEffect(() => {
    if (task?.id && currentUser?.id) {
      if (confirmed) {
        setDisable(true);
        dispatch(resolveTask(
          task,
          formatMessage(intl, 'tasksManagement', 'task.resolve.mutationLabel'),
          currentUser,
          approveOrFail,
          selectedRecords,
        ));
      }
    }
    return () => confirmed && clear(false);
  }, [confirmed]);

  const onConfirm = () => {
    setOpenModal(false);
    setConfirmed(true);
  };

  const onClose = () => {
    setOpenModal(false);
    setConfirmed(false);
  };

  const handleButtonClick = (choiceString) => {
    if (task?.id && currentUser?.id) {
      setApproveOrFail(choiceString);
      setOpenModal(true);
    }
  };

  return (
    <>
      <SelectDialog
        confirmState={openModal}
        onConfirm={onConfirm}
        onClose={onClose}
        module="individual"
        confirmTitle="taskConfirmation.title"
        confirmMessage={
          formatMessageWithValues(intl, 'socialProtection', 'atomicApprove', { count: selectedRecords.length })
        }
        confirmationButton="dialogActions.continue"
        rejectionButton="dialogActions.goBack"
      />
      <Table
        module="socialProtection"
        headers={headers()}
                // headerActions={headerActions}
        itemFormatters={itemFormatters()}
        items={(!!pending && pending) || []}
        fetching={fetchingPendingGroups}
        error={errorPendingGroups}
        fetched={fetchedPendingGroups}
                // onDoubleClick={this.onDoubleClick}
        withSelection={!isRowDisabled() ? 'multiple' : ''}
        onChangeSelection={onChangeSelection}
        withPagination
        rowsPerPageOptions={[10, 20, 10, 100]}
        defaultPageSize={10}
        page={currentPage()}
        pageSize={currentPageSize()}
        count={pendingGroupsPageInfo.totalCount}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        rowDisabled={isRowDisabled}
      />

      {isCurrentUserInTaskGroup()
                && (
                <>
                  {' '}
                  <Paper className={classes.paper}>
                    <div className={classes.fabHeaderContainer}>
                      {formatMessage(intl, 'socialProtection', 'resolveSelectedTasks')}
                      <Divider />
                    </div>
                    <div className={classes.fabContainer}>
                      <div className={classes.fab}>
                        <Fab
                          color="primary"
                          disabled={disabled
                              || task?.status === TASK_STATUS.RECEIVED
                              || isRowDisabled()
                              || selectedRecords.length === 0}
                          onClick={() => handleButtonClick('ACCEPT')}
                        >
                          <CheckIcon />
                        </Fab>
                        {formatMessage(intl, 'socialProtection', 'acceptSelected')}
                      </div>
                      <div className={classes.fab}>
                        <Fab
                          color="primary"
                          disabled={disabled
                              || task?.status === TASK_STATUS.RECEIVED
                              || isRowDisabled()
                              || selectedRecords.length === 0}
                          onClick={() => handleButtonClick('REJECT')}
                        >
                          <ClearIcon />
                        </Fab>
                        {formatMessage(intl, 'socialProtection', 'rejectSelected')}
                      </div>
                    </div>
                  </Paper>
                </>
                )}
    </>
  );
}

const GroupUploadResolutionTaskTableHeaders = () => [];

const GroupUploadResolutionItemFormatters = () => [
  (businessData, jsonExt, formatterIndex, setAdditionalData) => (
    <GroupUploadTaskDisplay
      businessData={businessData}
      setAdditionalData={setAdditionalData}
      jsonExt={jsonExt}
    />
  ),
];

function GroupUploadConfirmationPanel({ defaultAction, defaultDisabled }) {
  const intl = useIntl();
  const classes = useStyles();
  const { task } = useSelector((state) => state.tasksManagement);
  const currentUser = useSelector((state) => state.core.user);
  const [disabled, setDisable] = useState(defaultDisabled);

  const [openModal, setOpenModal] = useState(null);
  const [approveOrFail, setApproveOrFail] = useState('');
  const [confirmed, setConfirmed] = useState('');

  const onConfirm = () => {
    setOpenModal(false);
    setConfirmed(true);
  };

  const onClose = () => {
    setOpenModal(false);
    setConfirmed(false);
  };

  const isCurrentUserInTaskGroup = () => {
    const taskExecutors = task?.taskGroup?.taskexecutorSet?.edges.map((edge) => decodeId(edge.node.user.id)) ?? [];
    return taskExecutors && taskExecutors.includes(currentUser?.id);
  };

  const isRowDisabled = () => !isCurrentUserInTaskGroup() || task?.status !== TASK_STATUS.ACCEPTED;

  const clear = () => {
    setOpenModal(null);
    setApproveOrFail('');
    setConfirmed('');
  };

  const handleButtonClick = (choiceString) => {
    // () => defaultAction(APPROVED)
    if (task?.id && currentUser?.id) {
      setApproveOrFail(choiceString);
      setOpenModal(true);
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (task?.id && currentUser?.id) {
      if (confirmed) {
        setDisable(true);
        dispatch(resolveTask(
          task,
          formatMessage(intl, 'tasksManagement', 'task.resolve.mutationLabel'),
          currentUser,
          approveOrFail,

        ));
      }
    }
    return () => confirmed && clear();
  }, [confirmed]);

  return (
    <>
      <SelectDialog
        confirmState={openModal}
        onConfirm={onConfirm}
        onClose={onClose}
        module="socialProtection"
        confirmTitle="taskConfirmation.title"
        confirmMessage={formatMessage(intl, 'socialProtection', 'bulkApprove')}
        confirmationButton="dialogActions.continue"
        rejectionButton="dialogActions.goBack"
      />
      <Paper className={classes.paper}>
        <div className={classes.fabHeaderContainer}>
          {formatMessage(intl, 'socialProtection', 'resolveAllRemainingTasks')}
          <Divider />
        </div>
        <div className={classes.fabContainer}>
          <div className={classes.fab}>
            <Fab
              color="primary"
              disabled={disabled || isRowDisabled()}
              onClick={() => handleButtonClick(APPROVED)}
            >
              <CheckIcon />
            </Fab>
            {formatMessage(intl, 'socialProtection', 'approveAll')}

          </div>
          <div className={classes.fab}>
            <Fab
              color="primary"
              disabled={disabled || task?.status === TASK_STATUS.RECEIVED || isRowDisabled()}
              onClick={() => handleButtonClick(FAILED)}
            >
              <ClearIcon />
            </Fab>
            {formatMessage(intl, 'socialProtection', 'rejectAll')}
          </div>
        </div>
      </Paper>
    </>
  );
}

export { GroupUploadResolutionTaskTableHeaders, GroupUploadResolutionItemFormatters, GroupUploadConfirmationPanel };
