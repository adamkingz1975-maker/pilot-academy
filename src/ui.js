import { subjects, lessons, questions } from './content.js?v=1.1.1';
import { getTrainingVariant } from './training.js?v=1.1.1';
import { translate } from './i18n.js?v=1.1.1';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderOfflinePanel(state) {
  const t = key => escapeHtml(translate(state.progress.lang,key));
  return `${state.offlineFailed ? `<div class="notice" role="alert"><p>${t('offlineFailureInfo')}</p><button data-action="retryOffline">${t('retryOffline')}</button></div>` : ''}${state.updateWaiting ? `<div class="notice" role="status"><p>${t('updateWaiting')}</p><p>${t('updateClose')}</p></div>` : ''}`;
}
export function renderApp(state) {
  const p = state.progress, lang = p.lang, t = (key, values) => escapeHtml(translate(lang,key,values));
  const text = value => escapeHtml(value[lang]);
  const button = (action, label, value = '', cls = '') => `<button class="${cls}" data-action="${action}" data-value="${escapeHtml(value)}" ${action==='tab' && state.tab===value?'aria-current="page"':''}>${label}</button>`;
  const languages = ['de','pl'].map(l => button('language',l === 'de' ? 'Deutsch' : 'Polski',l,p.lang === l ? 'active' : '')).join('');
  const variant = getTrainingVariant(p.trainingCountry);
  const countryLabel = translate(lang, variant.id === 'PL' ? 'countryPL' : 'countryDE');
  let body = '';
  if (state.tab === 'home') body = `<section class="card hero"><div class="eyebrow">${t('academy')}</div><h1>${t('headline')}</h1><p>${t('intro')}</p><div class="progress"><div style="width:${100*p.done.length/lessons.length}%"></div></div><p>${t('completed',{done:p.done.length,total:lessons.length})}</p>${button('lesson',t('resume'),p.currentLessonId,'primary')}</section><div class="grid">${button('tab',`📘 ${t('book')}<br>${t('readOffline')}`,'book','card subject')}${button('tab',`🎯 ${t('quiz')}<br>${t('practiced',{count:p.attempts})}`,'quiz','card subject')}${button('tab',`🧭 ${t('syllabus')}<br>${t('nineSubjects')}`,'subjects','card subject')}</div>`;
  if (state.tab === 'subjects') body = `<h1>${t('subjectsTitle')}</h1><p>${t('subjectsIntro')}</p><div class="grid">${subjects.map((s,i) => button('subject',`<span class="number">${t('subject')} ${i+1}</span><b>${text(s.title)}</b><small>${text(s.description)}</small>`,s.id,'card subject')).join('')}</div>`;
  if (state.tab === 'book') body = `<h1>${t('bookTitle')}</h1><p>${t('bookIntro')}</p>${lessons.map((l,i) => button('lesson',`<b>${l.icon} ${t('chapter')} ${i+1}: ${text(l.title)}</b>${p.done.includes(l.id)?`<p>✓ ${t('read')}</p>`:''}`,l.id,'card full')).join('')}`;
  if (state.tab === 'lesson') {
    const l = lessons.find(l => l.id === p.currentLessonId), subject = subjects.find(s => s.id === l.subjectId);
    body = `${button('tab',t('back'),'book')}<section class="card"><span class="eyebrow">${t('chapter')} ${lessons.indexOf(l)+1} · ${text(subject.title)}</span><h1>${text(l.title)}</h1><div class="visual">${l.icon}</div><div class="actions">${languages}${button('speak',t('speak'))}${button('stop',t('stop'))}</div><div class="lesson-content">${l.paragraphs[lang].map(s=>`<p>${escapeHtml(s)}</p>`).join('')}</div><h3>Deutsch – Polski</h3>${l.terms.map(term=>`<div class="term"><span lang="de">${escapeHtml(term[0])}</span> → <span lang="pl">${escapeHtml(term[1])}</span></div>`).join('')}${button('finish',t('finish'),l.id,'primary')}</section>`;
  }
  if (state.tab === 'quiz') {
    const q = questions[state.questionIndex], session = state.question, answered = session.answeredId !== null;
    body = `<div class="eyebrow">${t('question',{current:state.questionIndex+1,total:questions.length})}</div><h1>${t('quizTitle')}</h1><section class="card"><h2 id="question-title" tabindex="-1">${text(q.text)}</h2>${button('speak',t('speak'))}<div class="options">${session.options.map((id,i)=>{
      const option=q.options.find(o=>o.id===id);
      const cls=answered?(id===q.correctId?'correct':id===session.answeredId?'wrong':''):'';
      return `<button data-action="answer" data-value="${id}" class="${cls}" ${answered?'disabled':''}>${String.fromCharCode(65+i)} · ${text(option.text)}</button>`;
    }).join('')}</div><p id="quiz-feedback" tabindex="-1" aria-live="polite" aria-atomic="true">${answered?`<strong>${t(session.answeredId===q.correctId?'correct':'wrong')}</strong> ${text(q.explanation)}`:''}</p>${answered?button('next',t('next'),'','primary'):''}</section><p>${t('stats',{score:p.score,attempts:p.attempts})} ${t('examples')}</p>`;
  }
  if (state.tab === 'settings') body=`<h1>${t('settings')}</h1><section class="card"><h3>${t('country')}</h3><div class="actions">${['DE','PL'].map(country=>button('country',t(country==='DE'?'countryDE':'countryPL'),country,variant.id===country?'active':'')).join('')}</div><p>${t('countryInfo')}</p><p>${t('nationalPending',{country:countryLabel})}</p></section><section class="card"><h3>${t('language')}</h3><div class="actions">${languages}</div><p>${t('audioInfo')}</p></section><section class="card"><h3>${t('privacy')}</h3><p>${t('privacyInfo')}</p><p>${t('installInfo')}</p><p><a href="./recovery/">${t('recovery')}</a></p>${button('checkUpdate',t('checkUpdate'))}${button('reset',t('reset'))}</section>`;
  return `<header><div class="brand"><span class="wing">✈</span> PILOT ACADEMY <small>· PPL(A)</small></div><span class="badge" id="offline">${t(state.offlineStatus)}</span></header><nav aria-label="${t('syllabus')}">${['home','subjects','book','quiz','settings'].map(tab=>button('tab',t(tab),tab,state.tab===tab?'active':'')).join('')}</nav>${state.warning?`<p class="notice" role="status">${t(state.warning)}</p>`:''}<p class="muted" id="training-context">${t('shared')} · ${t('country')}: ${escapeHtml(countryLabel)}</p><section id="offline-panel" aria-label="${t('offlineManagement')}">${renderOfflinePanel(state)}</section><div id="view">${body.replaceAll('<h1>','<h1 tabindex="-1">')}</div><footer>${t('footer')}</footer>`;
}
