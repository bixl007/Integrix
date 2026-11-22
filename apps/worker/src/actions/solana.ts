import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import base58 from 'bs58';
import { parse } from '../parser';
import type { ActionHandler } from './types';

const TIMEOUT_MS = 10_000;

const connection = new Connection('https://api.devnet.solana.com', {
  commitment: 'confirmed',
  // Every RPC call is bounded, so a stuck node can't hold up the queue.
  fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) }),
});

/** Sends the transfer and waits up to 10 seconds for it to confirm. */
export async function sendSol(
  to: string,
  amount: string,
  secretKey = process.env.SOL_PRIVATE_KEY ?? '',
) {
  const keypair = Keypair.fromSecretKey(base58.decode(secretKey.trim()));
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: Math.round(parseFloat(amount) * LAMPORTS_PER_SOL),
    }),
  );
  const signature = await connection.sendTransaction(tx, [keypair]);
  // Once sent, a slow confirmation must not throw: a retry would pay a second time.
  const confirmation = connection.confirmTransaction(signature, 'confirmed').then((result) => {
    if (result.value.err) throw new Error(`Transfer failed: ${JSON.stringify(result.value.err)}`);
    return true;
  });
  // Marked as handled: a rejection that arrives after the timeout won must not crash the worker.
  confirmation.catch(() => {});
  const confirmed = await Promise.race([
    confirmation,
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), TIMEOUT_MS)),
  ]);
  return { signature, confirmed };
}

export const solanaAction: ActionHandler = async (metadata, payload, context) => {
  const address = parse(String(metadata.address ?? ''), payload);
  const amount = parse(String(metadata.amount ?? ''), payload);
  console.log(`Sending ${amount} SOL to ${address}`);
  // With a connection the transfer is paid from the user's own wallet; otherwise from the server's.
  return { output: await sendSol(address, amount, context?.connection?.privateKey) };
};
