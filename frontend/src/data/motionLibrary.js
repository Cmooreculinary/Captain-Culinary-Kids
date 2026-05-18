/**
 * Captain Culinary Motion Library — V1 tagged catalog
 *
 * 90 poses sliced from rendered contact sheets, tagged by intent, tier fit,
 * emotional register, and rest-hold suitability. Source of truth for all
 * gesture selection in V1 and V2.
 *
 * Intent vocabulary:
 *   - patient        Arms crossed, listening — "go ahead"
 *   - presenting     Open palm offered — presenting an idea or object
 *   - framing        Both hands open — emphasis, scope, "this big"
 *   - pointing       Index finger up — key point / pay attention
 *   - encouragement  Thumbs up — well done, you got it
 *   - thinking       Hand to chin — let me consider
 *   - precision      Pinched fingers — small, careful, detail
 *   - counting       Two fingers / sequence — "first... second..."
 *   - neutral        Resting pose, low energy, can hold while listening
 *   - safety_stop    Open palm raised — STOP, careful, safety moment
 *
 * Tiers:
 *   - 7-12  Junior Chef       — bigger, broader, more animated
 *   - 13-16 Skill Builder     — demonstrating, calm authority
 *   - 17-19 Launch Path       — chef-instructor mode, contained, professional
 *
 * Registers: warm | focused | alert | playful | contemplative
 */

export const INTENTS = [
  'patient', 'presenting', 'framing', 'pointing', 'encouragement',
  'thinking', 'precision', 'counting', 'neutral', 'safety_stop',
];

export const INTENT_LABELS = {
  patient: 'Patient / listening',
  presenting: 'Presenting',
  framing: 'Framing / scope',
  pointing: 'Key point',
  encouragement: 'Encouragement',
  thinking: 'Thinking',
  precision: 'Precision / detail',
  counting: 'Counting / sequence',
  neutral: 'Neutral / rest',
  safety_stop: 'Safety stop',
};

export const TIERS = ['7-12', '13-16', '17-19'];

export const TIER_LABELS = {
  '7-12': 'Junior Chef',
  '13-16': 'Skill Builder',
  '17-19': 'Launch Path',
};

export const REGISTERS = ['warm', 'focused', 'alert', 'playful', 'contemplative'];

/**
 * The 90 poses. file paths resolve to /motions/cap-NNN.png in the public dir.
 */
