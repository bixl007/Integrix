import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import base58 from 'bs58';
import { parse } from '../parser';
import type { ActionHandler } from './types';

const connection = new Connection('https://api.devnet.solana.com', 'finalized');

export async function sendSol(to: string, amount: string) {
  const keypair = Keypair.fromSecretKey(base58.decode(process.env.SOL_PRIVATE_KEY ?? ''));
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(to),
      lamports: Math.round(parseFloat(amount) * LAMPORTS_PER_SOL),
    }),
  );
  return sendAndConfirmTransaction(connection, tx, [keypair]);
}

export const solanaAction: ActionHandler = async (metadata, payload) => {
  const address = parse(String(metadata.address ?? ''), payload);
  const amount = parse(String(metadata.amount ?? ''), payload);
  console.log(`Sending ${amount} SOL to ${address}`);
  return { output: { signature: await sendSol(address, amount) } };
};
