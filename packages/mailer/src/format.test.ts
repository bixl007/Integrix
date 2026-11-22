import { describe, expect, test } from 'bun:test';
import { formatSubject, textToHtml } from './format';

describe('textToHtml', () => {
  test('blank lines split paragraphs and single newlines become line breaks', () => {
    const html = textToHtml('Hi Ada,\n\nLine one\nLine two\n\n\nThanks');
    expect(html).toContain('>Hi Ada,</p>');
    expect(html).toContain('>Line one<br>Line two</p>');
    expect(html).toContain('>Thanks</p>');
  });

  test('escapes markup from payload values', () => {
    const html = textToHtml('<script>alert("x")</script> & co');
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; co');
    expect(html).not.toContain('<script>');
  });
});

describe('formatSubject', () => {
  test('collapses newlines and extra spaces to one line', () => {
    expect(formatSubject('  Order\nA-1   confirmed ')).toBe('Order A-1 confirmed');
  });
});
