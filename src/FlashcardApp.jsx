import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Trash2, Clock, ArrowLeft, BookOpen, Settings, Key, Server, X, Eye, EyeOff, Palette } from 'lucide-react';

// ===== ТЕМЫ =====
const themes = {
  scandinavian: {
    name: 'Скандинавский',
    icon: 'S',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    cardShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)',
    cardShadowLg: '0 4px 16px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    accent: '#10B981',
    accentHover: '#059669',
    accentText: '#FFFFFF',
    link: '#3B82F6',
    tabBg: '#E2E8F0',
    tabActive: '#FFFFFF',
    tabText: '#64748B',
    tabActiveText: '#0F172A',
    inputBg: '#F1F5F9',
    inputBorder: '#E2E8F0',
    navBg: '#E2E8F0',
    navText: '#334155',
    navActive: '#0F172A',
    dangerBg: '#FEE2E2',
    dangerText: '#DC2626',
    headerText: '#0F172A',
    savedBtnBg: '#F1F5F9',
    savedBtnText: '#64748B',
    settingsBtnText: '#94A3B8',
    modalOverlay: 'rgba(15,23,42,0.3)',
    indicatorText: '#94A3B8',
    counterBg: '#E2E8F0',
    counterText: '#334155',
    flipHint: '#94A3B8',
    historyItemBg: '#FFFFFF',
    emptyBg: '#F1F5F9',
    emptyText: '#94A3B8',
  },
  ocean: {
    name: 'Океан',
    icon: 'O',
    bg: '#6A9BCC',
    card: '#FFFFFF',
    cardShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
    cardShadowLg: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
    textPrimary: '#1E293B',
    textSecondary: '#8899AA',
    textMuted: '#FFFFFF80',
    accent: '#111827',
    accentHover: '#1F2937',
    accentText: '#FFFFFF',
    link: '#FFFFFF',
    tabBg: 'rgba(255,255,255,0.2)',
    tabActive: '#FFFFFF',
    tabText: '#FFFFFFDD',
    tabActiveText: '#374151',
    inputBg: '#FFFFFF',
    inputBorder: '#E5E7EB',
    navBg: 'rgba(255,255,255,0.25)',
    navText: '#FFFFFF',
    navActive: '#FFFFFF',
    dangerBg: '#FEE2E2',
    dangerText: '#DC2626',
    headerText: '#FFFFFF',
    savedBtnBg: 'rgba(255,255,255,0.15)',
    savedBtnText: '#FFFFFFCC',
    settingsBtnText: '#FFFFFF99',
    modalOverlay: 'rgba(0,0,0,0.5)',
    indicatorText: '#FFFFFF66',
    counterBg: 'rgba(255,255,255,0.15)',
    counterText: '#FFFFFF',
    flipHint: '#94A3B8',
    historyItemBg: '#FFFFFF',
    emptyBg: 'rgba(255,255,255,0.1)',
    emptyText: '#FFFFFF99',
  },
  midnight: {
    name: 'Полночь',
    icon: 'P',
    bg: '#0F172A',
    card: '#1E293B',
    cardShadow: '0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    cardShadowLg: '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    accent: '#6366F1',
    accentHover: '#4F46E5',
    accentText: '#FFFFFF',
    link: '#818CF8',
    tabBg: '#1E293B',
    tabActive: '#334155',
    tabText: '#64748B',
    tabActiveText: '#F1F5F9',
    inputBg: '#0F172A',
    inputBorder: '#334155',
    navBg: '#1E293B',
    navText: '#94A3B8',
    navActive: '#F1F5F9',
    dangerBg: '#7F1D1D',
    dangerText: '#FCA5A5',
    headerText: '#F1F5F9',
    savedBtnBg: '#1E293B',
    savedBtnText: '#94A3B8',
    settingsBtnText: '#475569',
    modalOverlay: 'rgba(0,0,0,0.7)',
    indicatorText: '#475569',
    counterBg: '#1E293B',
    counterText: '#CBD5E1',
    flipHint: '#475569',
    historyItemBg: '#1E293B',
    emptyBg: '#1E293B',
    emptyText: '#475569',
  }
};

