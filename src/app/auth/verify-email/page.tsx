'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { MailOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthCard } from '@/features/auth/components/auth-card'
import { resendVerificationAction } from '@/features/auth/actions/auth.actions'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleResend() {
    if (!email) return
    setStatus('loading')
    setErrorMsg(null)
    const result = await resendVerificationAction(email)
    if (result.success) {
      setStatus('sent')
    } else {
      setStatus('error')
      setErrorMsg(result.error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <MailOpen className="h-7 w-7 text-primary" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">Check your inbox</p>
        {email && (
          <p className="text-sm text-muted-foreground">
            We sent a verification link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Click the link in the email to verify your account.
        </p>
      </div>

      {status === 'sent' && (
        <Alert>
          <AlertDescription>Verification email resent successfully!</AlertDescription>
        </Alert>
      )}

      {status === 'error' && errorMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {email && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={status === 'loading' || status === 'sent'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Sending…
            </>
          ) : status === 'sent' ? (
            'Email sent!'
          ) : (
            'Resend verification email'
          )}
        </Button>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify your email" description="Almost there — one step left.">
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  )
}
