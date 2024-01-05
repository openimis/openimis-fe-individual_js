import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useModulesManager, useTranslations, Autocomplete,
} from '@openimis/fe-core';
import { fetchGroups } from '../actions';

function GroupPicker(props) {
  const {
    withLabel = true,
    withPlaceholder,
    label,
    groupIndividual,
    onChange,
  } = props;

  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const fetchingGroups = useSelector((state) => state.individual.fetchingGroups);
  const fetchedGroups = useSelector((state) => state.individual.fetchedGroups);
  const errorGroups = useSelector((state) => state.individual.errorGroups);
  const groups = useSelector((state) => state.individual.groups);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    if (!fetchingGroups && !fetchedGroups) {
      dispatch(fetchGroups({}));
    }
  }, []);

  const groupLabel = (option) => option.id;

  const getGroupsWithoutCurrentGroup = (options) => options.filter(
    (option) => option?.id !== groupIndividual?.group?.id,
  );

  const handleChange = (group) => {
    onChange(group);
    setGroup(group);
  };

  return (
    <Autocomplete
      label={label ?? formatMessage('groupPicker.label')}
      error={errorGroups}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      options={getGroupsWithoutCurrentGroup(groups)}
      isLoading={fetchingGroups}
      isFetched={fetchedGroups}
      value={group}
      getOptionLabel={groupLabel}
      onChange={handleChange}
      onInputChange={() => null}
    />
  );
}

export default GroupPicker;
