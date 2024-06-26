import React from 'react';
import { injectIntl } from 'react-intl';
import {
  formatDateFromISO,
  formatMessageWithValues,
  Searcher,
  withHistory,
  withModulesManager,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchIndividualHistory } from '../actions';
import { DEFAULT_PAGE_SIZE, EMPTY_STRING, ROWS_PER_PAGE_OPTIONS } from '../constants';
import IndividualHistoryFilter from './IndividualHistoryFilter';
import AdditionalFieldsDialog from './dialogs/AdditionalFieldsDialog';

function IndividualHistorySearcher({
  intl,
  modulesManager,
  individualHistory,
  fetchIndividualHistory,
  individualHistoryPageInfo,
  fetchingIndividualHistory,
  fetchedIndividualHistory,
  errorIndividualHistory,
  individualHistoryTotalCount,
  individualId,
}) {
  const fetch = (params) => fetchIndividualHistory(params);

  const headers = () => [
    'individualHistory.firstName',
    'individualHistory.lastName',
    'individualHistory.dob',
    'individualHistory.dateUpdated',
    'individualHistory.version',
    'individualHistory.jsonExt',
    'individualHistory.userUpdated',
  ];

  const itemFormatters = () => [
    (individualHistory) => individualHistory.firstName,
    (individualHistory) => individualHistory.lastName,
    (individualHistory) => (individualHistory.dob
      ? formatDateFromISO(modulesManager, intl, individualHistory.dob) : EMPTY_STRING
    ),
    (individualHistory) => (individualHistory.dateUpdated
      ? formatDateFromISO(modulesManager, intl, individualHistory.dateUpdated) : EMPTY_STRING
    ),
    (individualHistory) => individualHistory.version,
    (individualHistory) => (
      <AdditionalFieldsDialog
        individualJsonExt={individualHistory?.jsonExt}
      />
    ),
    (individualHistory) => individualHistory?.userUpdated?.username,
  ];

  const rowIdentifier = (individualHistory) => individualHistory.id;

  const sorts = () => [
    ['firstName', true],
    ['lastName', true],
    ['dob', true],
    ['dateUpdated', true],
    ['version', true],
  ];

  const defaultFilters = () => {
    const filters = {
      isDeleted: {
        value: false,
        filter: 'isDeleted: false',
      },
    };
    if (individualId !== null && individualId !== undefined) {
      filters.individualId = {
        value: individualId,
        filter: `id: "${individualId}"`,
      };
    }
    return filters;
  };

  const individualHistoryFilter = (props) => (
    <IndividualHistoryFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <div>
      <Searcher
        module="individual"
        FilterPane={individualHistoryFilter}
        fetch={fetch}
        items={individualHistory}
        itemsPageInfo={individualHistoryPageInfo}
        fetchingItems={fetchingIndividualHistory}
        fetchedItems={fetchedIndividualHistory}
        errorItems={errorIndividualHistory}
        tableTitle={formatMessageWithValues(intl, 'individual', 'individualHistoryList.searcherResultsTitle', {
          individualHistoryTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="-version"
        rowIdentifier={rowIdentifier}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="individualHistoryFilterChache"
        resetFiltersOnUnmount
      />
    </div>
  );
}

const mapStateToProps = (state) => ({
  fetchingIndividualHistory: state.individual.fetchingIndividualHistory,
  fetchedIndividualHistory: state.individual.fetchedIndividualHistory,
  errorIndividualHistory: state.individual.errorIndividualHistory,
  individualHistory: state.individual.individualHistory,
  individualHistoryPageInfo: state.individual.individualHistoryPageInfo,
  individualHistoryTotalCount: state.individual.individualHistoryTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchIndividualHistory,
  },
  dispatch,
);

export default withHistory(
  withModulesManager(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IndividualHistorySearcher))),
);
