const platforms = { app: '앱', ide: 'IDE 확장', cli: '터미널' };
const all = ['app', 'ide', 'cli'];
const stages = [
  ['시작 전 준비', '현재 상태와 작업 기준부터 확인하세요.'],
  ['방향 잡고 작업하기', '계획을 세우고, 필요한 맥락을 더하세요.'],
  ['변경 사항 검토하기', '작업 결과를 확인하는 습관을 만드세요.'],
  ['대화 이어가기', '긴 작업도 맥락을 관리하며 이어가세요.']
];
// Support is grounded in the official pages linked in each entry and the footer.
const commands = [
  { name: '/status', title: '현재 상태 확인', stage: 0, platforms: all, desc: '컨텍스트 사용량 등 현재 대화 상태를 확인합니다.', tip: '첫 작업 전에 실행해 보세요.' },
  { name: '/model', title: '모델 선택', stage: 0, platforms: all, desc: '현재 대화에서 사용할 모델을 선택합니다.', tip: '목록에 표시된 모델 중 선택하세요.' },
  { name: '/init', title: '프로젝트 규칙 만들기', stage: 0, platforms: all, desc: '프로젝트 지침 파일 AGENTS.md의 초안을 생성합니다.', tip: '생성 후 프로젝트 규칙에 맞게 검토하세요.' },
  { name: '/plan', title: '계획부터 세우기', stage: 1, platforms: all, desc: '여러 단계의 작업을 계획 모드로 시작합니다.', tip: '실습: 선택 후 “로그인 기능 구현 계획을 세워줘.”' },
  { name: '/ide-context', title: '편집기 맥락 연결', stage: 1, platforms: ['app', 'ide'], desc: 'IDE 맥락 공유를 켜거나 끕니다.', tip: '열린 코드와 관련된 질문에 활용해 보세요.' },
  { name: '/mention', title: '파일 지정하기', stage: 1, platforms: ['cli'], desc: '대화에 참고할 파일을 지정합니다.', tip: '실습: /mention 다음에 파일 경로를 입력하세요.' },
  { name: '/diff', title: '수정 내용 살펴보기', stage: 2, platforms: ['cli'], desc: '추적되지 않은 파일을 포함해 Git 차이를 표시합니다.', tip: '커밋 전에 변경 내용을 읽어 보세요.' },
  { name: '/review', title: '코드 검토 요청', stage: 2, platforms: all, desc: '코드 변경 사항의 검토를 시작합니다.', tip: '발견한 문제를 확인하고 수정 요청을 이어가세요.' },
  { name: '/compact', title: '긴 대화 정리', stage: 3, platforms: all, desc: '대화 맥락을 압축합니다.', tip: '대화가 길어졌을 때 사용해 보세요.' },
  { name: '/fork', title: '다른 방향 탐색', stage: 3, platforms: all, desc: '현재 대화를 복사해 새 대화로 분기합니다.', tip: '대안을 비교하고 싶을 때 활용하세요.' },
  { name: '/new', title: '새 대화 시작', stage: 3, platforms: ['cli'], desc: '같은 CLI 세션에서 새 대화를 시작합니다.', tip: '별개의 작업을 시작할 때 사용하세요.' },
  { name: '/resume', title: '이전 작업 재개', stage: 3, platforms: ['cli'], desc: '저장된 대화를 선택해 이어갑니다.', tip: '중단했던 작업으로 돌아가 보세요.' }
];
let platform = 'all';
let stage = 'all';
let completed = new Set();
try { const saved = JSON.parse(localStorage.getItem('slash-guide-completed') || '[]'); if (Array.isArray(saved)) completed = new Set(saved.filter(name => commands.some(c => c.name === name))); } catch {}
const search = document.querySelector('#search');
const list = document.querySelector('#command-list');
let toastTimer;
function notify(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 2600); }
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = commands.filter(c => (platform === 'all' || c.platforms.includes(platform)) && (stage === 'all' || c.stage === Number(stage)) && `${c.name} ${c.title} ${c.desc} ${c.tip}`.toLowerCase().includes(query));
  list.innerHTML = stages.map(([title, subtitle], index) => {
    const entries = visible.filter(c => c.stage === index);
    if (!entries.length) return '';
    return `<section class="chapter"><div class="chapter-heading"><span class="chapter-number">0${index + 1}</span><div><h2>${title}</h2><p>${subtitle}</p></div><span class="chapter-count">${entries.length}개 명령어</span></div><div class="cards">${entries.map(c => {
      const done = completed.has(c.name);
      const source = c.platforms.includes('app') ? 'https://learn.chatgpt.com/docs/reference/slash-commands' : 'https://learn.chatgpt.com/docs/developer-commands?surface=cli';
      return `<article class="card ${done ? 'done' : ''}"><div class="card-top"><span class="ordinal">${String(commands.indexOf(c) + 1).padStart(2, '0')}</span><div class="badges">${c.platforms.map(p => `<span>${platforms[p]}</span>`).join('')}</div></div><div class="command-line"><h3><code>${c.name}</code></h3><button class="copy" data-copy="${c.name}" aria-label="${c.name} 복사">복사</button></div><h4>${c.title}</h4><p class="description">${c.desc}</p><details><summary>사용 팁 보기</summary><p>${c.tip}</p><a href="${source}" target="_blank" rel="noopener noreferrer">공식 사용법 ↗</a></details><button class="complete" data-complete="${c.name}" aria-pressed="${done}"><span aria-hidden="true">${done ? '✓' : '○'}</span> ${done ? '학습 완료' : '학습 완료 표시'}</button></article>`;
    }).join('')}</div></section>`;
  }).join('');
  document.querySelector('#empty').hidden = visible.length > 0;
  document.querySelector('#result-count').textContent = `${visible.length}개 명령어`;
  document.querySelector('#progress').textContent = `${completed.size} / ${commands.length} 완료`;
}
function updateControls() {
  document.querySelectorAll('[data-platform]').forEach(b => { const active = b.dataset.platform === platform; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', active); });
  document.querySelectorAll('[data-stage]').forEach(b => { const active = b.dataset.stage === stage; b.classList.toggle('active', active); b.setAttribute('aria-pressed', active); });
}
document.querySelector('.filters').addEventListener('click', e => { const b = e.target.closest('[data-platform]'); if (!b) return; platform = b.dataset.platform; updateControls(); render(); });
document.querySelector('#steps').addEventListener('click', e => { const b = e.target.closest('[data-stage]'); if (!b) return; stage = b.dataset.stage; updateControls(); render(); document.querySelector('#commands').scrollIntoView({ behavior: 'instant' }); });
search.addEventListener('input', render);
document.querySelector('#clear-filters').addEventListener('click', () => { platform = stage = 'all'; search.value = ''; updateControls(); render(); search.focus(); });
list.addEventListener('click', async e => {
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    try { await navigator.clipboard.writeText(copy.dataset.copy); notify(`${copy.dataset.copy} 복사했어요.`); }
    catch { const range = document.createRange(); range.selectNodeContents(copy.previousElementSibling); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); notify('명령어를 선택했어요. Ctrl+C 또는 ⌘C로 복사하세요.'); }
  }
  const button = e.target.closest('[data-complete]');
  if (!button) return;
  const name = button.dataset.complete;
  completed.has(name) ? completed.delete(name) : completed.add(name);
  saveProgress();
  button.setAttribute('aria-pressed', completed.has(name));
  button.innerHTML = `<span aria-hidden="true">${completed.has(name) ? '✓' : '○'}</span> ${completed.has(name) ? '학습 완료' : '학습 완료 표시'}`;
  button.closest('.card').classList.toggle('done', completed.has(name));
  document.querySelector('#progress').textContent = `${completed.size} / ${commands.length} 완료`;
});
function saveProgress() { try { localStorage.setItem('slash-guide-completed', JSON.stringify([...completed])); } catch { notify('이 브라우저에서는 학습 기록이 이번 방문에만 유지됩니다.'); } }
document.querySelector('#reset-progress').addEventListener('click', () => { completed.clear(); saveProgress(); render(); notify('학습 기록을 초기화했어요.'); });
document.addEventListener('keydown', e => { if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); search.focus(); } if (e.key === 'Escape' && document.activeElement === search) { search.value = ''; render(); search.blur(); } });
render();
