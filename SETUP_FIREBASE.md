# Configuración de Firebase

La aplicación ya incluye la integración con **Firebase Authentication + Cloud Firestore**.

## 1. Crear/abrir el proyecto Firebase

En Firebase Console crea un proyecto o utiliza el que ya tengas.

## 2. Registrar la aplicación web

En **Configuración del proyecto > General > Tus apps**, registra una aplicación Web (`</>`).
Firebase te mostrará un objeto parecido a:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copia únicamente esos valores dentro de:

```text
js/firebase-config.js
```

## 3. Activar inicio de sesión con Google

Firebase Console > Authentication > Sign-in method > Google > Habilitar > Guardar.

Si quieres aceptar únicamente correos institucionales, edita:

```js
export const ALLOWED_EMAIL_DOMAIN = "tuinstitucion.edu.ec";
```

en `js/firebase-config.js`.

> Importante: la validación del dominio en el navegador mejora la experiencia de acceso, pero la seguridad de los datos se controla con las reglas de Firestore.

## 4. Crear Cloud Firestore

Firebase Console > Firestore Database > Create database.

Para una aplicación real usa reglas seguras, no reglas públicas de prueba.

## 5. Publicar las reglas incluidas

El archivo está en:

```text
firebase/firestore.rules
```

Puedes copiar su contenido en Firestore > Rules > Publish.

Las reglas incluidas permiten que cada docente acceda solo a:

```text
teachers/{SU_UID}/...
```

## 6. Estructura creada en Firestore

```text
teachers
└── UID_DOCENTE
    ├── uid
    ├── email
    ├── displayName
    ├── lastLoginAt
    │
    ├── planner
    │   └── current
    │       ├── curriculumDatabase
    │       ├── currentWeekIndex
    │       ├── mappingFileName
    │       ├── selectedGrade
    │       ├── selectedSubject
    │       └── updatedAt
    │
    └── mappings
        └── ID_MAPEO
            ├── fileName
            ├── rows
            └── createdAt
```

## 7. Ejecutar la app

Como Firebase usa módulos JavaScript, no abras el proyecto únicamente como `file://` si tu navegador bloquea módulos locales.
Usa GitHub Pages, Firebase Hosting, Live Server o cualquier servidor web estático.

## Comportamiento offline

La app conserva su respaldo en `localStorage`. Si el docente está autenticado, también sincroniza el estado con Firestore.
