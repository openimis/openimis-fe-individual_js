import React from 'react';
import { injectIntl } from 'react-intl';
import { Paper, Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { withTheme, withStyles } from '@material-ui/core/styles';

const styles = () => ({
  errorNumber: {
    color: '#C52816',
  },
});

function SummaryCard({
  classes,
  title,
  number,
  errorNumber = false,
}) {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Grid container justify="space-between">
        <Typography variant="h6">
          {title}
        </Typography>
        <Typography variant="h6" className={errorNumber ? classes.errorNumber : ''}>
          {number}
        </Typography>
      </Grid>
    </Paper>
  );
}

export default injectIntl(
  withTheme(withStyles(styles)(SummaryCard)),
);
