'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Feld "${key}" ist erforderlich.`)
  }
  return value.trim()
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = requiredString(formData, 'email')
  const password = requiredString(formData, 'password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Login fehlgeschlagen: ${error.message}`)
  }

  redirect('/dashboard')
}