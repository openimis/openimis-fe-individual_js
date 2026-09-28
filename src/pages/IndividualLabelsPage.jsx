import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button, Dialog, DialogActions, DialogTitle, Grid, IconButton, Paper, Table, TableBody, TableCell, TableHead,
  TableRow, Tooltip, Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  GetIconComponent, Helmet, ProgressOrError, useGraphqlQuery, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import {
  RIGHT_INDIVIDUAL_LABEL_CREATE, RIGHT_INDIVIDUAL_LABEL_DELETE, RIGHT_INDIVIDUAL_LABEL_UPDATE, RIGHT_INDIVIDUAL_SEARCH,
} from '../constants';
import IndividualLabelDialog from '../components/labels/IndividualLabelDialog';
import { schemaProperties } from '../components/schema/schemaFields';
import { useMutation } from '../util/useMutation';

const AddIcon = GetIconComponent('Add');
const EditIcon = GetIconComponent('Edit');
const DeleteIcon = GetIconComponent('Delete');

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme?.paper?.paper,
  margin: theme.spacing(1),
  padding: theme.spacing(2),
}));

function IndividualLabelsPage() {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);
  const {
    isLoading, error, data, refetch,
  } = useGraphqlQuery(`
    query IndividualLabelsPage {
      individualLabel(isDeleted: false, orderBy: ["code"]) {
        edges { node { uuid code name jsonSchema } }
      }
    }
  `);
  const remove = useMutation(`
    mutation deleteIndividualLabel($input: DeleteIndividualLabelMutationInput!) {
      deleteIndividualLabel(input: $input) { clientMutationId internalId }
    }
  `, formatMessage('individual.mutation.unconfirmed'));

  // `undefined`: closed; `null`: creating; a label: editing it.
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const labels = data?.individualLabel?.edges.map(({ node }) => node) ?? [];

  const saved = () => {
    setEditing(undefined);
    refetch();
  };
  const confirmDelete = () => remove.mutate({
    ids: [deleting.uuid],
    clientMutationLabel: formatMessageWithValues('individual.labels.deleteMutationLabel', { code: deleting.code }),
  }).then(() => {
    setDeleting(null);
    refetch();
  }, (err) => setDeleteError(err?.message ?? String(err)));

  // The route admits any label right, but reading labels and the schema needs the individual search right.
  if (!rights.includes(RIGHT_INDIVIDUAL_SEARCH)) return null;

  return (
    <StyledPaper>
      <Helmet title={formatMessage('individual.labels.pageTitle')} />
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{formatMessage('individual.labels.pageTitle')}</Typography>
        {rights.includes(RIGHT_INDIVIDUAL_LABEL_CREATE) && (
          <Button startIcon={<AddIcon />} onClick={() => setEditing(null)}>
            {formatMessage('individual.labels.create')}
          </Button>
        )}
      </Grid>
      <ProgressOrError progress={isLoading} error={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            {['code', 'name', 'fields'].map((column) => (
              <TableCell key={column}>{formatMessage(`individual.labels.${column}`)}</TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {labels.map((label) => (
            <TableRow key={label.uuid}>
              <TableCell>{label.code}</TableCell>
              <TableCell>{label.name}</TableCell>
              <TableCell>{Object.keys(schemaProperties(label.jsonSchema)).join(', ')}</TableCell>
              <TableCell align="right">
                {rights.includes(RIGHT_INDIVIDUAL_LABEL_UPDATE) && (
                  <Tooltip title={formatMessage('individual.labels.edit')}>
                    <IconButton onClick={() => setEditing(label)}><EditIcon /></IconButton>
                  </Tooltip>
                )}
                {rights.includes(RIGHT_INDIVIDUAL_LABEL_DELETE) && (
                  <Tooltip title={formatMessage('individual.labels.delete')}>
                    <IconButton onClick={() => { setDeleteError(null); setDeleting(label); }}><DeleteIcon /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <IndividualLabelDialog
        label={editing}
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        onSaved={saved}
      />
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}>
        <DialogTitle>
          {deleting && formatMessageWithValues('individual.labels.deleteConfirm', { code: deleting.code })}
        </DialogTitle>
        {deleteError && <Typography color="error" sx={{ px: 3 }}>{deleteError}</Typography>}
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>{formatMessage('individual.labels.cancel')}</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={remove.isLoading}>
            {formatMessage('individual.labels.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
}

export default IndividualLabelsPage;
