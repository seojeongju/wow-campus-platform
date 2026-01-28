// CORS middleware for WOW-CAMPUS Work Platform

import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow localhost for development
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    
    // Allow Cloudflare Pages domains
    if (origin.includes('.pages.dev') || origin.includes('wowcampus.com')) {
      return origin;
    }
    
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

export const apiCors = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
});