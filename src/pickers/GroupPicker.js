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
  // eslint-disable-next-line no-unused-vars
  const [currentString, setCurrentString] = useState('');
  const [filters, setFilters] = useState(['isDeleted: false']);

  useEffect(() => {
    dispatch(fetchGroups(filters));
  }, [filters]);

  const groupLabel = (option) => option.code;

  const getGroupsWithoutCurrentGroup = (options) => options.filter(
    (option) => option?.code !== groupIndividual?.group?.code,
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
      setCurrentString={setCurrentString}
      isFetched={fetchedGroups}
      value={group}
      getOptionLabel={groupLabel}
      onChange={handleChange}
      onInputChange={
        (search) => {
          if (search !== undefined) setFilters([`code_Icontains: "${search}"`, 'isDeleted: false']);
        }
      }
    />
  );
}

export default GroupPicker;
