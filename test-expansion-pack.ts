/**
 * End-to-end validation for the Expansion Pack 1 implementation.
 * Tests: new templates, new synths, effect presets, registry integrity.
 */

// ─── Template System Tests ──────────────────────────────────────────────────

import { ALL_TEMPLATES, TEMPLATE_CATEGORIES, searchTemplates } from './src/core/templates/template-registry';
import { CATEGORY_LABELS } from './src/core/templates/template-types';
import type { TemplateCategory } from './src/core/templates/template-types';
import { soulTemplates } from './src/core/templates/genres/soul';
import { metalTemplates } from './src/core/templates/genres/metal';
import { reggaeTemplates } from './src/core/templates/genres/reggae';
import { loFiTemplates } from './src/core/templates/genres/lo-fi';
import { rAndBTemplates } from './src/core/templates/genres/r-and-b';
import { ambientTemplates } from './src/core/templates/genres/ambient';

// ─── Synth Tests ────────────────────────────────────────────────────────────

import { ALL_SYNTH_TYPES, SYNTH_LABELS } from './src/core/synths/synth-factory';
import type { SynthType } from './src/core/synths/synth-interface';

// ─── Effect Preset Tests ────────────────────────────────────────────────────

import { EFFECT_PRESETS, getPresetsForEffect } from './src/core/effects/effect-presets';
import type { EffectType } from './src/core/models/effects';

// ─── Hydration Test ─────────────────────────────────────────────────────────

import { hydrateTemplate } from './src/core/templates/template-hydration';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n📦 EXPANSION PACK 1 — END-TO-END VALIDATION\n');
console.log('═'.repeat(60));

// ─── 1. New Genre Template Counts ───────────────────────────────────────────
console.log('\n1️⃣  NEW GENRE TEMPLATES\n');

assert(soulTemplates.length === 3, `Soul templates: expected 3, got ${soulTemplates.length}`);
assert(metalTemplates.length === 4, `Metal templates: expected 4, got ${metalTemplates.length}`);
assert(reggaeTemplates.length === 3, `Reggae templates: expected 3, got ${reggaeTemplates.length}`);

// Verify template names
const soulNames = soulTemplates.map(t => t.metadata.name);
assert(soulNames.includes('Classic Soul'), 'Soul has "Classic Soul"');
assert(soulNames.includes('Neo-Soul Groove'), 'Soul has "Neo-Soul Groove"');
assert(soulNames.includes('Gospel Soul'), 'Soul has "Gospel Soul"');

const metalNames = metalTemplates.map(t => t.metadata.name);
assert(metalNames.includes('Thrash Metal'), 'Metal has "Thrash Metal"');
assert(metalNames.includes('Heavy Metal'), 'Metal has "Heavy Metal"');
assert(metalNames.includes('Doom Metal'), 'Metal has "Doom Metal"');
assert(metalNames.includes('Progressive Metal'), 'Metal has "Progressive Metal"');

const reggaeNames = reggaeTemplates.map(t => t.metadata.name);
assert(reggaeNames.includes('Roots Reggae'), 'Reggae has "Roots Reggae"');
assert(reggaeNames.includes('Dub'), 'Reggae has "Dub"');
assert(reggaeNames.includes('Dancehall'), 'Reggae has "Dancehall"');

// ─── 2. Updated Genre Template Counts ───────────────────────────────────────
console.log('\n2️⃣  UPDATED GENRE TEMPLATES\n');

assert(loFiTemplates.length === 5, `Lo-Fi templates: expected 5, got ${loFiTemplates.length}`);
assert(rAndBTemplates.length === 6, `R&B templates: expected 6, got ${rAndBTemplates.length}`);
assert(ambientTemplates.length === 6, `Ambient templates: expected 6, got ${ambientTemplates.length}`);

// Verify new additions exist
const loFiNames = loFiTemplates.map(t => t.metadata.name);
assert(loFiNames.includes('Lo-Fi Bedroom'), 'Lo-Fi has "Lo-Fi Bedroom"');
assert(loFiNames.includes('Lo-Fi Rain'), 'Lo-Fi has "Lo-Fi Rain"');

