// A schema as the backend returns or stores it: an object, or the same object as a JSON string. A row that
// stores the schema as a JSON string comes back from GraphQL encoded twice.
export function parseSchema(value) {
  let parsed = value;
  try {
    for (let depth = 0; typeof parsed === 'string' && depth < 2; depth += 1) parsed = JSON.parse(parsed);
  } catch {
    return {};
  }
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

export function schemaProperties(value) {
  const { properties } = parseSchema(value);
  return properties && typeof properties === 'object' && !Array.isArray(properties) ? properties : {};
}

// Rows keep the property keys the editor does not show (`maxLength`, ...). What it does show is rewritten:
// `uniqueness` only as `true`, `validationCalculation` only with its `name`, the part the uploads read.
export function toRows(schema) {
  return Object.entries(schemaProperties(schema)).map(([name, definition]) => {
    const {
      type = '', description = '', uniqueness, validationCalculation, ...rest
    } = definition && typeof definition === 'object' ? definition : {};
    return {
      name,
      type,
      description,
      uniqueness: uniqueness === true,
      calculation: validationCalculation?.name ?? '',
      rest,
    };
  });
}

export function toSchema(schema, rows) {
  const properties = {};
  rows.forEach(({
    name, type, description, uniqueness, calculation, rest,
  }) => {
    properties[name] = {
      ...rest,
      type,
      ...(description ? { description } : {}),
      // The upload validation treats the key's presence as unique: omit it rather than write false.
      ...(uniqueness ? { uniqueness: true } : {}),
      ...(calculation ? { validationCalculation: { name: calculation } } : {}),
    };
  });
  return { ...parseSchema(schema), properties };
}

// The same name rules the backend applies: a name becomes a `json_ext__<name>__<lookup>` filter.
export function nameError(name, rows) {
  if (!name) return 'individual.schema.error.nameRequired';
  if (name.includes('__') || name.endsWith('_') || name.includes('=')) return 'individual.schema.error.nameInvalid';
  if (rows.filter((row) => row.name === name).length > 1) return 'individual.schema.error.nameDuplicate';
  return null;
}

export function rowsHaveErrors(rows) {
  return rows.some((row) => nameError(row.name, rows) || !row.type);
}
