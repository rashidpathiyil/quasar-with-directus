import '@directus/sdk';

// Extend the LoginCredentials interface for backwards compatibility
declare module '@directus/sdk' {
  interface AuthCredentials {
    email: string;
    password: string;
  }
} 
