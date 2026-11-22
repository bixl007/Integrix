import { describe, expect, test } from 'bun:test';
import { samplePayload, webhookCurl } from './sample-payload';

describe('samplePayload', () => {
  test('collects flat and nested placeholders across templates', () => {
    expect(
      samplePayload(['{ email }', 'Hi {name}, {repo.owner.login} starred {repo.name}']),
    ).toEqual({
      email: '<email>',
      name: '<name>',
      repo: { owner: { login: '<login>' }, name: '<name>' },
    });
  });

  test('returns an empty body when nothing is templated', () => {
    expect(samplePayload(['you@example.com', 'Hello'])).toEqual({});
  });

  test('a nested path replaces an earlier flat value', () => {
    expect(samplePayload(['{user}', '{user.email}', '{user}'])).toEqual({
      user: { email: '<email>' },
    });
  });
});

describe('webhookCurl', () => {
  test('shell-escapes single quotes in the JSON body', () => {
    expect(webhookCurl('http://x', { msg: "it's" })).toContain(`-d '{"msg":"it'\\''s"}'`);
  });
});
