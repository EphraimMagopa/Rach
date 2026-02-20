import type { TooltipPosition } from '../../core/tutorial/tutorial-steps';
import { TUTORIAL_STEPS } from '../../stores/tutorial-store';
import type { TutorialStep } from '../../stores/tutorial-store';

interface TutorialTooltipProps {
  title: string;
  instruction: string;
  position: TooltipPosition;
  targetRect: DOMRect | null;
  currentStep: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
}

export function TutorialTooltip({
  title,
  instruction,
  position,
  targetRect,
  currentStep,
  onNext,
  onSkip,
}: TutorialTooltipProps): React.JSX.Element {
  const stepIndex = TUTORIAL_STEPS.indexOf(currentStep);
  const totalSteps = TUTORIAL_STEPS.length;
  const isLast = currentStep === 'complete';

  // Calculate tooltip position relative to the target element
  const style: React.CSSProperties = { position: 'fixed', zIndex: 60 };

  const tooltipWidth = 288; // w-72 = 18rem = 288px
  const tooltipHeight = 120; // approximate rendered height
  const viewportPad = 12;

  if (targetRect) {
    const gap = 12;
    switch (position) {
      case 'bottom':
        style.top = targetRect.bottom + gap;
        style.left = Math.max(
          viewportPad,
          Math.min(
            targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - viewportPad
          )
        );
        break;
      case 'top':
        style.bottom = window.innerHeight - targetRect.top + gap;
        style.left = Math.max(
          viewportPad,
          Math.min(
            targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - viewportPad
          )
        );
        break;
      case 'right':
        style.top = Math.max(
          viewportPad,
          Math.min(
            targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            window.innerHeight - tooltipHeight - viewportPad
          )
        );
        style.left = Math.min(
          targetRect.right + gap,
          window.innerWidth - tooltipWidth - viewportPad
        );
        break;
      case 'left':
        style.top = Math.max(
          viewportPad,
          Math.min(
            targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
            window.innerHeight - tooltipHeight - viewportPad
          )
        );
        style.right = Math.max(
          viewportPad,
          window.innerWidth - targetRect.left + gap
        );
        break;
    }
  } else {
    // Center on screen as fallback
    style.top = '50%';
    style.left = '50%';
    style.transform = 'translate(-50%, -50%)';
  }

  return (
    <div
      style={style}
      className="w-72 bg-rach-surface border border-rach-accent/30 rounded-xl shadow-2xl p-4"
    >
      <h3 className="text-sm font-semibold text-rach-text mb-1">{title}</h3>
      <p className="text-xs text-rach-text-muted mb-3 leading-relaxed">{instruction}</p>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-rach-text-muted">
          {stepIndex + 1} / {totalSteps}
        </span>
        <div className="flex gap-2">
          {!isLast && (
            <button
              onClick={onSkip}
              className="text-[10px] px-2 py-1 rounded text-rach-text-muted hover:text-rach-text transition-colors"
            >
              Skip Tutorial
            </button>
          )}
          <button
            onClick={onNext}
            className="text-[10px] px-3 py-1 rounded bg-rach-accent text-white hover:bg-rach-accent/80 transition-colors"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
