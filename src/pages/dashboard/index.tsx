/**
 * Page Component
 * Route: /dashboard
 * Original: src/index.tsx lines 13755-13774
 */

import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { authMiddleware } from '../../middleware/auth'

export const handler = (c: Context) => {
  const user = c.get('user')

  if (!user) {
    throw new HTTPException(401, { message: '로그인이 필요합니다.' })
  }

  // Redirect to appropriate dashboard based on user type
  const userType = String(user.user_type || '').trim().toLowerCase()
  const dashboardUrls: Record<string, string> = {
    jobseeker: '/dashboard/jobseeker',
    company: '/dashboard/company',
    agent: '/agents',
    admin: '/admin'
  }

  const redirectUrl = dashboardUrls[userType] || '/dashboard/jobseeker'
  return c.redirect(redirectUrl)
}

// Middleware: authMiddleware
