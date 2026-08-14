# Planificador Curricular Inteligente

Aplicación web para apoyar la planificación docente semanal a partir del Mapeo de Contenidos.

## Estructura del proyecto

```text
planificador-curricular-inteligente/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   └── app.js
├── README.md
└── .gitignore
```

## Archivos principales

- `index.html`: estructura visual de la aplicación.
- `css/styles.css`: estilos propios e impresión.
- `js/data.js`: datos curriculares base y estrategias NEE/DUA.
- `js/app.js`: navegación, carga del Mapeo, generación de actividades, guardado local y funciones de interfaz.

## Funcionalidades actuales

- Selección de 3.º a 7.º de EGB.
- Selección de asignatura.
- Carga de Mapeo en Excel, CSV o JSON.
- Planificación por semanas.
- Activación, Anticipación, Construcción y Consolidación.
- Generación de nuevas propuestas de actividades según el tema.
- Estrategias NEE/DUA.
- Guardado local en el navegador.
- Exportación de respaldo JSON.

## Ejecutar localmente

Puedes abrir `index.html` directamente. Para desarrollo se recomienda usar un servidor local, por ejemplo Live Server en VS Code.

## Próximos pasos

- Firebase Authentication con correo institucional.
- Cloud Firestore para separar datos por docente.
- Historial de planificaciones.
- Panel administrativo.
- Sincronización entre dispositivos.

## Nota sobre GitHub Languages

Al separar JavaScript y CSS en archivos propios, GitHub podrá reconocer mejor la distribución real de tecnologías del proyecto.

---

## ☁️ Base de datos Firebase

Esta versión incorpora **Firebase Authentication y Cloud Firestore**.

Cuando un docente inicia sesión con Google, Firebase obtiene su `uid` y la aplicación guarda la información dentro de:

```text
teachers/{uid}/planner/current
teachers/{uid}/mappings/{mappingId}
```

Esto permite separar los datos de cada profesor. Las reglas incluidas en `firebase/firestore.rules` verifican que `request.auth.uid` coincida con el UID de la ruta antes de permitir lectura o escritura.

### Archivos de Firebase

```text
js/firebase-config.js   # Configuración del proyecto
js/firebase.js          # Authentication + Firestore
firebase/firestore.rules
firebase.json
SETUP_FIREBASE.md
```

Para completar la conexión, sigue [SETUP_FIREBASE.md](SETUP_FIREBASE.md).
