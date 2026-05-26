import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthCard } from '@/features/auth/components/auth-card'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Bagify account.',
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Enter your credentials to access your account."
    >
      {/* Suspense boundary required because LoginForm reads searchParams */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
