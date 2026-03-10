import { ServiceType, MaturityLevel } from '@/types/assessment';

// ─── Matrices de Madurez ───────────────────────────────────────
// Descripciones textuales por servicio × dimensión × nivel
// Extraídas de las matrices oficiales del framework de madurez

export type DimensionKey = 'procesos' | 'personas' | 'herramientas' | 'tecnologia';

export interface MatrixEntry {
    level: MaturityLevel;
    levelNumber: number;
    description: string;
}

export type MaturityMatrix = Record<DimensionKey, MatrixEntry[]>;

// ── BIM ──
const bimMatrix: MaturityMatrix = {
    procesos: [
        { level: 'Inicial', levelNumber: 1, description: 'Diseño aislado por especialidad. Compartición desestructurada (emails).' },
        { level: 'Oportunista', levelNumber: 2, description: 'Detección de interferencias periódica y manual.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Uso estricto de BEP (BIM Execution Plan) y flujos de aprobación ISO 19650.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Integración bidireccional de cronograma (4D) y costos (5D) al modelo.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Entrega de modelo "As-Built" digital para operación y mantenimiento (6D/7D).' },
    ],
    personas: [
        { level: 'Inicial', levelNumber: 1, description: 'Principalmente dibujantes 2D. Resistencia al cambio tecnológico en obra.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Roles iniciales (BIM Modeler). Colaboración fragmentada entre disciplinas.' },
        { level: 'Sistemático', levelNumber: 3, description: 'BIM Managers definidos. Colaboración y capacitación estructurada.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Proveedores, subcontratistas y clientes interactúan directamente con el modelo.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Gestores de Gemelos Digitales y expertos en Facility Management.' },
    ],
    herramientas: [
        { level: 'Inicial', levelNumber: 1, description: 'CAD 2D, programas aislados para visualización básica (renders).' },
        { level: 'Oportunista', levelNumber: 2, description: 'Software de autoría BIM (Revit/Archicad) usado internamente.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Entorno Común de Datos (CDE) formal en la nube y software de revisión federada.' },
        { level: 'Gestionado', levelNumber: 4, description: 'CDE integrado con el ERP corporativo y software de gestión en campo móvil.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Motores de simulación en tiempo real y plataformas de gestión de activos.' },
    ],
    tecnologia: [
        { level: 'Inicial', levelNumber: 1, description: 'Archivos nativos cerrados (DWG), PDFs no editables.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Exportaciones esporádicas a formatos abiertos, dependencia de marcas.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Estándares OpenBIM (IFC, BCF) obligatorios para interoperabilidad.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Escaneo láser (Nube de puntos) y drones para comparar modelo vs. obra.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Gemelo Digital bidireccional alimentado por sensores IoT del edificio.' },
    ],
};

// ── IA / RPA ──
const iaMatrix: MaturityMatrix = {
    procesos: [
        { level: 'Inicial', levelNumber: 1, description: 'Tareas manuales y repetitivas. Sin gobernanza ni procesos documentados.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Pilotos aislados para resolver cuellos de botella específicos. Limpiezas de datos manuales.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Gobernanza de datos establecida. Procesos priorizados bajo un marco de métricas.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Escalado empresarial con medición estricta del ROI. IA integrada en flujos core.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Procesos autónomos que se auto-optimizan. Anticipación de impactos no deseados.' },
    ],
    personas: [
        { level: 'Inicial', levelNumber: 1, description: 'Iniciativas aisladas ("Shadow IT"). Escepticismo generalizado hacia la IA.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Entusiastas liderando pilotos. Sin roles oficiales de automatización o datos.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Roles definidos (Data Scientists, Arquitectos RPA). Centro de Excelencia (CoE) activo.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Cultura "AI-First". Programas de desarrolladores ciudadanos (Citizen Developers).' },
        { level: 'Optimizado', levelNumber: 5, description: 'Equipos multidisciplinarios enfocados 100% en innovación disruptiva.' },
    ],
    herramientas: [
        { level: 'Inicial', levelNumber: 1, description: 'Hojas de cálculo, macros locales, scripts básicos.' },
        { level: 'Oportunista', levelNumber: 2, description: 'RPA de escritorio local, BI tradicional (descriptivo).' },
        { level: 'Sistemático', levelNumber: 3, description: 'Orquestadores RPA empresariales centralizados, plataformas Cloud.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Plataformas MLOps maduras, ecosistemas Low-Code/No-Code gobernados.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Ecosistemas de agentes virtuales y benchmarks con datos de la industria.' },
    ],
    tecnologia: [
        { level: 'Inicial', levelNumber: 1, description: 'Reglas estáticas (If/Then), extracción manual de datos.' },
        { level: 'Oportunista', levelNumber: 2, description: 'RPA desatendido básico, OCR simple, modelos genéricos.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Machine Learning predictivo propio, NLP básico.' },
        { level: 'Gestionado', levelNumber: 4, description: 'IA Generativa aplicada a datos internos (RAG), Visión Artificial.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Inteligencia de Enjambre (Multi-Agent), flujos adaptativos en tiempo real.' },
    ],
};