const rnbNames = rAndBTemplates.map(t => t.metadata.name);
assert(rnbNames.includes('Slow Jam'), 'R&B has "Slow Jam"');
assert(rnbNames.includes('Afrobeats R&B'), 'R&B has "Afrobeats R&B"');

const ambientNames = ambientTemplates.map(t => t.metadata.name);
assert(ambientNames.includes('Space Ambient'), 'Ambient has "Space Ambient"');
assert(ambientNames.includes('Generative Ambient'), 'Ambient has "Generative Ambient"');

// ─── 3. Total Template Count ────────────────────────────────────────────────
console.log('\n3️⃣  TOTAL TEMPLATE COUNT\n');

assert(ALL_TEMPLATES.length === 70, `Total templates: expected 70, got ${ALL_TEMPLATES.length}`);

// ─── 4. All Categories Populated ────────────────────────────────────────────
console.log('\n4️⃣  CATEGORY COVERAGE\n');

const allCategoryKeys = Object.keys(CATEGORY_LABELS) as TemplateCategory[];
const categoriesWithTemplates = TEMPLATE_CATEGORIES;

assert(
  categoriesWithTemplates.length === allCategoryKeys.length,
  `All ${allCategoryKeys.length} categories have templates (got ${categoriesWithTemplates.length})`,
);

// Check previously empty categories now have templates
for (const cat of ['soul', 'metal', 'reggae'] as TemplateCategory[]) {
  const count = ALL_TEMPLATES.filter(t => t.metadata.category === cat).length;
  assert(count > 0, `Category "${cat}" has ${count} templates (was 0)`);
}

// ─── 5. Search Function Works ───────────────────────────────────────────────
console.log('\n5️⃣  SEARCH FUNCTION\n');

const soulSearch = searchTemplates(undefined, 'soul');
assert(soulSearch.length === 3, `Search by category "soul": expected 3, got ${soulSearch.length}`);

const metalSearch = searchTemplates(undefined, 'metal');
assert(metalSearch.length === 4, `Search by category "metal": expected 4, got ${metalSearch.length}`);

const reggaeSearch = searchTemplates(undefined, 'reggae');
assert(reggaeSearch.length === 3, `Search by category "reggae": expected 3, got ${reggaeSearch.length}`);

const querySearch = searchTemplates('doom');
assert(querySearch.length >= 1, `Search "doom": found ${querySearch.length} results`);

const advancedSearch = searchTemplates(undefined, 'metal', 'advanced');
assert(advancedSearch.length === 2, `Search metal+advanced: expected 2, got ${advancedSearch.length}`);

// ─── 6. Template Structure Validation ───────────────────────────────────────
console.log('\n6️⃣  TEMPLATE STRUCTURE VALIDATION\n');

for (const tpl of ALL_TEMPLATES) {
  const m = tpl.metadata;
  const p = tpl.project;

  // Metadata completeness
  if (!m.id || !m.name || !m.description || !m.category || !m.difficulty || m.bars <= 0) {
    assert(false, `Template "${m.name}" has incomplete metadata`);
    continue;
  }

  // Project has tracks
  if (p.tracks.length === 0) {
    assert(false, `Template "${m.name}" has no tracks`);
    continue;
  }

  // Each track has at least one clip
  for (const track of p.tracks) {
    if (track.clips.length === 0) {
      assert(false, `Template "${m.name}" track "${track.name}" has no clips`);
    }
  }
}
assert(true, `All ${ALL_TEMPLATES.length} templates have valid structure`);

// ─── 7. Template Hydration ──────────────────────────────────────────────────
console.log('\n7️⃣  TEMPLATE HYDRATION\n');

// Test that hydrating a template produces unique IDs
const testTpl = soulTemplates[0];
const hydrated1 = hydrateTemplate(testTpl.project);
const hydrated2 = hydrateTemplate(testTpl.project);

assert(hydrated1.id !== hydrated2.id, 'Hydrated projects have unique IDs');
assert(hydrated1.tracks[0].id !== hydrated2.tracks[0].id, 'Hydrated tracks have unique IDs');
assert(
  hydrated1.tracks[0].clips[0].id !== hydrated2.tracks[0].clips[0].id,
  'Hydrated clips have unique IDs',
);

