// ============================================================
// CONFIGURACIÓN FIREBASE
// 1) Firebase Console > Configuración del proyecto > General
// 2) En "Tus apps", registra/abre tu aplicación Web (</>)
// 3) Copia los valores de firebaseConfig y reemplaza los de abajo.
// ============================================================

export const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "PEGA_AQUI_TU_MESSAGING_SENDER_ID",
  appId: "PEGA_AQUI_TU_APP_ID"
};

// Opcional: limita el acceso a un dominio institucional.
// Ejemplo: "eightacademy.edu.ec"
// Déjalo vacío mientras haces las primeras pruebas.
export const ALLOWED_EMAIL_DOMAIN = "";
