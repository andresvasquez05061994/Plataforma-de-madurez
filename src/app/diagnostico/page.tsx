'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/store/assessment-store';
import DiagnosticLayout from '@/components/diagnostic/DiagnosticLayout';
import SectionBreak from '@/components/diagnostic/SectionBreak';
import OptionQuestion from '@/components/diagnostic/OptionQuestion';
import OpenQuestion from '@/components/diagnostic/OpenQuestion';
import PriorityQuestion from '@/components/diagnostic/PriorityQuestion';
import ContactForm from '@/components/diagnostic/ContactForm';
import { questionsBim } from '@/data/questions-bim';
import { questionsIA } from '@/data/questions-ia';
import { questionsPLM } from '@/data/questions-plm';
import { serviceSections } from '@/data/sections';
import { Question, ServiceType, PriorityLevel } from '@/types/assessment';

const STATIC_QUESTIONS: Record<ServiceType, Question[]> = {
    bim: questionsBim,
    ia: questionsIA,
    plm: questionsPLM,
};

export default function DiagnosticoPage() {
    const router = useRouter();
    const store = useAssessmentStore();

    const {
        flowPhase,
        currentServiceIndex,
        currentQuestion,
        answers,
        setServiceAnswer,
        setPriority,
        setObjective,
        setContactInfo,
        nextQuestion,
        previousQuestion,
        dismissSectionBreak,
        calculateResults,
        setDynamicQuestionCounts,
    } = store;

    const selectedServices = answers.generalInfo.selectedServices;

    const [dynamicQuestions, setDynamicQuestions] = useState<Record<string, Question[]>>({});

    useEffect(() => {
        if (selectedServices.length === 0) return;

        let cancelled = false;

        async function loadQuestions() {
            const counts: Partial<Record<ServiceType, number>> = {};

            for (const svc of selectedServices) {
                try {
                    const r = await fetch(`/api/questions/${svc}`, { cache: 'no-store' });
                    const data = await r.json();
                    if (!cancelled && data.questions?.length > 0) {
                        setDynamicQuestions((prev) => ({ ...prev, [svc]: data.questions }));
                        counts[svc] = data.questions.length;
                    }
                } catch {
                    counts[svc] = STATIC_QUESTIONS[svc].length;
                }
            }

            if (!cancelled && Object.keys(counts).length > 0) {
                setDynamicQuestionCounts(counts);
            }
        }

        loadQuestions();
        return () => { cancelled = true; };
    }, [selectedServices, setDynamicQuestionCounts]);

    // Redirect to landing if no services selected
    useEffect(() => {
        if (selectedServices.length === 0 && flowPhase !== 'filter') {
            router.push('/');
        }
    }, [selectedServices, flowPhase, router]);

    const getServiceQuestions = useCallback(
        (service: ServiceType): Question[] => {
            return dynamicQuestions[service] || STATIC_QUESTIONS[service];
        },
        [dynamicQuestions]
    );

    // Current service and its section info
    const currentService = selectedServices[currentServiceIndex] || null;
    const currentSectionInfo = currentService
        ? serviceSections.find((s) => s.key === currentService)
        : null;

    // Handle keyboard shortcuts for option questions
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (flowPhase === 'questions' && currentService) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 5) {
                    const questions = getServiceQuestions(currentService);
                    const question = questions[currentQuestion];
                    if (question && question.type === 'options') {
                        setServiceAnswer(currentService, question.id, num);
                        setTimeout(() => nextQuestion(), 400);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flowPhase, currentService, currentQuestion, getServiceQuestions, setServiceAnswer, nextQuestion]);

    // Handle finishing the diagnostic
    const handleFinish = useCallback(() => {
        calculateResults();
        router.push('/resultados');
    }, [calculateResults, router]);

    // ── Render content based on flow phase ──
    const renderContent = () => {
        // Section Break
        if (flowPhase === 'section-break' && currentSectionInfo) {
            const svc = selectedServices[currentServiceIndex];
            const questions = svc ? getServiceQuestions(svc) : [];
            return (
                <SectionBreak
                    section={currentSectionInfo}
                    moduleNumber={currentServiceIndex + 1}
                    totalModules={selectedServices.length}
                    actualQuestionCount={questions.length}
                    onStart={dismissSectionBreak}
                    onBack={previousQuestion}
                />
            );
        }

        // Questions phase
        if (flowPhase === 'questions' && currentService) {
            const questions = getServiceQuestions(currentService);
            const question = questions[currentQuestion];

            if (!question) return null;

            if (question.type === 'options') {
                return (
                    <OptionQuestion
                        question={question}
                        currentValue={answers[currentService][question.id] as number}
                        onAnswer={(value) => {
                            setServiceAnswer(currentService, question.id, value);
                            setTimeout(() => nextQuestion(), 400);
                        }}
                        questionNumber={currentQuestion + 1}
                        totalQuestions={questions.length}
                    />
                );
            }

            if (question.type === 'priority') {
                return (
                    <PriorityQuestion
                        text={question.text}
                        help={question.help}
                        currentValue={answers.priorities[currentService]}
                        onAnswer={(value: PriorityLevel) => {
                            setPriority(currentService, value);
                            setTimeout(() => nextQuestion(), 400);
                        }}
                    />
                );
            }
        }

        // Objective phase
        if (flowPhase === 'objective') {
            return (
                <OpenQuestion
                    questionId="objective"
                    text="¿Qué resultado espera obtener de su proceso de transformación digital?"
                    help="Piense en el impacto concreto que quiere lograr: reducir costos, mejorar tiempos de entrega, cumplir regulaciones, ganar nuevos contratos, etc."
                    value={answers.objective}
                    onChange={setObjective}
                    onNext={nextQuestion}
                    placeholder="Ej: Queremos reducir un 30% los tiempos de coordinación en obra mediante BIM y automatizar los procesos administrativos con RPA..."
                    questionNumber={1}
                    totalQuestions={1}
                />
            );
        }

        // Contact phase
        if (flowPhase === 'contact') {
            return (
                <ContactForm
                    name={answers.contact.name}
                    email={answers.contact.email}
                    role={answers.contact.role}
                    currentField={currentQuestion}
                    onChangeName={(v) => setContactInfo('name', v)}
                    onChangeEmail={(v) => setContactInfo('email', v)}
                    onChangeRole={(v) => setContactInfo('role', v)}
                    onNext={nextQuestion}
                    onFinish={handleFinish}
                />
            );
        }

        return null;
    };

    if (selectedServices.length === 0) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 bg-surface-alt rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">🔄</span>
                    </div>
                    <p className="text-muted">Redirigiendo...</p>
                </div>
            </main>
        );
    }

    return (
        <DiagnosticLayout>
            <div key={`${flowPhase}-${currentServiceIndex}-${currentQuestion}`} className="w-full">
                {renderContent()}
            </div>
        </DiagnosticLayout>
    );
}
