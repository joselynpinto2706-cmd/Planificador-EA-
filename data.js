let curriculumDatabase = [
      {
        sem: 1,
        subject: "Lengua",
        trimestre: "PRIMER TRIMESTRE",
        unidad: "U1",
        fechas: "07 - 11 sep 2026",
        per: "6",
        tema: "Diagnóstico y Bienvenida",
        dcd: "Evaluación diagnóstica integral de destrezas de lectura, escritura y expresión oral del subnivel anterior.",
        comp: "Competencias comunicacionales / Socioemocionales",
        act: "Juego interactivo 'El micrófono preguntón' en Microsoft Teams para romper el hielo. Levantamiento de conocimientos previos mediante encuesta en Mentimeter.",
        cons: "Lectura individual guiada de un texto narrativo breve. Identificación visual de elementos del cuento utilizando la pizarra digital de Canva.",
        consol: "Cuestionario diagnóstico gamificado en Quizizz (10 preguntas visuales) para medir comprensión lectora."
      },
      {
        sem: 2,
        subject: "Lengua",
        trimestre: "PRIMER TRIMESTRE",
        unidad: "U1",
        fechas: "14 - 18 sep 2026",
        per: "6",
        tema: "Nivelación Pedagógica",
        dcd: "Reforzamiento de conciencia fonológica, semántica y sintáctica en la construcción de párrafos sencillos.",
        comp: "Competencias comunicacionales",
        act: "Presentación de tarjetas de imágenes animadas en Genially para ordenar secuencias lógicas de historias de la comunidad.",
        cons: "Construcción colectiva de oraciones con sujeto y predicado en un muro digital interactivo de Padlet.",
        consol: "Ticket de salida en Canvas LMS ordenando correctamente 3 oraciones desordenadas."
      },
      {
        sem: 3,
        subject: "Lengua",
        trimestre: "PRIMER TRIMESTRE",
        unidad: "U1",
        fechas: "21 - 25 sep 2026",
        per: "6",
        tema: "El Cuento Fantástico",
        dcd: "LL.2.5.1. Escuchar y leer diversos géneros literarios (privilegiando textos ecuatorianos, populares y de autor) para potenciar la imaginación, la curiosidad y la memoria.\n\nLL.2.5.2. Escuchar y leer diversos géneros literarios para desarrollar preferencias en el gusto literario.",
        comp: "Competencias comunicacionales / Digitales",
        act: "Escucha activa de un audiolibro fantástico ecuatoriano en Padlet. Lluvia de ideas mediante encuesta rápida en Mentimeter sobre elementos 'fantásticos'.",
        cons: "Identificación de los momentos del cuento (inicio, nudo y desenlace) usando una plantilla interactiva en Canva compartida en Teams.",
        consol: "Creación de una portada digital del cuento leído cambiando el personaje principal con apoyo de herramientas gráficas."
      },
      {
        sem: 4,
        subject: "Lengua",
        trimestre: "PRIMER TRIMESTRE",
        unidad: "U1",
        fechas: "28 sep - 02 oct 2026",
        per: "6",
        tema: "El Itinerario y la Secuencia Temporal",
        dcd: "LL.2.4.3. Redactar, en situaciones comunicativas que lo requieran, narraciones de experiencias personales, hechos cotidianos u otros sucesos de interés, ordenándolos cronológicamente con conectores temporales.",
        comp: "Competencias comunicacionales",
        act: "Observación del mapa de un itinerario de viaje fantástico proyectado en la pantalla interactiva.",
        cons: "Taller de escritura guiada en Microsoft Word/Canvas utilizando conectores temporales (primero, luego, más tarde, finalmente).",
        consol: "Juego de asociación en Educaplay completando conectores lógicos faltantes en un texto narrativo."
      },
      {
        sem: 5,
        subject: "Lengua",
        trimestre: "PRIMER TRIMESTRE",
        unidad: "U1",
        fechas: "05 - 09 oct 2026",
        per: "6",
        tema: "La Opinión Personal en Textos Narrativos",
        dcd: "LL.2.2.1. Compartir de manera espontánea sus ideas, experiencias y necesidades en situaciones informales de la vida cotidiana.",
        comp: "Competencias comunicacionales / Socioemocionales",
        act: "Debate relámpago con la función de levantamiento de mano en Teams: '¿Qué superpoder prefieres y por qué?'.",
        cons: "Modelado del párrafo de opinión: Estructura de Idea Principal + Razón + Ejemplo práctico en la pizarra digital.",
        consol: "Grabación de un audio corto (30 seg) en la asignación de Canvas expresando una opinión fundamentada."
      }
    ];

    const neeDatabase = {
      TDAH: [
        { titulo: "Pausas Activas Programadas", icono: "fa-person-running", desc: "Dividir la sesión de 40 min en 2 bloques de 15 min con 1 pausa activa motora. Usar temporizador visual." },
        { titulo: "Fragmentación de Entregables", icono: "fa-list-check", desc: "Entregar 1 instrucción a la vez en Canvas/Teams para evitar sobrecarga de estímulos." },
        { titulo: "Rol de Liderazgo Operativo", icono: "fa-star", desc: "Asignar el rol de 'Gestor de Tiempo' o 'Moderador de Chat' para canalizar el movimiento." }
      ],
      TDA: [
        { titulo: "Guías de Lectura Visuales", icono: "fa-eye", desc: "Proporcionar resaltador digital o máscara de lectura en PDF para mantener el foco." },
        { titulo: "Organizadores Pre-llenados", icono: "fa-sitemap", desc: "Entregar plantillas de notas con el 50% de la estructura completa para guiarse." },
        { titulo: "Instrucciones Multicanal", icono: "fa-volume-high", desc: "Acompañar indicaciones escritas con notas de voz en Canvas o lectura en voz alta." }
      ],
      DISLEXIA: [
        { titulo: "Sustitución de Lectura Extensa", icono: "fa-headphones", desc: "Permitir la escucha de audiotextos en lugar de lectura de textos muy extensos." },
        { titulo: "Evaluación Oral Adaptada", icono: "fa-microphone", desc: "Sustituir la respuesta escrita por grabación de voz en las fases de aplicación." }
      ]
    };
