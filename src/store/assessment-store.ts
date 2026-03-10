'use client';

import { create } from 'zustand';
import {
    AssessmentAnswers,
    GeneralInfo,
    ContactInfo,
    ServiceType,
    PriorityLevel,
    IndustryType,
    ServiceScore,
    MaturityLevel,
} from '@/types/assessment';
import { calculateAllScores } from '@/lib/scoring';
import { serviceSections } from '@/data/sections';

// ─── Flow Phase Types ──────────────────────────────────────────
// The v3 flow is:
// Phase 'filter' → 3 context questions (company, industry, services)
// Phase 'section-break' → transition screen before each service module  
// Phase 'questions' → actual service evaluation questions
// Phase 'objective' → open question about transformation goals
// Phase 'contact' → contact info form

export type FlowPhase = 'filter' | 'section-break' | 'questions' | 'objective' | 'contact';

interface AssessmentState {
    // ── V3 Navigation ──
    flowPhase: FlowPhase;
    filterStep: number;              // 0=company, 1=industry, 2=service selection
    currentServiceIndex: number;     // index into selectedServices array
    currentQuestion: number;         // question index within current service
    showingSectionBreak: boolean;    // currently showing section break screen

    // ── Dynamic question counts (from Google Sheets) ──
    dynamicQuestionCounts: Partial<Record<ServiceType, number>>;

    // ── Answers ──
    answers: AssessmentAnswers;

    // ── Results ──
    scores: ServiceScore[];
    globalScore: number;
    globalLevel: MaturityLevel;
    priorityRoadmap: ServiceScore[];
    aiAnalysis: string;

    // ── Actions ──
    // Filter phase
    setFilterStep: (step: number) => void;
    setCompany: (company: string) => void;
    setEmployees: (employees: string) => void;
    setIndustry: (industry: IndustryType) => void;
    toggleService: (service: ServiceType) => void;
    startDiagnostic: () => void;

    // Dynamic question counts
    setDynamicQuestionCounts: (counts: Partial<Record<ServiceType, number>>) => void;
    getQuestionCount: (service: ServiceType) => number;

    // Navigation
    setFlowPhase: (phase: FlowPhase) => void;
    setCurrentQuestion: (q: number) => void;
    dismissSectionBreak: () => void;
    nextQuestion: () => void;
    previousQuestion: () => void;

    // Answer setters
    setServiceAnswer: (service: ServiceType, questionId: string, value: number | string) => void;
    setPriority: (service: ServiceType, priority: PriorityLevel) => void;
    setObjective: (value: string) => void;
    setContactInfo: (field: keyof ContactInfo, value: string) => void;

    // Results
    calculateResults: () => void;
    setAiAnalysis: (analysis: string) => void;

    // Reset
    reset: () => void;

    // Computed helpers
    getSelectedServices: () => ServiceType[];
    getTotalQuestions: () => number;
    getCurrentProgress: () => number;
    getCurrentService: () => ServiceType | null;
    getCompletedQuestions: () => number;
}

const initialAnswers: AssessmentAnswers = {
    generalInfo: {
        company: '',
        employees: '',
        industry: '',
        selectedServices: [],
    },
    bim: {},
    ia: {},
    plm: {},
    priorities: {
        bim: 'media',
        ia: 'media',
        plm: 'media',
    },
    objective: '',
    contact: {
        name: '',
        email: '',
        role: '',
    },
};

