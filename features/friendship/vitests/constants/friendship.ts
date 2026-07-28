import type { NucFriendshipObjectInterface } from 'nucleify'

export const mockFriendship: NucFriendshipObjectInterface = {
  id: 99,
  friend: {
    id: 999,
    name: 'Example Friend',
    email: 'friend@example.com',
    role: 'user',
  },
  status: 'accepted',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
