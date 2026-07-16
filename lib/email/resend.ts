// lib/email/resend.ts
import { Resend } from 'resend'

let client: Resend | null = null

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (client) return client
  client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? 'onboarding@resend.dev'
