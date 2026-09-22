import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Configuração do Firebase.
 * Preencha as variáveis no arquivo `.env` (veja `.env.example`).
 * Enquanto as chaves não forem preenchidas, a loja funciona com o catálogo
 * local de demonstração (src/lib/sample-data.ts).
 */
const env = import.meta.env as Record<string, string | undefined>;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "",
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length
      ? getApp()
      : initializeApp(firebaseConfig as Required<typeof firebaseConfig>);
  }
  return app;
}

export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  return a ? getFirestore(a) : null;
}

export function getFirebaseAuth(): Auth | null {
  const a = getFirebaseApp();
  return a ? getAuth(a) : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const a = getFirebaseApp();
  return a ? getStorage(a) : null;
}

/** Nomes das coleções no Firestore. */
export const COLLECTIONS = {
  products: "products",
  orders: "orders",
  users: "users",
  coupons: "coupons",
} as const;
