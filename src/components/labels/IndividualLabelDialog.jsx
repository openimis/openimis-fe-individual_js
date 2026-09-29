import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography,
} from '@mui/material';
import {
  TextInput, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import SchemaFieldPicker from '../../pickers/SchemaFieldPicker';
import { parseSchema } from '../schema/schemaFields';
import { useMutation } from '../../util/useMutation';

const CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,63}$/;

// Creates a label (`label` null) or edits one; the code of an existing label cannot change.
function IndividualLabelDialog({ label, open, onClose, onSaved }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('individual', modulesManager);
  const [edited, setEdited] = useState({});
  const [error, setError] = useState(null);
  // The label is copied when the dialog opens: the page clears it on close, and reading the prop would
  // turn the form into an empty "Add label" while the dialog fades out.
  const [target, setTarget] = useState(null);
  useEffect(() => {
    if (!open) return;
    setTarget(label ?? null);
    setEdited({ code: label?.code ?? '', name: label?.name ?? '', schema: parseSchema(label?.jsonSchema) });
    setError(null);
  }, [open]);

  const unconfirmed = formatMessage('individual.mutation.unconfirmed');
  const create = useMutation(`
    mutation createIndividualLabel($input: CreateIndividualLabelMutationInput!) {
      createIndividualLabel(input: $input) { clientMutationId internalId }
    }
  `, unconfirmed);
  const update = useMutation(`
    mutation updateIndividualLabel($input: UpdateIndividualLabelMutationInput!) {
      updateIndividualLabel(input: $input) { clientMutationId internalId }
    }
  `, unconfirmed);

  const isNew = !target;
  const codeInvalid = isNew && !CODE_PATTERN.test(edited.code ?? '');
  const save = () => {
    const input = {
      name: edited.name,
      jsonSchema: JSON.stringify(edited.schema ?? {}),
      clientMutationLabel: formatMessageWithValues('individual.labels.mutationLabel', { code: edited.code }),
    };
    const saving = isNew
      ? create.mutate({ ...input, code: edited.code })
      : update.mutate({ ...input, id: target.uuid });
    saving.then(onSaved, (err) => setError(err?.message ?? String(err)));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{formatMessage(isNew ? 'individual.labels.create' : 'individual.labels.edit')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextInput
              module="individual"
              label="individual.labels.code"
              value={edited.code}
              readOnly={!isNew}
              required
              error={Boolean(edited.code) && codeInvalid}
              helperText={isNew ? formatMessage('individual.labels.codeHelp') : null}
              onChange={(code) => setEdited({ ...edited, code: code ?? '' })}
            />
          </Grid>
          <Grid size={8}>
            <TextInput
              module="individual"
              label="individual.labels.name"
              value={edited.name}
              required
              onChange={(name) => setEdited({ ...edited, name: name ?? '' })}
            />
          </Grid>
          <Grid size={12}>
            <SchemaFieldPicker
              value={edited.schema}
              onChange={(schema) => setEdited({ ...edited, schema })}
            />
          </Grid>
          {error && (
            <Grid size={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{formatMessage('individual.labels.cancel')}</Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={codeInvalid || !edited.name || create.isLoading || update.isLoading}
        >
          {formatMessage('individual.labels.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IndividualLabelDialog;
