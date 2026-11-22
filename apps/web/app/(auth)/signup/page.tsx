import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Set by the API's OAuth callback when sign-in with a provider fails.
  const { error } = await searchParams;
  return <AuthForm mode="signup" oauthError={error === 'oauth'} />;
}
