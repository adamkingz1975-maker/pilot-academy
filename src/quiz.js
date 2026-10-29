export function shuffleOptions(options, random = Math.random) {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
export function createQuestion(question, random) {
  return { id: question.id, options: shuffleOptions(question.options, random).map(option => option.id), answeredId: null };
}
export function submitAnswer(question, session, answerId) {
  if (session.id !== question.id || session.answeredId !== null || !session.options.includes(answerId)) return null;
  session.answeredId = answerId;
  return answerId === question.correctId;
}
