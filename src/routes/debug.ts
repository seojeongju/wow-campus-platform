
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Bindings, Variables } from '../types/env';
import { hashPassword } from '../utils/auth';

const debug = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Temporary debug route to promote a user to admin
debug.get('/promote', async (c) => {
    const email = c.req.query('email');
    const key = c.req.query('key');

    if (!email || !key) {
        return c.json({ success: false, message: 'Email and key are required' }, 400);
    }

    // Simple hardcoded key for temporary usage
    if (key !== 'wow-admin-secret') {
        return c.json({ success: false, message: 'Invalid key' }, 403);
    }

    try {
        const user = await c.env.DB.prepare(
            'SELECT id, email, user_type FROM users WHERE LOWER(email) = LOWER(?)'
        ).bind(email.trim()).first();

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        const result = await c.env.DB.prepare(
            "UPDATE users SET user_type = 'admin' WHERE id = ?"
        ).bind(user.id).run();

        if (result.success) {
            return c.json({
                success: true,
                message: `User ${email} promoted to admin successfully. Please log out and log in again.`
            });
        } else {
            return c.json({ success: false, message: 'Failed to update user type' }, 500);
        }

    } catch (error) {
        console.error('Promote error:', error);
        return c.json({ success: false, message: 'Internal server error', error: String(error) }, 500);
    }
});

// Check user info by email
debug.get('/check', async (c) => {
    const email = c.req.query('email');
    const key = c.req.query('key');

    if (!email || !key) {
        return c.json({ success: false, message: 'Email and key are required' }, 400);
    }

    // Simple hardcoded key for temporary usage
    if (key !== 'wow-admin-secret') {
        return c.json({ success: false, message: 'Invalid key' }, 403);
    }

    try {
        const user = await c.env.DB.prepare(
            'SELECT id, email, name, user_type, status, created_at, last_login_at FROM users WHERE LOWER(email) = LOWER(?)'
        ).bind(email.trim()).first();

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        return c.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                user_type: user.user_type,
                status: user.status,
                created_at: user.created_at,
                last_login_at: user.last_login_at
            }
        });

    } catch (error) {
        console.error('Check user error:', error);
        return c.json({ success: false, message: 'Internal server error', error: String(error) }, 500);
    }
});

// List all users (for debugging)
debug.get('/users', async (c) => {
    const key = c.req.query('key');

    if (!key) {
        return c.json({ success: false, message: 'Key is required' }, 400);
    }

    if (key !== 'wow-admin-secret') {
        return c.json({ success: false, message: 'Invalid key' }, 403);
    }

    try {
        const result = await c.env.DB.prepare(
            'SELECT id, email, name, user_type, status, created_at FROM users ORDER BY created_at DESC LIMIT 50'
        ).all();

        return c.json({
            success: true,
            count: result.results?.length || 0,
            users: result.results || []
        });

    } catch (error) {
        console.error('List users error:', error);
        return c.json({ success: false, message: 'Internal server error', error: String(error) }, 500);
    }
});

// Reset user password (for debugging)
debug.get('/reset-password', async (c) => {
    const email = c.req.query('email');
    const newPassword = c.req.query('password');
    const key = c.req.query('key');

    if (!email || !newPassword || !key) {
        return c.json({ success: false, message: 'Email, password, and key are required' }, 400);
    }

    if (key !== 'wow-admin-secret') {
        return c.json({ success: false, message: 'Invalid key' }, 403);
    }

    if (newPassword.length < 8) {
        return c.json({ success: false, message: 'Password must be at least 8 characters' }, 400);
    }

    try {
        const user = await c.env.DB.prepare(
            'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)'
        ).bind(email.trim()).first();

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        const result = await c.env.DB.prepare(
            'UPDATE users SET password_hash = ? WHERE id = ?'
        ).bind(hashedPassword, user.id).run();

        if (result.success) {
            return c.json({
                success: true,
                message: `Password for ${email} has been reset successfully. You can now login with the new password.`
            });
        } else {
            return c.json({ success: false, message: 'Failed to update password' }, 500);
        }

    } catch (error) {
        console.error('Reset password error:', error);
        return c.json({ success: false, message: 'Internal server error', error: String(error) }, 500);
    }
});

export default debug;
