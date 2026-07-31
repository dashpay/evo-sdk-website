export function parseInputValue(type, def, control) {
  switch (type) {
    case 'number': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return null;
      }
      const val = Number(raw);
      if (Number.isNaN(val)) {
        throw new Error(`${def.label || def.name} must be a number`);
      }
      return val;
    }
    case 'checkbox':
      return control.checked;
    case 'json': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch (error) {
        throw new Error(`${def.label || def.name} must be valid JSON`);
      }
    }
    case 'array': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return [];
      }
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        return raw.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    case 'multiselect': {
      const values = Array.from(control.selectedOptions).map(opt => opt.value);
      if (def.required && values.length === 0) {
        throw new Error(`${def.label || def.name} is required`);
      }
      return values;
    }
    case 'select': {
      const val = control.value;
      if (def.required && (val === '' || val === undefined || val === null)) {
        throw new Error(`${def.label || def.name} is required`);
      }
      return val;
    }
    case 'textarea':
    case 'password':
    case 'text':
    default: {
      const raw = control.value.trim();
      if (!raw && def.required) {
        throw new Error(`${def.label || def.name} is required`);
      }
      return raw || null;
    }
  }
}

export function namedArgs(defs, args) {
  const out = {};
  defs.forEach((def, index) => {
    if (!def || !def.name) return;
    out[def.name] = args[index];
  });
  return out;
}
