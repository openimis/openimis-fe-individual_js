import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  formatMessage,
} from '@openimis/fe-core';
import {
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  ...theme?.paper?.item,
}));

function CollapsableErrorList({
  intl,
  errors,
}) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = () => {
    setIsExpanded(!isExpanded);
  };

  if (!errors || !Object.keys(errors).length) {
    return (
      <StyledListItem>
        <ListItemText primary={formatMessage(
          intl,
          'socialProtection',
          'benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.errorNone',
        )}
        />
      </StyledListItem>
    );
  }

  return (
    <>
      <StyledListItem button onClick={handleOpen}>
        <ListItemText primary={formatMessage(
          intl,
          'socialProtection',
          'benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.error',
        )}
        />
        {isExpanded ? <ExpandLess /> : <ExpandMore />}
      </StyledListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        {JSON.stringify(errors)}
      </Collapse>
    </>
  );
}

export { StyledListItem };
export default injectIntl(CollapsableErrorList);
