'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    name: formData.get('name') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  // revalidate the root layout to update the session state
  // you can also revalidate a specific path if needed
  // revalidatePath('/some/specific/path')

  revalidatePath('/', 'layout') 
  redirect('/')
  // const user = {
  //   email: data?.email ?? null,
  //   name: data?.name ?? null
  // }

  // return { user }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options:{
      emailRedirectTo: process.env.SITE_URL,
      data:{
        name: formData.get('name') as string
      }
    }
  }
  const { error } = await supabase.auth.signUp(data)

 if (error) {
    // Instead of redirecting, throw error to handle in UI
    return { error: error.message }
  }

  // Return a message instead of redirecting immediately
  return { message: 'Confirmation email sent. Please check your inbox.' }
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://lexio-delta.vercel.app/auth/callback", 
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}