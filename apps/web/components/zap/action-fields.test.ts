import { expect, test } from 'bun:test';
import { builtInActions, builtInTriggers } from '../../../../packages/database/src/catalog';
import { actionFields, stepSummary } from './action-fields';
import { connectionTypes } from './connection-fields';

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

// The API accepts exactly the catalog's keys for a connection, so the Settings form must send them.
test('connection forms match the server catalog', () => {
  for (const action of builtInActions) {
    const keys = (connectionTypes[action.id]?.fields ?? []).map((f) => f.key).sort();
    expect([action.id, keys]).toEqual([action.id, (action.connectionFields ?? []).sort()]);
    const picker = (actionFields[action.id] ?? []).some((f) => f.connection);
    expect([action.id, picker]).toEqual([action.id, keys.length > 0]);
  }
});

test('a step summary leaves out credentials, connection ids and empty values', () => {
  expect(
    stepSummary('email', { connectionId: 'c-1', email: '{to}', subject: '', body: 'Hi' }),
  ).toBe('{to} · Hi');
  expect(stepSummary('telegram', { botToken: '••••••••', chatId: '42', text: 'x' })).toBe('42 · x');
  expect(stepSummary('unknown', { a: '1' })).toBe('1');
  expect(stepSummary('email', {})).toBeUndefined();
});
