import { useEffect, useState } from 'react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedServer, setSelectedServer] = useState('');
  const [connectionTime, setConnectionTime] = useState(0);
  const [dataUsed, setDataUsed] = useState({ download: 0, upload: 0 });

  const servers = [
    { id: 'mc', name: 'Монако', flag: '🇲🇨', ping: 12, load: 23 },
    { id: 'lu', name: 'Люксембург', flag: '🇱🇺', ping: 8, load: 45 },
    { id: 'ch', name: 'Швейцария', flag: '🇨🇭', ping: 15, load: 67 },
    { id: 'nl', name: 'Нидерланды', flag: '🇳🇱', ping: 10, load: 34 },
    { id: 'sg', name: 'Сингапур', flag: '🇸🇬', ping: 45, load: 56 },
    { id: 'is', name: 'Исландия', flag: '🇮🇸', ping: 25, load: 12 },
  ];

  useEffect(() => {
    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      snowflake.innerHTML = '❄️';
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = Math.random() * 3 + 5 + 's';
      snowflake.style.opacity = (Math.random() * 0.6 + 0.4).toString();
      snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
      document.body.appendChild(snowflake);

      setTimeout(() => {
        snowflake.remove();
      }, 8000);
    };

    const interval = setInterval(createSnowflake, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setConnectionTime(prev => prev + 1);
        setDataUsed(prev => ({
          download: prev.download + Math.random() * 0.5,
          upload: prev.upload + Math.random() * 0.2,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleConnection = () => {
    if (!selectedServer && !isConnected) {
      alert('Выберите сервер');
      return;
    }
    setIsConnected(!isConnected);
    if (isConnected) {
      setConnectionTime(0);
      setDataUsed({ download: 0, upload: 0 });
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Snow VPN 🎄
        </h1>
        <p className="text-muted-foreground text-lg">Ваша безопасность - наш приоритет</p>
      </div>

      <div className={`relative mb-8 ${isConnected ? 'pulse-glow' : ''}`}>
        <button
          onClick={toggleConnection}
          className={`w-48 h-48 rounded-full text-xl font-bold transition-all duration-300 ${
            isConnected
              ? 'bg-primary text-primary-foreground shadow-lg scale-110'
              : 'bg-secondary text-secondary-foreground hover:scale-105'
          }`}
        >
          {isConnected ? '🔓 Отключить' : '🔒 Подключить'}
        </button>
      </div>

      {isConnected && (
        <div className="text-center space-y-2 mb-6">
          <p className="text-2xl font-bold text-primary">Вы защищены!</p>
          <p className="text-muted-foreground">
            {servers.find(s => s.id === selectedServer)?.flag}{' '}
            {servers.find(s => s.id === selectedServer)?.name}
          </p>
          <p className="text-sm text-muted-foreground">Время: {formatTime(connectionTime)}</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          🌍 Выбрать сервер
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {servers.map(server => (
            <button
              key={server.id}
              onClick={() => !isConnected && setSelectedServer(server.id)}
              disabled={isConnected}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedServer === server.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              } ${isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{server.flag}</span>
                  <div>
                    <p className="font-medium">{server.name}</p>
                    <p className="text-xs opacity-70">{server.ping}ms</p>
                  </div>
                </div>
                <div className="text-xs opacity-70">
                  Загрузка: {server.load}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServers = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">🌍 Серверы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map(server => (
          <div key={server.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{server.flag}</span>
                <div>
                  <h3 className="font-bold text-xl">{server.name}</h3>
                  <p className="text-sm text-muted-foreground">Пинг: {server.ping}ms</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Загрузка сервера</span>
                <span className="font-medium">{server.load}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${server.load}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📊 Статистика</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Время подключения</p>
          <p className="text-3xl font-bold text-primary">{formatTime(connectionTime)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Скачано</p>
          <p className="text-3xl font-bold text-primary">{dataUsed.download.toFixed(2)} MB</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground mb-2">Загружено</p>
          <p className="text-3xl font-bold text-primary">{dataUsed.upload.toFixed(2)} MB</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">График использования данных</h3>
        <div className="h-48 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const height = Math.random() * 100;
            return (
              <div key={i} className="flex-1 bg-primary/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                <div className="absolute bottom-0 w-full bg-primary rounded-t-lg" style={{ height: '30%' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">⚙️ Настройки</h2>
      <div className="space-y-4">
        {[
          { title: 'Автоподключение', desc: 'Автоматическое подключение при запуске' },
          { title: 'Kill Switch', desc: 'Блокировка интернета при разрыве VPN' },
          { title: 'Уведомления', desc: 'Показывать уведомления о подключении' },
          { title: 'Темная тема', desc: 'Использовать темную тему интерфейса' },
        ].map(setting => (
          <div key={setting.title} className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{setting.title}</h3>
              <p className="text-sm text-muted-foreground">{setting.desc}</p>
            </div>
            <label className="relative inline-block w-14 h-8">
              <input type="checkbox" className="opacity-0 w-0 h-0 peer" />
              <span className="absolute cursor-pointer inset-0 bg-secondary rounded-full transition-all peer-checked:bg-primary">
                <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all peer-checked:translate-x-6" />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📜 История подключений</h2>
      <div className="space-y-3">
        {[
          { server: 'Монако', flag: '🇲🇨', date: '17 дек 2024, 14:30', duration: '2ч 15мин' },
          { server: 'Люксембург', flag: '🇱🇺', date: '17 дек 2024, 10:15', duration: '1ч 45мин' },
          { server: 'Швейцария', flag: '🇨🇭', date: '16 дек 2024, 18:00', duration: '3ч 20мин' },
          { server: 'Нидерланды', flag: '🇳🇱', date: '16 дек 2024, 12:30', duration: '45мин' },
        ].map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.flag}</span>
              <div>
                <p className="font-medium">{item.server}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">{item.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">👤 Профиль</h2>
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-4xl">
            🎅
          </div>
          <div>
            <h3 className="text-xl font-bold">Пользователь VPN</h3>
            <p className="text-muted-foreground">Premium аккаунт</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">user@snowvpn.com</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Подписка</span>
            <span className="font-medium text-primary">Premium до 31.12.2024</span>
          </div>
          <div className="flex justify-between py-3 border-b border-border">
            <span className="text-muted-foreground">Дата регистрации</span>
            <span className="font-medium">01.01.2024</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-muted-foreground">Всего подключений</span>
            <span className="font-medium">1,234</span>
          </div>
        </div>
      </div>
      <button className="w-full bg-destructive text-destructive-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
        Выйти из аккаунта
      </button>
    </div>
  );

  const renderSupport = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">💬 Поддержка</h2>
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Часто задаваемые вопросы</h3>
          <div className="space-y-3 mt-4">
            {[
              'Как подключиться к VPN?',
              'Что делать если не работает подключение?',
              'Как изменить сервер?',
              'Как отменить подписку?',
            ].map(q => (
              <button key={q} className="w-full text-left p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
        <a
          href="https://t.me/vkqeex"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-primary text-primary-foreground text-center py-4 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          💬 Написать в Telegram
        </a>
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Свяжитесь с нами</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <span>📧</span>
              <span className="text-muted-foreground">Email:</span>
              <span>support@snowvpn.com</span>
            </p>
            <p className="flex items-center gap-2">
              <span>⏰</span>
              <span className="text-muted-foreground">Время работы:</span>
              <span>24/7</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'home', label: 'Главная', icon: '🏠' },
    { id: 'servers', label: 'Серверы', icon: '🌍' },
    { id: 'stats', label: 'Статистика', icon: '📊' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
    { id: 'history', label: 'История', icon: '📜' },
    { id: 'profile', label: 'Профиль', icon: '👤' },
    { id: 'support', label: 'Поддержка', icon: '💬' },
  ];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🎄</span>
            Snow VPN
          </h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
              {isConnected ? '✓ Защищено' : '✗ Не защищено'}
            </span>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-[73px] z-40 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2 min-w-max">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-secondary'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8">
        {activeSection === 'home' && renderHome()}
        {activeSection === 'servers' && renderServers()}
        {activeSection === 'stats' && renderStats()}
        {activeSection === 'settings' && renderSettings()}
        {activeSection === 'history' && renderHistory()}
        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'support' && renderSupport()}
      </main>

      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Snow VPN. Ваша безопасность - наш приоритет 🎄</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;