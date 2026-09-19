// ============================================================
// Modelo de progresión de la Rama Scout (Tropa, 11–14 años)
// Fuente: Asociación Scouts de Colombia
//  - Tabla 8.5  Competencias intermedias
//  - Tabla 8.6.1 Insignias de Rutas
//  - Tabla 8.7  Fases de progresión
//  - CNSC-2026-004 Progresión Personal
// ============================================================

// Colores tomados de los parches oficiales de las insignias de ruta.
export const NIVELES = [
  {
    id: 'descubro',
    nombre: 'Descubro',
    color: '#efc24a',
    colorSuave: '#fdf4d9',
    colorTexto: '#8a6210',
    tono: 'Mostaza',
    lema: 'El primer encuentro',
    icono: '🔍',
    descripcion:
      'Te acercas por primera vez a un territorio: lo experimentas, preguntas, pruebas.',
  },
  {
    id: 'construyo',
    nombre: 'Construyo',
    color: '#3aa5ad',
    colorSuave: '#e0f2f3',
    colorTexto: '#1d666c',
    tono: 'Turquesa',
    lema: 'La competencia en acción',
    icono: '🔨',
    descripcion:
      'Habitas el territorio con autonomía y lo usas en situaciones reales de tu patrulla o Tropa.',
  },
  {
    id: 'conquisto',
    nombre: 'Conquisto',
    color: '#ce5229',
    colorSuave: '#f9e4db',
    colorTexto: '#8f3517',
    tono: 'Naranja',
    lema: 'El sello personal',
    icono: '🏆',
    descripcion:
      'Dominas el territorio y lo llevas a otro nivel: puedes enseñar a otros y generar transformaciones.',
  },
];

/** Ruta del parche oficial (hexágono) de una ruta en un nivel dado. */
export function insigniaRutaSrc(rutaId, nivelId) {
  return `${import.meta.env.BASE_URL}insignias/${rutaId}-${nivelId}.png`;
}

export const NIVEL_ORDEN = { descubro: 1, construyo: 2, conquisto: 3 };

export function nivelInfo(id) {
  return NIVELES.find((n) => n.id === id);
}

// Territorios que se necesitan conquistar en una ruta (mismo nivel)
// para que la ruta alcance ese nivel.
export const TERRITORIOS_POR_NIVEL = 2;

