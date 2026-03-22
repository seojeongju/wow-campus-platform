// Authentication middleware for WOW-CAMPUS Work Platform

import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import type { Bindings, Variables } from '../types/env';
import { verifyJWT, hashToken } from '../utils/auth';

// JWT Authentication middleware
export const authMiddleware = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  let token: string | undefined;
  
  // First, try to get token from Authorization header
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7); // Remove 'Bearer ' prefix
  }
  
  // If no header token, try to get from cookie
  if (!token) {
    token = getCookie(c, 'wowcampus_token');
  }
  
  // If still no token, return 401
  if (!token) {
    throw new HTTPException(401, { message: 'Missing authentication token' });
  }
  
  const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
  
  try {
    const payload = await verifyJWT(token, jwtSecret);
    
    // Check if token is in blacklist
    const tokenHash = await hashToken(token);
    const blacklisted = await c.env.DB.prepare(
      'SELECT id FROM token_blacklist WHERE token_hash = ? AND expires_at > datetime("now")'
    ).bind(tokenHash).first();
    
    if (blacklisted) {
      throw new HTTPException(401, { message: 'Token has been revoked' });
    }
    
    // Verify user still exists and is active
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, status FROM users WHERE id = ? AND status = ?'
    ).bind(payload.userId, 'approved').first();
    
    if (!user) {
      throw new HTTPException(401, { message: 'User not found or not approved' });
    }
    
    // Debug logging
    console.log('authMiddleware - User loaded:', {
      userId: user.id,
      email: user.email,
      user_type: user.user_type,
      user_type_type: typeof user.user_type,
      status: user.status,
      path: c.req.path
    });
    
    c.set('user', {
      id: user.id as number,
      email: user.email as string,
      name: user.name as string,
      user_type: String(user.user_type || '').trim(),
      status: user.status as string,
    });
    
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
});

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) =>
  createMiddleware<{
    Bindings: Bindings;
    Variables: Variables;
  }>(async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }
    
    // Normalize user_type (trim and lowercase for comparison)
    const userType = String(user.user_type || '').trim().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => String(role).trim().toLowerCase());
    
    // Debug logging with full user object
    console.log('requireRole check:', {
      userId: user.id,
      userEmail: user.email,
      userType: user.user_type,
      normalizedUserType: userType,
      allowedRoles: allowedRoles,
      normalizedAllowedRoles: normalizedAllowedRoles,
      hasAccess: normalizedAllowedRoles.includes(userType),
      fullUser: user
    });
    
    if (!normalizedAllowedRoles.includes(userType)) {
      throw new HTTPException(403, { 
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}, Your role: ${user.user_type || 'unknown'}` 
      });
    }
    
    await next();
  });

// Specific role middlewares
export const requireAdmin = requireRole(['admin']);
export const requireCompany = requireRole(['company', 'admin']);
export const requireJobseeker = requireRole(['jobseeker', 'admin']);
export const requireAgent = requireRole(['agent', 'admin']);
export const requireAgentOrAdmin = requireRole(['agent', 'admin']);
export const requireCompanyOrAdmin = requireRole(['company', 'admin']);
export const requireJobseekerOrAdmin = requireRole(['jobseeker', 'admin']);

// User ownership middleware (user can access their own resources)
export const requireOwnershipOrAdmin = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const user = c.get('user');
  const resourceUserId = c.req.param('userId') || c.req.param('id');
  
  if (!user) {
    throw new HTTPException(401, { message: 'Authentication required' });
  }
  
  // Admin can access any resource
  if (user.user_type === 'admin') {
    await next();
    return;
  }
  
  // Users can only access their own resources
  if (resourceUserId && parseInt(resourceUserId) !== user.id) {
    throw new HTTPException(403, { message: 'Access denied: can only access own resources' });
  }
  
  await next();
});

// Optional auth middleware (doesn't require authentication but sets user if available)
export const optionalAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  let token: string | undefined;
  
  // First, try to get token from Authorization header
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  
  // If no header token, try to get from cookie
  if (!token) {
    token = getCookie(c, 'wowcampus_token');
  }
  
  if (token) {
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    
    try {
      const payload = await verifyJWT(token, jwtSecret);
      
      const user = await c.env.DB.prepare(
        'SELECT id, email, user_type, status FROM users WHERE id = ? AND status = ?'
      ).bind(payload.userId, 'approved').first();
      
      if (user) {
        c.set('user', {
          id: user.id as number,
          email: user.email as string,
          user_type: user.user_type as string,
          status: user.status as string,
        });
      }
    } catch (error) {
      // Ignore errors in optional auth
    }
  }
  
  await next();
});