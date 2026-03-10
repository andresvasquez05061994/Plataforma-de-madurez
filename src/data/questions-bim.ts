import { Question } from '@/types/assessment';

// ─── Preguntas de madurez BIM ──────────────────────────────────
// 4 dimensiones × 2 preguntas + 1 de prioridad = 9 preguntas

export const questionsBim: Question[] = [
    // ── Dimensión 1: Procesos ──
    {
        id: 'bim-proc-1',
        dimension: 'procesos',
        text: '¿Cómo se gestiona el intercambio de la documentación del diseño entre los actores del proyecto?',
        help: 'Se refiere a cómo comparten planos, modelos y documentos entre las personas que participan en un proyecto. Piense en si usan correo, carpetas en la nube o una plataforma especializada.',
        type: 'options',
        options: [
            { level: 1, title: 'Desestructurado', description: 'El intercambio es desestructurado y manual, utilizando correos electrónicos, discos extraíbles o impresiones.' },
            { level: 2, title: 'Repositorio genérico', description: 'El intercambio se realiza de forma periódica mediante subidas manuales a repositorios genéricos en la nube.' },
            { level: 3, title: 'Flujo formal (BEP)', description: 'Existe un flujo formal regido por un Plan de Ejecución BIM (BEP), utilizando estados de aprobación definidos (ISO 19650).' },
            { level: 4, title: 'Integración 4D/5D', description: 'El flujo de información integra formalmente y sin reprocesos la gestión del tiempo (4D) y las estimaciones de costo (5D).' },
            { level: 5, title: 'Entrega para operación', description: 'El flujo abarca la entrega estructurada de datos (COBie) para la operación continua del activo construido (6D/7D).' },
        ],
    },
    {
        id: 'bim-proc-2',
        dimension: 'procesos',
        text: '¿Cómo se ejecuta el proceso de detección y resolución de interferencias multidisciplinares?',
        help: 'Cuando varios especialistas diseñan al mismo tiempo (estructura, instalaciones, arquitectura), sus diseños pueden chocar entre sí. Esta pregunta evalúa cómo detectan y resuelven esos choques.',
        type: 'options',
        options: [
            { level: 1, title: 'Visual en 2D', description: 'La detección se hace visualmente sobre planos 2D; los errores se descubren principalmente durante la construcción.' },
            { level: 2, title: 'Superposición reactiva', description: 'Se realizan superposiciones de modelos 3D de manera reactiva, generando reportes manuales esporádicos.' },
            { level: 3, title: 'Coordinación estructurada', description: 'Se ejecutan sesiones de coordinación estructuradas y periódicas sobre modelos federados con herramientas automatizadas.' },
            { level: 4, title: 'Resolución en tiempo real', description: 'La resolución de interferencias ocurre en la nube en tiempo real; los contratistas participan antes de pisar la obra.' },
            { level: 5, title: 'Diseño generativo', description: 'El sistema utiliza algoritmos de diseño generativo para proponer rutados óptimos que evitan colisiones por defecto.' },
        ],
    },
    // ── Dimensión 2: Personas ──
    {
        id: 'bim-pers-1',
        dimension: 'personas',
        text: '¿Qué nivel de formalización tienen los roles especializados en metodología BIM?',
        help: 'Evalúa si en su organización existen cargos dedicados a liderar la implementación BIM, o si cada persona asume ese rol de manera informal sin una estructura clara.',
        type: 'options',
        options: [
            { level: 1, title: 'Dibujantes CAD 2D', description: 'El equipo está compuesto principalmente por dibujantes CAD 2D sin entrenamiento formal en modelado paramétrico.' },
            { level: 2, title: 'Modeladores sin liderazgo', description: 'Existen modeladores BIM en las áreas de diseño, pero no hay un liderazgo metodológico central.' },
            { level: 3, title: 'BIM Managers formales', description: 'El organigrama cuenta con BIM Managers y Coordinadores que lideran y auditan la estrategia de los proyectos.' },
            { level: 4, title: 'Equipo de obra capacitado', description: 'Todo el equipo de obra (residentes, directores) está capacitado para consumir y auditar el modelo directamente.' },
            { level: 5, title: 'Roles avanzados', description: 'La organización cuenta con roles de Científicos de Datos Urbanos o Gestores de Gemelos Digitales.' },
        ],
    },
    {
        id: 'bim-pers-2',
        dimension: 'personas',
        text: '¿En qué fase se integra la experiencia de subcontratistas, fabricantes y clientes al modelo?',
        help: 'Se refiere a en qué momento del proyecto participan personas externas (contratistas, proveedores, cliente final) en la creación o revisión del modelo digital.',
        type: 'options',
        options: [
            { level: 1, title: 'Sin integración', description: 'No se integran; el diseño se entrega finalizado a los constructores y subcontratistas ("over the wall").' },
            { level: 2, title: 'Consulta pasiva', description: 'Los contratistas reciben modelos 3D únicamente para consulta o extracción de cantidades, pero no colaboran en ellos.' },
            { level: 3, title: 'Revisión colaborativa', description: 'Los principales fabricantes y subcontratistas participan en las revisiones del modelo federado durante el diseño detallado.' },
            { level: 4, title: 'Ingeniería concurrente', description: 'Existe un enfoque de Ingeniería Concurrente; la cadena de suministro diseña sus componentes directamente en el entorno del proyecto.' },
            { level: 5, title: 'Cliente desde el día cero', description: 'El cliente (operador del activo) define los requisitos de información desde el día cero y colabora durante todo el ciclo.' },
        ],
    },
    // ── Dimensión 3: Herramientas ──
    {
        id: 'bim-herr-1',
        dimension: 'herramientas',
        text: '¿Qué tipo de software rige la creación del diseño del proyecto?',
        help: 'Se refiere a los programas que usan para dibujar o modelar los proyectos. Desde herramientas básicas de dibujo en 2D hasta software avanzado que simula el comportamiento del edificio.',
        type: 'options',
        options: [
            { level: 1, title: 'CAD 2D', description: 'Plataformas CAD utilizadas estrictamente para el dibujo de líneas en dos dimensiones.' },
            { level: 2, title: '3D no paramétrico', description: 'Software de modelado 3D geométrico no paramétrico, usado principalmente para visualización o renderizado.' },
            { level: 3, title: 'BIM paramétrico', description: 'Software de autoría BIM paramétrico, donde los elementos contienen información y propiedades (metadata).' },
            { level: 4, title: 'BIM integrado', description: 'Software de autoría BIM integrado con plugins de cálculo estructural, análisis energético o presupuesto en tiempo real.' },
            { level: 5, title: 'Simulación avanzada', description: 'Herramientas de programación visual avanzada y motores de simulación predictiva del comportamiento del edificio.' },
        ],
    },
    {
        id: 'bim-herr-2',
        dimension: 'herramientas',
        text: '¿Qué plataforma utilizan para centralizar, controlar y aprobar los entregables del proyecto?',
        help: 'Pregunta por el lugar donde guardan y organizan todos los archivos del proyecto. Puede ser un servidor en la oficina, una nube genérica o una plataforma especializada en construcción.',
        type: 'options',
        options: [
            { level: 1, title: 'Servidores locales', description: 'Servidores físicos locales dentro de las oficinas de la empresa.' },
            { level: 2, title: 'Nube genérica', description: 'Sistemas de almacenamiento genéricos en la nube (ej. Google Drive, Dropbox) con estructura de carpetas manual.' },
            { level: 3, title: 'CDE especializado', description: 'Un Entorno Común de Datos (CDE) especializado para la construcción, con control de versiones y flujos de revisión.' },
            { level: 4, title: 'CDE integrado con ERP', description: 'El CDE está conectado bidireccionalmente con el sistema ERP financiero y las plataformas móviles de gestión de obra.' },
            { level: 5, title: 'Gestión de activos', description: 'Plataformas de gestión del ciclo de vida de activos (Facility Management) conectadas permanentemente al CDE.' },
        ],
    },
    // ── Dimensión 4: Tecnología ──
    {
        id: 'bim-tech-1',
        dimension: 'tecnologia',
        text: '¿Qué política tecnológica aplican para intercambiar modelos entre diferentes disciplinas?',
        help: 'Se refiere a las reglas que sigue la empresa para compartir modelos entre especialidades. Por ejemplo, si exigen un formato universal o si cada equipo usa su propio formato sin compatibilidad.',
        type: 'options',
        options: [
            { level: 1, title: 'Formatos cerrados', description: 'Se exige trabajar exclusivamente en formatos cerrados y nativos específicos (ej. DWG, RVT).' },
            { level: 2, title: 'Exportación ocasional', description: 'Se realizan exportaciones a formatos neutros ocasionalmente, pero con alta pérdida de información paramétrica.' },
            { level: 3, title: 'OpenBIM contractual', description: 'Se exige contractualmente el uso de estándares OpenBIM (IFC, BCF) asegurando la neutralidad tecnológica.' },
            { level: 4, title: 'Sincronización vía APIs', description: 'Se utilizan conexiones directas vía APIs para sincronizar datos entre plataformas sin necesidad de exportar archivos.' },
            { level: 5, title: 'Base de datos abierta', description: 'El modelo opera como una base de datos relacional abierta, consultable a través de protocolos web semánticos.' },
        ],
    },
    {
        id: 'bim-tech-2',
        dimension: 'tecnologia',
        text: '¿Qué tecnologías utilizan para conectar el modelo digital con el avance de la obra física?',
        help: 'Evalúa cómo verifican que lo construido coincide con lo diseñado. Puede ser con fotos manuales, drones, escáneres láser o sensores que reportan datos automáticamente.',
        type: 'options',
        options: [
            { level: 1, title: 'Reportes manuales', description: 'El control de obra se basa exclusivamente en reportes fotográficos en 2D y bitácoras manuales.' },
            { level: 2, title: 'Drones sin cruce 3D', description: 'Se utilizan drones o cámaras 360 para inspección visual intermitente, pero no se cruzan con el modelo 3D.' },
            { level: 3, title: 'Topografía digital', description: 'Se emplea topografía digital avanzada para referenciar espacialmente los modelos sobre el terreno físico.' },
            { level: 4, title: 'Escáner láser', description: 'Se realizan levantamientos continuos con escáner láser (Nubes de puntos) comparando la ejecución milimétricamente contra el diseño.' },
            { level: 5, title: 'Gemelo Digital con IoT', description: 'El edificio terminado está equipado con sensores IoT que reportan telemetría en tiempo real hacia un Gemelo Digital.' },
        ],
    },
    // ── Pregunta de prioridad ──
    {
        id: 'bim-priority',
        dimension: 'procesos',
        text: 'Para cumplir los objetivos estratégicos de la empresa este año, ¿qué tan importante es mejorar estas capacidades BIM?',
        help: 'Indique qué tan urgente y estratégico es para su empresa mejorar en BIM durante el próximo año.',
        type: 'priority',
    },
];
