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
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
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
