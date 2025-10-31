/**
 * Page Component
 * Route: /dashboard/admin
 * Original: src/index.tsx lines 17697-17701
 */

import type { Context } from 'hono'
import { optionalAuth, requireAdmin } from '../../middleware/auth'

export const handler = (c: Context) => {
  return c.redirect('/admin')
}

// Middleware: optionalAuth, requireAdmin
