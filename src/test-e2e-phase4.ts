/**
 * Phase 4 E2E Tests — Project Templates, Interactive Tutorial, Performance
 *
 * Run: npx tsx src/test-e2e-phase4.ts
 */

import { strict as assert } from 'assert';

// ═══════════════════════════════════════
// 4A: Template System Tests
// ═══════════════════════════════════════

function testTemplateTypes(): void {
  const { CATEGORY_LABELS } = require('./core/templates/template-types');
  assert.ok(Object.keys(CATEGORY_LABELS).length >= 10, 'Should have 10+ genre categories');
  assert.equal(CATEGORY_LABELS.pop, 'Pop');
  assert.equal(CATEGORY_LABELS.classical, 'Classical');
  assert.equal(CATEGORY_LABELS.edm, 'EDM');
  console.log('  [PASS] Template types & categories');
}

function testTemplateBuilder(): void {
  const { n, midiClip, t, section, fx, buildTemplateProject, meta } = require('./core/templates/template-builder');

  // n() creates a MIDI note
  const note = n(60, 0, 1, 100);
  assert.equal(note.pitch, 60);
  assert.equal(note.startBeat, 0);
  assert.equal(note.durationBeats, 1);
  assert.equal(note.velocity, 100);
  assert.ok(note.id, 'Note should have UUID');

  // n() default velocity
  const note2 = n(72, 4, 2);
  assert.equal(note2.velocity, 100);

  // midiClip() creates a clip with notes
  const clip = midiClip('', 'Test Clip', 0, 4, [note]);
  assert.equal(clip.name, 'Test Clip');
  assert.equal(clip.type, 'midi');
  assert.equal(clip.durationBeats, 4);
  assert.equal(clip.midiData.notes.length, 1);

  // t() creates a track
  const track = t('Piano', 'blue', { instrumentType: 'rach-pad' });
  assert.equal(track.name, 'Piano');
  assert.equal(track.color, 'blue');
  assert.equal(track.type, 'midi');
  assert.equal(track.instrumentType, 'rach-pad');
  assert.equal(track.volume, 0);

  // section() creates a section
  const sec = section('Intro', 0, 16);
  assert.equal(sec.name, 'Intro');
  assert.equal(sec.startBeat, 0);
  assert.equal(sec.durationBeats, 16);

  // fx() creates an effect instance
  const effect = fx('reverb-algorithmic');
  assert.equal(effect.type, 'reverb-algorithmic');
  assert.equal(effect.enabled, true);

  // buildTemplateProject() assembles a project
  const project = buildTemplateProject({
    title: 'Test',
    genre: 'pop',
    tempo: 120,
    tracks: [track],
    sections: [sec],
  });
  assert.equal(project.metadata.title, 'Test');
  assert.equal(project.tempo, 120);
  assert.equal(project.tracks.length, 1);
  assert.equal(project.sections.length, 1);

  // meta() creates metadata
  const m = meta('Test Template', 'pop', 'beginner', 'A test', 16, ['test']);
  assert.equal(m.name, 'Test Template');
  assert.equal(m.category, 'pop');
  assert.equal(m.difficulty, 'beginner');
  assert.equal(m.bars, 16);

  console.log('  [PASS] Template builder helpers');
}

