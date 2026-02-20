import type { TutorialStep } from '../../stores/tutorial-store';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TutorialStepDefinition {
  id: TutorialStep;
  targetSelector: string;
  tooltipPosition: TooltipPosition;
  title: string;
  instruction: string;
  claudeMessage: string;
}

export const TUTORIAL_STEP_DEFINITIONS: Record<TutorialStep, TutorialStepDefinition> = {
  welcome: {
    id: 'welcome',
    targetSelector: '[data-tutorial="transport-bar"]',
    tooltipPosition: 'bottom',
    title: 'Welcome to Rach!',
    instruction: 'This is your AI-powered DAW. Let me walk you through the basics. Click Next to begin.',
    claudeMessage: "Welcome to Rach! I'm your AI music assistant. Let's create something together. I'll guide you through the basics step by step.",
  },
  'create-track': {
    id: 'create-track',
    targetSelector: '[data-tutorial="add-midi-track"]',
    tooltipPosition: 'right',
    title: 'Create a Track',
    instruction: 'Click "MIDI Track" to add a new instrument track to your project.',
    claudeMessage: "First, let's add a MIDI track. This is where you'll write melodies and chords using our built-in synthesizers.",
  },
  'add-clip': {
    id: 'add-clip',
    targetSelector: '[data-tutorial="tool-draw"]',
    tooltipPosition: 'bottom',
    title: 'Switch to Draw Mode',
    instruction: 'Select the Draw tool, then click on the track lane to create a new MIDI clip.',
    claudeMessage: "Great! Now switch to the Draw tool and click on your track to create a clip. A clip is a container for musical notes.",
  },
  'draw-notes': {
    id: 'draw-notes',
    targetSelector: '[data-tutorial="piano-roll"]',
    tooltipPosition: 'top',
    title: 'Draw Notes',
    instruction: 'The Piano Roll is open below. Click on the grid to draw notes. Try creating a simple melody!',
    claudeMessage: "Excellent! The Piano Roll is where the magic happens. Click on the grid to place notes. Each row is a different pitch, and the horizontal axis is time. Try clicking a few spots to create a melody!",
  },
  'play-transport': {
    id: 'play-transport',
    targetSelector: '[data-tutorial="play-button"]',
    tooltipPosition: 'bottom',
    title: 'Play Your Music',
    instruction: 'Press the Play button (or hit Space) to hear what you\'ve created!',
    claudeMessage: "Now let's hear your creation! Hit the Play button or press the Space bar. You can stop playback by pressing Space again.",
  },
  'open-mixer': {
    id: 'open-mixer',
    targetSelector: '[data-tutorial="mixer-toggle"]',
    tooltipPosition: 'top',
    title: 'Open the Mixer',
    instruction: 'Click to expand the Mixer panel. This is where you adjust levels and add effects.',
    claudeMessage: "Let's open the Mixer. This is your control center for balancing track volumes, panning, and adding effects to shape your sound.",
  },
  'adjust-volume': {
    id: 'adjust-volume',
    targetSelector: '[data-tutorial="mixer-fader"]',
    tooltipPosition: 'left',
    title: 'Adjust Volume',
    instruction: 'Drag the volume fader up or down to change the track level.',
    claudeMessage: "Try adjusting the volume fader. Drag it up to make the track louder, or down to make it quieter. Professional mixing is all about finding the right balance.",
  },
  'add-effect': {
    id: 'add-effect',
    targetSelector: '[data-tutorial="effect-rack"]',
    tooltipPosition: 'left',
    title: 'Add an Effect',
    instruction: 'Click "Add Effect" to browse available effects. Try adding a Reverb!',
    claudeMessage: "Now let's add some polish! Click 'Add Effect' to see our library of professional effects. Reverb adds space and depth — it's a great starting point.",
  },
  'use-ai': {
    id: 'use-ai',
    targetSelector: '[data-tutorial="ai-panel"]',
    tooltipPosition: 'left',
    title: 'Chat with AI',
    instruction: 'Open the AI Panel (Cmd/Ctrl+Shift+A) to chat with Claude about mixing, composition, and more.',
    claudeMessage: "Finally, you can chat with me anytime! Open the AI Panel and ask me to help with mixing, suggest chord progressions, analyze your arrangement, or generate ideas. I'm always here to help.",
  },
  complete: {
    id: 'complete',
    targetSelector: 'body',
    tooltipPosition: 'bottom',
    title: 'You\'re Ready!',
    instruction: 'You know the basics. Explore templates, experiment with synths, and let AI help you create amazing music!',
    claudeMessage: "Congratulations! You've learned the basics of Rach. Remember: you can use templates to jumpstart projects, experiment with 5 different synthesizers, and I'm always just a message away. Happy music making!",
  },
};
