// Authentication utilities for WOW-CAMPUS Work Platform

import type { User } from '../types/database';

// Simple password hashing using Web Crypto API (for Cloudflare Workers)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'wow-campus-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// 🔐 Safe Base64 encoding/decoding for UTF-8 strings (handles Korean characters)
function base64UrlEncode(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  // Add padding if needed
  const padded = str + '='.repeat((4 - str.length % 4) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// Simple JWT creation using Web Crypto API with safe Base64 encoding
export async function createJWT(payload: any, secret: string, expiresInSeconds?: number): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = expiresInSeconds || (24 * 60 * 60); // Default: 24 hours
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expirationTime,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `${message}.${encodedSignature}`;
}

// Access Token 생성 (짧은 만료 시간: 15분)
export async function createAccessToken(payload: any, secret: string): Promise<string> {
  return createJWT(payload, secret, 15 * 60); // 15 minutes
}

// Refresh Token 생성 (긴 만료 시간: 7일 또는 30일)
export async function createRefreshToken(payload: any, secret: string, rememberMe: boolean = false): Promise<string> {
  const expiresIn = rememberMe ? (30 * 24 * 60 * 60) : (7 * 24 * 60 * 60); // 30일 또는 7일
  return createJWT(payload, secret, expiresIn);
}

// Token 해시 생성 (DB 저장용)
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + 'token-hash-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const message = `${headerB64}.${payloadB64}`;
    // Handle base64url decoding for signature
    const paddedSignature = signatureB64 + '='.repeat((4 - signatureB64.length % 4) % 4);
    const base64Signature = paddedSignature.replace(/-/g, '+').replace(/_/g, '/');
    const signature = Uint8Array.from(atob(base64Signature), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(message)
    );
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function sanitizeUser(user: User): Omit<User, 'password_hash'> {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// JWT 페이로드에서 만료 시간까지 남은 시간 계산 (초 단위)
export function getTokenTimeRemaining(payload: any): number {
  if (!payload || !payload.exp) {
    return 0;
  }
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}

// 토큰이 곧 만료되는지 확인 (5분 이내)
export function isTokenExpiringSoon(payload: any): boolean {
  const timeRemaining = getTokenTimeRemaining(payload);
  return timeRemaining > 0 && timeRemaining < 5 * 60; // 5분 이내
}