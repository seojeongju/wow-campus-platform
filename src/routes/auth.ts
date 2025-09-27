// Authentication routes for WOW-CAMPUS Work Platform

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/database';
import { hashPassword, verifyPassword, createJWT, sanitizeUser } from '../utils/auth';
import { getCurrentTimestamp } from '../utils/database';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Register new user
auth.post('/register', async (c) => {
  try {
    const { email, password, name, user_type, phone }: RegisterRequest = await c.req.json();
    
    // Validate required fields
    if (!email || !password || !name || !user_type) {
      throw new HTTPException(400, { message: 'Email, password, name, and user_type are required' });
    }
    
    // Validate user_type
    if (!['company', 'jobseeker', 'agent'].includes(user_type)) {
      throw new HTTPException(400, { message: 'Invalid user_type' });
    }
    
    // Check if email already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      throw new HTTPException(409, { message: 'Email already registered' });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, user_type, name, phone, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      email,
      passwordHash,
      user_type,
      name,
      phone || null,
      'pending',
      getCurrentTimestamp(),
      getCurrentTimestamp()
    ).run();
    
    if (!result.success) {
      throw new HTTPException(500, { message: 'Failed to create user' });
    }
    
    // Get created user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
    if (!user) {
      throw new HTTPException(500, { message: 'Failed to retrieve created user' });
    }
    
    return c.json({
      success: true,
      message: 'User registered successfully. Waiting for admin approval.',
      user: sanitizeUser(user as any)
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Registration failed' });
  }
});

// Login user
auth.post('/login', async (c) => {
  try {
    const { email, password }: LoginRequest = await c.req.json();
    
    if (!email || !password) {
      throw new HTTPException(400, { message: 'Email and password are required' });
    }
    
    // Get user by email
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash as string);
    
    if (!isValidPassword) {
      throw new HTTPException(401, { message: 'Invalid email or password' });
    }
    
    // Check if user is approved
    if (user.status !== 'approved') {
      throw new HTTPException(403, { 
        message: `Account is ${user.status}. Please wait for admin approval.` 
      });
    }
    
    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?'
    ).bind(getCurrentTimestamp(), getCurrentTimestamp(), user.id).run();
    
    // Create JWT token
    const jwtSecret = c.env.JWT_SECRET || 'wow-campus-default-secret';
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      userType: user.user_type
    }, jwtSecret);
    
    const response: AuthResponse = {
      user: sanitizeUser(user as any),
      token
    };
    
    return c.json({
      success: true,
      message: 'Login successful',
      ...response
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Login failed' });
  }
});

// Get current user profile
auth.get('/profile', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    const user = await c.env.DB.prepare(`
      SELECT u.*, 
        CASE 
          WHEN u.user_type = 'company' THEN (
            SELECT json_object(
              'company_name', c.company_name,
              'business_number', c.business_number,
              'industry', c.industry,
              'company_size', c.company_size,
              'address', c.address,
              'website', c.website,
              'description', c.description
            ) FROM companies c WHERE c.user_id = u.id
          )
          WHEN u.user_type = 'jobseeker' THEN (
            SELECT json_object(
              'first_name', js.first_name,
              'last_name', js.last_name,
              'nationality', js.nationality,
              'visa_status', js.visa_status,
              'korean_level', js.korean_level,
              'english_level', js.english_level,
              'experience_years', js.experience_years,
              'skills', js.skills,
              'bio', js.bio
            ) FROM jobseekers js WHERE js.user_id = u.id
          )
          WHEN u.user_type = 'agent' THEN (
            SELECT json_object(
              'agency_name', a.agency_name,
              'license_number', a.license_number,
              'specialization', a.specialization,
              'commission_rate', a.commission_rate,
              'experience_years', a.experience_years,
              'total_placements', a.total_placements,
              'success_rate', a.success_rate
            ) FROM agents a WHERE a.user_id = u.id
          )
        END as profile_data
      FROM users u 
      WHERE u.id = ?
    `).bind(currentUser!.id).first();
    
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' });
    }
    
    return c.json({
      success: true,
      user: sanitizeUser(user as any),
      profile: user.profile_data ? JSON.parse(user.profile_data as string) : null
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to get profile' });
  }
});

// Update user profile
auth.put('/profile', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    const updateData = await c.req.json();
    
    // Update user basic info
    const { name, phone, profile_image_url } = updateData;
    
    if (name || phone || profile_image_url) {
      await c.env.DB.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            profile_image_url = COALESCE(?, profile_image_url),
            updated_at = ?
        WHERE id = ?
      `).bind(name, phone, profile_image_url, getCurrentTimestamp(), currentUser!.id).run();
    }
    
    // Update type-specific profile data
    const userType = currentUser!.user_type;
    
    if (userType === 'company' && updateData.company_data) {
      const companyData = updateData.company_data;
      await c.env.DB.prepare(`
        UPDATE companies 
        SET company_name = COALESCE(?, company_name),
            business_number = COALESCE(?, business_number),
            industry = COALESCE(?, industry),
            company_size = COALESCE(?, company_size),
            address = COALESCE(?, address),
            website = COALESCE(?, website),
            description = COALESCE(?, description),
            founded_year = COALESCE(?, founded_year),
            employee_count = COALESCE(?, employee_count),
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        companyData.company_name,
        companyData.business_number,
        companyData.industry,
        companyData.company_size,
        companyData.address,
        companyData.website,
        companyData.description,
        companyData.founded_year,
        companyData.employee_count,
        getCurrentTimestamp(),
        currentUser!.id
      ).run();
    }
    
    return c.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Failed to update profile' });
  }
});

// Logout (client-side token removal, but we can track it)
auth.post('/logout', authMiddleware, async (c) => {
  return c.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default auth;