// ── PLM ──
const plmMatrix: MaturityMatrix = {
    procesos: [
        { level: 'Inicial', levelNumber: 1, description: 'Cambios de ingeniería (ECO) manuales. Listas de materiales (BOM) desconectadas.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Control de versiones CAD establecido (Gestión de Datos de Producto - PDM).' },
        { level: 'Sistemático', levelNumber: 3, description: 'Estandarización de eBOM y mBOM. Flujos de cambio automatizados y trazables.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Hilo Digital (Digital Thread) ininterrumpido desde el diseño hasta manufactura.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Datos de campo retroalimentan automáticamente el rediseño (Closed-Loop).' },
    ],
    personas: [
        { level: 'Inicial', levelNumber: 1, description: 'Ingeniería en silos. Manufactura se entera tarde de los cambios, generando sobrecostos.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Administrador PDM local. Colaboración rudimentaria entre disciplinas de diseño.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Comité multidisciplinario de cambios. Involucramiento temprano de compras y manufactura.' },
        { level: 'Gestionado', levelNumber: 4, description: 'Proveedores críticos integrados en el ecosistema digital colaborando sobre el diseño.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Equipos de ciclo de vida transversal tomando decisiones operativas basadas en datos reales.' },
    ],
    herramientas: [
        { level: 'Inicial', levelNumber: 1, description: 'Excel para gestionar BOMs. Carpetas de red compartidas sin control de acceso estructurado.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Bóvedas seguras de archivos CAD (sistemas PDM locales).' },
        { level: 'Sistemático', levelNumber: 3, description: 'Plataformas PLM empresariales centralizadas que consolidan la documentación.' },
        { level: 'Gestionado', levelNumber: 4, description: 'PLM integrado nativamente bidireccional con ERP y Sistemas MES en planta.' },
        { level: 'Optimizado', levelNumber: 5, description: 'Plataformas de Gemelo Digital de Producto que cruzan telemetría física con CAD.' },
    ],
    tecnologia: [
        { level: 'Inicial', levelNumber: 1, description: 'Archivos estáticos, bases de datos locales no relacionadas.' },
        { level: 'Oportunista', levelNumber: 2, description: 'Bases de datos relacionales únicamente para indexar metadatos del diseño.' },
        { level: 'Sistemático', levelNumber: 3, description: 'Arquitectura Cliente-Servidor. Integraciones punto a punto (PLM a ERP).' },
        { level: 'Gestionado', levelNumber: 4, description: 'Cloud PLM basado en Microservicios y APIs REST para escalabilidad.' },
        { level: 'Optimizado', levelNumber: 5, description: 'IoT Industrial (IIoT), Analítica Edge, Modelado de Sistemas (MBSE).' },
    ],
};

// ── Mapa de acceso rápido ──
const matrices: Record<ServiceType, MaturityMatrix> = {
    bim: bimMatrix,
    ia: iaMatrix,
    plm: plmMatrix,
};

/**
 * Obtiene la descripción de la matriz para un servicio, dimensión y score.
 * El nivel se determina redondeando el score al entero más cercano (1-5).
 */
export function getMatrixDescription(
    service: ServiceType,
    dimension: DimensionKey,
    score: number
): MatrixEntry | null {
    const matrix = matrices[service];
    if (!matrix || !matrix[dimension]) return null;

    // Clamp and round to nearest level (1-5)
    const levelNumber = Math.max(1, Math.min(5, Math.round(score)));
    const entry = matrix[dimension].find((e) => e.levelNumber === levelNumber);
    return entry || null;
}

/**
 * Obtiene todas las descripciones de la matriz para un servicio dado
 * y los scores de sus 4 dimensiones.
 */
export function getServiceMatrixDescriptions(
    service: ServiceType,
    dimensionScores: Record<DimensionKey, number>
): Record<DimensionKey, MatrixEntry | null> {
    return {
        procesos: getMatrixDescription(service, 'procesos', dimensionScores.procesos),
        personas: getMatrixDescription(service, 'personas', dimensionScores.personas),
        herramientas: getMatrixDescription(service, 'herramientas', dimensionScores.herramientas),
        tecnologia: getMatrixDescription(service, 'tecnologia', dimensionScores.tecnologia),
    };
}

/**
 * Obtiene la matriz completa de un servicio (5 niveles × 4 dimensiones).
 */
export function getFullMatrix(service: ServiceType): MaturityMatrix | null {
    return matrices[service] || null;
}
