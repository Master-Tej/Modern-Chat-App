import crypto from 'crypto';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from '../../utils/errors';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async register(input: RegisterInput) {
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await authRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createUser({
      ...input,
      passwordHash,
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

    return { user, accessToken, refreshToken };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refresh(refreshTokenStr: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = hashToken(refreshTokenStr);
    const storedToken = await authRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    if (storedToken.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(storedToken.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    await authRepository.deleteRefreshToken(storedToken.id);

    const user = await authRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await authRepository.createRefreshToken(user.id, newTokenHash, expiresAt);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshTokenStr: string) {
    const tokenHash = hashToken(refreshTokenStr);
    const storedToken = await authRepository.findRefreshToken(tokenHash);
    if (storedToken) {
      await authRepository.deleteRefreshToken(storedToken.id);
    }
  },

  async logoutAll(userId: string) {
    await authRepository.deleteUserRefreshTokens(userId);
  },
};
