import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Set new password',
  description: 'Choose a new password for your account.',
}

/**
 * Reset password page — only reachable after following the email link,
 * which establishes a recovery session via /auth/callback.
 */
export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      description="Your new password must be at least 8 characters."
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}