// ─── 8. New Synths ──────────────────────────────────────────────────────────
console.log('\n8️⃣  NEW SYNTHS\n');

assert(ALL_SYNTH_TYPES.length === 7, `Synth count: expected 7, got ${ALL_SYNTH_TYPES.length}`);
assert(ALL_SYNTH_TYPES.includes('pluck'), 'SynthType includes "pluck"');
assert(ALL_SYNTH_TYPES.includes('organ'), 'SynthType includes "organ"');
assert(SYNTH_LABELS['pluck'] === 'Pluck', `Pluck label: "${SYNTH_LABELS['pluck']}"`);
assert(SYNTH_LABELS['organ'] === 'Organ', `Organ label: "${SYNTH_LABELS['organ']}"`);

// ─── 9. Effect Presets ──────────────────────────────────────────────────────
console.log('\n9️⃣  EFFECT PRESETS\n');

const presetTypes = Object.keys(EFFECT_PRESETS) as EffectType[];
assert(presetTypes.length === 15, `Effect types with presets: expected 15, got ${presetTypes.length}`);

// Verify specific preset counts
const vcaPresets = getPresetsForEffect('compressor-vca');
assert(vcaPresets.length === 5, `VCA Compressor presets: expected 5, got ${vcaPresets.length}`);

const reverbPresets = getPresetsForEffect('reverb-algorithmic');
assert(reverbPresets.length === 6, `Algorithmic Reverb presets: expected 6, got ${reverbPresets.length}`);

const tapePresets = getPresetsForEffect('delay-tape');
assert(tapePresets.length === 5, `Tape Delay presets: expected 5, got ${tapePresets.length}`);

const distPresets = getPresetsForEffect('distortion');
assert(distPresets.length === 5, `Distortion presets: expected 5, got ${distPresets.length}`);

const eqPresets = getPresetsForEffect('parametric-eq');
assert(eqPresets.length === 5, `Parametric EQ presets: expected 5, got ${eqPresets.length}`);

// Verify no presets for types without entries
const noPresets = getPresetsForEffect('vst3');
assert(noPresets.length === 0, `VST3 presets: expected 0, got ${noPresets.length}`);

// Total preset count
let totalPresets = 0;
for (const type of presetTypes) {
  totalPresets += getPresetsForEffect(type).length;
}
assert(totalPresets >= 55, `Total presets: ${totalPresets} (expected ≥ 55)`);

// Verify preset structure
for (const type of presetTypes) {
  for (const preset of getPresetsForEffect(type)) {
    if (!preset.id || !preset.name || !preset.parameters || typeof preset.parameters !== 'object') {
      assert(false, `Preset "${preset.name}" for "${type}" has invalid structure`);
    }
  }
}
assert(true, 'All presets have valid structure (id, name, parameters)');

// ─── 10. fx() Builder Populates Presets ─────────────────────────────────────
console.log('\n🔟  fx() BUILDER INTEGRATION\n');

import { fx } from './src/core/templates/template-builder';

const testFx = fx('compressor-vca');
assert(testFx.presets.length === 5, `fx('compressor-vca') has ${testFx.presets.length} presets (expected 5)`);

const testFx2 = fx('reverb-algorithmic');
assert(testFx2.presets.length === 6, `fx('reverb-algorithmic') has ${testFx2.presets.length} presets (expected 6)`);

const testFx3 = fx('vst3');
assert(testFx3.presets.length === 0, `fx('vst3') has ${testFx3.presets.length} presets (expected 0)`);

// Verify existing templates now get presets
const anyTemplateWithReverb = ALL_TEMPLATES.find(t =>
  t.project.tracks.some(tr =>
    tr.effects.some(e => e.type === 'reverb-algorithmic')
  )
);
if (anyTemplateWithReverb) {
  const reverbEffect = anyTemplateWithReverb.project.tracks
    .flatMap(tr => tr.effects)
    .find(e => e.type === 'reverb-algorithmic');
  assert(
    (reverbEffect?.presets.length ?? 0) > 0,
    `Existing template "${anyTemplateWithReverb.metadata.name}" reverb has presets`,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