export const RUTAS = [
  {
    id: 'temple',
    nombre: 'Ruta del Temple',
    area: 'Desarrollo físico · Corporalidad',
    lema: 'Tu cuerpo, tu salud, tu seguridad',
    icono: '💪',
    color: '#c0392b',
    colorSuave: '#fbe3e0',
    descripcion:
      'Responsabilizarte del crecimiento y funcionamiento de tu cuerpo: actividad física, hábitos saludables, autocuidado y sexualidad.',
    territorios: [
      {
        id: 'temple-actividad',
        nombre: 'Actividad física',
        subtitulo: 'Un cuerpo y una mente equilibrada',
        icono: '🏃',
        competencia:
          'Participa en actividades físicas de manera regular, disfrutándolas como una forma de cuidar tu cuerpo, liberar tensiones y sentirte mejor contigo mismo, integrando hábitos saludables para tu vida diaria.',
        ejemplos: {
          descubro: [
            'Participa por primera vez en un circuito físico de la Tropa y pregúntate qué hábitos quieres incorporar.',
            'Prueba tres deportes o juegos de movimiento distintos y registra en tu diario cuál disfrutaste más y por qué.',
          ],
          construyo: [
            'Organiza un plan de entrenamiento de dos semanas con tu patrulla y propone ajustes para la siguiente.',
            'Mantén una rutina personal de actividad física durante un mes y comparte tus resultados en el consejo de patrulla.',
          ],
          conquisto: [
            'Diseña y facilita una sesión de movimiento para los Lobatos, adaptándola a distintas capacidades.',
            'Lidera la preparación física de tu patrulla para un campamento o competencia, enseñando calentamiento y ejercicios seguros.',
          ],
        },
      },
      {
        id: 'temple-habitos',
        nombre: 'Hábitos saludables',
        subtitulo: 'Higiene, sueño, alimentación, autocuidado',
        icono: '🥗',
        competencia:
          'Desarrolla hábitos de higiene y cuidado del cuerpo, rutinas de sueño adecuadas, alimentación equilibrada e identifica situaciones de riesgo para proteger tu salud y seguridad.',
        ejemplos: {
          descubro: [
            'Registra durante una semana tus horas de sueño, comidas e higiene, y descubre qué hábito quieres mejorar.',
            'Aprende a armar un menú de campamento balanceado con ayuda de tu guía de patrulla.',
          ],
          construyo: [
            'Planea y prepara con tu patrulla los menús saludables de un campamento completo.',
            'Sostén durante un mes una rutina de sueño e higiene que tú mismo diseñaste y evalúa cómo te sentiste.',
          ],
          conquisto: [
            'Enseña a tu patrulla o a scouts nuevos cómo planear alimentación e higiene para una excursión.',
            'Crea una campaña creativa de hábitos saludables para toda la Tropa y mide si algo cambió.',
          ],
        },
      },
      {
        id: 'temple-autocuidado',
        nombre: 'Autocuidado y ambientes seguros',
        subtitulo: 'A Salvo del Peligro (ASP)',
        icono: '🛡️',
        competencia:
          'Aplica normas de convivencia para garantizar ambientes seguros, desarrolla empatía para relacionarte de manera positiva y respetuosa con tu cuerpo y el de los demás, e identifica situaciones de riesgo, conociendo los pasos para protegerte y buscar apoyo.',
        ejemplos: {
          descubro: [
            'Conoce las normas de ambientes seguros de la Tropa y conversa con un dirigente sobre a quién acudir si algo te incomoda.',
            'Identifica en un juego de roles qué situaciones son seguras y cuáles son de riesgo.',
          ],
          construyo: [
            'Ayuda a construir con tu patrulla un acuerdo de convivencia y cuidado mutuo para un campamento.',
            'Reconoce una situación de riesgo real o simulada y aplica los pasos para buscar apoyo.',
          ],
          conquisto: [
            'Facilita una actividad para la Tropa sobre respeto, límites personales y ambientes seguros.',
            'Sé referente de cuidado en tu patrulla: los más nuevos saben que pueden acudir a ti y tú sabes canalizar la ayuda.',
          ],
        },
      },
      {
        id: 'temple-sexualidad',
        nombre: 'Sexualidad y cambios',
        subtitulo: 'Pubertad, respeto y límites',
        icono: '🌱',
        competencia:
          'Comprende los cambios de la pubertad, mostrando respeto por tu cuerpo y el de los demás, aprendiendo a establecer límites personales, identificando situaciones saludables o de riesgo y cuándo hablar de temas sensibles con adultos de confianza.',
        ejemplos: {
          descubro: [
            'Participa en una charla o taller sobre los cambios de la pubertad y anota las preguntas que te surgen.',
            'Identifica quiénes son tus adultos de confianza y en qué momentos acudirías a ellos.',
          ],
          construyo: [
            'Practica cómo poner límites personales con respeto en situaciones cotidianas de la Tropa o el colegio.',
            'Diferencia en casos reales o simulados qué relaciones son saludables y cuáles son de riesgo.',
          ],
          conquisto: [
            'Apoya un espacio de conversación entre pares sobre respeto al cuerpo y límites, junto a un dirigente.',
            'Ayuda a que en tu patrulla se hable con naturalidad y respeto de estos temas, orientando a dónde buscar información confiable.',
          ],
        },
      },
    ],
  },
  {
    id: 'ingenio',
    nombre: 'Ruta del Ingenio',
    area: 'Desarrollo intelectual · Creatividad',
    lema: 'Tu mente, tu creatividad, la tecnología',
    icono: '🧠',
    color: '#8e44ad',
    colorSuave: '#efe1f5',
    descripcion:
      'Adquirir habilidades para comprender, transformar y crear en tu entorno: innovación, mundo digital y pensamiento crítico.',
    territorios: [
      {
        id: 'ingenio-innovacion',
        nombre: 'Habilidades para la innovación',
        subtitulo: 'Ideas nuevas para desafíos reales',
        icono: '💡',
        competencia:
          'Aplica estrategias de pensamiento creativo para proponer soluciones novedosas a desafíos junto a tus pares, evaluando la viabilidad de tus ideas y comunicándolas de manera clara.',
        ejemplos: {
          descubro: [
            'Participa en una lluvia de ideas de tu patrulla y atrévete a proponer al menos una idea "loca".',
            'Prueba una técnica creativa nueva (mapa mental, prototipo con materiales reciclados) para resolver un reto del campamento.',
          ],
          construyo: [
            'Lidera la solución creativa de un problema real de tu patrulla (un rincón, una construcción, un juego nuevo) y evalúa si funcionó.',
            'Presenta al consejo de patrulla una propuesta con alternativas, explicando ventajas y desventajas.',
          ],
          conquisto: [
            'Facilita una sesión de creatividad para la Tropa y guía al grupo desde la idea hasta un plan viable.',
            'Diseña una innovación que quede instalada en la Tropa (un sistema, un invento, una tradición nueva) y enseña a otros a mantenerla.',
          ],
        },
      },
      {
        id: 'ingenio-digital',
        nombre: 'Era digital',
        subtitulo: 'Explorar, aprender y comunicarse en línea',
        icono: '💻',
        competencia:
          'Emplea herramientas digitales para explorar, aprender y comunicarte en línea de forma segura y guiada, comprendiendo los beneficios y riesgos de los entornos virtuales y colaborando en actividades digitales de tu cotidianidad.',
        ejemplos: {
          descubro: [
            'Explora con un adulto una herramienta digital nueva y conversa sobre sus riesgos y beneficios.',
            'Revisa la privacidad de tus redes o juegos en línea y descubre qué información estás compartiendo.',
          ],
          construyo: [
            'Usa herramientas digitales para organizar una actividad real de tu patrulla (mapa, presupuesto, invitación, video).',
            'Aplica prácticas de seguridad digital y ayuda a un compañero a configurar las suyas.',
          ],
          conquisto: [
            'Crea contenido digital útil para la Tropa (tutorial, blog, video de una técnica scout) cuidando derechos y seguridad.',
            'Enseña a otros scouts o a adultos de tu familia a usar una herramienta digital de forma segura.',
          ],
        },
      },
      {
        id: 'ingenio-critico',
        nombre: 'Pensamiento crítico',
        subtitulo: 'Analizar, dudar, argumentar',
        icono: '🧐',
        competencia:
          'Analiza información y argumentos presentes en diversos medios, identificando diferentes puntos de vista y formando juicios sobre su validez, para expresar tus propias conclusiones con argumentos y reconocer las repercusiones de tus opiniones en tu entorno cercano.',
        ejemplos: {
          descubro: [
            'Compara cómo dos medios distintos cuentan la misma noticia y descubre las diferencias.',
            'Aprende a detectar una cadena falsa o noticia dudosa antes de compartirla.',
          ],
          construyo: [
            'Participa en un debate de la Tropa defendiendo tu posición con argumentos y escuchando la contraria.',
            'Antes de una decisión de patrulla, investiga y presenta información verificada de al menos dos fuentes.',
          ],
          conquisto: [
            'Modera un debate o foro en la Tropa cuidando que todas las voces sean escuchadas.',
            'Crea una guía o taller para que otros scouts aprendan a verificar información en internet.',
          ],
        },
      },
    ],
  },
  {
    id: 'forja',
    nombre: 'Ruta de la Forja',
    area: 'Desarrollo del carácter · Carácter',
    lema: 'Tu identidad, tus valores, tu resiliencia',
    icono: '🔥',
    color: '#b0530f',
    colorSuave: '#f9e6d6',
    descripcion:
      'Construir una identidad sólida y actuar con integridad frente a desafíos personales y sociales: paz, autoconocimiento, resiliencia y resolución de conflictos.',
    territorios: [
      {
        id: 'forja-paz',
        nombre: 'Cultura de paz',
        subtitulo: 'Convivencia y respeto mutuo',
        icono: '🕊️',
        competencia:
          'Facilita la convivencia pacífica en tu entorno, practicando el respeto mutuo y la colaboración, resolviendo desacuerdos de manera constructiva.',
        ejemplos: {
          descubro: [
            'Identifica qué situaciones generan conflictos en tu patrulla y cómo sueles reaccionar tú.',
            'Participa en la construcción de las normas de convivencia de tu patrulla.',
          ],
          construyo: [
            'Ayuda a resolver un desacuerdo real entre compañeros usando el diálogo, sin tomar partido.',
            'Propón y aplica un "acuerdo de paz" de patrulla para los momentos de tensión en campamento.',
          ],
          conquisto: [
            'Actúa como mediador reconocido en tu patrulla o Tropa cuando hay conflictos.',
            'Diseña una actividad de cultura de paz para la Tropa o para tu colegio.',
          ],
        },
      },
      {
        id: 'forja-autoconocimiento',
        nombre: 'Autoconocimiento',
        subtitulo: 'Talentos, fortalezas y emociones',
        icono: '🪞',
        competencia:
          'Explora tus talentos, fortalezas y emociones, y analiza tus preferencias y motivaciones al participar en diversos espacios, interactuar con tus pares y reflexionar sobre tus experiencias personales.',
        ejemplos: {
          descubro: [
            'Haz tu "mapa personal": qué te gusta, qué se te facilita, qué te cuesta y qué te gustaría intentar.',
            'Después de una actividad exigente, registra en tu diario cómo te sentiste y qué aprendiste de ti.',
          ],
          construyo: [
            'Elige un rol en tu patrulla que use tus fortalezas y evalúa tu desempeño con tu guía.',
            'Identifica una emoción que te cueste manejar y practica una estrategia para gestionarla durante un mes.',
          ],
          conquisto: [
            'Acompaña a un scout más nuevo a descubrir sus talentos y proponerse retos.',
            'Comparte tu historia de crecimiento en un fogón o consejo de Tropa, inspirando a otros.',
          ],
        },
      },
      {
        id: 'forja-resiliencia',
        nombre: 'Resiliencia',
        subtitulo: 'Adaptarse y crecer con los cambios',
        icono: '🌊',
        competencia:
          'Aborda dificultades y cambios en tu entorno con disposición constructiva, explorando soluciones para superarlos y aprendiendo de la experiencia para mejorar en el futuro.',
        ejemplos: {
          descubro: [
            'Recuerda un cambio difícil que hayas vivido y conversa con alguien de confianza sobre cómo lo enfrentaste.',
            'En una actividad que salga mal (lluvia, plan caído), identifica qué se puede rescatar en lugar de rendirte.',
          ],
          construyo: [
            'Ante un imprevisto real en campamento, propone un plan B y ayúdale a tu patrulla a adaptarse.',
            'Ponte una meta personal exigente, persiste aunque falles al inicio y registra tu proceso en el diario.',
          ],
          conquisto: [
            'Anima y sostén a tu patrulla en momentos duros (una pérdida, una derrota, un campamento difícil).',
            'Enseña con tu ejemplo y palabras cómo convertir errores en aprendizaje: lidera la evaluación de una actividad fallida.',
          ],
        },
      },
      {
        id: 'forja-problemas',
        nombre: 'Resolución de problemas',
        subtitulo: 'Diálogo, creatividad, negociación',
        icono: '🧩',
        competencia:
          'Analiza problemas y conflictos cotidianos en tu entorno, identificando diferentes perspectivas y aplicando estrategias creativas para proponer soluciones, utilizando el diálogo y la negociación para llegar a entendimientos mutuos.',
        ejemplos: {
          descubro: [
            'Ante un problema de patrulla, aprende a separar los hechos de las opiniones antes de opinar.',
            'Escucha las dos versiones de un desacuerdo y descubre qué quiere realmente cada parte.',
          ],
          construyo: [
            'Aplica una estrategia paso a paso (definir el problema, opciones, acuerdo) para resolver un problema real de tu patrulla.',
            'Negocia un acuerdo justo en una situación donde tú también eres parte interesada.',
          ],
          conquisto: [
            'Guía a tu patrulla en la resolución de un problema complejo del proyecto o campamento.',
            'Enseña a otros una técnica de resolución de conflictos y úsala como referente de la Tropa.',
          ],
        },
      },
    ],
  },
  {
    id: 'lazos',
    nombre: 'Ruta de los Lazos',
    area: 'Desarrollo afectivo · Afectividad',
    lema: 'Tus emociones, tus relaciones, tu empatía',
    icono: '💞',
    color: '#c2185b',
    colorSuave: '#fbe0ec',
    descripcion:
      'Entender y gestionar las emociones y desarrollar relaciones afectivas positivas y responsables: igualdad, afectividad, empatía y autoestima.',
    territorios: [
      {
        id: 'lazos-igualdad',
        nombre: 'Igualdad de género',
        subtitulo: 'Convivencia igualitaria y derechos',
        icono: '⚖️',
        competencia:
          'Promueve la igualdad de género, entendiendo la importancia de una convivencia igualitaria donde se garanticen los derechos para todas las personas en los diferentes contextos en los que interactúas.',
        ejemplos: {
          descubro: [
            'Observa en tu Tropa, colegio o casa qué tareas se asignan "por ser niño o niña" y cuestiónalo en tu diario.',
            'Participa en una conversación sobre igualdad de género y comparte una situación que hayas visto.',
          ],
          construyo: [
            'Propón que los roles de tu patrulla (cocina, construcciones, liderazgo) se repartan por interés y no por género.',
            'Interviene con respeto cuando escuches burlas o comentarios que discriminen por género.',
          ],
          conquisto: [
            'Lidera una actividad de Tropa sobre igualdad y respeto para todas las personas.',
            'Sé referente de trato igualitario: los dirigentes y tu patrulla reconocen que promueves la equidad.',
          ],
        },
      },
      {
        id: 'lazos-afectividad',
        nombre: 'Responsabilidad afectiva',
        subtitulo: 'Emociones y relaciones sanas',
        icono: '❤️',
        competencia:
          'Identifica y comprende tus emociones construyendo relaciones afectivas, respetuosas y responsables, que integren el reconocimiento de tu sexualidad y la de los demás.',
        ejemplos: {
          descubro: [
            'Ponle nombre a tus emociones durante una semana: registra en tu diario qué sentiste y qué lo provocó.',
            'Identifica qué características tiene para ti una amistad sana.',
          ],
          construyo: [
            'Expresa lo que sientes de forma respetuosa en un momento difícil, en lugar de callarlo o explotar.',
            'Cuida una relación importante para ti (amigo, familiar) con acciones concretas durante un mes.',
          ],
          conquisto: [
            'Ayuda a un compañero a expresar lo que siente y a buscar apoyo cuando lo necesita.',
            'Promueve en tu patrulla un ambiente donde se pueda hablar de emociones sin burlas.',
          ],
        },
      },
      {
        id: 'lazos-empatia',
        nombre: 'Empatía',
        subtitulo: 'Ponerse en los zapatos del otro',
        icono: '🤗',
        competencia:
          'Comprende las emociones y perspectivas de otros en diversas situaciones, entendiendo sus necesidades y manifestando sensibilidad, respeto y colaboración en tus interacciones.',
        ejemplos: {
          descubro: [
            'Pregúntale a un compañero cómo se sintió en una actividad y escúchalo sin interrumpir ni juzgar.',
            'Identifica cuándo un compañero está triste o excluido en la Tropa.',
          ],
          construyo: [
            'Acompaña a un scout nuevo en sus primeras actividades hasta que se sienta parte de la patrulla.',
            'Ante un conflicto, expresa cómo crees que se siente la otra persona antes de dar tu opinión.',
          ],
          conquisto: [
            'Impulsa acciones de la patrulla para que nadie quede excluido (en juegos, campamentos y decisiones).',
            'Lidera un servicio donde la patrulla conozca de cerca una realidad distinta a la suya y reflexione.',
          ],
        },
      },
      {
        id: 'lazos-autoestima',
        nombre: 'Autoestima',
        subtitulo: 'Valorarte y valorar la diversidad',
        icono: '🌟',
        competencia:
          'Explora tus talentos y limitaciones, comprendiendo la influencia de tus emociones en tus relaciones y analizando la importancia del respeto mutuo y la valoración de la diversidad en tus grupos de pertenencia.',
        ejemplos: {
          descubro: [
            'Escribe en tu diario tres cosas que valoras de ti y una que quieras fortalecer.',
            'Recibe un reconocimiento o crítica y registra cómo te hizo sentir.',
          ],
          construyo: [
            'Atrévete a hacer algo que te daba pena (dirigir un juego, cantar en el fogón) y evalúa cómo te fue.',
            'Reconoce en voz alta los logros de tus compañeros en las evaluaciones de patrulla.',
          ],
          conquisto: [
            'Ayuda a un compañero a reconocer sus capacidades y a atreverse a nuevos retos.',
            'Promueve en la Tropa el respeto por las diferencias: cada scout vale por lo que es.',
          ],
        },
      },
    ],
  },
  {
    id: 'patrulla',
    nombre: 'Ruta de la Patrulla',
    area: 'Desarrollo social · Sociabilidad',
    lema: 'Tu equipo, tu liderazgo, el planeta',
    icono: '🤝',
    color: '#2c6e31',
    colorSuave: '#dff0e0',
    descripcion:
      'Adquirir el concepto de interdependencia con los demás y desarrollar la capacidad de cooperar y liderar: ambiente, liderazgo, trabajo en equipo e interculturalidad.',
    territorios: [
      {
        id: 'patrulla-ambiente',
        nombre: 'Sensibilidad ambiental',
        subtitulo: 'Desarrollo sostenible y acción climática',
        icono: '🌍',
        competencia:
          'Participa activamente en iniciativas grupales de cuidado ambiental, aplicando prácticas de cuidado climático en actividades prácticas y comprendiendo la relevancia de proteger la naturaleza para el bienestar común.',
        ejemplos: {
          descubro: [
            'Aplica el principio "no dejar rastro" en tu próxima excursión y registra qué fue lo más difícil.',
            'Investiga un problema ambiental de tu barrio o municipio y compártelo con tu patrulla.',
          ],
          construyo: [
            'Organiza con tu patrulla una acción ambiental concreta (siembra, limpieza de quebrada, reciclaje del local).',
            'Implementa una práctica sostenible permanente en los campamentos de tu patrulla.',
          ],
          conquisto: [
            'Lidera un proyecto ambiental de la Tropa con impacto medible en la comunidad.',
            'Enseña prácticas de campamento sostenible a otras patrullas o a la manada.',
          ],
        },
      },
      {
        id: 'patrulla-liderazgo',
        nombre: 'Liderazgo social',
        subtitulo: 'Innovación y cultura ciudadana',
        icono: '📣',
        competencia:
          'Participa activamente en iniciativas grupales que fomentan la cultura ciudadana, mostrando habilidades básicas de liderazgo en tu entorno.',
        ejemplos: {
          descubro: [
            'Asume por primera vez una pequeña responsabilidad visible: dirigir un juego, coordinar una fila, representar a tu patrulla.',
            'Observa a un líder que admires e identifica qué hace bien.',
          ],
          construyo: [
            'Coordina una actividad completa de tu patrulla, delegando tareas y evaluando el resultado.',
            'Participa en una iniciativa ciudadana o comunitaria representando a tu Tropa.',
          ],
          conquisto: [
            'Lidera un proyecto de servicio con impacto en la comunidad, desde la idea hasta la evaluación.',
            'Forma a otros scouts en habilidades de liderazgo (cómo delegar, motivar y evaluar).',
          ],
        },
      },
      {
        id: 'patrulla-equipo',
        nombre: 'Trabajo en equipo',
        subtitulo: 'Metas comunes, fortalezas de todos',
        icono: '⛺',
        competencia:
          'Colabora activamente en proyectos grupales, identificando las fortalezas y debilidades individuales para distribuir tareas y responsabilidades, comunicándote de manera efectiva y respetuosa para lograr metas comunes.',
        ejemplos: {
          descubro: [
            'Cumple tu cargo de patrulla durante un ciclo completo y evalúa cómo te fue.',
            'En una construcción de campamento, identifica qué aporta cada miembro de la patrulla.',
          ],
          construyo: [
            'Reparte las tareas de un proyecto de patrulla según las fortalezas de cada uno y haz seguimiento.',
            'Cuando el equipo se traba, propone soluciones en lugar de buscar culpables.',
          ],
          conquisto: [
            'Coordina un proyecto de patrulla de principio a fin (campamento, empresa, servicio) logrando la meta común.',
            'Ayuda a otra patrulla o equipo a organizarse mejor, compartiendo lo que tu patrulla aprendió.',
          ],
        },
      },
      {
        id: 'patrulla-intercultura',
        nombre: 'Interculturalidad',
        subtitulo: 'Riqueza de las culturas y respeto',
        icono: '🌐',
        competencia:
          'Valora la riqueza de las diversas expresiones culturales presentes en tu comunidad y en otros contextos, analizando cómo las costumbres, tradiciones y formas de vida influyen en la construcción de identidades, y manifestando respeto por las diferencias culturales.',
        ejemplos: {
          descubro: [
            'Investiga una tradición cultural de tu región y compártela en un fogón.',
            'Conoce la historia y costumbres de un compañero que venga de otra región o cultura.',
          ],
          construyo: [
            'Organiza con tu patrulla una actividad que celebre la diversidad cultural (comidas, músicas, juegos tradicionales).',
            'Participa en un intercambio con scouts de otra región o país (presencial o virtual).',
          ],
          conquisto: [
            'Lidera un proyecto que visibilice y valore una cultura de tu comunidad (indígena, afro, campesina, migrante).',
            'Representa a tu Tropa en un encuentro nacional o internacional y comparte lo aprendido.',
          ],
        },
      },
    ],
  },
  {
    id: 'horizonte',
    nombre: 'Ruta del Horizonte',
    area: 'Desarrollo espiritual · Espiritualidad',
    lema: 'Tu sentido de vida, tu trascendencia',
    icono: '🌄',
    color: '#34568b',
    colorSuave: '#e0e8f5',
    descripcion:
      'Descubrir el significado trascendental de la vida y actuar en coherencia con los valores fundamentales: respeto por la vida, crecimiento espiritual y trascendencia.',
    territorios: [
      {
        id: 'horizonte-vida',
        nombre: 'Respeto por la vida',
        subtitulo: 'El valor único de cada ser vivo',
        icono: '🌿',
        competencia:
          'Reconoce el valor único de cada ser vivo, reflexionando sobre el impacto de las acciones humanas en su existencia y manifestando un trato considerado y respetuoso en tus interacciones con ellos.',
        ejemplos: {
          descubro: [
            'Observa en silencio la naturaleza durante una excursión y registra en tu diario lo que descubriste.',
            'Reflexiona sobre cómo tus acciones diarias afectan a otros seres vivos.',
          ],
          construyo: [
            'Adopta una práctica concreta de respeto por la vida (cuidar un animal, proteger una zona verde) y sostenla.',
            'Promueve en tu patrulla el trato respetuoso a los seres vivos en campamentos y excursiones.',
          ],
          conquisto: [
            'Lidera una reflexión de Tropa sobre el valor de la vida a partir de una experiencia en la naturaleza.',
            'Impulsa un compromiso permanente de tu Tropa con el respeto por los seres vivos.',
          ],
        },
      },
      {
        id: 'horizonte-espiritual',
        nombre: 'Crecimiento espiritual',
        subtitulo: 'Sentido, creencias y diálogo',
        icono: '🕯️',
        competencia:
          'Explora prácticas personales de entendimiento sobre tus experiencias vitales y aprendizajes, el sentido de la vida y la existencia, y participa en diálogos con diversas perspectivas, respetando las diferentes creencias y compartiendo tus reflexiones.',
        ejemplos: {
          descubro: [
            'Participa en una reflexión o momento espiritual de la Tropa y registra qué te dejó pensando.',
            'Pregunta a personas de distintas creencias qué da sentido a sus vidas y escucha con respeto.',
          ],
          construyo: [
            'Encuentra tu propia práctica de reflexión (escribir, orar, meditar, caminar) y sostenla un tiempo.',
            'Comparte en tu patrulla una reflexión personal sobre una experiencia que te marcó.',
          ],
          conquisto: [
            'Prepara y guía un momento de reflexión o fogón espiritual para la Tropa, respetando todas las creencias.',
            'Acompaña a otros scouts a hacerse preguntas profundas sin imponer tus respuestas.',
          ],
        },
      },
      {
        id: 'horizonte-trascendencia',
        nombre: 'Trascendencia',
        subtitulo: 'Tu propósito y tu huella',
        icono: '🧭',
        competencia:
          'Identifica y reflexiona sobre tus valores y creencias, explorando tu propósito personal y tu rol en los espacios en que participas.',
        ejemplos: {
          descubro: [
            'Escribe en tu diario qué valores de la Ley Scout sientes más tuyos y por qué.',
            'Reflexiona: ¿qué huella te gustaría dejar en tu patrulla este año?',
          ],
          construyo: [
            'Define un propósito personal para el ciclo de programa y revisa tu avance con tu dirigente.',
            'Actúa en coherencia: identifica una situación donde tus valores se pusieron a prueba y cómo respondiste.',
          ],
          conquisto: [
            'Renueva tu Promesa Scout con plena conciencia de lo que significa para tu vida.',
            'Inspira con tu ejemplo: tu patrulla te reconoce como alguien que vive la Ley Scout dentro y fuera del movimiento.',
          ],
        },
      },
    ],
  },
];

