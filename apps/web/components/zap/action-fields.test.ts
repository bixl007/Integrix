import { expect, test } from 'bun:test';
import { builtInActions, builtInTriggers } from '../../../../packages/database/src/catalog';
import { actionFields } from './action-fields';

// The API masks what the seed lists; the form decides what is typed as a password. They must agree.
test('secret fields match the server catalog for every built-in connector', () => {
  for (const action of [...builtInTriggers, ...builtInActions]) {
    const secrets = (actionFields[action.id] ?? []).filter((f) => f.secret).map((f) => f.key);
    expect([action.id, secrets.sort()]).toEqual([action.id, (action.secretFields ?? []).sort()]);
  }
});

test('every built-in action has a form', () => {
  for (const action of builtInActions) expect(actionFields[action.id]?.length).toBeGreaterThan(0);
});

test('select options have unique values', () => {
  for (const fields of Object.values(actionFields)) {
    for (const field of fields) {
      const values = (field.options ?? []).map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
    }
  }
});
