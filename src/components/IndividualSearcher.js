import React, { useState, useEffect, useRef } from "react";
import { injectIntl } from "react-intl";
import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  formatDateFromISO,
  coreConfirm,
  journalize,
  withHistory,
  historyPush,
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchIndividuals, deleteIndividual } from "../actions";
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  EMPTY_STRING,
  RIGHT_INDIVIDUAL_UPDATE,
  RIGHT_INDIVIDUAL_DELETE,
} from "../constants";
import IndividualFilter from "./IndividualFilter";
import { IconButton, Tooltip } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

const IndividualSearcher = ({
  intl,
  modulesManager,
  history,
  rights,
  coreConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  fetchIndividuals,
  deleteIndividual,
  fetchingIndividuals,
  fetchedIndividuals,
  errorIndividuals,
  individuals,
  individualsPageInfo,
  individualsTotalCount,
}) => {
  const [individualToDelete, setIndividualToDelete] = useState(null);
  const [deletedIndividualUuids, setDeletedIndividualUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => individualToDelete && openDeleteIndividualConfirmDialog(), [individualToDelete]);

  useEffect(() => {
    if (individualToDelete && confirmed) {
      deleteIndividual(
        individualToDelete,
        formatMessageWithValues(intl, "individual", "individual.delete.mutationLabel", {
          firstName: individualToDelete.firstName,
          lastName: individualToDelete.lastName
        }),
      );
      setDeletedIndividualUuids([...deletedIndividualUuids, individualToDelete.id]);
    }
    individualToDelete && confirmed !== null && setIndividualToDelete(null);
  }, [confirmed]);

  useEffect(() => {
    prevSubmittingMutationRef.current && !submittingMutation && journalize(mutation);
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const openDeleteIndividualConfirmDialog = () =>
    coreConfirm(
      formatMessageWithValues(intl, "individual", "individual.delete.confirm.title", {
        firstName: individualToDelete.firstName,
        lastName: individualToDelete.lastName
      }),
      formatMessage(intl, "individual", "individual.delete.confirm.message"),
    );

  const fetch = (params) => fetchIndividuals(params);

  const headers = () => {
    const headers = [
      "individual.firstName",
      "individual.lastName",
      "individual.dob",
    ];
    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE)) {
      headers.push("emptyLabel");
    }
    return headers;
  };

  const itemFormatters = () => {
    const formatters = [
      (individual) => individual.firstName,
      (individual) => individual.lastName,
      (individual) =>
        !!individual.dob ? formatDateFromISO(modulesManager, intl, individual.dob) : EMPTY_STRING,
    ];
    if (rights.includes(RIGHT_INDIVIDUAL_UPDATE)) {
      formatters.push((individual) => (
        <Tooltip title={formatMessage(intl, "individual", "editButtonTooltip")}>
          <IconButton
            href={individualUpdatePageUrl(individual)}
            onClick={(e) => e.stopPropagation() && onDoubleClick(individual)}
            disabled={deletedIndividualUuids.includes(individual.id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(RIGHT_INDIVIDUAL_DELETE)) {
      formatters.push((individual) => (
        <Tooltip title={formatMessage(intl, "individual", "deleteButtonTooltip")}>
          <IconButton
            onClick={() => onDelete(individual)}
            disabled={deletedIndividualUuids.includes(individual.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const rowIdentifier = (individual) => individual.id;

  const sorts = () => [
    ["firstName", true],
    ["lastName", true],
    ["dob", true],
  ];

  const individualUpdatePageUrl = (individual) => modulesManager.getRef("individual.route.individual") + "/" + individual?.id;

  const onDoubleClick = (individual, newTab = false) =>
    rights.includes(RIGHT_INDIVIDUAL_UPDATE) &&
    !deletedIndividualUuids.includes(individual.id) &&
    historyPush(modulesManager, history, "individual.route.individual", [individual?.id], newTab);

  const onDelete = (individual) => setIndividualToDelete(individual);

  const isRowDisabled = (_, individual) => deletedIndividualUuids.includes(individual.id);

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: "isDeleted: false",
    },
  });

  return (
    <Searcher
      module="individual"
      FilterPane={IndividualFilter}
      fetch={fetch}
      items={individuals}
      itemsPageInfo={individualsPageInfo}
      fetchingItems={fetchingIndividuals}
      fetchedItems={fetchedIndividuals}
      errorItems={errorIndividuals}
      tableTitle={formatMessageWithValues(intl, "individual", "individuals.searcherResultsTitle", {
        individualsTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="lastName"
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
    />
  );
};

const mapStateToProps = (state) => ({
  fetchingIndividuals: state.individual.fetchingIndividuals,
  fetchedIndividuals: state.individual.fetchedIndividuals,
  errorIndividuals: state.individual.errorIndividuals,
  individuals: state.individual.individuals,
  individualsPageInfo: state.individual.individualsPageInfo,
  individualsTotalCount: state.individual.individualsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.individual.submittingMutation,
  mutation: state.individual.mutation,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIndividuals,
      deleteIndividual,
      coreConfirm,
      journalize,
    },
    dispatch,
  );

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualSearcher))),
);
