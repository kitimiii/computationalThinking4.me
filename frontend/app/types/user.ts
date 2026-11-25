// The logged-in person, as the backend reports it from /auth/me.
export interface User {
  name: string
  avatarUrl?: string
  email: string
}
