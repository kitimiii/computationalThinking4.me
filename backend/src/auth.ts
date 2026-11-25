import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { Hono, type Context } from 'hono'
import { setCookie } from 'hono/cookie'
import type { User } from '@supabase/supabase-js'
import { upsertProfile, type Profile } from './storage.js'

const FRONTEND_URL = 'http://localhost:3000'
const BACKEND_URL = 'http://localhost:3001'

// Login with Google via Supabase Auth. The tokens live in cookies that only the backend sets,
// so the frontend never talks to Supabase itself.
export const auth = new Hono()

// One client per request: it reads the session from the request cookies and writes changes back.
function client(c: Context) {
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    cookies: {
      getAll: () => parseCookieHeader(c.req.header('Cookie') ?? '').map(({ name, value }) => ({ name, value: value ?? '' })),
      setAll: (cookies) => {
        for (const { name, value, options } of cookies) {
          setCookie(c, name, value, { ...options, sameSite: 'Lax', httpOnly: true })
        }
      },
    },
  })
}

// The logged-in user of this request, or null. Routes call it themselves where they need it.
export async function currentUser(c: Context) {
  const { data } = await client(c).auth.getUser()
  return data.user
}

// Google puts name and picture into the user metadata.
function toProfile(user: User): Profile {
  const meta = user.user_metadata
  return {
    id: user.id,
    email: user.email!,
    name: meta.full_name ?? meta.name ?? user.email,
    avatarUrl: meta.avatar_url ?? meta.picture,
  }
}

// Sends the browser to Google; Google sends it back to /auth/callback.
auth.get('/login', async (c) => {
  const { data, error } = await client(c).auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${BACKEND_URL}/auth/callback`, skipBrowserRedirect: true },
  })
  if (error) return c.json({ error: error.message }, 500)
  return c.redirect(data.url)
})

// Exchanges the one-time code for a session, which ends up in the cookies,
// and stores the profile so others can add this person to a board by email.
auth.get('/callback', async (c) => {
  const code = c.req.query('code')
  if (code) {
    const { data } = await client(c).auth.exchangeCodeForSession(code)
    if (data.user) await upsertProfile(toProfile(data.user))
  }
  return c.redirect(`${FRONTEND_URL}/`)
})

auth.get('/me', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.json({ error: 'Not logged in' }, 401)
  return c.json(toProfile(user))
})

auth.post('/logout', async (c) => {
  await client(c).auth.signOut()
  return c.body(null, 204)
})
