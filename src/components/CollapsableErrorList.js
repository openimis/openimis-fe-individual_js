import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import {
  formatMessage,
} from '@openimis/fe-core';
import {
  ListItem,
  ListItemText,
  Collapse,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  item: theme.paper.item,
});

function CollapsableErrorList({
  intl,
  errors,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleOpen = () => {
    setIsExpanded(!isExpanded);
  };

  if (!errors || !Object.keys(errors).length) {
    return (
      <ListItem>
        <ListItemText primary={formatMessage(
          intl,
          'socialProtection',
          'benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.errorNone',
        )}
        />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem button onClick={handleOpen}>
        <ListItemText primary={formatMessage(
          intl,
          'socialProtection',
          'benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.error',
        )}
        />
        {isExpanded ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        { JSON.stringify(errors) }
      </Collapse>
    </>
  );
}

export default injectIntl(
  withTheme(
    withStyles(styles)(CollapsableErrorList),
  ),
);
