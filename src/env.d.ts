/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_BREVO_API_KEY: string;
  readonly VITE_BREVO_SENDER_EMAIL: string;
  readonly VITE_BREVO_SENDER_NAME?: string;
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}