export const motionLibrary = [
  { id: 1,  file: 'cap-001.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed, looking aside' },
  { id: 2,  file: 'cap-002.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed, facing forward' },
  { id: 3,  file: 'cap-003.png', intent: 'neutral',       tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: true,  note: 'Arm relaxed at side' },
  { id: 4,  file: 'cap-004.png', intent: 'neutral',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Hand on hip, confident neutral' },
  { id: 5,  file: 'cap-005.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm presenting' },
  { id: 6,  file: 'cap-006.png', intent: 'neutral',       tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: true,  note: 'Arm relaxed, soft posture' },
  { id: 7,  file: 'cap-007.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open, low framing' },
  { id: 8,  file: 'cap-008.png', intent: 'framing',       tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hands at center, gentle framing' },
  { id: 9,  file: 'cap-009.png', intent: 'framing',       tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Hands meeting at center, animated' },
  { id: 10, file: 'cap-010.png', intent: 'pointing',      tiers: ['7-12', '13-16'],          register: 'alert',         canHold: false, note: 'Index finger pointing up — key point' },
  { id: 11, file: 'cap-011.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 12, file: 'cap-012.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 13, file: 'cap-013.png', intent: 'precision',     tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Pinched fingers — detail / small' },
  { id: 14, file: 'cap-014.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm, lower' },
  { id: 15, file: 'cap-015.png', intent: 'pointing',      tiers: ['7-12', '13-16'],          register: 'alert',         canHold: false, note: 'Index finger up' },
  { id: 16, file: 'cap-016.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 17, file: 'cap-017.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 18, file: 'cap-018.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 19, file: 'cap-019.png', intent: 'presenting',    tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Open palm gesturing' },
  { id: 20, file: 'cap-020.png', intent: 'pointing',      tiers: ['7-12'],                   register: 'alert',         canHold: false, note: 'Index up, animated' },
  { id: 21, file: 'cap-021.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm receiving' },
  { id: 22, file: 'cap-022.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 23, file: 'cap-023.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 24, file: 'cap-024.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm offered' },
  { id: 25, file: 'cap-025.png', intent: 'pointing',      tiers: ['7-12', '13-16'],          register: 'alert',         canHold: false, note: 'Index finger up' },
  { id: 26, file: 'cap-026.png', intent: 'thinking',      tiers: ['13-16', '17-19'],         register: 'contemplative', canHold: false, note: 'Hand to chin' },
  { id: 27, file: 'cap-027.png', intent: 'neutral',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Hands clasped, composed' },
  { id: 28, file: 'cap-028.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands gesturing' },
  { id: 29, file: 'cap-029.png', intent: 'framing',       tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Both hands, animated' },
  { id: 30, file: 'cap-030.png', intent: 'framing',       tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hands together at center' },
  { id: 31, file: 'cap-031.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 32, file: 'cap-032.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm' },
  { id: 33, file: 'cap-033.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 34, file: 'cap-034.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 35, file: 'cap-035.png', intent: 'presenting',    tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Open palm gesture' },
  { id: 36, file: 'cap-036.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm, side' },
  { id: 37, file: 'cap-037.png', intent: 'presenting',    tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Hand reaching out' },
  { id: 38, file: 'cap-038.png', intent: 'presenting',    tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Hand explaining' },
  { id: 39, file: 'cap-039.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Open palm' },
  { id: 40, file: 'cap-040.png', intent: 'precision',     tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Pinched fingers — holding small' },
  { id: 41, file: 'cap-041.png', intent: 'pointing',      tiers: ['7-12', '13-16', '17-19'], register: 'alert',         canHold: false, note: 'Index pointing' },
  { id: 42, file: 'cap-042.png', intent: 'framing',       tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Both hands, animated' },
  { id: 43, file: 'cap-043.png', intent: 'presenting',    tiers: ['13-16', '17-19'],         register: 'warm',          canHold: false, note: 'Hand at chest, earnest' },
  { id: 44, file: 'cap-044.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 45, file: 'cap-045.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered, low' },
  { id: 46, file: 'cap-046.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 47, file: 'cap-047.png', intent: 'presenting',    tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Hand reaching forward' },
  { id: 48, file: 'cap-048.png', intent: 'presenting',    tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Arm extended, demonstrating' },
  { id: 49, file: 'cap-049.png', intent: 'presenting',    tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Hand showing' },
  { id: 50, file: 'cap-050.png', intent: 'neutral',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms close, gathered' },
  { id: 51, file: 'cap-051.png', intent: 'patient',       tiers: ['13-16', '17-19'],         register: 'focused',       canHold: true,  note: 'Arms crossed' },
  { id: 52, file: 'cap-052.png', intent: 'neutral',       tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: true,  note: 'Arms folded, gentle' },
  { id: 53, file: 'cap-053.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Hands gesturing together' },
  { id: 54, file: 'cap-054.png', intent: 'counting',      tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Two fingers up — sequence marker' },
  { id: 55, file: 'cap-055.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand presenting' },
  { id: 56, file: 'cap-056.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 57, file: 'cap-057.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 58, file: 'cap-058.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open wide' },
  { id: 59, file: 'cap-059.png', intent: 'framing',       tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Both hands animated' },
  { id: 60, file: 'cap-060.png', intent: 'precision',     tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Hand pinching, careful' },
  { id: 61, file: 'cap-061.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 62, file: 'cap-062.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered, low' },
  { id: 63, file: 'cap-063.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 64, file: 'cap-064.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 65, file: 'cap-065.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 66, file: 'cap-066.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 67, file: 'cap-067.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands gesturing' },
  { id: 68, file: 'cap-068.png', intent: 'pointing',      tiers: ['7-12', '13-16'],          register: 'alert',         canHold: false, note: 'Index up' },
  { id: 69, file: 'cap-069.png', intent: 'framing',       tiers: ['7-12'],                   register: 'playful',       canHold: false, note: 'Hands gesturing, animated' },
  { id: 70, file: 'cap-070.png', intent: 'presenting',    tiers: ['13-16', '17-19'],         register: 'warm',          canHold: false, note: 'Hand at chest, earnest' },
  { id: 71, file: 'cap-071.png', intent: 'encouragement', tiers: ['7-12', '13-16'],          register: 'playful',       canHold: false, note: 'Thumbs up — well done' },
  { id: 72, file: 'cap-072.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 73, file: 'cap-073.png', intent: 'precision',     tiers: ['13-16', '17-19'],         register: 'focused',       canHold: false, note: 'Pinched fingers' },
  { id: 74, file: 'cap-074.png', intent: 'encouragement', tiers: ['7-12', '13-16'],          register: 'playful',       canHold: false, note: 'Thumbs up — encouragement' },
  { id: 75, file: 'cap-075.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 76, file: 'cap-076.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 77, file: 'cap-077.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 78, file: 'cap-078.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 79, file: 'cap-079.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 80, file: 'cap-080.png', intent: 'presenting',    tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Hand reaching' },
  { id: 81, file: 'cap-081.png', intent: 'pointing',      tiers: ['7-12', '13-16'],          register: 'alert',         canHold: false, note: 'Index up' },
  { id: 82, file: 'cap-082.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 83, file: 'cap-083.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 84, file: 'cap-084.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 85, file: 'cap-085.png', intent: 'pointing',      tiers: ['7-12', '13-16', '17-19'], register: 'alert',         canHold: false, note: 'Index pointing' },
  { id: 86, file: 'cap-086.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 87, file: 'cap-087.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 88, file: 'cap-088.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
  { id: 89, file: 'cap-089.png', intent: 'framing',       tiers: ['7-12', '13-16'],          register: 'warm',          canHold: false, note: 'Both hands open' },
  { id: 90, file: 'cap-090.png', intent: 'presenting',    tiers: ['7-12', '13-16', '17-19'], register: 'warm',          canHold: false, note: 'Hand offered' },
];

/**
 * Known coverage gaps — flagged for the next render batch.
 */
export const COVERAGE_GAPS = [
  {
    intent: 'safety_stop',
    needed: 2,
    description:
      'Open palm raised, clear "STOP / careful" gesture for knife, heat, ' +
      'raw-meat, and chemical moments. Current library has zero poses ' +
      'matching this intent. Required for the safety standard in PRD.md.',
  },
];

export default motionLibrary;
