import type { App } from 'vue'

import { NucUserDashboard } from 'nucleify'

export function registerNucUsers(app: App<Element>): void {
  app.component('nuc-user-dashboard', NucUserDashboard)
}
