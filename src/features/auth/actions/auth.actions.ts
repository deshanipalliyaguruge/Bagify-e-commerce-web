'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES, APP_CONFIG } from '@/config/app'
import type { ActionResult } from '@/features/auth/types/auth.types'
import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas'

// ─────────────────────────────────────────────────────────────────
// Sign Up
// ─────────────────────────────────────────────────────────────────

export async function signUpAction(values: RegisterFormValues): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
      emailRedirectTo: `${APP_CONFIG.url}/auth/callback?next=${ROUTES.home}`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────
// Sign In
// ─────────────────────────────────────────────────────────────────

export async function signInAction(values: LoginFormValues): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  })

  if (error) {
    // Return a generic message to avoid user enumeration
    const message =
      error.message === 'Email not confirmed'
        ? 'Please verify your email before signing in.'
        : 'Invalid email or password.'
    return { success: false, error: message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────
// Sign Out
// ─────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect(ROUTES.auth.login)
}

// ─────────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  values: ForgotPasswordFormValues,
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${APP_CONFIG.url}/auth/callback?next=${ROUTES.auth.resetPassword}&type=recovery`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Always return success to prevent user enumeration
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────
// Update Password (after reset-password flow)
// ─────────────────────────────────────────────────────────────────

export async function updatePasswordAction(
  values: ResetPasswordFormValues,
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: values.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Sign out all other sessions after password change (security)
  await supabase.auth.signOut({ scope: 'others' })

  revalidatePath('/', 'layout')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────
// Resend verification email
// ─────────────────────────────────────────────────────────────────

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${APP_CONFIG.url}/auth/callback?next=${ROUTES.home}`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
