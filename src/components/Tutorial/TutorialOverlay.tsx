import { useState, useEffect, useCallback } from 'react';
import { useTutorialStore } from '../../stores/tutorial-store';
import { TUTORIAL_STEP_DEFINITIONS } from '../../core/tutorial/tutorial-steps';
import { TutorialTooltip } from './TutorialTooltip';

export function TutorialOverlay(): React.JSX.Element | null {
  const { isActive, currentStep, nextStep, skipTutorial } = useTutorialStore();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const stepDef = TUTORIAL_STEP_DEFINITIONS[currentStep];

  // Find and track the target element
  useEffect(() => {
    if (!isActive || !stepDef) return;

    const updateRect = () => {
      const el = document.querySelector(stepDef.targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();

    // Re-measure on scroll/resize
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    // Poll briefly in case element appears after render
    const interval = setInterval(updateRect, 500);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearInterval(interval);
    };
  }, [isActive, stepDef]);

  const handleNext = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handleSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  if (!isActive || !stepDef) return null;

  // Spotlight cutout dimensions
  const pad = 8;
  const cutout = targetRect
    ? {
        x: targetRect.left - pad,
        y: targetRect.top - pad,
        w: targetRect.width + pad * 2,
        h: targetRect.height + pad * 2,
        rx: 8,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent backdrop with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tutorial-spotlight">
            <rect width="100%" height="100%" fill="white" />
            {cutout && (
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.w}
                height={cutout.h}
                rx={cutout.rx}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tutorial-spotlight)"
        />
      </svg>

      {/* Highlight border around target */}
      {cutout && (
        <div
          className="absolute border-2 border-rach-accent rounded-lg pointer-events-none animate-pulse"
          style={{
            left: cutout.x,
            top: cutout.y,
            width: cutout.w,
            height: cutout.h,
          }}
        />
      )}

      {/* Tooltip */}
      <div className="pointer-events-auto">
        <TutorialTooltip
          title={stepDef.title}
          instruction={stepDef.instruction}
          position={stepDef.tooltipPosition}
          targetRect={targetRect}
          currentStep={currentStep}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