// ---------- Fases de progresión (Tabla 8.7) ----------
// requisitos: cantidades mínimas de rutas cuyo nivel alcanzado es AL MENOS el indicado.
// La verificación asigna rutas distintas a cada requisito (de mayor a menor exigencia).
export const INSIGNIAS = [
  {
    id: 'vigia',
    orden: 1,
    nombre: 'Vigía del Valle',
    icono: '🏕️',
    imagen: `${import.meta.env.BASE_URL}insignias/fase-vigia.png`,
    color: '#f6c429',
    requisitoTexto:
      'Al menos 3 rutas en Descubro (mostaza) + al menos 1 ruta en Construyo (turquesa).',
    requisitos: [
      { nivel: 'construyo', cantidad: 1 },
      { nivel: 'descubro', cantidad: 3 },
    ],
  },
  {
    id: 'explorador',
    orden: 2,
    nombre: 'Explorador de Cumbres',
    icono: '⛰️',
    imagen: `${import.meta.env.BASE_URL}insignias/fase-explorador.png`,
    color: '#06abb5',
    requisitoTexto:
      'Al menos 3 rutas en Descubro (mostaza) + 3 rutas en Construyo (turquesa).',
    requisitos: [
      { nivel: 'construyo', cantidad: 3 },
      { nivel: 'descubro', cantidad: 3 },
    ],
  },
  {
    id: 'navegante',
    orden: 3,
    nombre: 'Navegante de Horizontes',
    icono: '🧭',
    imagen: `${import.meta.env.BASE_URL}insignias/fase-navegante.png`,
    color: '#df3f06',
    requisitoTexto:
      'Al menos 3 rutas en Construyo (turquesa) + 3 rutas en Conquisto (naranja).',
    requisitos: [
      { nivel: 'conquisto', cantidad: 3 },
      { nivel: 'construyo', cantidad: 3 },
    ],
  },
  {
    id: 'maestro',
    orden: 4,
    nombre: 'Maestro de la Aventura',
    icono: '🏅',
    imagen: `${import.meta.env.BASE_URL}insignias/fase-maestro.png`,
    color: '#819b1e',
    esMaxima: true,
    requisitoTexto: 'Las 6 Rutas completas en nivel Conquisto (naranja).',
    requisitos: [{ nivel: 'conquisto', cantidad: 6 }],
  },
];

