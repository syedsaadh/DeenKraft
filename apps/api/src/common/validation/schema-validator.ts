import Ajv, { type ErrorObject } from 'ajv';

export interface SchemaValidationError {
  field: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

export function validateAgainstSchema(
  schema: Record<string, unknown>,
  data: unknown,
): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: mapErrors(validate.errors ?? []),
  };
}

function mapErrors(errors: ErrorObject[]): SchemaValidationError[] {
  return errors.map((error) => ({
    field: resolveField(error),
    message: error.message ?? 'is invalid',
  }));
}

function resolveField(error: ErrorObject): string {
  if (error.keyword === 'required') {
    const missingProperty = (error.params as { missingProperty?: string })
      .missingProperty;
    return missingProperty ?? '$';
  }

  const field = error.instancePath.replace(/^\//, '').replace(/\//g, '.');
  return field || '$';
}
