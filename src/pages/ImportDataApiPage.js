import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
} from '@material-ui/core';
import {
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  Helmet,
} from '@openimis/fe-core';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  footer: {
    marginInline: 16,
    marginBlock: 12,
  },
  headerTitle: theme.table.title,
  actionCell: {
    width: 60,
  },
  header: theme.table.header,
}));

const API_WORKFLOW_HEADERS = [
  'ImportPageAPI.apiSelection',
  'ImportPageAPI.workflowName',
  'ImportPageAPI.triggerImport',
];

const workflows = [
  // Dummy data for workflows, replace with real data
  { apiSelection: 'API 1', workflowName: 'Workflow 1' },
];

const handleImportClick = (workflow) => {
  // Implement the import functionality here
  // eslint-disable-next-line no-console
  console.log(`Triggering import for ${workflow.workflowName}`);
};

// eslint-disable-next-line no-empty-pattern
function ImportDataApiPage({
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations('individual', modulesManager);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('ImportPageAPI.ImportPage')} />
      <div>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead className={classes.header}>
              <TableRow className={classes.headerTitle}>
                {API_WORKFLOW_HEADERS.map((header) => (
                  <TableCell key={header}>
                    {formatMessage(header)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.workflowName}>
                  <TableCell>
                    {workflow.apiSelection}
                  </TableCell>
                  <TableCell>
                    {workflow.workflowName}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={formatMessage('ImportPageAPI.triggerImport')}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleImportClick(workflow)}
                      >
                        {formatMessage('ImportPageAPI.triggerImport')}
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
});

export default connect(mapStateToProps, mapDispatchToProps)(ImportDataApiPage);
