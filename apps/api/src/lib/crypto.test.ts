import { describe, expect, test } from 'bun:test';
import type { Request } from 'express';
import { readCookie } from './cookies';
import { generateOtp, safeEqual, sha256 } from './crypto';

describe('crypto helpers', () => {
  test('generateOtp returns 6 digits', () => {
    for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  test('safeEqual matches only identical digests', () => {
    expect(safeEqual(sha256('a'), sha256('a'))).toBe(true);
    expect(safeEqual(sha256('a'), sha256('b'))).toBe(false);
    expect(safeEqual('ab', 'abc')).toBe(false);
  });
});

describe('readCookie', () => {
  const req = (cookie?: string) => ({ headers: { cookie } }) as Request;

  test('finds a cookie among others and decodes it', () => {
    expect(readCookie(req('a=1; integrix_session=x%2By; b=2'), 'integrix_session')).toBe('x+y');
  });

  test('returns undefined when missing', () => {
    expect(readCookie(req(), 'a')).toBeUndefined();
    expect(readCookie(req('ab=1'), 'a')).toBeUndefined();
  });
});
