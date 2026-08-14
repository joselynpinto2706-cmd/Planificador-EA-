import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { firebaseConfig, ALLOWED_EMAIL_DOMAIN } from "./firebase-config.js";

const isConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("PEGA_AQUI") &&
    !firebaseConfig.projectId.includes("TU_PROYECTO")
  );
};

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let initError = null;

function dispatch(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function userSummary(user) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email || "Docente",
    photoURL: user.photoURL || ""
  };
}

async function ensureTeacherProfile(user) {
  if (!db || !user) return;
  const ref = doc(db, "teachers", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    photoURL: user.photoURL || "",
    lastLoginAt: serverTimestamp()
  }, { merge: true });
}

async function loginWithGoogle() {
  if (!isConfigured()) {
    throw new Error("Firebase todavía no está configurado. Completa js/firebase-config.js.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (ALLOWED_EMAIL_DOMAIN) {
    const email = (user.email || "").toLowerCase();
    const allowed = email.endsWith(`@${ALLOWED_EMAIL_DOMAIN.toLowerCase()}`);
    if (!allowed) {
      await signOut(auth);
      throw new Error(`Debes ingresar con un correo @${ALLOWED_EMAIL_DOMAIN}.`);
    }
  }

  await ensureTeacherProfile(user);
  return userSummary(user);
}

async function logout() {
  if (!auth) return;
  await signOut(auth);
}

function requireUser() {
  if (!currentUser) throw new Error("Debes iniciar sesión para sincronizar con la nube.");
  return currentUser;
}

async function savePlannerData(payload) {
  const user = requireUser();
  const ref = doc(db, "teachers", user.uid, "planner", "current");
  await setDoc(ref, {
    curriculumDatabase: payload.curriculumDatabase || [],
    currentWeekIndex: Number(payload.currentWeekIndex || 0),
    mappingFileName: payload.mappingFileName || "",
    selectedGrade: payload.selectedGrade || "",
    selectedSubject: payload.selectedSubject || "",
    updatedAt: serverTimestamp()
  }, { merge: true });
  return true;
}

async function loadPlannerData() {
  const user = requireUser();
  const ref = doc(db, "teachers", user.uid, "planner", "current");
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
}

async function saveMappingSnapshot(fileName, rows) {
  const user = requireUser();
  const safeId = `${Date.now()}-${String(fileName || "mapeo").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60)}`;
  const ref = doc(db, "teachers", user.uid, "mappings", safeId);
  await setDoc(ref, {
    fileName: fileName || "Mapeo",
    rows: rows || [],
    createdAt: serverTimestamp()
  });
  return safeId;
}

window.firebasePlanner = {
  isConfigured,
  loginWithGoogle,
  logout,
  savePlannerData,
  loadPlannerData,
  saveMappingSnapshot,
  getCurrentUser: () => userSummary(currentUser),
  getInitError: () => initError
};

if (isConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    await setPersistence(auth, browserLocalPersistence);

    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      if (user) {
        try { await ensureTeacherProfile(user); } catch (err) { console.error(err); }
      }
      dispatch("firebase-auth-changed", { user: userSummary(user) });
    });

    dispatch("firebase-ready", { configured: true });
  } catch (error) {
    initError = error;
    console.error("Firebase initialization error:", error);
    dispatch("firebase-ready", { configured: false, error: error.message });
  }
} else {
  dispatch("firebase-ready", { configured: false });
}