export const useAssessmentStore = create<AssessmentState>()((set, get) => ({
    // ── Initial State ──
    flowPhase: 'filter',
    filterStep: 0,
    currentServiceIndex: 0,
    currentQuestion: 0,
    showingSectionBreak: false,
    dynamicQuestionCounts: {},
    answers: { ...initialAnswers, generalInfo: { ...initialAnswers.generalInfo, selectedServices: [] } },
    scores: [],
    globalScore: 0,
    globalLevel: 'Inicial',
    priorityRoadmap: [],
    aiAnalysis: '',

    // ── Filter Phase ──
    setFilterStep: (step) => set({ filterStep: step }),

    setCompany: (company) =>
        set((state) => ({
            answers: {
                ...state.answers,
                generalInfo: { ...state.answers.generalInfo, company },
            },
        })),

    setEmployees: (employees) =>
        set((state) => ({
            answers: {
                ...state.answers,
                generalInfo: { ...state.answers.generalInfo, employees },
            },
        })),

    setIndustry: (industry) =>
        set((state) => ({
            answers: {
                ...state.answers,
                generalInfo: { ...state.answers.generalInfo, industry },
            },
        })),

    toggleService: (service) =>
        set((state) => {
            const current = state.answers.generalInfo.selectedServices;
            const updated = current.includes(service)
                ? current.filter((s) => s !== service)
                : [...current, service];
            return {
                answers: {
                    ...state.answers,
                    generalInfo: { ...state.answers.generalInfo, selectedServices: updated },
                },
            };
        }),

    startDiagnostic: () => {
        const { answers } = get();
        if (
            answers.generalInfo.company.trim() &&
            answers.generalInfo.industry &&
            answers.generalInfo.selectedServices.length > 0
        ) {
            set({
                flowPhase: 'section-break',
                currentServiceIndex: 0,
                currentQuestion: 0,
                showingSectionBreak: true,
            });
        }
    },

    // ── Dynamic question counts ──
    setDynamicQuestionCounts: (counts) =>
        set((state) => ({
            dynamicQuestionCounts: { ...state.dynamicQuestionCounts, ...counts },
        })),

    getQuestionCount: (service) => {
        const dynamic = get().dynamicQuestionCounts[service];
        if (dynamic !== undefined) return dynamic;
        const section = serviceSections.find((s) => s.key === service);
        return section?.questionCount ?? 9;
    },

    // ── Navigation ──
    setFlowPhase: (phase) => set({ flowPhase: phase }),
    setCurrentQuestion: (q) => set({ currentQuestion: q }),

    dismissSectionBreak: () => {
        set({
            flowPhase: 'questions',
            showingSectionBreak: false,
            currentQuestion: 0,
        });
    },

    nextQuestion: () => {
        const { flowPhase, currentServiceIndex, currentQuestion, answers, getQuestionCount } = get();
        const selectedServices = answers.generalInfo.selectedServices;

        if (flowPhase === 'questions') {
            const currentService = selectedServices[currentServiceIndex];
            const qCount = getQuestionCount(currentService);
            const maxQ = qCount - 1;

            if (currentQuestion < maxQ) {
                set({ currentQuestion: currentQuestion + 1 });
            } else if (currentServiceIndex < selectedServices.length - 1) {
                set({
                    flowPhase: 'section-break',
                    currentServiceIndex: currentServiceIndex + 1,
                    currentQuestion: 0,
                    showingSectionBreak: true,
                });
            } else {
                set({ flowPhase: 'objective', currentQuestion: 0 });
            }
        } else if (flowPhase === 'objective') {
            set({ flowPhase: 'contact', currentQuestion: 0 });
        } else if (flowPhase === 'contact') {
            if (currentQuestion < 2) {
                set({ currentQuestion: currentQuestion + 1 });
            }
        }
    },

    previousQuestion: () => {
        const { flowPhase, currentServiceIndex, currentQuestion, answers, getQuestionCount } = get();
        const selectedServices = answers.generalInfo.selectedServices;

        if (flowPhase === 'contact' && currentQuestion > 0) {
            set({ currentQuestion: currentQuestion - 1 });
            return;
        }

        if (flowPhase === 'contact') {
            set({ flowPhase: 'objective', currentQuestion: 0 });
            return;
        }

        if (flowPhase === 'objective') {
            const lastServiceIdx = selectedServices.length - 1;
            const lastService = selectedServices[lastServiceIdx];
            const qCount = getQuestionCount(lastService);
            set({
                flowPhase: 'questions',
                currentServiceIndex: lastServiceIdx,
                currentQuestion: qCount - 1,
            });
            return;
        }

        if (flowPhase === 'questions') {
            if (currentQuestion > 0) {
                set({ currentQuestion: currentQuestion - 1 });
            } else if (currentServiceIndex > 0) {
                const prevServiceIdx = currentServiceIndex - 1;
                const prevService = selectedServices[prevServiceIdx];
                const qCount = getQuestionCount(prevService);
                set({
                    currentServiceIndex: prevServiceIdx,
                    currentQuestion: qCount - 1,
                });
            } else {
                set({ flowPhase: 'filter', filterStep: 2 });
            }
        }

        if (flowPhase === 'section-break') {
            if (currentServiceIndex > 0) {
                const prevServiceIdx = currentServiceIndex - 1;
                const prevService = selectedServices[prevServiceIdx];
                const qCount = getQuestionCount(prevService);
                set({
                    flowPhase: 'questions',
                    currentServiceIndex: prevServiceIdx,
                    currentQuestion: qCount - 1,
                    showingSectionBreak: false,
                });
            } else {
                set({ flowPhase: 'filter', filterStep: 2, showingSectionBreak: false });
            }
        }
    },

    // ── Answer Setters ──
    setServiceAnswer: (service, questionId, value) =>
        set((state) => ({
            answers: {
                ...state.answers,
                [service]: { ...state.answers[service], [questionId]: value },
            },
        })),

    setPriority: (service, priority) =>
        set((state) => ({
            answers: {
                ...state.answers,
                priorities: { ...state.answers.priorities, [service]: priority },
            },
        })),

    setObjective: (value) =>
        set((state) => ({
            answers: { ...state.answers, objective: value },
        })),

    setContactInfo: (field, value) =>
        set((state) => ({
            answers: {
                ...state.answers,
                contact: { ...state.answers.contact, [field]: value },
            },
        })),

    // ── Results ──
    calculateResults: () => {
        const { answers } = get();
        const { scores, globalScore, globalLevel, priorityRoadmap } = calculateAllScores(answers);
        set({ scores, globalScore, globalLevel, priorityRoadmap });
    },

    setAiAnalysis: (analysis) => set({ aiAnalysis: analysis }),

    // ── Reset ──
    reset: () =>
        set({
            flowPhase: 'filter',
            filterStep: 0,
            currentServiceIndex: 0,
            currentQuestion: 0,
            showingSectionBreak: false,
            dynamicQuestionCounts: {},
            answers: { ...initialAnswers, generalInfo: { ...initialAnswers.generalInfo, selectedServices: [] } },
            scores: [],
            globalScore: 0,
            globalLevel: 'Inicial',
            priorityRoadmap: [],
            aiAnalysis: '',
        }),

    // ── Computed Helpers ──
    getSelectedServices: () => get().answers.generalInfo.selectedServices,

    getTotalQuestions: () => {
        const { answers, getQuestionCount } = get();
        const selected = answers.generalInfo.selectedServices;
        let total = 0;
        for (const svc of selected) {
            total += getQuestionCount(svc);
        }
        return total + 1 + 3; // +1 objective +3 contact fields
    },

    getCompletedQuestions: () => {
        const { flowPhase, currentServiceIndex, currentQuestion, answers, getQuestionCount } = get();
        const selectedServices = answers.generalInfo.selectedServices;

        if (flowPhase === 'filter' || flowPhase === 'section-break') return 0;

        let completed = 0;

        if (flowPhase === 'questions') {
            for (let i = 0; i < currentServiceIndex; i++) {
                completed += getQuestionCount(selectedServices[i]);
            }
            completed += currentQuestion;
        } else if (flowPhase === 'objective') {
            for (const svc of selectedServices) {
                completed += getQuestionCount(svc);
            }
        } else if (flowPhase === 'contact') {
            for (const svc of selectedServices) {
                completed += getQuestionCount(svc);
            }
            completed += 1;
            completed += currentQuestion;
        }

        return completed;
    },

    getCurrentProgress: () => {
        const total = get().getTotalQuestions();
        const completed = get().getCompletedQuestions();
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    },

    getCurrentService: () => {
        const { currentServiceIndex, answers } = get();
        const selected = answers.generalInfo.selectedServices;
        if (currentServiceIndex < selected.length) {
            return selected[currentServiceIndex];
        }
        return null;
    },
}));
