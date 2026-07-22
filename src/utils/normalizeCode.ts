// Compares typed Python code against known-good answers WITHOUT executing
// anything. We strip all whitespace so indentation/newline style doesn't
// trip up a learner who got the logic right but formatted it differently.
// We also normalize "smart quotes" that mobile keyboards auto-insert
// (e.g. iOS/Android turning " into curly " ") so correct code isn't
// wrongly marked incorrect just because of keyboard auto-punctuation.
export function normalizeCode(code: string): string {
  return code
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, "")
    .trim();
}

export function isCodeAnswerCorrect(userCode: string, acceptedAnswers: string[] = []): boolean {
  const normalizedUser = normalizeCode(userCode);
  if (!normalizedUser) return false;
  return acceptedAnswers.some((ans) => normalizeCode(ans) === normalizedUser);
}