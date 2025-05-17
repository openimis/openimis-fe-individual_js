import React from 'react';
import { injectIntl } from 'react-intl';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { useModulesManager } from '@openimis/fe-core';

const styles = (theme) => ({
  // '& .MuiSnackbar-anchorOriginBottomCenter'
  customSnackbar: {
    left: `calc(50% + 0.5 * -${theme.jrnlDrawer.close.width}px)`,
    bottom: '12px',
    width: `calc(100% - 70px - ${theme.jrnlDrawer.close.width}px)`,
  },
  customSnackbarShiftLeftMenu: {
    left: `calc(50% + 0.5 * (${theme.menu.drawer.width}px - ${theme.jrnlDrawer.close.width}px))`,
    bottom: '12px',
    width: `calc(100% - 70px - ${theme.jrnlDrawer.close.width}px - ${theme.menu.drawer.width}px)`,
  },
  customAlert: {
    color: `${theme.palette.text.error}`,
    backgroundColor: '#FDEDED',
    alignItems: 'center',
    // fontWeight: 'bold',
  },
});

function ErrorSnackbar({
  classes,
  anchorOrigin,
  open,
  setOpen,
  children,
}) {
  const modulesManager = useModulesManager();
  const menuLeft = modulesManager.getConf(
    'openimis-fe-core_js',
    'menuLeft',
    false,
  );
  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      open={open}
      className={menuLeft ? classes.customSnackbarShiftLeftMenu : classes.customSnackbar}
    >
      <Alert
        severity="error"
        onClose={() => { setOpen(false); }}
        className={classes.customAlert}
      >
        {children}
      </Alert>
    </Snackbar>
  );
}

export default injectIntl(
  withTheme(withStyles(styles)(ErrorSnackbar)),
);
