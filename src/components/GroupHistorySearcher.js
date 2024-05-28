import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  useModulesManager,
  useTranslations,
  Searcher,
  withHistory,
  withModulesManager,
} from '@openimis/fe-core';
import { DEFAULT_PAGE_SIZE, EMPTY_STRING, ROWS_PER_PAGE_OPTIONS } from '../constants';
import GroupHistoryFilter from './GroupHistoryFilter';
import { fetchGroupHistory } from '../actions';

function GroupHistorySearcher({
  groupId,
}) {
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const { formatDateFromISO, formatMessageWithValues } = useTranslations('individual', modulesManager);

  const fetchingGroupHistory = useSelector((state) => state.individual.fetchingGroupHistory);
  const fetchedGroupHistory = useSelector((state) => state.individual.fetchedGroupHistory);
  const errorGroupHistory = useSelector((state) => state.individual.errorGroupHistory);
  const groupHistory = useSelector((state) => state.individual.groupHistory);
  const groupHistoryPageInfo = useSelector((state) => state.individual.groupHistoryPageInfo);
  const groupHistoryTotalCount = useSelector((state) => state.individual.groupHistoryTotalCount);
  const fetch = (params) => dispatch(fetchGroupHistory(params));

  const headers = () => [
    'groupHistory.primaryRecipient',
    'groupHistory.head',
    'groupHistory.secondaryRecipient',
    'groupHistory.dateUpdated',
    'groupHistory.version',
    'groupHistory.members',
    'groupHistory.userUpdated',
  ];

  const itemFormatters = () => [
    (groupHistory) => {
      const jsonExt = groupHistory?.jsonExt ? JSON.parse(groupHistory.jsonExt) : null;
      return jsonExt?.primary_recipient ?? EMPTY_STRING;
    },
    (groupHistory) => {
      const jsonExt = groupHistory?.jsonExt ? JSON.parse(groupHistory.jsonExt) : null;
      return jsonExt?.head ?? EMPTY_STRING;
    },
    (groupHistory) => {
      const jsonExt = groupHistory?.jsonExt ? JSON.parse(groupHistory.jsonExt) : null;
      return jsonExt?.secondary_recipient ?? EMPTY_STRING;
    },
    (groupHistory) => (groupHistory?.dateUpdated
      ? formatDateFromISO(groupHistory.dateUpdated)
      : EMPTY_STRING),
    (groupHistory) => groupHistory?.version || EMPTY_STRING,
    (groupHistory) => {
      const jsonExt = groupHistory?.jsonExt ? JSON.parse(groupHistory.jsonExt) : null;
      return jsonExt?.members ? Object.values(jsonExt?.members).map((value) => `${value}, `) : EMPTY_STRING;
    },
    (groupHistory) => groupHistory?.userUpdated?.username,
  ];

  const rowIdentifier = (groupHistory) => groupHistory.id;

  const sorts = () => [
    ['id', true],
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
    if (groupId !== null && groupId !== undefined) {
      filters.groupId = {
        value: groupId,
        filter: `id: "${groupId}"`,
      };
    }
    return filters;
  };

  const groupHistoryFilter = (props) => (
    <GroupHistoryFilter
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
        FilterPane={groupHistoryFilter}
        fetch={fetch}
        items={groupHistory}
        itemsPageInfo={groupHistoryPageInfo}
        fetchingItems={fetchingGroupHistory}
        fetchedItems={fetchedGroupHistory}
        errorItems={errorGroupHistory}
        tableTitle={formatMessageWithValues('groupHistoryList.searcherResultsTitle', {
          groupHistoryTotalCount,
        })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        defaultOrderBy="id"
        rowIdentifier={rowIdentifier}
        defaultFilters={defaultFilters()}
        cacheFiltersKey="groupHistoryFilterCache"
        resetFiltersOnUnmount
      />
    </div>
  );
}

export default withHistory(
  withModulesManager(injectIntl((GroupHistorySearcher))),
);
