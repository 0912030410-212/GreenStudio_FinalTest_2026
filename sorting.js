'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const starters = {
    python: '# 第一部分 · 排序编程\n# 实现升序排序，无需读取输入或编写 main\n\ndef sort_array(arr):\n    # TODO: 在这里编写排序算法\n    # 交换或写入后可调用 snapshot(arr) 记录可视化步骤\n    return arr\n',
    cpp: '// 第一部分 · 排序编程\n// 已提供 vector、algorithm、iostream，无需 main\n\nvoid sort_array(vector<int>& arr) {\n    // TODO: 在这里编写升序排序算法\n    // 交换或写入后可调用 snapshot(arr)\n}\n',
    c: '// 第一部分 · 排序编程\n// 已提供 stdio.h、stdlib.h，无需 main\n\nvoid sort_array(int arr[], int n) {\n    // TODO: 在这里编写升序排序算法\n    // 交换或写入后可调用 snapshot(arr, n)\n}\n'
  };
  const extensions = { python: 'py', cpp: 'cpp', c: 'c' };
  const contracts = {
    python: 'sort_array(arr) · 可用 snapshot(arr) 记录步骤',
    cpp: 'void sort_array(vector<int>& arr) · snapshot(arr)',
    c: 'void sort_array(int arr[], int n) · snapshot(arr, n)'
  };
  const editor = $('codeEditor');
  const storageKey = 'greenexplore.project.sorting.';
  const drafts = {};
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let language = 'python', input = [42, 17, 65, 9, 38, 54, 26, 73];
  let health = null, controller = null, runVersion = 0, validatedKey = null;
  let frames = [], frameIndex = 0, playbackTimer, playing = false, toastTimer;

  function readStorage(key) {
    try { return localStorage.getItem(storageKey + key); } catch { return null; }
  }
  for (const key of Object.keys(starters)) drafts[key] = readStorage(key) ?? starters[key];
  if (Object.hasOwn(starters, readStorage('language'))) language = readStorage('language');

  function saveDraft() {
    drafts[language] = editor.value;
    let saved = true;
    try {
      localStorage.setItem(storageKey + language, editor.value);
      localStorage.setItem(storageKey + 'language', language);
    } catch { saved = false; }
    $('saveStatus').textContent = saved ? '草稿已保存在本机' : '本机存储不可用，请保留源码备份';
    $('editedDot').hidden = editor.value === starters[language];
  }
  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3200);
  }
  function setConsole(message, type = '') {
    $('consoleOutput').className = `console-output ${type}`;
    $('consoleOutput').textContent = message;
  }
  function updateEditor() {
    const lines = editor.value.slice(0, editor.selectionStart).split('\n');
    $('lineNumbers').textContent = editor.value.split('\n').map((_, i) => i + 1).join('\n');
    $('lineNumbers').scrollTop = editor.scrollTop;
    $('cursorPosition').textContent = `Ln ${lines.length}, Col ${lines.at(-1).length + 1}`;
  }
  function currentKey() {
    return JSON.stringify([$('languageSelect').value, editor.value, $('arrayInput').value]);
  }
  function submissionName() {
    const values = [$('studentClass').value.trim(), $('studentName').value.trim()];
    if (values.some(value => !value || value.length > 30 || /[\\/:*?"<>|\u0000-\u001f]/.test(value) || value.includes('..') || /[. ]$/.test(value))) return null;
    return `${values[0]}_${values[1]}.${extensions[language]}`;
  }
  function updateDownload() {
    const passed = validatedKey !== null && validatedKey === currentKey();
    const filename = submissionName();
    $('downloadCodeButton').disabled = !passed || !filename;
    $('downloadHint').textContent = !passed ? '当前代码须先通过当前数组的运行验证，才能下载。'
      : !filename ? '当前数组验证通过。请在页面顶部选择自己的班级和姓名。'
      : `当前数组验证通过。下载后保存到 submissions/${filename}，再提交代码审核。`;
  }
  function setBusy(busy) {
    $('runButton').disabled = busy;
    ($('runButton').querySelector('span') || $('runButton')).textContent = busy ? '执行中…' : '运行并验证';
    $('runButton').setAttribute('aria-busy', String(busy));
  }
  function pausePlayback() {
    playing = false;
    clearTimeout(playbackTimer);
    $('playbackButton').textContent = frameIndex === frames.length - 1 ? '重播' : '继续';
  }
  function renderBars(array, previous = [], complete = false) {
    const bars = $('bars'), low = Math.min(0, ...input, ...array), high = Math.max(1, ...input, ...array);
    while (bars.children.length > array.length) bars.lastElementChild.remove();
    array.forEach((value, index) => {
      let bar = bars.children[index];
      if (!bar) {
        bar = document.createElement('div');
        const label = document.createElement('span');
        label.className = 'bar-value';
        bar.append(label); bars.append(bar);
      }
      bar.className = `bar${complete ? ' complete' : previous.length && value !== previous[index] ? ' changed' : ''}`;
      bar.style.height = `${14 + (value - low) / (high - low) * 76}%`;
      bar.firstElementChild.textContent = value;
      bar.title = `位置 ${index + 1}：${value}`;
    });
    bars.classList.toggle('dense', array.length > 16);
    bars.setAttribute('aria-label', `当前数组：[${array.join(', ')}]`);
    $('arrayCount').textContent = `${array.length} 个元素 · 升序`;
  }
  function displayFrame(index) {
    frameIndex = index;
    const complete = index === frames.length - 1;
    renderBars(frames[index], index ? frames[index - 1] : [], complete);
    $('frameSlider').value = index;
    $('frameCount').textContent = `${index} / ${frames.length - 1}`;
    $('visualStatus').textContent = complete ? '当前数组排序通过' : `排序步骤 ${index}`;
    if (complete) pausePlayback();
    else if (!playing) $('playbackButton').textContent = '继续';
  }
  function startPlayback() {
    if (frames.length < 2) return;
    if (frameIndex === frames.length - 1) displayFrame(0);
    playing = true;
    $('playbackButton').textContent = '暂停';
    function next() {
      if (!playing) return;
      playbackTimer = setTimeout(() => { displayFrame(frameIndex + 1); next(); }, Number($('playbackSpeed').value));
    }
    next();
  }
  function resetVisualization() {
    pausePlayback(); frames = []; frameIndex = 0;
    $('playback').hidden = true;
    $('runDuration').textContent = '等待执行';
    $('visualStatus').textContent = '等待运行';
    renderBars(input);
  }
  function invalidateRun() {
    ++runVersion;
    if (controller) controller.abort();
    controller = null; validatedKey = null;
    setBusy(false); resetVisualization(); updateDownload();
  }
  function setLanguage(next) {
    invalidateRun(); language = next;
    $('languageSelect').value = language;
    editor.value = drafts[language]; editor.scrollTop = 0;
    $('editorFileName').textContent = `sort_array.${extensions[language]}`;
    $('editorContract').textContent = contracts[language];
    updateEditor(); saveDraft(); updateRunnerStatus(); updateDownload();
    setConsole('实现 sort_array 函数后，点击「运行并验证」验证当前数组。');
    document.dispatchEvent(new Event('sorting-language-change'));
  }
  function updateRunnerStatus() {
    const available = health?.languages?.[language]?.available;
    $('runnerStatus').classList.toggle('offline', !available);
    $('runnerStatus').textContent = health ? (available ? '本地运行环境已连接' : '当前语言环境未安装') : '本地运行服务未连接';
  }
  async function connectRunner() {
    try {
      const response = await fetch('/api/health', { signal: AbortSignal.timeout(3500), cache: 'no-store' });
      const result = await response.json();
      health = response.ok && result.ok && result.languages ? result : null;
    } catch { health = null; }
    updateRunnerStatus();
  }
  function readArray() {
    const parts = $('arrayInput').value.trim().replace(/^\[/, '').replace(/\]$/, '').split(/[,，\s]+/).filter(Boolean);
    const valid = parts.length >= 2 && parts.length <= 32 && parts.every(value => /^-?\d+$/.test(value) && Math.abs(Number(value)) <= 999);
    $('arrayError').textContent = valid ? '' : '请输入 2–32 个 -999 到 999 的整数，用逗号或空格分隔。';
    return valid ? parts.map(Number) : null;
  }
  async function runCode() {
    if (controller) return;
    invalidateRun(); saveDraft();
    const array = readArray();
    if (!array) return;
    input = array; resetVisualization();
    if (!editor.value.trim() || new TextEncoder().encode(editor.value).length > 24000) {
      setConsole('请编写非空的 sort_array 函数，源码不能超过 24 KB（UTF-8）。', 'error'); return;
    }
    const version = ++runVersion, key = currentKey(), source = editor.value, selectedLanguage = language;
    const request = new AbortController(); controller = request;
    const timer = setTimeout(() => request.abort(), 20000);
    setBusy(true); setConsole('正在连接本地运行服务…');
    try {
      await connectRunner();
      if (version !== runVersion) return;
      if (!health || !health.languages[selectedLanguage]?.available) {
        setConsole(!health ? '无法连接本地服务。请双击项目目录中的 start.bat，再打开 http://127.0.0.1:8000。'
          : '当前语言环境未安装。请安装 GCC / G++，或切换为 Python。', 'error'); return;
      }
      $('visualStatus').textContent = '正在执行';
      setConsole(`正在${selectedLanguage === 'python' ? '运行' : '编译并运行'}…\n输入：[${array.join(', ')}]`);
      const response = await fetch('/api/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: request.signal,
        body: JSON.stringify({ language: selectedLanguage, code: source, array })
      });
      const result = await response.json();
      if (version !== runVersion || key !== currentKey()) return;
      $('runDuration').textContent = `${Math.round(Number(result.durationMs) || 0)} ms`;
      if (!response.ok || !result.ok) {
        $('visualStatus').textContent = '运行未通过';
        setConsole([result.error || `执行失败（HTTP ${response.status}）`, result.stderr, result.stdout].filter(Boolean).join('\n\n'), 'error'); return;
      }
      const validArray = value => Array.isArray(value) && value.length === array.length && value.every(Number.isSafeInteger);
      const expected = [...array].sort((a, b) => a - b);
      if (!validArray(result.sorted) || result.sorted.some((value, i) => value !== expected[i])) throw new Error('执行服务返回了无效的排序结果。');
      frames = [array];
      const recorded = Array.isArray(result.frames) ? result.frames.filter(validArray).slice(0, 250) : [];
      for (const frame of [...recorded, result.sorted]) if (frame.some((value, i) => value !== frames.at(-1)[i])) frames.push(frame);
      validatedKey = key; updateDownload();
      setConsole(`✓ 当前测试数组排序通过\n输出：[${result.sorted.join(', ')}]\n可更换数组继续验证；此结果仅代表当前数组。${frames.length <= 2 ? '\n调用 snapshot 可记录中间步骤。' : ''}${result.stdout ? `\n\n标准输出：\n${result.stdout}` : ''}${result.stderr ? `\n\n运行提示：\n${result.stderr}` : ''}`, 'success');
      $('playback').hidden = frames.length < 2;
      $('frameSlider').max = frames.length - 1;
      displayFrame(0);
      if (reducedMotion.matches || frames.length <= 2) displayFrame(frames.length - 1);
      else startPlayback();
    } catch (error) {
      if (version !== runVersion) return;
      $('visualStatus').textContent = '执行中断';
      setConsole(request.signal.aborted ? '执行请求超时，请检查代码或重启本地服务。' : `执行失败：${error.message}`, 'error');
    } finally {
      clearTimeout(timer);
      if (version === runVersion) { controller = null; setBusy(false); }
    }
  }

  $('languageSelect').addEventListener('change', event => { saveDraft(); setLanguage(event.target.value); });
  editor.addEventListener('input', () => { invalidateRun(); updateEditor(); saveDraft(); setConsole('代码已修改，请重新运行验证。'); });
  ['click', 'keyup', 'select'].forEach(event => editor.addEventListener(event, updateEditor));
  editor.addEventListener('scroll', () => { $('lineNumbers').scrollTop = editor.scrollTop; });
  editor.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    event.preventDefault(); editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end');
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !$('sortingTask').hidden) { event.preventDefault(); runCode(); }
  });
  $('runButton').addEventListener('click', runCode);
  $('resetCodeButton').addEventListener('click', () => {
    if (editor.value !== starters[language] && !confirm('恢复初始代码会覆盖当前语言的本机草稿。继续吗？')) return;
    drafts[language] = starters[language]; setLanguage(language);
  });
  $('arrayInput').addEventListener('input', () => { invalidateRun(); setConsole('数组已修改，点击运行验证新数组。'); });
  $('arrayForm').addEventListener('submit', event => {
    event.preventDefault(); invalidateRun();
    const array = readArray();
    if (array) { input = array; resetVisualization(); setConsole('数组已应用，点击运行验证。'); }
  });
  $('shuffleButton').addEventListener('click', () => {
    invalidateRun(); input = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 1);
    if (input.every((value, i) => !i || input[i - 1] <= value)) input.reverse();
    $('arrayInput').value = input.join(', '); $('arrayError').textContent = '';
    resetVisualization(); setConsole('随机数组已更新，点击运行验证。');
  });
  $('playbackButton').addEventListener('click', () => playing ? pausePlayback() : startPlayback());
  $('frameSlider').addEventListener('input', event => { pausePlayback(); displayFrame(Number(event.target.value)); });
  $('playbackSpeed').addEventListener('change', () => { if (playing) { pausePlayback(); startPlayback(); } });
  reducedMotion.addEventListener('change', event => { if (event.matches && playing) { pausePlayback(); displayFrame(frames.length - 1); } });
  for (const id of ['studentClass', 'studentName']) for (const event of ['input', 'change']) $(id).addEventListener(event, updateDownload);
  $('downloadCodeButton').addEventListener('click', () => {
    updateDownload();
    if ($('downloadCodeButton').disabled) return;
    const filename = submissionName();
    const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(`已下载 ${filename}，请保存到仓库的 submissions 文件夹。`);
  });
  $('arrayInput').value = input.join(', ');
  setLanguage(language); connectRunner();
})();
