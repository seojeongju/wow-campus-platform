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
  i18n?: {
    language: string;
    t: (key: string) => string;
  };
}

declare global {
  interface CloudflareBindings extends Bindings { }
}