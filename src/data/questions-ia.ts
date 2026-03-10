import { Question } from '@/types/assessment';

// ─── Preguntas de madurez IA / RPA ─────────────────────────────
// 4 dimensiones × 2 preguntas + 1 de prioridad = 9 preguntas

export const questionsIA: Question[] = [
    // ── Dimensión 1: Procesos ──
    {
        id: 'ia-proc-1',
        dimension: 'procesos',
        text: '¿Cómo se identifica y prioriza la ejecución de iniciativas de automatización e IA en la organización?',
        help: 'Se refiere al método que usa su empresa para decidir qué tareas automatizar o mejorar con inteligencia artificial. Piense en si es algo planificado o si surge cuando hay un problema urgente.',
        type: 'options',
        options: [
            { level: 1, title: 'Ad-hoc', description: 'No existe un proceso formal; las iniciativas surgen de forma ad-hoc según la necesidad del momento.' },
            { level: 2, title: 'Pilotos aislados', description: 'Se ejecutan pilotos aislados de manera oportunista cuando un área específica tiene presupuesto o un problema crítico.' },
            { level: 3, title: 'Centro de Excelencia', description: 'Existe un proceso sistemático de priorización guiado por un Centro de Excelencia (CoE) basado en el caso de negocio.' },
            { level: 4, title: 'Estrategia con ROI', description: 'La automatización está embebida en la planificación estratégica; se prioriza mediante medición continua y estricta del ROI.' },
            { level: 5, title: 'Auto-optimización', description: 'Las iniciativas son identificadas proactivamente por sistemas de minería de procesos que sugieren auto-optimizaciones.' },
        ],
    },
    {
        id: 'ia-proc-2',
        dimension: 'procesos',
        text: '¿Bajo qué lineamientos se asegura la calidad y disponibilidad de los datos utilizados?',
        help: 'Evalúa si su empresa tiene reglas claras sobre quién es responsable de los datos, cómo se mantienen limpios y organizados, y si están disponibles cuando se necesitan.',
        type: 'options',
        options: [
            { level: 1, title: 'Sin gobernanza', description: 'No hay gobernanza; los datos están fragmentados y no existen responsables definidos de su calidad.' },
            { level: 2, title: 'Limpieza reactiva', description: 'Se realizan esfuerzos de limpieza de datos manuales y reactivos únicamente cuando se va a lanzar un proyecto específico.' },
            { level: 3, title: 'Políticas establecidas', description: 'Contamos con políticas de gobernanza establecidas y diccionarios de datos centralizados.' },
            { level: 4, title: 'Datos como producto', description: 'Tratamos los datos como un producto auditado; la arquitectura garantiza alta calidad y disponibilidad para modelos avanzados.' },
            { level: 5, title: 'Gobernanza predictiva', description: 'La gobernanza es predictiva; los sistemas detectan anomalías y corrigen la integridad de los datos sin intervención humana.' },
        ],
    },
    // ── Dimensión 2: Personas ──
    {
        id: 'ia-pers-1',
        dimension: 'personas',
        text: '¿Cómo está formalizado el talento humano encargado del desarrollo analítico y de automatización?',
        help: 'Pregunta si su empresa tiene personas contratadas específicamente para trabajar en automatización e inteligencia artificial, o si son empleados que lo hacen por iniciativa propia sin que sea su rol oficial.',
        type: 'options',
        options: [
            { level: 1, title: 'Shadow IT', description: 'El desarrollo recae en el esfuerzo no oficial de empleados ("Shadow IT") sin reconocimiento formal.' },
            { level: 2, title: 'Entusiastas informales', description: 'Contamos con entusiastas liderando iniciativas, pero sin cargos oficiales de automatización o datos en su contrato.' },
            { level: 3, title: 'Roles especializados', description: 'Hemos oficializado roles especializados (ej. Científicos de Datos, Desarrolladores RPA) dentro del organigrama.' },
            { level: 4, title: 'Desarrolladores ciudadanos', description: 'Existen programas estructurados de "Desarrolladores Ciudadanos" que habilitan a los usuarios de negocio a crear soluciones.' },
            { level: 5, title: 'Equipos de innovación IA', description: 'Contamos con equipos multidisciplinarios dedicados 100% a la innovación disruptiva y a la creación de productos IA.' },
        ],
    },
    {
        id: 'ia-pers-2',
        dimension: 'personas',
        text: '¿Cuál es el nivel de adopción cultural del personal de negocio frente a estas tecnologías?',
        help: 'Mide qué tanto el personal de la empresa confía y usa las herramientas de automatización e inteligencia artificial en su trabajo diario, o si por el contrario hay resistencia o desinterés.',
        type: 'options',
        options: [
            { level: 1, title: 'Resistencia', description: 'Existe resistencia, temor al desplazamiento laboral y escepticismo sobre la utilidad de los datos.' },
            { level: 2, title: 'Interés aislado', description: 'Hay interés en áreas puntuales, pero la organización general aún ve a la IA/RPA como "un tema exclusivo de TI".' },
            { level: 3, title: 'Colaboración activa', description: 'El personal comprende el valor de las iniciativas y colabora formalmente en la definición de las reglas de negocio.' },
            { level: 4, title: 'Cultura AI-First', description: 'La cultura es "AI-First"; el personal exige soluciones basadas en datos y participa fluidamente con los equipos técnicos.' },
            { level: 5, title: 'Cambio continuo', description: 'La cultura abraza el cambio continuo; el personal confía plenamente en la colaboración con agentes autónomos.' },
        ],
    },
    // ── Dimensión 3: Herramientas ──
    {
        id: 'ia-herr-1',
        dimension: 'herramientas',
        text: '¿Qué plataformas conforman su núcleo para la automatización de tareas operativas?',
        help: 'Se refiere a los programas o sistemas que usa su empresa para que las computadoras realicen tareas repetitivas de forma automática, como procesar facturas o llenar formularios.',
        type: 'options',
        options: [
            { level: 1, title: 'Ofimática y macros', description: 'Uso exclusivo de herramientas ofimáticas (Excel), macros locales y scripts básicos.' },
            { level: 2, title: 'RPA de escritorio', description: 'Herramientas de RPA de escritorio implementadas mediante licencias individuales no centralizadas.' },
            { level: 3, title: 'Orquestadores RPA', description: 'Orquestadores RPA empresariales centralizados que administran y auditan múltiples flujos simultáneamente.' },
            { level: 4, title: 'Low-Code / No-Code', description: 'Ecosistemas gestionados que combinan orquestadores avanzados con herramientas Low-Code/No-Code.' },
            { level: 5, title: 'Agentes virtuales', description: 'Plataformas de orquestación de Agentes Virtuales que interactúan nativamente con sistemas transaccionales.' },
        ],
    },
    {
        id: 'ia-herr-2',
        dimension: 'herramientas',
        text: '¿Qué tipo de herramientas utilizan para el almacenamiento y análisis de información?',
        help: 'Pregunta por las herramientas que usa su empresa para guardar grandes cantidades de datos y obtener conclusiones útiles de ellos, desde hojas de cálculo hasta plataformas avanzadas en la nube.',
        type: 'options',
        options: [
            { level: 1, title: 'Hojas de cálculo', description: 'Hojas de cálculo y bases de datos transaccionales simples para generar reportes estáticos.' },
            { level: 2, title: 'BI tradicional', description: 'Herramientas de visualización (BI tradicional) conectadas a extracciones de datos esporádicas.' },
            { level: 3, title: 'Data Warehouse Cloud', description: 'Bodegas de datos estructuradas (Data Warehouses) conectadas a plataformas Cloud empresariales.' },
            { level: 4, title: 'MLOps', description: 'Plataformas MLOps que permiten el ciclo de vida completo de modelos de Machine Learning (desarrollo, despliegue y monitoreo).' },
            { level: 5, title: 'Ecosistema en tiempo real', description: 'Ecosistemas dinámicos de análisis que utilizan datos externos y telemetría en tiempo real de la industria.' },
        ],
    },
    // ── Dimensión 4: Tecnología ──
    {
        id: 'ia-tech-1',
        dimension: 'tecnologia',
        text: '¿Qué nivel de inteligencia cognitiva poseen las soluciones de automatización en producción?',
        help: 'Evalúa qué tan "inteligentes" son los procesos automáticos de su empresa. Desde reglas simples tipo "si pasa esto, haz aquello", hasta sistemas que aprenden y se adaptan solos.',
        type: 'options',
        options: [
            { level: 1, title: 'Reglas estáticas', description: 'Automatización rígida basada 100% en reglas estáticas (Si/Entonces).' },
            { level: 2, title: 'Reglas + OCR básico', description: 'Automatización basada en reglas apoyada por digitalización simple de documentos (OCR básico).' },
            { level: 3, title: 'NLP integrado', description: 'Automatizaciones que incorporan Procesamiento de Lenguaje Natural (NLP) para clasificar y enrutar información.' },
            { level: 4, title: 'Visión + IA Generativa', description: 'Procesos integrados con Visión Artificial avanzada o IA Generativa (RAG) para toma de decisiones complejas.' },
            { level: 5, title: 'Multi-Agente adaptativo', description: 'Sistemas adaptativos e Inteligencia de Enjambre (Multi-Agente) que ajustan su comportamiento ante excepciones.' },
        ],
    },
    {
        id: 'ia-tech-2',
        dimension: 'tecnologia',
        text: '¿Qué tipo de modelos predictivos o analíticos se encuentran desplegados?',
        help: 'Pregunta si su empresa usa programas que predicen resultados futuros basados en datos. Puede ir desde no usarlos, hasta tener modelos propios que aprenden y mejoran automáticamente.',
        type: 'options',
        options: [
            { level: 1, title: 'Solo descriptivos', description: 'No utilizamos modelos predictivos; nos basamos puramente en análisis de datos históricos (descriptivos).' },
            { level: 2, title: 'APIs de terceros', description: 'Consumimos modelos pre-entrenados genéricos de terceros a través de APIs públicas.' },
            { level: 3, title: 'ML clásico propio', description: 'Desarrollamos e implementamos nuestros propios modelos de Machine Learning clásico (regresiones, clasificaciones).' },
            { level: 4, title: 'Deep Learning propio', description: 'Desplegamos modelos avanzados de Deep Learning entrenados con nuestro propio corpus de datos corporativos.' },
            { level: 5, title: 'Modelos en tiempo real', description: 'Operamos con modelos predictivos y prospectivos en tiempo real que se re-entrenan automáticamente.' },
        ],
    },
    // ── Pregunta de prioridad ──
    {
        id: 'ia-priority',
        dimension: 'procesos',
        text: 'Para cumplir los objetivos estratégicos de la empresa este año, ¿qué tan importante es mejorar las capacidades en IA/RPA?',
        help: 'Indique qué tan urgente y estratégico es para su empresa mejorar en inteligencia artificial y automatización durante el próximo año.',
        type: 'priority',
    },
];
