import { Question } from '@/types/assessment';

// ─── Preguntas de madurez PLM ──────────────────────────────────
// 4 dimensiones × 2 preguntas + 1 de prioridad = 9 preguntas

export const questionsPLM: Question[] = [
    // ── Dimensión 1: Procesos ──
    {
        id: 'plm-proc-1',
        dimension: 'procesos',
        text: '¿Cómo se ejecuta y documenta el proceso cuando se requiere un cambio de ingeniería en un producto?',
        help: 'Se refiere a qué pasa cuando necesitan modificar el diseño de un producto que ya está en fabricación. Piense en cómo se comunica y aprueba ese cambio internamente.',
        type: 'options',
        options: [
            { level: 1, title: 'Correos e impresos', description: 'Se maneja mediante correos electrónicos o documentos impresos sin un sistema centralizado de trazabilidad.' },
            { level: 2, title: 'PDM sin notificación', description: 'Los cambios se documentan formalmente en un sistema de ingeniería (PDM), pero no notifican automáticamente a producción.' },
            { level: 3, title: 'Workflow automatizado', description: 'Existe un flujo automatizado (workflow) que rutea la Orden de Cambio (ECO) a través de todos los aprobadores requeridos.' },
            { level: 4, title: 'Actualización automática', description: 'El cambio en el diseño actualiza automáticamente los requerimientos y secuencias de ensamblaje en los sistemas de manufactura.' },
            { level: 5, title: 'Análisis predictivo', description: 'El análisis de impacto del cambio es predictivo, evaluando instantáneamente el efecto en costos, inventario y proveedores.' },
        ],
    },
    {
        id: 'plm-proc-2',
        dimension: 'procesos',
        text: '¿Cómo se gestiona la traducción de la lista de materiales de diseño (eBOM) hacia manufactura (mBOM)?',
        help: 'La lista de materiales es como la receta de un producto: dice qué piezas lleva. Esta pregunta evalúa cómo pasan esa "receta" del equipo de diseño al equipo de fabricación.',
        type: 'options',
        options: [
            { level: 1, title: 'Transcripción manual', description: 'La lista de materiales se transcribe manualmente de los planos de ingeniería a planillas de Excel.' },
            { level: 2, title: 'Exportación y ajuste', description: 'La eBOM se exporta del CAD y se ajusta manualmente antes de cargarla de forma masiva (batch) al ERP.' },
            { level: 3, title: 'Coexistencia en PLM', description: 'La eBOM y la mBOM coexisten en el sistema PLM; las transformaciones y equivalencias están gobernadas por reglas.' },
            { level: 4, title: 'Sincronización continua', description: 'Existe una sincronización continua; una actualización en la eBOM impacta dinámicamente la mBOM en el sistema de planta (MES).' },
            { level: 5, title: 'Configure-to-Order', description: 'Las BOMs están configuradas para ser hiper-personalizables según la demanda (Configure-to-Order) de forma automatizada.' },
        ],
    },
    // ── Dimensión 2: Personas ──
    {
        id: 'plm-pers-1',
        dimension: 'personas',
        text: '¿En qué fase del desarrollo de producto se integran las áreas de manufactura, compras y calidad?',
        help: 'Evalúa en qué momento del diseño de un producto participan los equipos de fábrica, compras y calidad. Lo ideal es que colaboren desde el inicio y no solo al final.',
        type: 'options',
        options: [
            { level: 1, title: 'Trabajo en silos', description: 'Trabajan en silos; manufactura y compras reciben los planos únicamente cuando el diseño ya fue congelado.' },
            { level: 2, title: 'Reuniones sobre modelos estáticos', description: 'Existen reuniones de revisión de diseño, pero las áreas operativas interactúan sobre modelos estáticos o presentaciones.' },
            { level: 3, title: 'Comité multidisciplinario', description: 'Un comité multidisciplinario participa formalmente en la revisión y aprobación de las configuraciones del producto a través del PLM.' },
            { level: 4, title: 'Ingeniería concurrente', description: 'Las áreas operativas diseñan los procesos de ensamble e inspección en paralelo al desarrollo del producto (Ingeniería Concurrente).' },
            { level: 5, title: 'Squads transversales', description: 'La empresa opera con equipos de ciclo de vida transversales (Squads) donde no existen fronteras entre diseño y operación.' },
        ],
    },
    {
        id: 'plm-pers-2',
        dimension: 'personas',
        text: '¿Cómo se gestiona la colaboración de diseño técnico con proveedores externos?',
        help: 'Pregunta cómo comparten información técnica de diseño con sus proveedores. Puede ser desde enviar PDFs por correo hasta permitirles trabajar directamente en el mismo sistema de diseño.',
        type: 'options',
        options: [
            { level: 1, title: 'PDFs por correo', description: 'Se envían planos estáticos (PDFs) por correo electrónico, lo que frecuentemente genera errores de versión con los proveedores.' },
            { level: 2, title: 'Carpetas FTP', description: 'Los proveedores acceden a carpetas compartidas externas (FTPs) para descargar los archivos CAD bajo demanda.' },
            { level: 3, title: 'Portales PLM seguros', description: 'Se utilizan portales seguros donde los proveedores pueden visualizar y aprobar especificaciones controladas por el PLM.' },
            { level: 4, title: 'Co-desarrollo directo', description: 'Los proveedores estratégicos tienen acceso directo al entorno de diseño y co-desarrollan componentes de forma colaborativa.' },
            { level: 5, title: 'Cadena integrada', description: 'La cadena de suministro opera como una extensión nativa; la telemetría de calidad del proveedor alimenta los modelos de R&D.' },
        ],
    },
    // ── Dimensión 3: Herramientas ──
    {
        id: 'plm-herr-1',
        dimension: 'herramientas',
        text: '¿Dónde reside centralizada la documentación técnica y las iteraciones de diseño del producto?',
        help: 'Se refiere al lugar donde guardan todos los archivos de diseño, especificaciones y versiones de sus productos. Puede ser en computadoras individuales o en una plataforma centralizada.',
        type: 'options',
        options: [
            { level: 1, title: 'Discos locales', description: 'En discos duros locales de los ingenieros o en servidores de red genéricos sin control estructurado de accesos.' },
            { level: 2, title: 'PDM local', description: 'En un sistema local de Gestión de Datos de Producto (PDM) enfocado estrictamente en resguardar el historial de archivos CAD.' },
            { level: 3, title: 'PLM corporativo', description: 'En una plataforma PLM corporativa que consolida modelos CAD, especificaciones de calidad, software embebido y empaquetado.' },
            { level: 4, title: 'Componentes reutilizables', description: 'El PLM aloja un portafolio de componentes estandarizados y reutilizables que agilizan el diseño de nuevas variantes.' },
            { level: 5, title: 'Gemelo Digital', description: 'En plataformas de Gemelo Digital que fusionan el modelo 3D teórico con el historial de mantenimiento real del producto.' },
        ],
    },
    {
        id: 'plm-herr-2',
        dimension: 'herramientas',
        text: '¿Cómo se comunican las herramientas de diseño con los sistemas operativos (ERP/MES)?',
        help: 'Evalúa si los programas de diseño de producto hablan automáticamente con los sistemas de administración y manufactura, o si hay que pasar la información a mano entre ellos.',
        type: 'options',
        options: [
            { level: 1, title: 'Digitación manual', description: 'No hay comunicación; los datos de diseño deben digitarse manualmente en los sistemas transaccionales.' },
            { level: 2, title: 'Cargas por lotes', description: 'Se realizan cargas manuales por lotes (ej. subida de archivos CSV) desde el repositorio de diseño hacia el ERP.' },
            { level: 3, title: 'Integración punto a punto', description: 'Existe una integración estructurada punto a punto; cuando se aprueba un diseño en PLM, se libera el código de artículo en el ERP.' },
            { level: 4, title: 'Bidireccional continua', description: 'Integración bidireccional continua nativa; el diseñador puede ver niveles de inventario y costos del ERP dentro de su interfaz CAD.' },
            { level: 5, title: 'Hilo Digital completo', description: 'Ecosistema completamente conectado; las herramientas operan bajo una arquitectura de Hilo Digital (Digital Thread) sin fisuras.' },
        ],
    },
    // ── Dimensión 4: Tecnología ──
    {
        id: 'plm-tech-1',
        dimension: 'tecnologia',
        text: '¿Qué tipo de arquitectura de TI soporta sus sistemas de ciclo de vida del producto?',
        help: 'Se refiere a la infraestructura tecnológica donde corren sus sistemas de diseño y gestión de productos. Puede ser desde computadoras individuales hasta plataformas en la nube.',
        type: 'options',
        options: [
            { level: 1, title: 'Standalone', description: 'Estaciones de trabajo individuales desconectadas con software instalado localmente (Standalone).' },
            { level: 2, title: 'Cliente-servidor local', description: 'Arquitectura tradicional cliente-servidor alojada en centros de datos físicos dentro de las instalaciones (On-Premise).' },
            { level: 3, title: 'Máquinas virtuales', description: 'Arquitectura empresarial robusta con despliegues en máquinas virtuales que permiten escalabilidad vertical.' },
            { level: 4, title: 'Cloud/SaaS nativo', description: 'Plataformas PLM nativas de la nube (Cloud/SaaS), basadas en microservicios y APIs REST que garantizan actualizaciones continuas.' },
            { level: 5, title: 'Plataformas componibles', description: 'Plataformas componibles que permiten a la empresa ensamblar su propia arquitectura utilizando bloques tecnológicos modulares.' },
        ],
    },
    {
        id: 'plm-tech-2',
        dimension: 'tecnologia',
        text: '¿Qué tecnologías emplean para recuperar datos de rendimiento del producto físico?',
        help: 'Pregunta cómo obtienen información sobre el desempeño de sus productos una vez que están en manos del cliente. Desde quejas en papel hasta sensores que envían datos automáticamente.',
        type: 'options',
        options: [
            { level: 1, title: 'Garantías en papel', description: 'Únicamente reclamaciones de garantía en papel y llamadas al centro de servicio al cliente.' },
            { level: 2, title: 'Tickets de mantenimiento', description: 'Registros de intervenciones de mantenimiento guardados en sistemas de tickets aislados.' },
            { level: 3, title: 'Análisis de calidad', description: 'Herramientas de análisis de calidad que correlacionan estadísticamente las fallas de campo con lotes de manufactura.' },
            { level: 4, title: 'IoT unidireccional', description: 'Sensores integrados en el producto (IoT) que transmiten alertas de diagnóstico de forma unidireccional.' },
            { level: 5, title: 'IIoT Closed-Loop', description: 'Plataformas de Internet de las Cosas Industrial (IIoT) que alimentan la telemetría en tiempo real (Closed-Loop) a los ingenieros de diseño.' },
        ],
    },
    // ── Pregunta de prioridad ──
    {
        id: 'plm-priority',
        dimension: 'procesos',
        text: 'Para cumplir los objetivos estratégicos de la empresa este año, ¿qué tan importante es mejorar las capacidades de PLM?',
        help: 'Indique qué tan urgente y estratégico es para su empresa mejorar la gestión del ciclo de vida de sus productos durante el próximo año.',
        type: 'priority',
    },
];
