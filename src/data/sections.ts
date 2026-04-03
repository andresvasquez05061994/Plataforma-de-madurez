import { ServiceSection } from '@/types/assessment';

export const serviceSections: ServiceSection[] = [
    {
        key: 'bim',
        title: 'BIM',
        description: 'Building Information Modeling — Evalúa tus capacidades de modelado, coordinación y gestión de información de construcción.',
        icon: '🏗️',
        questionCount: 9,
    },
    {
        key: 'ia',
        title: 'IA / RPA',
        description: 'Inteligencia Artificial y Automatización — Mide tu nivel de adopción de inteligencia artificial y automatización de procesos.',
        icon: '🤖',
        questionCount: 9,
    },
    {
        key: 'plm',
        title: 'PLM',
        description: 'Product Lifecycle Management — Evalúa la gestión del ciclo de vida de tus productos y procesos de ingeniería.',
        icon: '⚙️',
        questionCount: 9,
    },
];

export function getQuestionCountForServices(services: string[]): number {
    return serviceSections
        .filter((s) => services.includes(s.key))
        .reduce((sum, s) => sum + s.questionCount, 0);
}
