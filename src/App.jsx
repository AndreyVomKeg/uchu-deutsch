import React, { useState, useEffect, useCallback } from 'react';

const CATEGORIES = {
  basics: {
    name: 'Основы',
    emoji: '📚',
    cards: [
      { de: 'Hallo', ru: 'Привет', example: 'Hallo! Wie geht es dir?' },
      { de: 'Danke', ru: 'Спасибо', example: 'Danke für deine Hilfe!' },
      { de: 'Bitte', ru: 'Пожалуйста', example: 'Bitte schön!' },
      { de: 'Ja', ru: 'Да', example: 'Ja, ich verstehe.' },
      { de: 'Nein', ru: 'Нет', example: 'Nein, das stimmt nicht.' },
      { de: 'Guten Morgen', ru: 'Доброе утро', example: 'Guten Morgen! Haben Sie gut geschlafen?' },
      { de: 'Guten Abend', ru: 'Добрый вечер', example: 'Guten Abend, meine Damen und Herren!' },
      { de: 'Auf Wiedersehen', ru: 'До свидания', example: 'Auf Wiedersehen! Bis morgen!' },
      { de: 'Entschuldigung', ru: 'Извините', example: 'Entschuldigung, wo ist der Bahnhof?' },
      { de: 'Ich verstehe nicht', ru: 'Я не понимаю', example: 'Ich verstehe nicht, können Sie wiederholen?' },
    ],
  },
  food: {
    name: 'Еда',
    emoji: '🍔',
    cards: [
      { de: 'das Brot', ru: 'Хлеб', example: 'Ich kaufe frisches Brot.' },
      { de: 'das Wasser', ru: 'Вода', example: 'Kann ich ein Glas Wasser haben?' },
      { de: 'der Kaffee', ru: 'Кофе', example: 'Ich trinke jeden Morgen Kaffee.' },
      { de: 'das Bier', ru: 'Пиво', example: 'Ein Bier, bitte!' },
      { de: 'der Wein', ru: 'Вино', example: 'Möchten Sie Rot- oder Weißwein?' },
      { de: 'der Apfel', ru: 'Яблоко', example: 'Der Apfel ist sehr süß.' },
      { de: 'das Fleisch', ru: 'Мясо', example: 'Ich esse kein Fleisch.' },
      { de: 'der Käse', ru: 'Сыр', example: 'Deutscher Käse ist lecker.' },
      { de: 'die Milch', ru: 'Молоко', example: 'Die Milch ist im Kühlschrank.' },
      { de: 'der Kuchen', ru: 'Пирог/Торт', example: 'Dieser Kuchen schmeckt wunderbar!' },
    ],
  },
  travel: {
    name: 'Путешествия',
    emoji: '✈️',
    cards: [
      { de: 'der Bahnhof', ru: 'Вокзал', example: 'Der Bahnhof ist in der Nähe.' },
      { de: 'der Flughafen', ru: 'Аэропорт', example: 'Wir fahren zum Flughafen.' },
      { de: 'das Hotel', ru: 'Отель', example: 'Das Hotel hat fünf Sterne.' },
      { de: 'die Straße', ru: 'Улица', example: 'Die Straße ist sehr lang.' },
      { de: 'die Fahrkarte', ru: 'Билет', example: 'Ich brauche eine Fahrkarte nach Berlin.' },
      { de: 'der Zug', ru: 'Поезд', example: 'Der Zug fährt um 10 Uhr ab.' },
      { de: 'das Taxi', ru: 'Такси', example: 'Rufen Sie bitte ein Taxi!' },
      { de: 'die Grenze', ru: 'Граница', example: 'Wir haben die Grenze überquert.' },
      { de: 'der Reisepass', ru: 'Загранпаспорт', example: 'Zeigen Sie bitte Ihren Reisepass.' },
      { de: 'die Abfahrt', ru: 'Отправление', example: 'Die Abfahrt ist um 8 Uhr.' },
    ],
  },
  numbers: {
    name: 'Числа',
    emoji: '🔢',
    cards: [
      { de: 'eins', ru: 'Один', example: 'Ich habe eins gesehen.' },
      { de: 'zwei', ru: 'Два', example: 'Zwei Kaffee, bitte.' },
      { de: 'drei', ru: 'Три', example: 'Ich habe drei Kinder.' },
      { de: 'zehn', ru: 'Десять', example: 'Es kostet zehn Euro.' },
      { de: 'zwanzig', ru: 'Двадцать', example: 'Ich bin zwanzig Jahre alt.' },
      { de: 'hundert', ru: 'Сто', example: 'Hundert Prozent richtig!' },
      { de: 'tausend', ru: 'Тысяча', example: 'Tausend Dank!' },
      { de: 'die Hälfte', ru: 'Половина', example: 'Die Hälfte ist schon fertig.' },
      { de: 'null', ru: 'Ноль', example: 'Null Grad draußen.' },
      { de: 'eine Million', ru: 'Миллион', example: 'Eine Million Menschen leben hier.' },
    ],
  },
  phrases: {
    name: 'Фразы',
    emoji: '💬',
    cards: [
      { de: 'Wie geht es Ihnen?', ru: 'Как у Вас дела?', example: 'Hallo! Wie geht es Ihnen heute?' },
      { de: 'Ich spreche kein Deutsch', ru: 'Я не говорю по-немецки', example: 'Entschuldigung, ich spreche kein Deutsch.' },
      { de: 'Wo ist die Toilette?', ru: 'Где туалет?', example: 'Entschuldigung, wo ist die Toilette?' },
      { de: 'Ich möchte bestellen', ru: 'Я хотел(а) бы заказать', example: 'Ich möchte bestellen, bitte.' },
      { de: 'Was kostet das?', ru: 'Сколько это стоит?', example: 'Was kostet das T-Shirt?' },
      { de: 'Sprechen Sie Englisch?', ru: 'Вы говорите по-английски?', example: 'Sprechen Sie Englisch, bitte?' },
      { de: 'Ich bin verloren', ru: 'Я заблудился', example: 'Hilfe! Ich bin verloren.' },
      { de: 'Es tut mir leid', ru: 'Мне очень жаль', example: 'Es tut mir leid, das war mein Fehler.' },
      { de: 'Ich liebe dich', ru: 'Я люблю тебя', example: 'Ich liebe dich von ganzem Herzen.' },
      { de: 'Alles Gute!', ru: 'Всего хорошего!', example: 'Alles Gute zum Geburtstag!' },
    ],
  },
};

