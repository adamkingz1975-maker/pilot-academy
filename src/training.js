// Country is independent of display language. No unverified exam limits or
// national legal requirements are supplied by this foundational release.
export const trainingVariants = {
  DE: { id: 'DE', authority: 'LBA / Landesluftfahrtbehörden', nationalContent: [], examRules: null },
  PL: { id: 'PL', authority: 'ULC', nationalContent: [], examRules: null }
};
export function getTrainingVariant(country) {
  return trainingVariants[country] || trainingVariants.DE;
}
