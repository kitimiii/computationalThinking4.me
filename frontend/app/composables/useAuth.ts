import type { User } from '~/types/user'

// Who is logged in. The backend does the login and keeps the tokens in cookies,
// so the browser only has to send those cookies along (credentials: 'include').
export function useAuth() {
  const apiBase = useRuntimeConfig().public.apiBase
  const api = $fetch.create({ baseURL: apiBase, credentials: 'include' })
  const user = useState<User | null>('user', () => null)

  // The backend answers 401 when nobody is logged in.
  async function load() {
    try {
      user.value = await api<User>('/auth/me')
    }
    catch {
      user.value = null
    }
  }

  // A real page change, because Google has to show its own login page.
  function login() {
    window.location.href = `${apiBase}/auth/login`
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user: readonly(user), load, login, logout }
}
