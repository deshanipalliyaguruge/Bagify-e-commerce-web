import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/auth-card'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a new Bagify account.',
}

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Start your Bagify journey today. Free to join."
    >
      <RegisterForm />
    </AuthCard>
  )
}
