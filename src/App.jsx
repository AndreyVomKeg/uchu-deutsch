import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Trash2, Clock, ArrowLeft, BookOpen, Settings, Key, Server, X, Eye, EyeOff } from 'lucide-react';

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

  const SYSTEM_PROMPT = `Ты \u2014 преподаватель немецкого языка для русскоязычных студентов.
Твоя задача \u2014 создавать обучающие флеш-карточки.

Правила:
- На лицевой стороне (front): немецкое слово или фраза. Для существительных обязательно указывай артикль (der/die/das) и форму множественного числа. Для глаголов \u2014 инфинитив.
- На обратной стороне (back): русский перевод, затем через пустую строку \u2014 пример употребления на немецком с переводом на русский. НЕ пиши слово \u00abПример:\u00bb перед примером, просто дай предложение.
- Карточки должны быть практичными и полезными для повседневного общения.
- Уровень сложности: от A1 до B2, адаптируйся под тему.
- Отвечай ТОЛЬКО валидным JSON-массивом без какого-либо текста вокруг.`;

  // ===== STORAGE (localStorage) =====
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
      const sets = keys.map(k => {
        try { return JSON.parse(localStorage.getItem(k)); }
        catch { return null; }
      }).filter(Boolean);
      sets.sort((a, b) => b.createdAt - a.createdAt);
      setSavedSets(sets);
    } catch { setSavedSets([]); }
    setLoadingHistory(false);
  };

  const saveCurrentSet = () => {
    const id = Date.now().toString();
    const setData = { id, title: currentSetTitle || topic.slice(0, 60), cards: flashcards, createdAt: Date.now(), cardCount: flashcards.length };
    try {
      localStorage.setItem(`flashset:${id}`, JSON.stringify(setData));
      setIsSaved(true);
      setSavedSets(prev => [setData, ...prev]);
    } catch { alert('Не удалось сохранить.'); }
  };

  const deleteSet = (id) => {
    try {
      localStorage.removeItem(`flashset:${id}`);
      setSavedSets(prev => prev.filter(s => s.id !== id));
      setConfirmDelete(null);
    } catch { alert('Не удалось удалить.'); }
  };

  const openSavedSet = (set) => {
    setFlashcards(set.cards); setCurrentSetTitle(set.title);
    setCurrentIndex(0); setFlipped(false); setIsSaved(true); setMode('study');
  };

  useEffect(() => { loadSavedSets(); }, []);

  // ===== API CALL =====
  const callAPI = async (userPrompt) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    };

    if (apiMode === 'key' && apiKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return await res.json();
    } else {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      return await res.json();
    }
  };

  // ===== GENERATE =====
  const generateFlashcards = async () => {
    if (!topic.trim()) return;
    if (apiMode === 'key' && !apiKey) { setShowSettings(true); return; }
    setMode('loading'); setIsSaved(false); setCurrentSetTitle(topic.slice(0, 60));

    let userPrompt;
    if (activeTab === 'paste') {
      userPrompt = `Проанализируй следующий немецкий текст и извлеки из него 5\u201310 ключевых слов или выражений для изучения.\n\nТекст:\n"""\n${topic}\n"""\n\nФормат \u2014 только JSON:\n[\n  {"front": "das Wort, -\u0308er", "back": "слово\\n\\nDieses Wort ist sehr wichtig. \u2014 Это слово очень важное."}\n]`;
    } else {
      userPrompt = `Создай 10 флеш-карточек по теме: "${topic}".\n\nФормат \u2014 только JSON:\n[\n  {"front": "слово с артиклем", "back": "перевод\\n\\nпредложение \u2014 перевод"}\n]`;
    }

    try {
      const data = await callAPI(userPrompt);
      const text = data.content.map(i => i.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      setFlashcards(JSON.parse(clean));
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

  // ===== STYLES =====
  const lifted = { boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)' };
  const liftedBtn = { boxShadow: '0 6px 20px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' };
  const liftedCard = { boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)' };
  const liftedNav = { boxShadow: '0 4px 14px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)' };
  const tShadow = { textShadow: '0 3px 8px rgba(0,0,0,0.25)' };
  const formatDate = (ts) => new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

  // ===== SETTINGS MODAL =====
  const SettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative" style={liftedCard}>
        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"><Settings size={20} /> Настройки API</h2>
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-3">Способ подключения к Claude</p>
          <div className="flex gap-2">
            <button onClick={() => { setApiMode('proxy'); localStorage.setItem('apiMode', 'proxy'); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${apiMode === 'proxy' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={apiMode === 'proxy' ? liftedNav : {}}><Server size={16} /> Серверный прокси</button>
            <button onClick={() => { setApiMode('key'); localStorage.setItem('apiMode', 'key'); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${apiMode === 'key' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={apiMode === 'key' ? liftedNav : {}}><Key size={16} /> Свой ключ</button>
          </div>
        </div>
        {apiMode === 'proxy' ? (
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Серверный прокси</p>
            <p className="text-blue-600/80">Запросы идут через <code className="bg-blue-100 px-1 rounded">/api/chat</code>. API-ключ хранится на сервере.</p>
          </div>
        ) : (
          <div>
            <label className="text-sm text-gray-500 mb-2 block">API-ключ Anthropic</label>
            <div className="relative">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..." className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 mt-3 text-xs text-amber-700">Ключ хранится только в памяти и исчезает при закрытии вкладки.</div>
          </div>
        )}
        <button onClick={() => setShowSettings(false)} className="w-full mt-5 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:translate-y-0.5 transition-all" style={liftedBtn}>Сохранить</button>
      </div>
    </div>
  );

  const SettingsButton = () => (
    <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all" title="Настройки API"><Settings size={18} /></button>
  );

  const ApiIndicator = () => (
    <div className="flex items-center gap-1.5 text-xs text-white/40">
      {apiMode === 'proxy' ? <Server size={12} /> : <Key size={12} />}
      {apiMode === 'proxy' ? 'прокси' : 'свой ключ'}
    </div>
  );

  // ========== CREATE ==========
  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#6A9BCC' }}>
        {showSettings && <SettingsModal />}
        <div className="w-full max-w-lg p-4 sm:p-8">
          <div className="flex items-center justify-center mb-1">
            <h1 className="text-white text-2xl sm:text-4xl font-bold text-center" style={tShadow}>Учу немецкий</h1>
            <div className="ml-2"><SettingsButton /></div>
          </div>
          <div className="flex justify-center mb-6"><ApiIndicator /></div>
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="bg-white/20 p-1 rounded-full inline-flex" style={lifted}>
              <button onClick={() => setActiveTab('paste')}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base ${activeTab === 'paste' ? 'bg-white text-gray-700' : 'text-white hover:text-white/90'}`}
                style={activeTab === 'paste' ? liftedNav : {}}>Вставить текст</button>
              <button onClick={() => setActiveTab('describe')}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all text-sm sm:text-base ${activeTab === 'describe' ? 'bg-white text-gray-700' : 'text-white hover:text-white/90'}`}
                style={activeTab === 'describe' ? liftedNav : {}}>Описать тему</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8" style={liftedCard}>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={activeTab === 'describe'
                ? 'Опишите тему для карточек...\n\nНапример:\n\u2022 еда и напитки\n\u2022 фразы для путешествий\n\u2022 глаголы с предлогами'
                : 'Вставьте немецкий текст сюда...\n\nИз него будут извлечены ключевые слова и выражения для изучения.'}
              className="w-full h-44 sm:h-52 text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-base sm:text-lg" style={{ lineHeight: '1.6' }} />
          </div>
          <button onClick={generateFlashcards}
            className="w-full mt-6 sm:mt-8 py-3.5 sm:py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 active:translate-y-0.5 transition-all text-base sm:text-lg"
            style={liftedBtn}>Сгенерировать карточки</button>
          {savedSets.length > 0 && (
            <button onClick={() => { setMode('history'); loadSavedSets(); }}
              className="w-full mt-3 py-3 sm:py-3.5 bg-white/15 text-white font-medium rounded-full hover:bg-white/25 active:translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
              style={liftedNav}><Clock size={18} /> Сохранённые наборы ({savedSets.length})</button>
          )}
        </div>
      </div>
    );
  }

  // ========== LOADING ==========
  if (mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#6A9BCC' }}>
        <div className="text-center">
          <h1 className="text-white text-2xl sm:text-4xl font-medium mb-3 sm:mb-4" style={tShadow}>Генерируем карточки...</h1>
          <p className="text-white/80 text-sm sm:text-base mb-8">Это может занять несколько секунд</p>
          <div className="flex justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' }}></div>
          </div>
        </div>
      </div>
    );
  }

    // ========== FLASHCARDS ==========
  if (mode === 'study') {
    const card = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#6A9BCC' }}>
        {showSettings && <SettingsModal />}
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <SettingsButton />
              <ApiIndicator />
            </div>
            <p className="text-white/80 text-xs sm:text-sm">{currentIndex + 1} / {flashcards.length}</p>
          </div>

          <div className="w-full bg-white/20 rounded-full h-1.5 mb-4 sm:mb-6" style={lifted}>
            <div className="bg-white h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div
            className="relative cursor-pointer"
            style={{ perspective: '1000px', minHeight: '260px' }}
            onClick={() => { if (!animating) { setAnimating(true); setFlipped(!flipped); setTimeout(() => setAnimating(false), 400); } }}
          >
            <div style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.4s ease',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              position: 'relative',
              minHeight: '260px'
            }}>
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center absolute inset-0 flex flex-col items-center justify-center" style={{ ...liftedCard, backfaceVisibility: 'hidden' }}>
                <p className="text-gray-800 text-xl sm:text-3xl font-bold leading-snug">{card.front}</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-4">{'\u{1F447}'} нажмите, чтобы перевернуть</p>
              </div>
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center absolute inset-0 flex flex-col items-center justify-center" style={{ ...liftedCard, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <p className="text-gray-700 text-base sm:text-xl leading-relaxed whitespace-pre-line">{card.back}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 sm:mt-6">
            <button
              onClick={() => { if (currentIndex > 0) { setFlipped(false); setCurrentIndex(currentIndex - 1); } }}
              disabled={currentIndex === 0}
              className={`p-3 sm:p-4 rounded-full transition-all ${currentIndex === 0 ? 'text-white/30' : 'bg-white/15 text-white hover:bg-white/25 active:translate-y-0.5'}`}
              style={currentIndex === 0 ? {} : liftedNav}
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => { setFlipped(false); setCurrentIndex(0); setMode('create'); setIsSaved(false); setCurrentSetTitle(''); }}
                className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/15 text-white text-sm font-medium rounded-full hover:bg-white/25 active:translate-y-0.5 transition-all"
                style={liftedNav}
              >
                Новая тема
              </button>
              {!isSaved && (
                <button
                  onClick={() => {
                    const title = currentSetTitle || topic || '\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F';
                    const id = Date.now().toString();
                    const setData = { id, title, cards: flashcards, cardCount: flashcards.length, createdAt: new Date().toISOString() };
                    localStorage.setItem(`flashset_${id}`, JSON.stringify(setData));
                    setSavedSets(prev => [setData, ...prev]);
                    setIsSaved(true);
                  }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white text-gray-800 text-sm font-medium rounded-full hover:bg-gray-50 active:translate-y-0.5 transition-all flex items-center gap-1.5"
                  style={liftedNav}
                >
                  <Bookmark size={16} /> Сохранить
                </button>
              )}
              {isSaved && (
                <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/15 text-white/70 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <Bookmark size={16} /> Сохранено
                </div>
              )}
            </div>

            <button
              onClick={() => { if (currentIndex < flashcards.length - 1) { setFlipped(false); setCurrentIndex(currentIndex + 1); } }}
              disabled={currentIndex === flashcards.length - 1}
              className={`p-3 sm:p-4 rounded-full transition-all ${currentIndex === flashcards.length - 1 ? 'text-white/30' : 'bg-white/15 text-white hover:bg-white/25 active:translate-y-0.5'}`}
              style={currentIndex === flashcards.length - 1 ? {} : liftedNav}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ========== HISTORY ==========
  if (mode === 'history') {
    return (
      <div className="min-h-screen px-4 py-8 sm:py-12" style={{ backgroundColor: '#6A9BCC' }}>
        {showSettings && <SettingsModal />}
        <div className="w-full max-w-lg mx-auto">
          <button onClick={() => setMode('create')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm sm:text-base">
            <ArrowLeft size={18} /> Назад
          </button>
          <h1 className="text-white text-xl sm:text-3xl font-bold mb-6" style={tShadow}>Сохранённые наборы</h1>
          {loadingHistory ? (
            <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>
          ) : savedSets.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-8 text-center" style={lifted}>
              <BookOpen size={40} className="mx-auto text-white/40 mb-3" />
              <p className="text-white/60 text-base">Пока нет сохранённых наборов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSets.map((set) => (
                <div key={set.id} className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4" style={liftedCard}>
                  <button onClick={() => openSavedSet(set)} className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg truncate">{set.title}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">{set.cardCount} карточек \u00b7 {formatDate(set.createdAt)}</p>
                  </button>
                  {confirmDelete === set.id ? (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => deleteSet(set.id)} className="px-3 py-1.5 bg-red-500 text-white text-xs sm:text-sm rounded-full font-medium hover:bg-red-600 active:translate-y-0.5 transition-all" style={liftedNav}>Да</button>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs sm:text-sm rounded-full font-medium hover:bg-gray-300 active:translate-y-0.5 transition-all" style={liftedNav}>Нет</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(set.id)} className="p-2.5 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0"><Trash2 size={18} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
    }

  return null;
};

export default FlashcardApp;
