import jwt from 'jsonwebtoken';
import { success, error } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const ADMIN_USER = {
  id: '600000000000000000000001', // Valid-ish ObjectId for dummy admin
  email: 'admin@studyvault.pk',
  password: 'admin123',
  name: 'Admin User',
  role: 'admin'
};

/**
 * POST /auth/google - Google OAuth login/register with credential
 */
export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json(error('Google credential required', 'VALIDATION_ERROR'));
    }

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const google = await googleRes.json();

    if (google.error || !google.email) {
      return res.status(401).json(error('Invalid Google token', 'GOOGLE_INVALID'));
    }

    if (process.env.GOOGLE_CLIENT_ID && google.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json(error('Token audience mismatch', 'GOOGLE_AUDIENCE_MISMATCH'));
    }

    let user = await User.findOne({ email: google.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: google.name || google.email.split('@')[0],
        email: google.email.toLowerCase(),
        google_id: google.sub,
        avatar_url: google.picture,
        is_verified: true,
        role: 'student',
        student_profile: { onboarding_completed: false },
      });
    } else if (!user.google_id) {
      await User.findByIdAndUpdate(user._id, { google_id: google.sub, is_verified: true });
    }

    const tokens = authService.generateTokenPair(user);

    res.cookie('sv_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(success({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        onboardingComplete: user.student_profile?.onboarding_completed || false,
      },
      tokens,
    }, 'Google auth successful'));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE/POST /auth/logout - Clear session cookie
 */
export async function logout(req, res, next) {
  try {
    res.clearCookie('sv_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json(success({ message: 'Logged out' }, 'LOGGED_OUT'));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/onboarding - Complete student onboarding (requires auth)
 */
export async function completeOnboarding(req, res, next) {
  try {
    const user = req.user;
    const { board, grade, className } = req.body;

    if (!board || !grade) {
      return res.status(400).json(error('Board and grade are required', 'VALIDATION_ERROR'));
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          'student_profile.board': board,
          'student_profile.grade': grade,
          'student_profile.class': className,
          'student_profile.onboarding_completed': true,
        },
      },
      { new: true }
    ).select('-password_hash -otp -password_reset_token');

    res.json(success({ user: updatedUser }, 'Onboarding completed'));
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = req.user;
    res.json(success(user, 'User retrieved'));
  } catch (err) {
    next(err);
  }
}

// ── DEV ONLY — delete before production ─────────────────────────────────────
export async function devLogin(req, res, next) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    const { email = 'dev@studyvault.pk', name = 'Dev User' } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });
    const isEmailAdmin = email.toLowerCase().includes('admin');
    console.log(`[AUTH] devLogin for ${email}, isEmailAdmin: ${isEmailAdmin}`);

    if (!user) {
      console.log(`[AUTH] Creating new dev user for ${email} with role ${isEmailAdmin ? 'admin' : 'student'}`);
      user = await User.create({
        name,
        email: email.toLowerCase(),
        google_id: 'dev-' + email.split('@')[0],
        is_verified: true,
        role: isEmailAdmin ? 'admin' : 'student',
        student_profile: { onboarding_completed: false },
      });
    } else if (isEmailAdmin && user.role !== 'admin') {
      console.log(`[AUTH] Upgrading existing user ${email} to admin`);
      user.role = 'admin';
      await user.save();
    }

    const tokens = authService.generateTokenPair(user);
    res.json(success({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, tokens }, 'Dev login OK'));
  } catch (err) {
    next(err);
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials against hardcoded admin
    if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
      let user = await User.findOne({ email: ADMIN_USER.email });
      if (!user) {
        user = await User.create({
          name: ADMIN_USER.name,
          email: ADMIN_USER.email,
          role: 'admin',
          is_verified: true,
          google_id: 'admin-hardcoded'
        });
      } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const tokens = authService.generateTokenPair(user);

      return res.json(success({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens
      }, 'Admin login successful'));
    }

    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password. Try admin@studyvault.pk / admin123' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' }
    });
  }
};
// ── END DEV ONLY ─────────────────────────────────────────────────────────────
