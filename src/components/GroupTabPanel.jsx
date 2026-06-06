import React, { useState } from 'react';
import { Paper, Grid } from '@mui/material';
import { Contributions } from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { useTheme, styled } from '@mui/material/styles';
import {
  BENEFIT_PLANS_LIST_TAB_VALUE,
  GROUPS_TABS_LABEL_CONTRIBUTION_KEY,
  GROUPS_TABS_PANEL_CONTRIBUTION_KEY, INDIVIDUALS_LIST_TAB_VALUE,
} from '../constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme?.paper?.paper,
  '& .tableTitle': theme?.table?.title,
  '& .tabs': {
    display: 'flex',
    alignItems: 'center',
  },
  '& .selectedTab': {
    borderBottom: '4px solid white',
  },
  '& .unselectedTab': {
    borderBottom: '4px solid transparent',
  },
  '& .button': {
    marginLeft: 'auto',
    padding: theme.spacing(1),
    fontSize: '0.875rem',
    textTransform: 'none',
  },
}));

function GroupTabPanel({
  intl,
  rights,
  individual,
  setConfirmedAction,
  group, editedGroupIndividual,
  setEditedGroupIndividual,
  groupIndividualIds,
  groupId,
}) {
  const theme = useTheme();
  if (!groupId) return null;

  const [activeTab, setActiveTab] = useState(individual ? BENEFIT_PLANS_LIST_TAB_VALUE : INDIVIDUALS_LIST_TAB_VALUE);

  const isSelected = (tab) => tab === activeTab;

  const tabStyle = (tab) => (isSelected(tab) ? 'selectedTab' : 'unselectedTab');

  const handleChange = (_, tab) => setActiveTab(tab);

  return (
    <StyledPaper className="paper">
      <StyledPaper className="tableTitle tabs">
        <Contributions
          contributionKey={GROUPS_TABS_LABEL_CONTRIBUTION_KEY}
          intl={intl}
          rights={rights}
          value={activeTab}
          onChange={handleChange}
          isSelected={isSelected}
          tabStyle={tabStyle}
          group={group}
          groupId={groupId}
          individual={individual}
          editedGroupIndividual={editedGroupIndividual}
          setEditedGroupIndividual={setEditedGroupIndividual}
        />
      </StyledPaper>
      <Contributions
        contributionKey={GROUPS_TABS_PANEL_CONTRIBUTION_KEY}
        rights={rights}
        value={activeTab}
        individual={individual}
        group={group}
        groupId={groupId}
        groupIndividualIds={groupIndividualIds}
        setConfirmedAction={setConfirmedAction}
        editedGroupIndividual={editedGroupIndividual}
        setEditedGroupIndividual={setEditedGroupIndividual}
      />
    </StyledPaper>
  );
}

export { StyledPaper };
export default injectIntl(GroupTabPanel);
