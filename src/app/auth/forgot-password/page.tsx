import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Request a password reset link for your account.',
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we will send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
