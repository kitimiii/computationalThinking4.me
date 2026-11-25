// Someone who belongs to a board; the overview shows their avatar.
export interface Member {
  id: string
  name: string
  avatarUrl?: string
}

// A board holds objects; every object belongs to exactly one board.
export interface Board {
  id: string
  name: string
  createdAt: string
  members: Member[]
}