function testTemplateHydration(): void {
  const { buildTemplateProject, t, midiClip, n, section, fx } = require('./core/templates/template-builder');
  const { hydrateTemplate } = require('./core/templates/template-hydration');

  const track = t('Lead', 'red', {
    instrumentType: 'fm',
    clips: [midiClip('', 'Clip 1', 0, 4, [n(60, 0, 1)])],
    effects: [fx('reverb-algorithmic')],
  });

  const project = buildTemplateProject({
    title: 'Hydration Test',
    genre: 'pop',
    tempo: 120,
    tracks: [track],
    sections: [section('Intro', 0, 16)],
  });

  const hydrated = hydrateTemplate(project);

  // All IDs should be different
  assert.notEqual(hydrated.id, project.id, 'Project ID should be regenerated');
  assert.notEqual(hydrated.tracks[0].id, project.tracks[0].id, 'Track ID should be regenerated');
  assert.notEqual(
    hydrated.tracks[0].clips[0].id,
    project.tracks[0].clips[0].id,
    'Clip ID should be regenerated',
  );
  assert.notEqual(
    hydrated.tracks[0].effects[0].id,
    project.tracks[0].effects[0].id,
    'Effect ID should be regenerated',
  );
  assert.notEqual(
    hydrated.sections[0].id,
    project.sections[0].id,
    'Section ID should be regenerated',
  );

  // Clip trackId should reference the new track ID
  assert.equal(
    hydrated.tracks[0].clips[0].trackId,
    hydrated.tracks[0].id,
    'Clip trackId should reference hydrated track',
  );

  // Structure should be preserved
  assert.equal(hydrated.tracks.length, 1);
  assert.equal(hydrated.tracks[0].clips.length, 1);
  assert.equal(hydrated.tracks[0].effects.length, 1);
  assert.equal(hydrated.sections.length, 1);
  assert.equal(hydrated.tempo, 120);
  assert.equal(hydrated.tracks[0].name, 'Lead');

  console.log('  [PASS] Template hydration (UUID regeneration)');
}

function testTemplateRegistry(): void {
  const { ALL_TEMPLATES, TEMPLATE_CATEGORIES, searchTemplates } = require('./core/templates/template-registry');

  assert.ok(ALL_TEMPLATES.length >= 50, `Should have 50+ templates, got ${ALL_TEMPLATES.length}`);
  assert.ok(TEMPLATE_CATEGORIES.length >= 8, `Should have 8+ categories, got ${TEMPLATE_CATEGORIES.length}`);

  // Each template should have required fields
  for (const tpl of ALL_TEMPLATES) {
    assert.ok(tpl.metadata.id, `Template missing id: ${tpl.metadata.name}`);
    assert.ok(tpl.metadata.name, 'Template missing name');
    assert.ok(tpl.metadata.category, `Template missing category: ${tpl.metadata.name}`);
    assert.ok(tpl.metadata.difficulty, `Template missing difficulty: ${tpl.metadata.name}`);
    assert.ok(tpl.project.tracks.length > 0, `Template "${tpl.metadata.name}" has no tracks`);
    assert.ok(tpl.project.tempo > 0, `Template "${tpl.metadata.name}" has invalid tempo`);
  }

  // Search by category
  const popResults = searchTemplates(undefined, 'pop');
  assert.ok(popResults.length >= 3, `Should find 3+ pop templates, got ${popResults.length}`);
  assert.ok(popResults.every((t: { metadata: { category: string } }) => t.metadata.category === 'pop'));

  // Search by difficulty
  const beginnerResults = searchTemplates(undefined, undefined, 'beginner');
  assert.ok(beginnerResults.length >= 5, `Should find 5+ beginner templates`);

  // Search by query
  const jazzSearch = searchTemplates('jazz');
  assert.ok(jazzSearch.length >= 1, `Should find templates matching "jazz"`);

  // Search by category + difficulty
  const combined = searchTemplates(undefined, 'classical', 'beginner');
  assert.ok(combined.length >= 1, `Should find beginner classical templates`);

  console.log(`  [PASS] Template registry (${ALL_TEMPLATES.length} templates, ${TEMPLATE_CATEGORIES.length} categories)`);
}

function testTemplateMusicalContent(): void {
  const { ALL_TEMPLATES } = require('./core/templates/template-registry');

  let totalNotes = 0;
  let totalClips = 0;
  let totalEffects = 0;
  let totalSections = 0;

  for (const tpl of ALL_TEMPLATES) {
    totalSections += tpl.project.sections.length;
    for (const track of tpl.project.tracks) {
      totalEffects += track.effects.length;
      for (const clip of track.clips) {
        totalClips++;
        if (clip.midiData) {
          totalNotes += clip.midiData.notes.length;
          // Verify notes have valid pitches
          for (const note of clip.midiData.notes) {
            assert.ok(
              note.pitch >= 0 && note.pitch <= 127,
              `Invalid pitch ${note.pitch} in template "${tpl.metadata.name}"`,
            );
            assert.ok(
              note.velocity >= 0 && note.velocity <= 127,
              `Invalid velocity ${note.velocity} in template "${tpl.metadata.name}"`,
            );
            assert.ok(note.durationBeats > 0, `Invalid duration in template "${tpl.metadata.name}"`);
          }
        }
      }
    }
  }

  assert.ok(totalNotes > 500, `Should have 500+ total MIDI notes across all templates, got ${totalNotes}`);
  assert.ok(totalClips > 80, `Should have 80+ total clips, got ${totalClips}`);
  assert.ok(totalEffects > 40, `Should have 40+ total effects, got ${totalEffects}`);

  console.log(`  [PASS] Musical content: ${totalNotes} notes, ${totalClips} clips, ${totalEffects} effects, ${totalSections} sections`);
}

