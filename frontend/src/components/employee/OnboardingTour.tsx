import { X, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourStep } from "@/hooks/useOnboardingTour";

interface OnboardingTourProps {
  show: boolean;
  currentStep: TourStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({
  show,
  currentStep,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: OnboardingTourProps) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onSkip} />

      {/* Tour Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
        <div className="bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Compass className="h-5 w-5" />
              <span className="font-semibold">Welcome Tour</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {currentStep.title}
              </h3>
              <p className="text-muted-foreground mt-2">{currentStep.content}</p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === stepNumber ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step indicator */}
            <p className="text-xs text-muted-foreground text-center mb-4">
              Step {stepNumber + 1} of {totalSteps}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={stepNumber === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>
            <Button size="sm" onClick={onNext} className="gap-1">
              {stepNumber === totalSteps - 1 ? "Finish" : "Next"}
              {stepNumber !== totalSteps - 1 && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
