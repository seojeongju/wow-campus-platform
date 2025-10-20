// Cloudflare Workers Environment Bindings

export interface Bindings {
  DB: D1Database;
  JWT_SECRET?: string;
  BCRYPT_ROUNDS?: string;
  DOCUMENTS_BUCKET?: R2Bucket;
  RESEND_API_KEY?: string;
}

export interface Variables {
  user?: {
    id: number;
    email: string;
    user_type: string;
    status: string;
  };
}

declare global {
  interface CloudflareBindings extends Bindings {}
}