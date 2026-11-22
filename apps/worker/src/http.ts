import { lookup as dnsLookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { BlockList, isIP, type LookupFunction } from 'node:net';

const TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 64 * 1024;

// Loopback, private, link-local (cloud metadata), carrier NAT, multicast and reserved ranges.
const internal = new BlockList();
const ranges: [string, number, 'ipv4' | 'ipv6'][] = [
  ['0.0.0.0', 8, 'ipv4'],
  ['10.0.0.0', 8, 'ipv4'],
  ['100.64.0.0', 10, 'ipv4'],
  ['127.0.0.0', 8, 'ipv4'],
  ['169.254.0.0', 16, 'ipv4'],
  ['172.16.0.0', 12, 'ipv4'],
  ['192.0.0.0', 24, 'ipv4'],
  ['192.168.0.0', 16, 'ipv4'],
  ['198.18.0.0', 15, 'ipv4'],
  ['224.0.0.0', 4, 'ipv4'],
  ['240.0.0.0', 4, 'ipv4'],
  ['::', 127, 'ipv6'],
  ['64:ff9b::', 96, 'ipv6'],
  ['fc00::', 7, 'ipv6'],
  ['fe80::', 10, 'ipv6'],
  ['ff00::', 8, 'ipv6'],
];
for (const [address, prefix, family] of ranges) internal.addSubnet(address, prefix, family);

// IPv4 written as IPv6 (::ffff:7f00:1 or ::ffff:127.0.0.1) must be judged as the IPv4 address it is.
const MAPPED_HEX = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i;
const MAPPED_DOTTED = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i;

function unmapped(address: string) {
  const dotted = MAPPED_DOTTED.exec(address);
  if (dotted) return dotted[1];
  const hex = MAPPED_HEX.exec(address);
  if (!hex) return address;
  const high = parseInt(hex[1], 16);
  const low = parseInt(hex[2], 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

/** True for an address a step must never reach: anything that isn't a public IP. */
export function isInternalAddress(address: string) {
  const ip = unmapped(address);
  const family = isIP(ip);
  return family === 0 || internal.check(ip, family === 6 ? 'ipv6' : 'ipv4');
}

type AddressGuard = (address: string) => boolean;

/** A DNS lookup that fails when any resolved address is internal, so the check and the connection use the same answer. */
export const guardedLookup =
  (isBlocked: AddressGuard): LookupFunction =>
  (hostname, options, callback) =>
    dnsLookup(hostname, options, (error, address, family) => {
      const addresses = Array.isArray(address) ? address.map((a) => a.address) : [address];
      if (!error && addresses.some(isBlocked)) {
        callback(new Error(`${hostname} resolves to a private or internal address`), '', 4);
        return;
      }
      callback(error, address as string, family);
    });

export interface HttpRequest {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface HttpResponse {
  status: number;
  /** At most 64 KB of the response text. */
  body: string;
}

/**
 * Sends one request to a public http(s) address with a 10 second limit and no redirects.
 * Throws on a response outside 2xx so the worker's retries apply. Errors name the host only, never the URL.
 */
export function request(
  url: string,
  { method = 'GET', headers = {}, body }: HttpRequest = {},
  isBlocked: AddressGuard = isInternalAddress,
): Promise<HttpResponse> {
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return Promise.reject(new Error('The URL is not valid'));
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return Promise.reject(new Error('Only http and https URLs are allowed'));
  }
  const host = target.hostname.replace(/^\[|\]$/g, '');
  // A literal IP never goes through the DNS lookup, so it is checked here.
  if (isIP(host) && isBlocked(host)) {
    return Promise.reject(new Error(`${host} is a private or internal address`));
  }

  return new Promise((resolve, reject) => {
    const client = target.protocol === 'https:' ? https : http;
    const req = client.request(
      target,
      {
        method,
        headers,
        lookup: guardedLookup(isBlocked),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          if (size < MAX_RESPONSE_BYTES) chunks.push(chunk);
          size += chunk.length;
        });
        res.on('error', reject);
        res.on('end', () => {
          const text = Buffer.concat(chunks).subarray(0, MAX_RESPONSE_BYTES).toString('utf8');
          const status = res.statusCode ?? 0;
          if (status >= 200 && status < 300) resolve({ status, body: text });
          else reject(new Error(`${host} answered ${status}: ${text.slice(0, 200)}`.trim()));
        });
      },
    );
    req.on('error', (error) =>
      reject(
        error.name === 'TimeoutError' || error.name === 'AbortError'
          ? new Error(`${host} did not answer within ${TIMEOUT_MS / 1000} seconds`)
          : new Error(`Request to ${host} failed: ${error.message}`),
      ),
    );
    req.end(body);
  });
}

/** POSTs `payload` as JSON. */
export const postJson = (url: string, payload: unknown) =>
  request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