const STORAGE_KEY = 'uchu-deutsch-progress';

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

function FlashCard({ card, isFlipped, onFlip }) {
  return (
    <div
      className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-white shadow-xl border border-gray-100 flex flex-col items-center justify-center p-6">
          <p className="text-3xl font-bold text-gray-800 mb-2">{card.de}</p>
          <p className="text-sm text-gray-400 mt-4">Нажмите, чтобы перевернуть</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl flex flex-col items-center justify-center p-6">
          <p className="text-2xl font-bold text-white mb-2">{card.ru}</p>
          <p className="text-sm text-blue-100 italic mt-2">«{card.example}»</p>
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет! Я помогу тебе с немецким. Спроси меня о грамматике, переводах или попроси объяснить слово!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: 'Ты — помощник для изучения немецкого языка. Отвечай кратко на русском, давай примеры на немецком с переводом.',
          messages: newMessages.filter((m) => m.role !== 'assistant' || m !== messages[0]).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.content && data.content[0]) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.content[0].text },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Ошибка: ' + (data.error.message || data.error) },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ошибка сети. Попробуйте ещё раз.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl h-[80vh] sm:h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">🤖 AI-помощник</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2 text-sm text-gray-400">
                Пишет...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Спросите о немецком..."
            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [category, setCategory] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [showChat, setShowChat] = useState(false);

  const cards = category ? CATEGORIES[category].cards : [];
  const currentCard = cards[cardIndex];

  const markKnown = useCallback(() => {
    if (!category || !currentCard) return;
    const key = `${category}:${currentCard.de}`;
    const newProgress = { ...progress, [key]: true };
    setProgress(newProgress);
    saveProgress(newProgress);
    nextCard();
  }, [category, currentCard, progress, cardIndex, cards.length]);

  const nextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const startCategory = (cat) => {
    setCategory(cat);
    setCardIndex(0);
    setIsFlipped(false);
    setScreen('cards');
  };

  const goHome = () => {
    setScreen('home');
    setCategory(null);
    setCardIndex(0);
    setIsFlipped(false);
  };

  const getCategoryProgress = (cat) => {
    const catCards = CATEGORIES[cat].cards;
    const known = catCards.filter((c) => progress[`${cat}:${c.de}`]).length;
    return { known, total: catCards.length };
  };

  const totalCards = Object.values(CATEGORIES).reduce((sum, c) => sum + c.cards.length, 0);
  const totalKnown = Object.keys(progress).filter((k) => progress[k]).length;

  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">🇩🇪 Учу немецкий</h1>
                <p className="text-gray-500 mt-1">Флэш-карты с AI-помощником</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{totalKnown}/{totalCards}</p>
                <p className="text-xs text-gray-400">изучено</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalCards > 0 ? (totalKnown / totalCards) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const { known, total } = getCategoryProgress(key);
              const pct = Math.round((known / total) * 100);
              return (
                <button
                  key={key}
                  onClick={() => startCategory(key)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className="text-sm font-medium text-gray-400">{known}/{total}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reset */}
          {totalKnown > 0 && (
            <button
              onClick={() => { setProgress({}); saveProgress({}); }}
              className="mt-8 mx-auto block text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Сбросить прогресс
            </button>
          )}
        </div>

        {/* Chat FAB */}
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl"
          title="AI-помощник"
        >
          🤖
        </button>
        {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  // Cards screen
  const isKnown = currentCard && progress[`${category}:${currentCard.de}`];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Top bar */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={goHome} className="text-blue-500 font-medium text-sm">
          ← Назад
        </button>
        <h2 className="font-bold text-gray-800">
          {CATEGORIES[category]?.emoji} {CATEGORIES[category]?.name}
        </h2>
        <span className="text-sm text-gray-400">
          {cardIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {currentCard && (
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={prevCard}
            className="bg-white border border-gray-200 text-gray-600 w-12 h-12 rounded-full shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg"
          >
            ←
          </button>
          <button
            onClick={markKnown}
            className={`px-6 py-3 rounded-full font-medium text-sm shadow-sm transition-all ${
              isKnown
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isKnown ? '✓ Изучено' : 'Знаю!'}
          </button>
          <button
            onClick={nextCard}
            className="bg-white border border-gray-200 text-gray-600 w-12 h-12 rounded-full shadow-sm hover:bg-gray-50 flex items-center justify-center text-lg"
          >
            →
          </button>
        </div>
      </div>

      {/* Chat FAB */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-2xl"
        title="AI-помощник"
      >
        🤖
      </button>
      {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
    </div>
  );
}