// ═══════════════════════════════════════
// 4B: Tutorial System Tests
// ═══════════════════════════════════════

function testTutorialStore(): void {
  const { useTutorialStore, TUTORIAL_STEPS } = require('./stores/tutorial-store');

  // Check steps
  assert.equal(TUTORIAL_STEPS.length, 10);
  assert.equal(TUTORIAL_STEPS[0], 'welcome');
  assert.equal(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1], 'complete');

  // Initial state
  const state = useTutorialStore.getState();
  assert.equal(state.isActive, false);
  assert.equal(state.currentStep, 'welcome');

  // Start tutorial
  state.startTutorial();
  const started = useTutorialStore.getState();
  assert.equal(started.isActive, true);
  assert.equal(started.currentStep, 'welcome');

  // Next step
  started.nextStep();
  const stepped = useTutorialStore.getState();
  assert.equal(stepped.currentStep, 'create-track');
  assert.ok(stepped.completedSteps.has('welcome'));

  // Skip tutorial
  stepped.skipTutorial();
  const skipped = useTutorialStore.getState();
  assert.equal(skipped.isActive, false);
  assert.equal(skipped.hasCompletedTutorial, true);

  // Reset for other tests
  useTutorialStore.setState({
    isActive: false,
    currentStep: 'welcome',
    completedSteps: new Set(),
    hasCompletedTutorial: false,
  });

  console.log('  [PASS] Tutorial store (start, next, skip)');
}

function testTutorialStepDefinitions(): void {
  const { TUTORIAL_STEP_DEFINITIONS } = require('./core/tutorial/tutorial-steps');
  const { TUTORIAL_STEPS } = require('./stores/tutorial-store');

  // Every step should have a definition
  for (const step of TUTORIAL_STEPS) {
    const def = TUTORIAL_STEP_DEFINITIONS[step];
    assert.ok(def, `Missing definition for step "${step}"`);
    assert.ok(def.targetSelector, `Missing targetSelector for step "${step}"`);
    assert.ok(def.title, `Missing title for step "${step}"`);
    assert.ok(def.instruction, `Missing instruction for step "${step}"`);
    assert.ok(def.claudeMessage, `Missing claudeMessage for step "${step}"`);
    assert.ok(
      ['top', 'bottom', 'left', 'right'].includes(def.tooltipPosition),
      `Invalid tooltipPosition for step "${step}"`,
    );
  }

  console.log('  [PASS] Tutorial step definitions (10 steps with selectors, messages)');
}

// ═══════════════════════════════════════
// 4C: Performance Optimization Tests
// ═══════════════════════════════════════

function testReactMemoComponents(): void {
  // Verify React.memo wrapping by checking module exports
  const components = [
    { path: './components/Timeline/ClipView', name: 'ClipView' },
    { path: './components/PianoRoll/NoteBlock', name: 'NoteBlock' },
    { path: './components/Mixer/MixerStrip', name: 'MixerStrip' },
    { path: './components/Timeline/TrackHeader', name: 'TrackHeader' },
    { path: './components/Mixer/VUMeter', name: 'VUMeter' },
    { path: './components/PianoRoll/PianoKeys', name: 'PianoKeys' },
    { path: './components/Timeline/TimelineRuler', name: 'TimelineRuler' },
    { path: './components/AI/ToolExecutionCard', name: 'ToolExecutionCard' },
    { path: './components/SessionView/ClipSlot', name: 'ClipSlot' },
    { path: './components/SessionView/SceneRow', name: 'SceneRow' },
    { path: './components/Templates/TemplateCard', name: 'TemplateCard' },
  ];

  const fs = require('fs');
  const path = require('path');

  for (const { path: modPath, name } of components) {
    const filePath = path.resolve(__dirname, modPath + '.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    assert.ok(
      content.includes('React.memo'),
      `${name} should be wrapped in React.memo`,
    );
  }

  console.log(`  [PASS] React.memo applied to ${components.length} components`);
}

