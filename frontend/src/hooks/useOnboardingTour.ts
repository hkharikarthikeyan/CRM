import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "employee_onboarding_completed";

export interface TourStep {
  target: string;
  title: string;
  content: string;
}

export const tourSteps: TourStep[] = [
  {
    target: "leave-request-btn",
    title: "Request Leave",
    content: "Click here to request leave days.",
  },
  {
    target: "attendance-section",
    title: "Your Attendance",
    content: "Your attendance records appear here.",
  },
  {
    target: "quick-actions",
    title: "Quick Actions",
    content: "Use these shortcuts for quick actions.",
  },
];

export const useOnboardingTour = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay tour start to allow page to render
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowTour(false);
    setCurrentStep(0);
  }, []);

  const skipTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowTour(false);
    setCurrentStep(0);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setShowTour(true);
  }, []);

  return {
    showTour,
    currentStep,
    totalSteps: tourSteps.length,
    currentTourStep: tourSteps[currentStep],
    nextStep,
    prevStep,
    completeTour,
    skipTour,
    resetTour,
  };
};