const FlashcardApp = () => {
  const [mode, setMode] = useState('create');
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState('describe');
  const [animating, setAnimating] = useState(false);
  const [savedSets, setSavedSets] = useState([]);
  const [currentSetTitle, setCurrentSetTitle] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [apiMode, setApiMode] = useState(() => localStorage.getItem('apiMode') || 'proxy');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('api');
  const [themeId, setThemeId] = useState(() => localStorage.getItem('theme') || 'scandinavian');

  const t = themes[themeId];

  const SYSTEM_PROMPT = `Ты — преподаватель немецкого языка для русскоязычных студентов.
Твоя задача — создавать обучающие флеш-карточки.

Правила:
- На лицевой стороне (front): немецкое слово или фраза. Для существительных обязательно указывай артикль (der/die/das) и форму множественного числа. Для глаголов — инфинитив.
- На обратной стороне (back): русский перевод, затем через пустую строку — пример употребления на немецком с переводом на русский. НЕ пиши слово «Пример:» перед примером, просто дай предложение.
- Карточки должны быть практичными и полезными для повседневного общения.
- Уровень сложности: от A1 до B2, адаптируйся под тему.
- Отвечай ТОЛЬКО валидным JSON-массивом без какого-либо текста вокруг.`;

  // ===== STORAGE =====
  const getKeysByPrefix = (prefix) => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    return keys;
  };

  const loadSavedSets = () => {
    setLoadingHistory(true);
    try {
      const keys = getKeysByPrefix('flashset:');
      const sets = keys.map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }).filter(Boolean);
      sets.sort((a, b) => b.createdAt - a.createdAt);
      setSavedSets(sets);
    } catch { setSavedSets([]); }
    setLoadingHistory(false);
  };

  const saveCurrentSet = () => {
    const id = Date.now().toString();
    const d = { id, title: currentSetTitle || topic.slice(0, 60), cards: flashcards, createdAt: Date.now(), cardCount: flashcards.length };
    try { localStorage.setItem(`flashset:${id}`, JSON.stringify(d)); setIsSaved(true); setSavedSets(prev => [d, ...prev]); }
    catch { alert('Не удалось сохранить.'); }
  };

  const deleteSet = (id) => {
    try { localStorage.removeItem(`flashset:${id}`); setSavedSets(prev => prev.filter(s => s.id !== id)); setConfirmDelete(null); }
    catch { alert('Не удалось удалить.'); }
  };

  const openSavedSet = (set) => {
    setFlashcards(set.cards); setCurrentSetTitle(set.title);
    setCurrentIndex(0); setFlipped(false); setIsSaved(true); setMode('study');
  };

  useEffect(() => { loadSavedSets(); }, []);

  const changeTheme = (id) => { setThemeId(id); localStorage.setItem('theme', id); };

  // ===== API =====
  const callAPI = async (userPrompt) => {
    const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: userPrompt }] };
    if (apiMode === 'key' && apiKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } else {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      return await res.json();
    }
  };

  const generateFlashcards = async () => {
    if (!topic.trim()) return;
    if (apiMode === 'key' && !apiKey) { setShowSettings(true); setSettingsTab('api'); return; }
    setMode('loading'); setIsSaved(false); setCurrentSetTitle(topic.slice(0, 60));
    let p;
    if (activeTab === 'paste') {
      p = `Проанализируй следующий немецкий текст и извлеки 5–10 ключевых слов.\n\nТекст:\n"""\n${topic}\n"""\n\nФормат — только JSON:\n[{"front":"das Wort, -̈er","back":"слово\\n\\nDieses Wort ist sehr wichtig. — Это слово очень важное."}]`;
    } else {
      p = `Создай 10 флеш-карточек по теме: "${topic}".\n\nФормат — только JSON:\n[{"front":"слово с артиклем","back":"перевод\\n\\nпредложение — перевод"}]`;
    }
    try {
      const data = await callAPI(p);
      const text = data.content.map(i => i.text || "").join("\n");
      setFlashcards(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setCurrentIndex(0); setFlipped(false); setMode('study');
    } catch (e) {
      console.error(e);
      alert(apiMode === 'key' ? 'Ошибка API. Проверьте ключ.' : 'Ошибка сервера. Проверьте настройки.');
      setMode('create');
    }
  };

  const handleFlip = () => setFlipped(!flipped);
  const navigate = (dir) => {
    const next = currentIndex + dir;
    if (next < 0 || next >= flashcards.length || animating) return;
    setAnimating(true);
    setTimeout(() => { setFlipped(false); setCurrentIndex(next); setTimeout(() => setAnimating(false), 50); }, 150);
  };

  useEffect(() => {
    const h = (e) => {
      if (mode !== 'study') return;
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); handleFlip(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [mode, currentIndex, flashcards.length, flipped, animating]);

  const formatDate = (ts) => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  // ===== SETTINGS MODAL =====
  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: t.modalOverlay }}>
      <div className="rounded-2xl w-full max-w-md p-6 relative" style={{ backgroundColor: t.card, boxShadow: t.cardShadowLg }}>
        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 transition-colors" style={{ color: t.textMuted }}><X size={20} /></button>
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: t.textPrimary }}><Settings size={20} /> Настройки</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ backgroundColor: t.tabBg }}>
          <button onClick={() => setSettingsTab('api')}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: settingsTab === 'api' ? t.tabActive : 'transparent', color: settingsTab === 'api' ? t.tabActiveText : t.tabText, boxShadow: settingsTab === 'api' ? t.cardShadow : 'none' }}>
            <Server size={14} /> API
          </button>
          <button onClick={() => setSettingsTab('theme')}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5"
            style={{ backgroundColor: settingsTab === 'theme' ? t.tabActive : 'transparent', color: settingsTab === 'theme' ? t.tabActiveText : t.tabText, boxShadow: settingsTab === 'theme' ? t.cardShadow : 'none' }}>
            <Palette size={14} /> Тема
          </button>
        </div>

        {settingsTab === 'api' ? (
          <>
            <p className="text-sm mb-3" style={{ color: t.textSecondary }}>Способ подключения к Claude</p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setApiMode('proxy'); localStorage.setItem('apiMode', 'proxy'); }}
                className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: apiMode === 'proxy' ? t.accent : t.tabBg, color: apiMode === 'proxy' ? t.accentText : t.tabText }}>
                <Server size={16} /> Прокси
              </button>
              <button onClick={() => { setApiMode('key'); localStorage.setItem('apiMode', 'key'); }}
                className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: apiMode === 'key' ? t.accent : t.tabBg, color: apiMode === 'key' ? t.accentText : t.tabText }}>
                <Key size={16} /> Свой ключ
              </button>
            </div>
            {apiMode === 'proxy' ? (
              <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: t.inputBg, color: t.textSecondary }}>
                <p className="font-medium mb-1" style={{ color: t.textPrimary }}>Серверный прокси</p>
                <p>Запросы через <code className="px-1 rounded" style={{ backgroundColor: t.tabBg }}>/api/chat</code>. Ключ на сервере.</p>
              </div>
            ) : (
              <div>
                <label className="text-sm mb-2 block" style={{ color: t.textSecondary }}>API-ключ Anthropic</label>
                <div className="relative">
                  <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..." className="w-full px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ backgroundColor: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }} />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }}>
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="rounded-xl p-3 mt-3 text-xs" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Ключ хранится только в памяти браузера.</div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: t.textSecondary }}>Выберите оформление</p>
            <div className="space-y-2">
              {Object.entries(themes).map(([id, th]) => (
                <button key={id} onClick={() => changeTheme(id)}
                  className="w-full p-3.5 rounded-xl flex items-center gap-3 transition-all text-left"
                  style={{
                    backgroundColor: themeId === id ? t.accent : t.inputBg,
                    color: themeId === id ? t.accentText : t.textPrimary,
                    boxShadow: themeId === id ? t.cardShadow : 'none'
                  }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: th.accent, color: th.accentText }}>{th.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{th.name}</p>
                    <div className="flex gap-1 mt-1.5">
                      {[th.bg, th.card, th.accent, th.textPrimary].map((c, i) => (
                        <span key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c, borderColor: themeId === id ? 'rgba(255,255,255,0.3)' : t.inputBorder }} />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={() => setShowSettings(false)}
          className="w-full mt-5 py-3 font-medium rounded-xl transition-all active:translate-y-0.5"
          style={{ backgroundColor: t.accent, color: t.accentText }}>Готово</button>
      </div>
    </div>
  );

  const SettingsButton = () => (
    <button onClick={() => setShowSettings(true)} className="p-2 rounded-full transition-all" style={{ color: t.settingsBtnText }}><Settings size={18} /></button>
  );

  const ApiIndicator = () => (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: t.indicatorText }}>
      {apiMode === 'proxy' ? <Server size={12} /> : <Key size={12} />}
      {apiMode === 'proxy' ? 'прокси' : 'свой ключ'}
    </div>
  );

  // ========== CREATE ==========
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
        {showSettings && <SettingsModal />}
        <div className="w-full max-w-lg p-4 sm:p-8">
          <div className="flex items-center justify-center mb-1">
            <h1 className="text-2xl sm:text-4xl font-bold text-center" style={{ color: t.headerText }}>Учу немецкий</h1>
            <div className="ml-2"><SettingsButton /></div>
          </div>
          <div className="flex justify-center mb-6"><ApiIndicator /></div>

          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="p-1 rounded-full inline-flex" style={{ backgroundColor: t.tabBg }}>
              <button onClick={() => setActiveTab('paste')}
                className="px-4 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base"
                style={{ backgroundColor: activeTab === 'paste' ? t.tabActive : 'transparent', color: activeTab === 'paste' ? t.tabActiveText : t.tabText, boxShadow: activeTab === 'paste' ? t.cardShadow : 'none' }}>
                Вставить текст</button>
              <button onClick={() => setActiveTab('describe')}
                className="px-4 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base"
                style={{ backgroundColor: activeTab === 'describe' ? t.tabActive : 'transparent', color: activeTab === 'describe' ? t.tabActiveText : t.tabText, boxShadow: activeTab === 'describe' ? t.cardShadow : 'none' }}>
                Описать тему</button>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={{ backgroundColor: t.card, boxShadow: t.cardShadowLg }}>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={activeTab === 'describe'
                ? 'Опишите тему для карточек...\n\nНапример:\n• еда и напитки\n• фразы для путешествий\n• глаголы с предлогами'
                : 'Вставьте немецкий текст сюда...\n\nИз него будут извлечены ключевые слова.'}
              className="w-full h-44 sm:h-52 placeholder-current resize-none focus:outline-none text-base sm:text-lg"
              style={{ lineHeight: '1.6', color: t.textPrimary, '--tw-placeholder-opacity': 1, '::placeholder': { color: t.textMuted } }} />
          </div>

          <button onClick={generateFlashcards}
            className="w-full mt-6 sm:mt-8 py-3.5 sm:py-4 font-semibold rounded-full transition-all active:translate-y-0.5 text-base sm:text-lg"
            style={{ backgroundColor: t.accent, color: t.accentText, boxShadow: t.cardShadow }}>
            Сгенерировать карточки</button>

          {savedSets.length > 0 && (
            <button onClick={() => { setMode('history'); loadSavedSets(); }}
              className="w-full mt-3 py-3 sm:py-3.5 font-medium rounded-full transition-all active:translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2"
              style={{ backgroundColor: t.savedBtnBg, color: t.savedBtnText, boxShadow: t.cardShadow }}>
              <Clock size={18} /> Сохранённые наборы ({savedSets.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // ========== LOADING ==========
  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-medium mb-3 sm:mb-4" style={{ color: t.headerText }}>Генерируем карточки...</h1>
          <p className="text-sm sm:text-base mb-8" style={{ color: t.textSecondary }}>Это может занять несколько секунд</p>
          <div className="flex justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full animate-spin" style={{ border: `4px solid ${t.tabBg}`, borderTopColor: t.accent }}></div>
          </div>
        </div>
      </div>
    );
  }

  // ========== HISTORY ==========
  if (mode === 'history') {
    return (
      <div className="min-h-screen px-4 py-8 sm:py-12 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
        {showSettings && <SettingsModal />}
        <div className="w-full max-w-lg mx-auto">
          <button onClick={() => setMode('create')} className="flex items-center gap-2 transition-colors mb-6 text-sm sm:text-base" style={{ color: t.textSecondary }}>
            <ArrowLeft size={18} /> Назад
          </button>
          <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: t.headerText }}>Сохранённые наборы</h1>
          {loadingHistory ? (
            <div className="flex justify-center py-12"><div className="w-10 h-10 rounded-full animate-spin" style={{ border: `4px solid ${t.tabBg}`, borderTopColor: t.accent }}></div></div>
          ) : savedSets.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: t.emptyBg }}>
              <BookOpen size={40} className="mx-auto mb-3" style={{ color: t.emptyText }} />
              <p style={{ color: t.emptyText }}>Пока нет сохранённых наборов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSets.map((set) => (
                <div key={set.id} className="rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4" style={{ backgroundColor: t.historyItemBg, boxShadow: t.cardShadow }}>
                  <button onClick={() => openSavedSet(set)} className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: t.textPrimary }}>{set.title}</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: t.textMuted }}>{set.cardCount} карточек · {formatDate(set.createdAt)}</p>
                  </button>
                  {confirmDelete === set.id ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => deleteSet(set.id)} className="px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium active:translate-y-0.5 transition-all"
                        style={{ backgroundColor: t.dangerText, color: '#FFFFFF' }}>Да</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium active:translate-y-0.5 transition-all"
                        style={{ backgroundColor: t.tabBg, color: t.tabText }}>Нет</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(set.id)} className="p-2.5 rounded-full transition-all shrink-0" style={{ color: t.textMuted }}><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== STUDY ==========
  const card = flashcards[currentIndex];
  return (
    <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ backgroundColor: t.bg }}>
      {showSettings && <SettingsModal />}
      <div className="w-full max-w-2xl">
        <div className="relative" style={{ perspective: '1000px' }}>
          <div className={`relative w-full cursor-pointer ${animating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            onClick={handleFlip}
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
              transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s, scale 0.15s', height: 'clamp(280px, 50vh, 384px)' }}>
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 sm:p-8"
              style={{ backfaceVisibility: 'hidden', backgroundColor: t.card, boxShadow: t.cardShadowLg }}>
              <div className="text-center flex-1 flex items-center justify-center">
                <h2 className="font-semibold" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', color: t.textPrimary }}>{card.front}</h2>
              </div>
              <p className="text-xs sm:text-sm mt-auto" style={{ color: t.flipHint }}>нажмите, чтобы перевернуть</p>
            </div>
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl flex items-center justify-center p-6 sm:p-8"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', backgroundColor: t.card, boxShadow: t.cardShadowLg }}>
              <div className="text-center">
                <p className="font-medium leading-relaxed whitespace-pre-line" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: t.textPrimary }}>{card.back}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-6 sm:mt-8">
          <button onClick={() => navigate(-1)} disabled={currentIndex === 0}
            className="p-2.5 sm:p-3 rounded-full transition-all active:translate-y-0.5"
            style={{ backgroundColor: currentIndex === 0 ? t.tabBg : t.navBg, color: currentIndex === 0 ? t.textMuted : t.navText, opacity: currentIndex === 0 ? 0.5 : 1, boxShadow: currentIndex === 0 ? 'none' : t.cardShadow }}>
            <ChevronLeft size={22} /></button>
          <span className="mx-5 sm:mx-6 text-base sm:text-lg font-medium px-4 py-1.5 rounded-full"
            style={{ backgroundColor: t.counterBg, color: t.counterText, boxShadow: t.cardShadow }}>
            {currentIndex + 1} / {flashcards.length}
          </span>
          <button onClick={() => navigate(1)} disabled={currentIndex === flashcards.length - 1}
            className="p-2.5 sm:p-3 rounded-full transition-all active:translate-y-0.5"
            style={{ backgroundColor: currentIndex === flashcards.length - 1 ? t.tabBg : t.navBg, color: currentIndex === flashcards.length - 1 ? t.textMuted : t.navText, opacity: currentIndex === flashcards.length - 1 ? 0.5 : 1, boxShadow: currentIndex === flashcards.length - 1 ? 'none' : t.cardShadow }}>
            <ChevronRight size={22} /></button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 sm:mt-6">
          {!isSaved ? (
            <button onClick={saveCurrentSet} className="flex items-center gap-2 text-sm sm:text-base px-5 py-2 rounded-full transition-all active:translate-y-0.5"
              style={{ backgroundColor: t.savedBtnBg, color: t.savedBtnText, boxShadow: t.cardShadow }}>
              <Bookmark size={16} /> Сохранить
            </button>
          ) : (
            <span className="flex items-center gap-2 text-sm sm:text-base px-5 py-2 rounded-full"
              style={{ backgroundColor: t.savedBtnBg, color: t.textMuted }}>
              <Bookmark size={16} /> Сохранено
            </span>
          )}
          <button onClick={() => { setMode('create'); setTopic(''); setFlashcards([]); setIsSaved(false); }}
            className="text-sm sm:text-base px-5 py-2 rounded-full transition-all active:translate-y-0.5"
            style={{ backgroundColor: t.savedBtnBg, color: t.savedBtnText, boxShadow: t.cardShadow }}>
            Новые карточки
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardApp;
