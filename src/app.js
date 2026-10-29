import { lessons, questions } from './content.js?v=1.1.0';
import { loadProgress, saveProgress, clearProgress } from './storage.js?v=1.1.0';
import { createQuestion, submitAnswer } from './quiz.js?v=1.1.0';
import { createOfflineManager } from './offline.js?v=1.1.0';
import { renderApp, renderOfflinePanel } from './ui.js?v=1.1.0';
import { translate } from './i18n.js?v=1.1.0';
export function startApp() {
let storage;
try { storage = window.localStorage; } catch { /* Storage may be blocked by Safari. */ }
const loaded = loadProgress(storage);
const state = { progress: loaded.progress, warning: loaded.warning, tab: 'home', questionIndex: 0, question: createQuestion(questions[0]), offlineStatus: navigator.onLine ? 'offlineUnknown' : 'offline' };
const app = document.querySelector('#app');
function render(focus = null) {
  document.documentElement.lang = state.progress.lang;
  document.querySelector('meta[name="description"]').content = translate(state.progress.lang, 'installDescription');
  const manifest = document.querySelector('link[rel="manifest"]');
  manifest.href = state.progress.lang === 'pl' ? './manifest.pl.webmanifest' : './manifest.webmanifest';
  app.innerHTML = renderApp(state);
  if (focus) app.querySelector(focus)?.focus();
}
function store() {
  if (!loaded.writable) { state.warning = 'storageVersion'; return; }
  if (!saveProgress(storage,state.progress)) state.warning = 'storageSave';
}
function stop() { window.speechSynthesis?.cancel(); }
function speak() {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { alert(translate(state.progress.lang,'speechUnavailable')); return; }
  stop();
  const lang=state.progress.lang;
  const text=state.tab==='lesson'?lessons.find(l=>l.id===state.progress.currentLessonId).paragraphs[lang].join(' '):questions[state.questionIndex].text[lang];
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=lang==='de'?'de-DE':'pl-PL'; utterance.rate=.88;
  speechSynthesis.speak(utterance);
}
app.addEventListener('click', event => {
  const button=event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const {action,value}=button.dataset;
  if (action==='retryOffline') { offline.retry(); return; }
  if (action==='checkUpdate') { offline.retry(); return; }
  if (action==='speak') { speak(); return; }
  if (action==='stop') { stop(); return; }
  if (action==='tab') { stop(); state.tab=value; }
  if (action==='country' && ['DE','PL'].includes(value)) { state.progress.trainingCountry=value; store(); }
  if (action==='language' && ['de','pl'].includes(value)) { stop(); state.progress.lang=value; store(); }
  if (action==='subject') {
    const lesson=lessons.find(l=>l.subjectId===value);
    if (!lesson) { alert(translate(state.progress.lang,'unavailable')); return; }
    state.progress.currentLessonId=lesson.id; state.tab='lesson'; store();
  }
  if (action==='lesson' && lessons.some(l=>l.id===value)) { state.progress.currentLessonId=value; state.tab='lesson'; store(); }
  if (action==='finish' && lessons.some(l=>l.id===value)) {
    if (!state.progress.done.includes(value)) state.progress.done.push(value);
    stop(); state.tab='quiz'; store();
  }
  if (action==='answer') {
    const correct=submitAnswer(questions[state.questionIndex],state.question,value);
    if (correct===null) return;
    state.progress.attempts++; if(correct) state.progress.score++; store();
  }
  if (action==='next') {
    state.questionIndex=(state.questionIndex+1)%questions.length;
    state.question=createQuestion(questions[state.questionIndex]);
  }
  if (action==='reset' && confirm(translate(state.progress.lang,'confirmReset'))) {
    if (clearProgress(storage)) { stop(); location.reload(); return; }
    state.warning='storageSave';
  }
  const focus = action === 'answer' ? '#quiz-feedback' : action === 'next' ? '#question-title' :
    ['language','country'].includes(action) ? `[data-action="${action}"][data-value="${value}"]` : '#view h1';
  render(focus);
});
render();
const offline = createOfflineManager(status => {
  state.offlineStatus = status.ready ? 'offlineReady' : status.failed ? 'offlineError' : status.installing ? 'offlineInstalling' : 'offlineUnknown';
  if (!navigator.onLine && !status.failed) state.offlineStatus = 'offline';
  state.offlineFailed = status.failed;
  state.updateWaiting = status.waiting;
  // Network events must not replace the current learning view or steal focus.
  const panel = document.querySelector('#offline-panel');
  if (panel) panel.innerHTML = renderOfflinePanel(state);
  const badge = document.querySelector('#offline');
  if (badge) badge.textContent = translate(state.progress.lang, state.offlineStatus);
});
offline.start();
}
