import React, { useMemo } from 'react';
import {
  Checkbox, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import {
  Autocomplete, TextInput, useGraphqlQuery, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { parseSchema, schemaProperties } from '../components/schema/schemaFields';

// Builds a schema by picking fields of the individual schema: `onChange` receives a schema object whose
// properties carry the picked fields' type and description. With `withOptions`, uniqueness and the
// validation calculation are set per picked field, as a benefit plan needs.
function SchemaFieldPicker({
  value, onChange, readOnly = false, withOptions = false, label,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const { isLoading, error, data } = useGraphqlQuery('query SchemaFieldPicker { globalSchema { schema } }');

  const systemFields = useMemo(() => schemaProperties(data?.globalSchema?.schema), [data]);
  const picked = schemaProperties(value);
  const options = useMemo(() => Object.entries(systemFields).map(
    ([name, definition]) => ({ id: name, name, type: definition?.type }),
  ), [systemFields]);
  // Fields the individual schema no longer has stay visible, so they can be seen and removed.
  const pickedKey = Object.entries(picked).map(([name, definition]) => `${name}:${definition?.type}`).join('\n');
  const selected = useMemo(() => Object.keys(picked).map(
    (name) => options.find((option) => option.name === name) ?? { id: name, name, type: picked[name]?.type },
  ), [options, pickedKey]);

  const emit = (properties) => onChange({ ...parseSchema(value), properties });
  const pick = (chosen) => emit(Object.fromEntries((chosen ?? []).map(({ name }) => {
    if (picked[name]) return [name, picked[name]];
    const { type, description } = systemFields[name] ?? {};
    return [name, { type, ...(description ? { description } : {}) }];
  })));
  const setOption = (name, option, optionValue) => {
    const { [option]: omitted, ...definition } = picked[name];
    emit({ ...picked, [name]: optionValue ? { ...definition, [option]: optionValue } : definition });
  };

  return (
    <>
      <Autocomplete
        multiple
        readOnly={readOnly}
        label={label ?? formatMessage('individual.schema.fields')}
        isLoading={isLoading}
        options={options}
        value={selected}
        getOptionLabel={(option) => (option?.type ? `${option.name} (${option.type})` : option?.name ?? '')}
        onChange={pick}
        onInputChange={() => {}}
        filterSelectedOptions
      />
      {error && <Typography color="error" variant="body2">{String(error?.message ?? error)}</Typography>}
      {selected.filter(({ name }) => !systemFields[name]).length > 0 && !isLoading && !error && (
        <Typography color="error" variant="body2">
          {`${formatMessage('individual.schema.missingFields')}: ${
            selected.filter(({ name }) => !systemFields[name]).map(({ name }) => name).join(', ')}`}
        </Typography>
      )}
      {withOptions && selected.length > 0 && (
        <Table size="small">
          <TableHead>
            <TableRow>
              {['name', 'uniqueness', 'calculation'].map((column) => (
                <TableCell key={column}>{formatMessage(`individual.schema.column.${column}`)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {selected.map(({ name }) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={picked[name]?.uniqueness === true}
                    disabled={readOnly}
                    onChange={(event) => setOption(name, 'uniqueness', event.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    module="individual"
                    value={picked[name]?.validationCalculation?.name ?? ''}
                    readOnly={readOnly}
                    onChange={(calculation) => setOption(
                      name, 'validationCalculation', calculation ? { name: calculation } : null,
                    )}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

export default SchemaFieldPicker;
