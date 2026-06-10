import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Extract token from request (header or cookie)
 */
function extractToken(req) {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookies = req.cookies;
  if (cookies && cookies.sv_token) {
    return cookies.sv_token;
  }

  return null;
}

/**
 * Require authentication middleware
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      console.warn('[AUTH] No token provided');
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    console.log('[AUTH] Token decoded:', JSON.stringify(decoded));
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.warn(`[AUTH] User not found in DB for ID: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    console.log(`[AUTH] Authenticated user: ${user.email}, Role: ${user.role}`);
    req.user = user;
    next();
  } catch (err) {
    console.error('[AUTH] Auth error:', err.name, err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expired'
        }
      });
    }

    next(err);
  }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(req, res, next) {
  console.log('[AUTH] Checking admin role for:', req.user?.email, 'Role:', req.user?.role);
  if (!req.user) {
    console.warn('[AUTH] requireAdmin failed: No user on request');
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  if (req.user.role !== 'admin') {
    console.warn(`[AUTH] requireAdmin failed: User ${req.user.email} has role ${req.user.role}, but admin required`);
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }

  console.log(`[AUTH] requireAdmin success for ${req.user.email}`);
  next();
}

/**
 * Optional auth - attaches user if authenticated, continues anyway
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore errors for optional auth
  }

  next();
}
