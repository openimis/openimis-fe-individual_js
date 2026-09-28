import React, { useEffect, useRef, useState } from 'react';
import {
  Button, Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip,
} from '@mui/material';
import {
  GetIconComponent, SelectInput, TextInput, useModulesManager, useTranslations,
} from '@openimis/fe-core';
import { SCHEMA_FIELD_TYPES } from '../../constants';
import {
  nameError, rowsHaveErrors, toRows, toSchema,
} from './schemaFields';

const AddIcon = GetIconComponent('Add');
const DeleteIcon = GetIconComponent('Delete');

const EMPTY_ROW = {
  name: '', type: 'string', description: '', uniqueness: false, calculation: '', rest: {},
};

// Edits the properties of a schema object. `onChange(schema, hasErrors)`: the parent must pass that same
// object back as `value` (any other object replaces the rows being edited), and not save while
// `hasErrors` is true.
function SchemaFieldsEditor({ value, onChange, readOnly = false }) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('individual', modulesManager);
  const [rows, setRows] = useState(() => toRows(value));
  // Rows are the source of truth while editing (they can hold an empty or duplicated name, which an
  // object cannot); a value that did not come from here, such as a reload, replaces them.
  const emitted = useRef(value);
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setRows(toRows(value));
    }
  }, [value]);

  const update = (nextRows) => {
    setRows(nextRows);
    const schema = toSchema(value, nextRows);
    emitted.current = schema;
    onChange(schema, rowsHaveErrors(nextRows));
  };
  const setField = (index, field, fieldValue) => update(
    rows.map((row, i) => (i === index ? { ...row, [field]: fieldValue } : row)),
  );
  const typeOptions = SCHEMA_FIELD_TYPES.map((type) => ({
    value: type, label: formatMessage(`individual.schema.type.${type}`),
  }));

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['name', 'type', 'description', 'uniqueness', 'calculation'].map((column) => (
              <TableCell key={column}>{formatMessage(`individual.schema.column.${column}`)}</TableCell>
            ))}
            {!readOnly && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const error = nameError(row.name, rows);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow key={index}>
                <TableCell>
                  <TextInput
                    module="individual"
                    value={row.name}
                    readOnly={readOnly}
                    required
                    error={Boolean(error)}
                    helperText={error && formatMessage(error)}
                    onChange={(name) => setField(index, 'name', name ?? '')}
                  />
                </TableCell>
                <TableCell>
                  <SelectInput
                    module="individual"
                    withLabel={false}
                    options={typeOptions}
                    value={row.type}
                    readOnly={readOnly}
                    // The select's clear button sends null; a field always needs a type, so keep the current one.
                    onChange={(type) => type && setField(index, 'type', type)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    module="individual"
                    value={row.description}
                    readOnly={readOnly}
                    onChange={(description) => setField(index, 'description', description ?? '')}
                  />
                </TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={row.uniqueness}
                    disabled={readOnly}
                    onChange={(event) => setField(index, 'uniqueness', event.target.checked)}
                  />
                </TableCell>
                <TableCell>
                  <TextInput
                    module="individual"
                    value={row.calculation}
                    readOnly={readOnly}
                    onChange={(calculation) => setField(index, 'calculation', calculation ?? '')}
                  />
                </TableCell>
                {!readOnly && (
                  <TableCell padding="checkbox">
                    <Tooltip title={formatMessage('individual.schema.removeField')}>
                      <IconButton onClick={() => update(rows.filter((_, i) => i !== index))}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!readOnly && (
        <Button startIcon={<AddIcon />} onClick={() => update([...rows, { ...EMPTY_ROW }])}>
          {formatMessage('individual.schema.addField')}
        </Button>
      )}
    </>
  );
}

export default SchemaFieldsEditor;
