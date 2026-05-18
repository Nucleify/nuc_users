import { type ApiRoute, when } from 'nuc_api'

import {
  handleAvatar,
  handleCreateDemoUser,
  handleCurrentUser,
} from './users_handlers'

/** POST /users/demo — dev: konto + przykładowe dane (wyłączone na produkcji) */
export const routeCreateDemoUser = when(
  { method: 'POST', path: ['users', 'demo'] },
  handleCreateDemoUser
)

/** GET /user */
export const routeCurrentUser = when(
  { method: 'GET', path: ['user'] },
  handleCurrentUser
)

/** POST /users/:id/avatar · DELETE /users/:id/avatar */
export const routeAvatar = when(
  { method: ['POST', 'DELETE'], len: 3, path: ['users', undefined, 'avatar'] },
  handleAvatar
)

export const usersRoutes: ApiRoute[] = [
  routeCreateDemoUser,
  routeCurrentUser,
  routeAvatar,
]
