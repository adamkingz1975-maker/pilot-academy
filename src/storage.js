import { lessons } from './content.js?v=1.1.0';
export const STORAGE_KEY = 'pilot-academy-state';
const lessonIds = lessons.map(lesson => lesson.id);
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
export function normalizeProgress(input) {
  const value = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const legacy = value.version === undefined;
  const lessonId = legacy ? lessonIds[value.currentLesson] : value.currentLessonId;
  const done = Array.isArray(value.done) ? value.done : [];
  const attempts = count(value.attempts);
  return {
    version: 1,
    lang: value.lang === 'pl' ? 'pl' : 'de',
    trainingCountry: value.trainingCountry === 'PL' ? 'PL' : 'DE',
    currentLessonId: lessonIds.includes(lessonId) ? lessonId : lessonIds[0],
    done: [...new Set(done.map(id => legacy && Number.isInteger(id) ? lessonIds[id] : id).filter(id => lessonIds.includes(id)))],
    attempts,
    score: Math.min(count(value.score), attempts)
  };
}
export function loadProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw === null ? {} : JSON.parse(raw);
    if (parsed?.version !== undefined && parsed.version !== 1) {
      return { progress: normalizeProgress({}), warning: 'storageVersion', writable: false };
    }
    return { progress: normalizeProgress(parsed), warning: null, writable: true };
  } catch {
    return { progress: normalizeProgress({}), warning: 'storageLoad', writable: true };
  }
}
export function saveProgress(storage, progress) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress))); return true; }
  catch { return false; }
}
export function clearProgress(storage) {
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