// ---------- Rol del dirigente según el nivel ----------
export const ROLES_DIRIGENTE = [
  {
    nivel: 'descubro',
    rol: 'Apoyo',
    icono: '🧰',
    estilo: 'Reactivo y disponible. El scout debe descubrir por sí mismo, probar y equivocarse sin miedo.',
    acciones:
      'Provee recursos variados · responde cuando solicita orientación · valida la exploración.',
  },
  {
    nivel: 'construyo',
    rol: 'Acompañamiento',
    icono: '🚶',
    estilo: 'Más activo y constante. El scout necesita orientación para transferir lo aprendido a situaciones reales.',
    acciones:
      'Observa sistemáticamente · retroalimenta · guía la reflexión · acompaña decisiones.',
  },
  {
    nivel: 'conquisto',
    rol: 'Enlace',
    icono: '🔗',
    estilo: 'Proactivo, como facilitador de conexiones. El scout ya tiene autonomía y busca especialización.',
    acciones:
      'Conecta con expertos · abre oportunidades externas · facilita mentoría · apoya la exploración vocacional.',
  },
];

// ---------- Utilidades ----------
const territorioIndex = {};
const rutaDeTerritorio = {};
for (const ruta of RUTAS) {
  for (const t of ruta.territorios) {
    territorioIndex[t.id] = t;
    rutaDeTerritorio[t.id] = ruta;
  }
}

export function getTerritorio(id) {
  return territorioIndex[id];
}

export function getRutaDeTerritorio(territorioId) {
  return rutaDeTerritorio[territorioId];
}

export function getRuta(id) {
  return RUTAS.find((r) => r.id === id);
}
