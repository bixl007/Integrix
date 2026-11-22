import { describe, expect, test } from 'bun:test';
import { actionFields } from './action-fields';
import { integrationCatalog } from './integration-catalog';
import { OWNER_EMAIL, templateSteps, zapTemplates } from './zap-templates';

const integration = (id: string) => ({ id, name: id, image: '' });

describe('zapTemplates', () => {
  test('names fit the 80-character zap name limit', () => {
    for (const t of zapTemplates) expect(t.name.length).toBeLessThanOrEqual(80);
  });

  test('ids are unique', () => {
    const ids = zapTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Keeps templates in step with the builder form, so "Use template" never leaves a field empty.
  test('every step uses a known integration and exactly its form fields', () => {
    for (const t of zapTemplates) {
      expect(integrationCatalog[t.triggerId]?.kind).toBe('trigger');
      for (const a of t.actions) {
        const keys = (actionFields[a.actionId] ?? []).map((f) => f.key).sort();
        expect(Object.keys(a.metadata).sort()).toEqual(keys);
      }
    }
  });
});

describe('templateSteps', () => {
  const [template] = zapTemplates;

  test('resolves the trigger and actions from the available integrations', () => {
    const resolved = templateSteps(
      template,
      [integration('webhook')],
      [integration('email')],
      'me@test.dev',
    );
    expect(resolved?.trigger.integration.id).toBe('webhook');
    expect(resolved?.steps.map((s) => s.metadata)).toEqual(template.actions.map((a) => a.metadata));
  });

  test('returns undefined when an integration is missing', () => {
    expect(templateSteps(template, [integration('webhook')], [], 'me@test.dev')).toBeUndefined();
    expect(templateSteps(template, [], [integration('email')], 'me@test.dev')).toBeUndefined();
  });

  // A template must never publish an undeliverable placeholder address.
  test("replaces OWNER_EMAIL with the signed-in user's email", () => {
    const starAlert = zapTemplates.find((t) => t.id === 'github-star-alert');
    expect(starAlert?.actions[0].metadata.email).toBe(OWNER_EMAIL);
    const resolved =
      starAlert &&
      templateSteps(starAlert, [integration('webhook')], [integration('email')], 'me@test.dev');
    expect(resolved?.steps[0].metadata.email).toBe('me@test.dev');
  });
});