function testSelectiveSubscriptions(): void {
  const fs = require('fs');
  const path = require('path');

  // Timeline.tsx should use individual selectors
  const timelineSrc = fs.readFileSync(
    path.resolve(__dirname, './components/Timeline/Timeline.tsx'),
    'utf-8',
  );
  assert.ok(
    timelineSrc.includes('useProjectStore((s) => s.project)'),
    'Timeline should use selective project subscription',
  );
  assert.ok(
    timelineSrc.includes('useUIStore((s) => s.zoomX)'),
    'Timeline should use selective zoomX subscription',
  );

  // MixerPanel.tsx should use individual selectors
  const mixerSrc = fs.readFileSync(
    path.resolve(__dirname, './components/Mixer/MixerPanel.tsx'),
    'utf-8',
  );
  assert.ok(
    mixerSrc.includes('useProjectStore((s) => s.project)'),
    'MixerPanel should use selective project subscription',
  );

  console.log('  [PASS] Selective Zustand subscriptions');
}

function testLazyLoading(): void {
  const fs = require('fs');
  const path = require('path');

  const layoutSrc = fs.readFileSync(
    path.resolve(__dirname, './components/Layout/MainLayout.tsx'),
    'utf-8',
  );

  assert.ok(
    layoutSrc.includes('React.lazy'),
    'MainLayout should use React.lazy',
  );
  assert.ok(
    layoutSrc.includes('Suspense'),
    'MainLayout should use Suspense',
  );
  assert.ok(
    layoutSrc.includes("import('../PianoRoll/PianoRoll')"),
    'PianoRoll should be lazy loaded',
  );
  assert.ok(
    layoutSrc.includes("import('../SessionView/SessionView')"),
    'SessionView should be lazy loaded',
  );

  console.log('  [PASS] Lazy loading (PianoRoll, SessionView)');
}

function testTrackVirtualization(): void {
  const fs = require('fs');
  const path = require('path');

  const timelineSrc = fs.readFileSync(
    path.resolve(__dirname, './components/Timeline/Timeline.tsx'),
    'utf-8',
  );

  assert.ok(
    timelineSrc.includes('useVirtualization'),
    'Timeline should have virtualization logic',
  );
  assert.ok(
    timelineSrc.includes('tracks.length > 12'),
    'Virtualization should activate at > 12 tracks',
  );
  assert.ok(
    timelineSrc.includes('overscan'),
    'Virtualization should include overscan',
  );
  assert.ok(
    timelineSrc.includes('topPadding'),
    'Virtualization should use padding divs',
  );

  console.log('  [PASS] Track virtualization in Timeline');
}

// ═══════════════════════════════════════
// 4: Integration Tests
// ═══════════════════════════════════════

function testUIStoreTemplateBrowser(): void {
  const { useUIStore } = require('./stores/ui-store');

  const state = useUIStore.getState();
  assert.equal(state.templateBrowserOpen, false);

  state.setTemplateBrowserOpen(true);
  assert.equal(useUIStore.getState().templateBrowserOpen, true);

  state.setTemplateBrowserOpen(false);
  assert.equal(useUIStore.getState().templateBrowserOpen, false);

  console.log('  [PASS] UI store templateBrowserOpen state');
}

// ═══════════════════════════════════════
// Runner
// ═══════════════════════════════════════

function run(): void {
  console.log('\n=== Phase 4 E2E Tests ===\n');

  console.log('4A: Project Template System');
  testTemplateTypes();
  testTemplateBuilder();
  testTemplateHydration();
  testTemplateRegistry();
  testTemplateMusicalContent();

  console.log('\n4B: Interactive Tutorial');
  testTutorialStore();
  testTutorialStepDefinitions();

  console.log('\n4C: Performance Optimization');
  testReactMemoComponents();
  testSelectiveSubscriptions();
  testLazyLoading();
  testTrackVirtualization();

  console.log('\n4: Integration');
  testUIStoreTemplateBrowser();

  console.log('\n=== All Phase 4 tests passed! ===\n');
}

run();
