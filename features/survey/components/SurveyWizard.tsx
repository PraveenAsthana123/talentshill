'use client';

import { useMemo } from 'react';
import { useSurveyStore } from '@/store/survey-store';
import type { SurveyQuestion } from '@/types';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import styles from './Survey.module.css';
import surveyData from '@/data/survey-questions.json';

const questions = surveyData as SurveyQuestion[];

function getRecommendations(score: number, level: string) {
  if (level === 'leader') return [
    { title: 'Scale Your AI Operations', text: 'You are ahead of the curve. Focus on scaling AI across departments, optimizing costs, and exploring cutting-edge technologies like quantum computing.' },
    { title: 'Build an AI Center of Excellence', text: 'Formalize your AI practices with governance frameworks, model registries, and cross-functional AI teams.' },
  ];
  if (level === 'advanced') return [
    { title: 'Expand GenAI Adoption', text: 'Move beyond pilots to enterprise-wide GenAI deployment. Consider RAG pipelines, AI copilots, and automated workflows.' },
    { title: 'Invest in MLOps', text: 'Automate your ML lifecycle: model training, testing, deployment, and monitoring at scale.' },
  ];
  if (level === 'developing') return [
    { title: 'Strengthen Data Foundation', text: 'Before scaling AI, ensure your data infrastructure is solid. Invest in data quality, governance, and centralized pipelines.' },
    { title: 'Start with High-Impact Use Cases', text: 'Identify 2-3 use cases with clear ROI. Build internal capability while delivering business value.' },
  ];
  return [
    { title: 'Begin Your AI Journey', text: 'Start with an AI readiness assessment and strategy workshop. Identify quick wins that demonstrate AI value to stakeholders.' },
    { title: 'Build Data Literacy', text: 'Invest in training your teams on data analysis, basic ML concepts, and AI-powered tools. Culture change is as important as technology.' },
  ];
}

export default function SurveyWizard() {
  const { currentStep, answers, result, isComplete, setStep, nextStep, prevStep, setAnswer, setResult, reset } = useSurveyStore();

  const currentQuestion = questions[currentStep];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);
  const totalSteps = questions.length;
  const progress = ((currentStep) / totalSteps) * 100;

  const handleSelect = (value: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'multiple') {
      const current = (currentAnswer?.value as string[]) || [];
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      setAnswer({ questionId: currentQuestion.id, value: updated });
    } else {
      setAnswer({ questionId: currentQuestion.id, value });
    }
  };

  const canProceed = !!currentAnswer?.value && (Array.isArray(currentAnswer.value) ? currentAnswer.value.length > 0 : true);

  const handleFinish = async () => {
    let score = 0;
    answers.forEach((a) => {
      if (typeof a.value === 'string') {
        const q = questions.find((q) => q.id === a.questionId);
        if (q?.type === 'scale') {
          score += parseInt(a.value, 10);
        } else if (q?.options) {
          const idx = q.options.indexOf(a.value);
          score += (idx + 1) * 2;
        }
      } else if (Array.isArray(a.value)) {
        score += a.value.length * 2;
      }
    });
    const maxScore = totalSteps * 10;
    const normalized = Math.round((score / maxScore) * 100);
    const level = normalized >= 80 ? 'leader' : normalized >= 60 ? 'advanced' : normalized >= 35 ? 'developing' : 'beginner';
    setResult({ id: generateId(), answers, score: normalized, level, completedAt: new Date().toISOString() });

    // Persist to database
    try {
      const apiAnswers = answers.map((a) => {
        const q = questions.find((q) => q.id === a.questionId);
        let scoreValue = 0;
        if (typeof a.value === 'string') {
          if (q?.type === 'scale') {
            scoreValue = parseInt(a.value, 10);
          } else if (q?.options) {
            const idx = q.options.indexOf(a.value);
            scoreValue = (idx + 1) * 2;
          }
        } else if (Array.isArray(a.value)) {
          scoreValue = a.value.length * 2;
        }
        return {
          questionId: a.questionId,
          value: a.value,
          scoreValue,
        };
      });

      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: apiAnswers,
          score: normalized,
          level,
        }),
      });
    } catch {
      // Silent fail — results are shown client-side regardless
    }
  };

  if (isComplete && result) {
    const recs = getRecommendations(result.score, result.level);
    return (
      <div className={styles.wrapper}>
        <div className={styles.questionCard}>
          <div className={styles.results}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)' }}>Your AI Readiness Score</h2>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>{result.score}</span>
              <span className={styles.scoreLabel}>/ 100</span>
            </div>
            <div className={styles.level}>
              Level: {result.level.charAt(0).toUpperCase() + result.level.slice(1)}
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
              Based on your responses across AI Readiness, GenAI Adoption, Robotics, and Quantum exploration.
            </p>
            <div className={styles.recommendations}>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>Recommendations</h3>
              {recs.map((r, i) => (
                <div key={i} className={styles.recCard}>
                  <div className={styles.recTitle}>{r.title}</div>
                  <div className={styles.recText}>{r.text}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
              <Button variant="outline" onClick={reset}>Retake Assessment</Button>
              <Button onClick={() => window.location.href = '/contact'}>Talk to an Expert</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressText}>Question {currentStep + 1} of {totalSteps}</div>

      <div className={styles.questionCard}>
        <div className={styles.category}>{currentQuestion.category}</div>
        <h2 className={styles.question}>{currentQuestion.question}</h2>

        {currentQuestion.type === 'scale' ? (
          <div className={styles.scaleRow}>
            {currentQuestion.options?.map((opt) => (
              <button
                key={opt}
                className={cn(styles.scaleOption, currentAnswer?.value === opt && styles.scaleSelected)}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.options}>
            {currentQuestion.options?.map((opt) => {
              const isSelected = currentQuestion.type === 'multiple'
                ? (currentAnswer?.value as string[] || []).includes(opt)
                : currentAnswer?.value === opt;
              return (
                <button
                  key={opt}
                  className={cn(styles.option, isSelected && styles.optionSelected)}
                  onClick={() => handleSelect(opt)}
                >
                  {currentQuestion.type === 'multiple' ? (
                    <span className={cn(styles.checkbox, isSelected && styles.checkboxSelected)}>
                      {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </span>
                  ) : (
                    <span className={cn(styles.radio, isSelected && styles.radioSelected)}>
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                  )}
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}>Back</Button>
          {currentStep < totalSteps - 1 ? (
            <Button onClick={nextStep} disabled={!canProceed}>Next</Button>
          ) : (
            <Button onClick={handleFinish} disabled={!canProceed}>See Results</Button>
          )}
        </div>
      </div>
    </div>
  );
}
