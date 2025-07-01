import React from 'react';
import { Tab } from '@material-ui/core';
import { formatMessage, PublishedComponent } from '@openimis/fe-core';
import { INDIVIDUALS_LIST_TAB_VALUE } from '../constants';

function IndividualsListTabLabel({
  intl, onChange, tabStyle, isSelected, individual,
}) {
  if (individual) {
    return null;
  }

  return (
    <Tab
      onChange={onChange}
      className={tabStyle(INDIVIDUALS_LIST_TAB_VALUE)}
      selected={isSelected(INDIVIDUALS_LIST_TAB_VALUE)}
      value={INDIVIDUALS_LIST_TAB_VALUE}
      label={formatMessage(intl, 'individual', 'individualsList.label')}
    />
  );
}

function IndividualsListTabPanel({
  value, rights, groupId, individual, editedGroupIndividual, setEditedGroupIndividual,
}) {
  if (individual) {
    return null;
  }
  return (
    <PublishedComponent
      pubRef="policyHolder.TabPanel"
      module="individual"
      index={INDIVIDUALS_LIST_TAB_VALUE}
      value={value}
    >
      <PublishedComponent
        rights={rights}
        groupId={groupId}
        editedGroupIndividual={editedGroupIndividual}
        setEditedGroupIndividual={setEditedGroupIndividual}
        pubRef="individual.GroupIndividualSearcher"
      />
    </PublishedComponent>
  );
}

export { IndividualsListTabLabel, IndividualsListTabPanel };
