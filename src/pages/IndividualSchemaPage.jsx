import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button, FormControlLabel, Grid, Paper, Switch, Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Helmet, ProgressOrError, TextAreaInput, useGraphqlQuery, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { RIGHT_INDIVIDUAL_SCHEMA_UPDATE } from '../constants';
import SchemaFieldsEditor from '../components/schema/SchemaFieldsEditor';
import { parseSchema, rowsHaveErrors, toRows } from '../components/schema/schemaFields';
import { useMutation } from '../util/useMutation';

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme?.paper?.paper,
  margin: theme.spacing(1),
  padding: theme.spacing(2),
}));

function parseRawSchema(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function IndividualSchemaPage() {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);
  const canUpdate = rights.includes(RIGHT_INDIVIDUAL_SCHEMA_UPDATE);

  const { isLoading, error, data, refetch } = useGraphqlQuery('query IndividualSchemaPage { globalSchema { schema } }');
  const { mutate, isLoading: isSaving } = useMutation(`
    mutation updateIndividualSchema($input: UpdateIndividualSchemaMutationInput!) {
      updateIndividualSchema(input: $input) { clientMutationId internalId }
    }
  `, formatMessage('individual.mutation.unconfirmed'));

  const [schema, setSchema] = useState({});
  const [rowErrors, setRowErrors] = useState(false);
  // `null` while the table is shown; the raw text otherwise, which may not parse.
  const [raw, setRaw] = useState(null);
  const [rawInvalid, setRawInvalid] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const loaded = parseSchema(data?.globalSchema?.schema);
    setSchema(loaded);
    setRowErrors(false);
    setDirty(false);
    setRaw((current) => (current === null ? null : JSON.stringify(loaded, null, 2)));
    setRawInvalid(false);
  }, [data]);

  const edit = (next, errors) => {
    setSchema(next);
    setRowErrors(errors);
    setDirty(true);
    setSaveError(null);
  };
  const editRaw = (text) => {
    setRaw(text);
    const parsed = parseRawSchema(text);
    setRawInvalid(!parsed);
    if (parsed) edit(parsed, rowsHaveErrors(toRows(parsed)));
  };
  const hasErrors = rowErrors || rawInvalid;
  const save = () => mutate({
    schema: JSON.stringify(schema),
    clientMutationLabel: formatMessage('individual.schema.mutationLabel'),
  }).then(() => refetch(), (err) => setSaveError(err?.message ?? String(err)));

  return (
    <StyledPaper>
      <Helmet title={formatMessage('individual.schema.pageTitle')} />
      <Grid container spacing={2}>
        <Grid size={12}>
          <Typography variant="h6">{formatMessage('individual.schema.pageTitle')}</Typography>
          <Typography variant="body2">{formatMessage('individual.schema.pageHelp')}</Typography>
        </Grid>
        <Grid size={12}>
          <ProgressOrError progress={isLoading} error={error} />
          {!isLoading && !error && (raw === null ? (
            <SchemaFieldsEditor value={schema} onChange={edit} readOnly={!canUpdate} />
          ) : (
            <TextAreaInput
              module="individual"
              label="individual.schema.rawJson"
              value={raw}
              rows={20}
              readOnly={!canUpdate}
              error={rawInvalid}
              helperText={rawInvalid ? formatMessage('individual.schema.error.invalidJson') : null}
              onChange={editRaw}
            />
          ))}
        </Grid>
        {saveError && (
          <Grid size={12}>
            <Typography color="error">{saveError}</Typography>
          </Grid>
        )}
        <Grid size={12} container justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={(
              <Switch
                checked={raw !== null}
                // Switching would carry an invalid state across: a duplicated name, for instance,
                // collapses into one property in the JSON.
                disabled={hasErrors}
                onChange={(event) => setRaw(event.target.checked ? JSON.stringify(schema, null, 2) : null)}
              />
            )}
            label={formatMessage('individual.schema.rawJson')}
          />
          {canUpdate && (
            <Button variant="contained" onClick={save} disabled={!dirty || hasErrors || isSaving}>
              {formatMessage('individual.schema.save')}
            </Button>
          )}
        </Grid>
      </Grid>
    </StyledPaper>
  );
}

export default IndividualSchemaPage;
