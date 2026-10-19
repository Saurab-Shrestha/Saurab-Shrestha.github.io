/**
 * The investigation rendered by the Evidence Graph.
 *
 * This is the exact example the case study opens with — "find contradictions
 * across 40 transformer architecture papers" — built from a real, documented
 * disagreement in that literature rather than invented nodes. Every claim below
 * is attributable to a published paper; none of the numbers are stated, because
 * a graph about a system that tracks evidence should not itself assert figures
 * it can't cite.
 *
 * Replace with a serialised graph from an actual Pramana run when one exists.
 */

export type Polarity = 'supports' | 'contradicts';

export interface EvidenceNode {
  id: string;
  /** Short label drawn beside the node. */
  label: string;
  /** Where the claim comes from. */
  source: string;
  polarity: Polarity;
  /**
   * Order of discovery — the graph assembles in this order as you scroll, the
   * way an Investigation accumulates Evidence across successive Queries.
   */
  tier: number;
  /** Unit-ish position; the scene scales these. */
  position: [number, number, number];
}

export const HYPOTHESIS = {
  id: 'h1',
  label: 'Self-attention is essential to transformer performance',
  short: 'H₁',
};

export const EVIDENCE: EvidenceNode[] = [
  {
    id: 'e1',
    label: 'Attention-only encoder–decoder matches recurrent models',
    source: 'Vaswani et al., Attention Is All You Need',
    polarity: 'supports',
    tier: 0,
    position: [-1.15, 0.75, 0.35],
  },
  {
    id: 'e2',
    label: 'Pruning attention heads degrades downstream accuracy',
    source: 'Michel et al., Are Sixteen Heads Really Better Than One?',
    polarity: 'supports',
    tier: 0,
    position: [-1.3, -0.35, -0.5],
  },
  {
    id: 'e3',
    label: 'Unparameterised Fourier mixing retains most of BERT’s accuracy',
    source: 'Lee-Thorp et al., FNet',
    polarity: 'contradicts',
    tier: 1,
    position: [1.25, 0.55, -0.4],
  },
  {
    id: 'e4',
    label: 'Token-mixing MLPs are competitive without any attention',
    source: 'Tolstikhin et al., MLP-Mixer',
    polarity: 'contradicts',
    tier: 1,
    position: [1.35, -0.5, 0.45],
  },
  {
    id: 'e5',
    label: 'Random and learned attention matrices perform comparably',
    source: 'Tay et al., Synthesizer',
    polarity: 'contradicts',
    tier: 2,
    position: [0.55, -1.05, -0.7],
  },
  {
    id: 'e6',
    label: 'Attention distributions are not reliable explanations',
    source: 'Jain & Wallace, Attention Is Not Explanation',
    polarity: 'contradicts',
    tier: 2,
    position: [0.15, 1.15, 0.6],
  },
];

/** Highest tier index, used to map scroll progress onto discovery order. */
export const MAX_TIER = Math.max(...EVIDENCE.map(e => e.tier));
