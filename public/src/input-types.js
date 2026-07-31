export const SUPPORTED_INPUT_TYPES = new Set([
  'text',
  'password',
  'string',
  'textarea',
  'number',
  'checkbox',
  'json',
  'select',
  'multiselect',
  'array',
  'button',
  'dynamic',
  'keyPreview',
]);

export function normalizeType(type) {
  if (!type) return 'text';
  switch (type) {
    case 'string': return 'text';
    case 'textarea': return 'textarea';
    default: return type;
  }
}
