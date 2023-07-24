import React, { useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  coreConfirm,
  clearConfirm,
  journalize,
  withHistory,
  historyPush,
  downloadExport,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  IconButton, Tooltip, Button,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  fetchGroupIndividuals, deleteGroupIndividual, downloadGroupIndividuals, updateGroupIndividual,
} from '../actions';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
  RIGHT_GROUP_INDIVIDUAL_UPDATE,
  RIGHT_GROUP_INDIVIDUAL_DELETE,
} from '../constants';
import GroupIndividualFilter from './GroupIndividualFilter';
import GroupIndividualRolePicker from '../pickers/GroupIndividualRolePicker';

function GroupIndividualSearcher({
  intl,
  modulesManager,
  history,
  rights,
  coreConfirm,
  clearConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  fetchGroupIndividuals,
  deleteGroupIndividual,
  fetchingGroupIndividuals,
  fetchedGroupIndividuals,
  errorGroupIndividuals,
  groupIndividuals,
  updateGroupIndividual,
  groupIndividualsPageInfo,
  groupIndividualsTotalCount,
  groupId,
  downloadGroupIndividuals,
  groupIndividualExport,
  errorGroupIndividualExport,
}) {
  const [groupIndividualToDelete, setGroupIndividualToDelete] = useState(null);
  const [deletedGroupIndividualUuids, setDeletedGroupIndividualUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();
  const [updatedGroupIndividuals, setUpdatedGroupIndividuals] = useState([]);

  function groupIndividualUpdatePageUrl(groupIndividual) {
    return `${modulesManager.getRef('individual.route.individual')}/${groupIndividual.individual?.id}`;
  }

  const openDeleteGroupIndividualConfirmDialog = () => coreConfirm(
    formatMessageWithValues(intl, 'individual', 'individual.delete.confirm.title', {
      firstName: groupIndividualToDelete.individual.firstName,
      lastName: groupIndividualToDelete.individual.lastName,
    }),
    formatMessage(intl, 'individual', 'individual.delete.confirm.message'),
  );

  const onDoubleClick = (groupIndividual, newTab = false) => rights.includes(RIGHT_GROUP_INDIVIDUAL_UPDATE)
        && !deletedGroupIndividualUuids.includes(groupIndividual.id)
        && historyPush(modulesManager, history, 'individual.route.individual', [groupIndividual?.id], newTab);

  const onDelete = (groupIndividual) => setGroupIndividualToDelete(groupIndividual);

  useEffect(() => groupIndividualToDelete && openDeleteGroupIndividualConfirmDialog(), [groupIndividualToDelete]);

  useEffect(() => {
    if (groupIndividualToDelete && confirmed) {
      deleteGroupIndividual(
        groupIndividualToDelete,
        formatMessageWithValues(intl, 'individual', 'individual.delete.mutationLabel', {
          firstName: groupIndividualToDelete.individual.firstName,
          lastName: groupIndividualToDelete.individual.lastName,
        }),
      );
      setDeletedGroupIndividualUuids([...deletedGroupIndividualUuids, groupIndividualToDelete.id]);
    }
    if (groupIndividualToDelete && confirmed !== null) {
      setGroupIndividualToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchGroupIndividuals(params);

  const headers = () => {
    const headers = [
      'individual.firstName',
      'individual.lastName',
      'individual.dob',
      'groupIndividual.individual.role',
    ];
    if (rights.includes(RIGHT_GROUP_INDIVIDUAL_UPDATE)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const addUpdatedGroupIndividual = (groupIndividual, role) => {
    setUpdatedGroupIndividuals((prevState) => {
      const updatedBeneficiaryExists = prevState.some(
        (item) => item.id === groupIndividual.id && item.role === role,
      );

      if (!updatedBeneficiaryExists) {
        return [...prevState, groupIndividual];
      }

      return prevState.filter(
        (item) => !(item.id === groupIndividual.id && item.role === role),
      );
    });
  };

  const handleRoleOnChange = (groupIndividual, role) => {
    if (groupIndividual && role) {
      addUpdatedGroupIndividual(groupIndividual, role);
      const editedGroupIndividual = { ...groupIndividual, role };
      updateGroupIndividual(
        editedGroupIndividual,
        formatMessageWithValues(intl, 'individual', 'groupIndividual.update.mutationLabel', {
          id: editedGroupIndividual?.individual?.id,
        }),
      );
    }
  };

  const isRowUpdated = (groupIndividual) => (
    updatedGroupIndividuals.some((item) => item.id === groupIndividual.id));

  const isRowDeleted = (groupIndividual) => deletedGroupIndividualUuids.includes(groupIndividual.id);

  const isRowDisabled = (_, groupIndividual) => isRowDeleted(groupIndividual) || isRowUpdated(groupIndividual);

  const itemFormatters = () => {
    const formatters = [
      (groupIndividual) => groupIndividual.individual.firstName,
      (groupIndividual) => groupIndividual.individual.lastName,
      (groupIndividual) => (
        groupIndividual.individual.dob
          ? formatDateFromISO(modulesManager, intl, groupIndividual.individual.dob)
          : EMPTY_STRING
      ),
      (groupIndividual) => (rights.includes(RIGHT_GROUP_INDIVIDUAL_UPDATE) && !isRowDeleted(groupIndividual) ? (
        <GroupIndividualRolePicker
          withLabel={false}
          withNull={false}
          value={groupIndividual.role}
          onChange={(role) => handleRoleOnChange(groupIndividual, role)}
        />
      ) : groupIndividual.role),
    ];
    if (rights.includes(RIGHT_GROUP_INDIVIDUAL_UPDATE)) {
      formatters.push((groupIndividual) => (
        <Tooltip title={formatMessage(intl, 'individual', 'editButtonTooltip')}>
          <IconButton
            href={groupIndividualUpdatePageUrl(groupIndividual)}
            onClick={(e) => e.stopPropagation() && onDoubleClick(groupIndividual)}
            disabled={isRowDeleted(groupIndividual)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(RIGHT_GROUP_INDIVIDUAL_DELETE)) {
      formatters.push((groupIndividual) => (
        <Tooltip title={formatMessage(intl, 'individual', 'deleteButtonTooltip')}>
          <IconButton
            onClick={() => onDelete(groupIndividual)}
            disabled={isRowDeleted(groupIndividual)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const rowIdentifier = (groupIndividual) => groupIndividual.id;

  const sorts = () => [
    ['individual__firstName', true],
    ['individual__lastName', true],
    ['individual__dob', true],
  ];

  const [failedExport, setFailedExport] = useState(false);

  useEffect(() => {
    setFailedExport(true);
  }, [errorGroupIndividualExport]);

  useEffect(() => {
    if (groupIndividualExport) {
      downloadExport(
        groupIndividualExport,
        `${formatMessage(intl, 'individual', 'export.filename.individuals')}.csv`,
      )();
    }
  }, [groupIndividualExport]);

  const defaultFilters = () => {
    const filters = {
      isDeleted: {
        value: false,
        filter: 'isDeleted: false',
      },
    };
    if (groupId !== null && groupId !== undefined) {
      filters.groupId = {
        value: groupId,
        filter: `group_Id: "${groupId}"`,
      };
    }
    return filters;
  };

  return (
    <div>
      <Searcher
        module="individual"
        FilterPane={GroupIndividualFilter}
        fetch={fetch}
        items={groupIndividuals}
        itemsPageInfo={groupIndividualsPageInfo}
        fetchingItems={fetchingGroupIndividuals}
        fetchedItems={fetchedGroupIndividuals}
        errorItems={errorGroupIndividuals}
        tableTitle={formatMessageWithValues(intl, 'individual', 'individuals.searcherResultsTitle', {
          individualsTotalCount: groupIndividualsTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="individual__lastName"
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
        exportable
        exportFetch={downloadGroupIndividuals}
        exportFields={[
          'individual__id',
          'individual__first_name',
          'individual__last_name',
          'individual__dob',
          'role',
          'json_ext', // Unfolded by backend and removed from csv
        ]}
        exportFieldsColumns={{
          individual__id: 'ID',
          individual__first_name: formatMessage(intl, 'individual', 'export.firstName'),
          individual__last_name: formatMessage(intl, 'individual', 'export.lastName'),
          individual__dob: formatMessage(intl, 'individual', 'export.dob'),
          role: formatMessage(intl, 'individual', 'export.role'),
        }}
        exportFieldLabel={formatMessage(intl, 'individual', 'export.label')}
        cacheFiltersKey="groupIndividualsFilterCache"
      />
      {failedExport && (
        <Dialog fullWidth maxWidth="sm">
          <DialogTitle>{errorGroupIndividualExport}</DialogTitle>
          <DialogActions>
            <Button onClick={setFailedExport(false)} variant="contained">
              {formatMessage(intl, 'individual', 'ok')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingGroupIndividuals: state.individual.fetchingGroupIndividuals,
  fetchedGroupIndividuals: state.individual.fetchedGroupIndividuals,
  errorGroupIndividuals: state.individual.errorGroupIndividuals,
  groupIndividuals: state.individual.groupIndividuals,
  groupIndividualsPageInfo: state.individual.groupIndividualsPageInfo,
  groupIndividualsTotalCount: state.individual.groupIndividualsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
  selectedFilters: state.core.filtersCache.groupIndividualsFilterCache,
  fetchingGroupIndividualExport: state.individual.fetchingGroupIndividualExport,
  fetchedGroupIndividualExport: state.individual.fetchedGroupIndividualExport,
  groupIndividualExport: state.individual.groupIndividualExport,
  groupIndividualExportPageInfo: state.individual.groupIndividualExportPageInfo,
  errorGroupIndividualExport: state.individual.errorGroupIndividualExport,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchGroupIndividuals,
    updateGroupIndividual,
    deleteGroupIndividual,
    downloadGroupIndividuals,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(GroupIndividualSearcher))),
);
