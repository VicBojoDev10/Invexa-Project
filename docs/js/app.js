// Invexa - Main Application Logic

const App = window.App = {
  // Application State
  state: {
    currentSection: 'invest',
    userLevel: null,
    tutorialCompleted: false,
    currentModal: null,
    settings: {
      music: true,
      sound: true,
      notifications: true,
      darkMode: false,
      cardsBlocked: false,
      accountBlocked: false,
      hasPassword: false
    },
    user: {
      name: 'Usuario',
      email: 'usuario@invexa.com',
      password: null,
      level: 1,
      xp: 0,
      xpToNext: 100,
      coins: 0,
      investments: [],
      missions: [],
      skills: [],
      cards: [],
      transactions: []
    }
  },

  // Supabase
  supabase: null,
  currentUser: null,

  // Hardcoded Supabase credentials
  SUPABASE_URL: 'https://rbpqnnabjaqrjvcfgxsa.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicHFubmFiamFxcmp2Y2ZneHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTg0ODksImV4cCI6MjA5MzY3NDQ4OX0.wIceXEHIFQ_LjZpDvybjwykc7vcOESiwLgSAme7vY0E',

  // Icon helper function
  getIcon(name, size = 24) {
    return `<svg width="${size}" height="${size}" style="stroke: currentColor; fill: none;"><use href="#icon-${name}"></use></svg>`;
  },

  // Financial Concepts Data
  financialConcepts: [
    {
      key: 'diversification',
      iconName: 'refresh',
      colors: { from: '#3b82f6', to: '#1d4ed8' }
    },
    {
      key: 'compoundInterest',
      iconName: 'trending',
      colors: { from: '#10b981', to: '#059669' }
    },
    {
      key: 'financialLiteracy',
      iconName: 'book',
      colors: { from: '#f59e0b', to: '#d97706' }
    },
    {
      key: 'riskProfile',
      iconName: 'alert',
      colors: { from: '#8b5cf6', to: '#7c3aed' }
    },
    {
      key: 'volatility',
      iconName: 'chart',
      colors: { from: '#ec4899', to: '#db2777' }
    }
  ],

  // Investment Types Data
  investments: [
    {
      id: 'stocks',
      iconName: 'chart',
      iconEmoji: '📊',
      minLevel: 1,
      riskLevel: 'medium',
      potentialReturn: '8-12%'
    },
    {
      id: 'etfs',
      iconName: 'package',
      iconEmoji: '📦',
      minLevel: 1,
      riskLevel: 'low',
      potentialReturn: '6-10%'
    },
    {
      id: 'creditCards',
      iconName: 'credit-card',
      iconEmoji: '💳',
      minLevel: 2,
      riskLevel: 'high',
      potentialReturn: '15-25%'
    },
    {
      id: 'mortgages',
      iconName: 'home',
      iconEmoji: '🏠',
      minLevel: 3,
      riskLevel: 'low',
      potentialReturn: '4-8%'
    },
    {
      id: 'crypto',
      iconName: 'bitcoin',
      iconEmoji: '₿',
      minLevel: 4,
      riskLevel: 'very-high',
      potentialReturn: '20-50%'
    }
  ],

  // Missions Data
  missions: [
    {
      id: 'login-streak-1',
      type: 'login',
      title: 'loginStreak',
      description: 'loginStreakDesc',
      target: 7,
      reward: { coins: 100, xp: 50 },
      icon: '🔥'
    },
    {
      id: 'daily-collection-1',
      type: 'collect',
      title: 'dailyCollection',
      description: 'dailyCollectionDesc',
      target: 1,
      reward: { coins: 50, xp: 25 },
      icon: '🎁'
    },
    {
      id: 'first-investment',
      type: 'invest',
      title: 'firstInvestment',
      description: 'firstInvestmentDesc',
      target: 1,
      reward: { coins: 200, xp: 100 },
      icon: '💰'
    },
    {
      id: 'achievement-unlock',
      type: 'achievement',
      title: 'firstAchievement',
      description: 'firstAchievementDesc',
      target: 1,
      reward: { coins: 150, xp: 75, skin: 'gold' },
      icon: '🏆'
    }
  ],

  // Initialize Application
  init() {
    this.loadState();
    this.setupEventListeners();
    this.initSupabase(this.SUPABASE_URL, this.SUPABASE_KEY);
    i18n.init();

    // Apply dark mode immediately on load
    if (this.state.settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Update dynamic text content
    this.updateDynamicText();

    // Check auth or show login
    this.checkAuth();
  },

  // Update dynamic text elements
  updateDynamicText() {
    const subtitle = document.getElementById('loginSubtitle');
    if (subtitle) {
      subtitle.textContent = '💰 ' + i18n.t('welcomeSubtitle');
    }
    const skipLink = document.getElementById('skipLink');
    if (skipLink) {
      skipLink.textContent = i18n.t('continueWithoutAccount');
    }
    const dividerText = document.getElementById('loginDividerText');
    if (dividerText) {
      dividerText.textContent = i18n.t('orContinueWith');
    }
  },

  async checkAuth() {
    // Check for dev mode first - dev users should go through dev flow
    const session = localStorage.getItem('invexa_session');
    if (session) {
      try {
        const sess = JSON.parse(session);
        // Restore dev mode automatically for dev users
        if (sess.user && sess.user.email === 'dev@invexa.local') {
          this.currentUser = sess.user;
          this.state.userLevel = 'intermediate';
          this.state.user = {
            name: 'Dev User',
            email: 'dev@invexa.local',
            coins: 5000,
            level: 3,
            xp: 250
          };
          this.createDevApp(i18n.currentLang || 'es');
          return;
        }
      } catch (e) {}
    }

    if (this.supabase) {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        this.currentUser = session.user;
        localStorage.setItem('invexa_session', JSON.stringify(session));
        this.showLoginSuccess();
        return;
      }
    }
    
    const localSession = localStorage.getItem('invexa_session');
    if (localSession) {
      try {
        const sess = JSON.parse(localSession);
        if (sess.user) {
          this.currentUser = sess.user;
          this.showLoginSuccess();
          return;
        }
      } catch (e) {}
    }
    this.showLoginScreen();
  },

  showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  },

  showLoginSuccess() {
    const savedLevel = localStorage.getItem('invexa_level');
    if (savedLevel) {
      this.state.userLevel = savedLevel;
      if (this.state.settings.accountBlocked) {
        this.showBlockedScreen();
      } else {
        this.showMainApp();
      }
    } else {
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('appContainer').classList.add('hidden');
      document.getElementById('welcomeScreen').classList.remove('hidden');
    }
  },

  showBlockedScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');
    const blockedHtml = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
        <h2 style="margin-bottom: 1rem;">${i18n.t('accountBlocked')}</h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem;">${i18n.currentLang === 'es' ? 'Tu cuenta ha sido bloqueada. Contacta al soporte.' : 'Your account has been blocked. Contact support.'}</p>
        <button class="btn btn-primary" onclick="App.requestUnblock()">${i18n.currentLang === 'es' ? 'Solicitar Desbloqueo' : 'Request Unblock'}</button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', '<div id="blockedScreen">' + blockedHtml + '</div>');
  },

  requestUnblock() {
    this.showToast('success', i18n.currentLang === 'es' ? 'Solicitud enviada' : 'Request sent');
  },

  // Load saved state from localStorage
  loadState() {
    const saved = localStorage.getItem('invexa_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state.user = { ...this.state.user, ...parsed.user };
        this.state.settings = { ...this.state.settings, ...parsed.settings };
      } catch (e) {
        console.error('Error loading state:', e);
      }
    }
  },

  // Save state to localStorage
  saveState() {
    localStorage.setItem('invexa_state', JSON.stringify({
      user: this.state.user,
      settings: this.state.settings
    }));
  },

  // Setup Event Listeners
  setupEventListeners() {
    // Level selection
    document.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectLevel(card);
      });
    });

    // Language selector
    document.getElementById('langToggle').addEventListener('click', () => {
      document.getElementById('langDropdown').classList.toggle('active');
    });

    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        this.setLanguage(lang);
      });
    });

    // Close language dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.language-selector')) {
        document.getElementById('langDropdown').classList.remove('active');
      }
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.navigateTo(section);
      });
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    });

    // Tutorial
    document.getElementById('tutorialNext').addEventListener('click', () => {
      this.nextTutorialStep();
    });

    document.getElementById('tutorialSkip').addEventListener('click', () => {
      this.completeTutorial();
    });
  },

  // Select knowledge level
  selectLevel(card) {
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    this.state.userLevel = card.dataset.level;

    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
      continueBtn.disabled = false;
      continueBtn.style.opacity = '1';
      continueBtn.style.cursor = 'pointer';
    }

    // Update button text based on level
    const levelTexts = {
      es: {
        beginner: '¡Comenzar Aprendizaje!',
        basic: '¡Comenzar!',
        intermediate: '¡Comenzar!',
        advanced: '¡Comenzar!'
      },
      en: {
        beginner: 'Start Learning!',
        basic: 'Get Started!',
        intermediate: 'Get Started!',
        advanced: 'Get Started!'
      }
    };

    const lang = i18n.currentLang || 'es';
    const texts = levelTexts[lang];
    const btn = document.getElementById('continueBtn');
    if (btn) {
      btn.textContent = texts[this.state.userLevel];
    }
  },

  // Complete onboarding and show tutorial
  completeOnboarding() {
    localStorage.setItem('invexa_level', this.state.userLevel);
    this.showMainApp();
    this.showTutorial();
  },

// Show main application
  showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    // Render the initial section
    this.navigateTo('invest');
  },

  // Navigate to section
  navigateTo(section) {
    this.state.currentSection = section;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    // Render section
    const content = this.renderSection(section);
    document.getElementById('mainContent').innerHTML = content;

    // Setup section-specific event listeners
    this.setupSectionListeners(section);
  },

  // Render section content
  renderSection(section) {
    switch (section) {
      case 'invest':
        return this.renderInvestSection();
      case 'missions':
        return this.renderMissionsSection();
      case 'progress':
        return this.renderProgressSection();
      case 'wallet':
        return this.renderWalletSection();
      case 'profile':
        return this.renderProfileSection();
      case 'options':
        return this.renderOptionsSection();
      default:
        return this.renderInvestSection();
    }
  },

  // Render Invest Section
  renderInvestSection() {
    const t = i18n.currentLang;
    const investmentsHtml = this.investments.map(inv => `
      <div class="investment-card" data-investment="${inv.id}" onclick="alert('Clicked: ${inv.id}'); App.openInvestmentModal('${inv.id}')" style="cursor: pointer; background: var(--card-bg); border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 2px solid var(--border); user-select: none;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">${this.getIcon(inv.iconName, 24)}</div>
        <div style="font-weight: 600; font-size: 1.125rem; color: var(--text-primary); margin-bottom: 8px;">${i18n.t(inv.id)}</div>
        <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">${i18n.t(inv.id + 'Desc')}</p>
      </div>
    `).join('');

    return `
      <div class="fade-in">
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">${this.getIcon('coin', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="invest">${i18n.t('invest')}</h3>
              <p class="card-subtitle" data-i18n="selectInvestment">${i18n.t('selectInvestment')}</p>
            </div>
          </div>
        </div>

        <div class="investment-grid">
          ${investmentsHtml}
        </div>

        ${this.state.userLevel === 'beginner' ? `
          <div class="card mt-4">
            <div class="card-header">
              <div class="card-icon accent">${this.getIcon('book', 24)}</div>
              <div>
                <h3 class="card-title" data-i18n="concepts">${i18n.t('concepts')}</h3>
                <p class="card-subtitle">${this.financialConcepts.length} ${i18n.t('concepts').toLowerCase()}</p>
              </div>
            </div>
            <div class="skills-grid">
              ${this.financialConcepts.map(concept => `
                <div class="skill-card unlocked">
                  <div class="skill-icon">${this.getIcon(concept.iconName, 32)}</div>
                  <div class="skill-name" data-i18n="${concept.key}">${i18n.t(concept.key)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // Render Missions Section
  renderMissionsSection() {
    const missions = [
      { id: 1, title: 'loginStreak', iconName: 'fire', progress: 3, target: 7, status: 'in-progress', reward: '100 ' },
      { id: 2, title: 'dailyCollection', iconName: 'gift', progress: 0, target: 1, status: 'new', reward: '50 ' },
      { id: 3, title: 'firstInvestment', iconName: 'coin', progress: 0, target: 1, status: 'new', reward: '200 ' },
      { id: 4, title: 'achievements', iconName: 'trophy', progress: 2, target: 5, status: 'in-progress', reward: '150 ' }
    ];

    const missionsHtml = missions.map(mission => {
      const percent = (mission.progress / mission.target) * 100;
      const statusClass = mission.status === 'completed' ? 'completed' :
                         mission.status === 'in-progress' ? 'in-progress' : 'new';

      return `
        <div class="mission-card ${statusClass}">
          <div class="mission-header">
            <span class="mission-title" data-i18n="${mission.title}">${i18n.t(mission.title)}</span>
            <span class="mission-status ${mission.status}" data-i18n="${mission.status}">
              ${mission.status === 'in-progress' ? i18n.t('missionInProgress') :
                mission.status === 'completed' ? i18n.t('completedMissions') : i18n.t('availableMissions')}
            </span>
          </div>
          <div class="mission-progress">
            <div class="mission-progress-bar" style="width: ${percent}%"></div>
          </div>
          <div class="mission-reward">
            <span class="mission-reward-icon">${this.getIcon(mission.iconName, 18)}</span>
            <span>${mission.reward}${this.getIcon('coin', 16)}</span>
            ${mission.status === 'completed' ?
              `<button class="btn btn-success btn-sm" style="margin-left: auto;" data-i18n="claimReward">${i18n.t('claimReward')}</button>` :
              ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="fade-in">
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon success">${this.getIcon('target', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="missions">${i18n.t('missions')}</h3>
              <p class="card-subtitle" data-i18n="availableMissions">${i18n.t('availableMissions')}</p>
            </div>
          </div>
        </div>

        <div class="mission-list">
          ${missionsHtml}
        </div>
      </div>
    `;
  },

  // Render Progress Section
  renderProgressSection() {
    const user = this.state.user;
    const xpPercent = (user.xp / user.xpToNext) * 100;

    const skills = [
      { name: 'diversification', iconName: 'refresh', unlocked: true },
      { name: 'compoundInterest', iconName: 'trending', unlocked: true },
      { name: 'riskProfile', iconName: 'alert', unlocked: user.level >= 2 },
      { name: 'financialLiteracy', iconName: 'book', unlocked: user.level >= 3 },
      { name: 'volatility', iconName: 'chart', unlocked: user.level >= 4 },
      { name: 'portfolio', iconName: 'wallet', unlocked: user.level >= 5 }
    ];

    const skillsHtml = skills.map(skill => `
      <div class="skill-card ${skill.unlocked ? 'unlocked' : 'locked'}">
        <div class="skill-icon">${this.getIcon(skill.iconName, 32)}</div>
        <div class="skill-name" data-i18n="${skill.name}">${i18n.t(skill.name)}</div>
        ${!skill.unlocked ? `<div class="skill-lock">${this.getIcon('lock', 16)}</div>` : ''}
      </div>
    `).join('');

    // Get available investments based on user level
    const availableInvestments = this.investments.filter(inv => user.level >= inv.minLevel);
    const investmentsHtml = availableInvestments.map(inv => `
      <div class="investment-card clickable" data-investment="${inv.id}">
        <div class="investment-icon ${inv.id}">${this.getIcon(inv.iconName, 32)}</div>
        <div class="investment-name" data-i18n="${inv.id}">${i18n.t(inv.id)}</div>
        <p class="investment-description" data-i18n="${inv.id}Desc">${i18n.t(inv.id + 'Desc')}</p>
      </div>
    `).join('');

    const lang = i18n.currentLang || 'es';
    const returnText = lang === 'es' ? '← Volver a Invertir' : '← Back to Invest';

    return `
      <div class="fade-in">
        <div class="progress-header">
          <div class="level-display">${user.level}</div>
          <div class="level-label" data-i18n="currentLevel">${i18n.t('currentLevel')}</div>
          <div class="xp-bar-container">
            <div class="xp-bar">
              <div class="xp-bar-fill" style="width: ${xpPercent}%"></div>
            </div>
            <div class="xp-text">${user.xp} / ${user.xpToNext} <span data-i18n="xp">${i18n.t('xp')}</span></div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon purple">${this.getIcon('star', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="unlockedSkills">${i18n.t('unlockedSkills')}</h3>
            </div>
          </div>
          <div class="skills-grid">
            ${skillsHtml}
          </div>
        </div>

        ${availableInvestments.length > 0 ? `
          <div class="card mb-4">
            <div class="card-header">
              <div class="card-icon success">${this.getIcon('wallet', 24)}</div>
              <div>
                <h3 class="card-title">${lang === 'es' ? 'Inversiones Disponibles' : 'Available Investments'}</h3>
                <p class="card-subtitle">${lang === 'es' ? 'Toca para invertir' : 'Tap to invest'}</p>
              </div>
            </div>
            <div class="investment-grid">
              ${investmentsHtml}
            </div>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <div class="card-icon accent">${this.getIcon('chart', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="userHistory">${i18n.t('userHistory')}</h3>
            </div>
          </div>
          <div style="padding: 1rem 0;">
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
              <span>${i18n.t('invest')}</span>
              <span>0</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
              <span>${i18n.t('missions')}</span>
              <span>0</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
              <span>Coins</span>
              <span>${user.coins} ${this.getIcon('coin', 18)}</span>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary btn-full mt-4" onclick="App.navigateTo('invest')">
          ${returnText}
        </button>
      </div>
    `;
  },

  // Render Profile Section
  renderProfileSection() {
    const user = this.state.user;
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const lang = i18n.currentLang || 'es';

    // Text variables for buttons
    const addDebitText = lang === 'es' ? 'Tarjeta de Débito' : 'Debit Card';
    const addCreditText = lang === 'es' ? 'Tarjeta de Crédito' : 'Credit Card';
    const manageMoneyText = lang === 'es' ? 'Gestionar' : 'Manage';

    // Render user's cards
    const isBlocked = this.state.settings.cardsBlocked;
    const cardsHtml = user.cards.length > 0 ? user.cards.map(card => `
      <div class="credit-card ${card.type}" style="background: linear-gradient(135deg, ${card.type === 'debit' ? '#3b82f6, #1d4ed8' : '#8b5cf6, #7c3aed'});${isBlocked ? '; position: relative;' : ''}">
        ${isBlocked ? '<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; border-radius: inherit;"><span style="color: #ef4444; font-weight: bold; font-size: 1.2rem;">' + (lang === 'es' ? 'BLOQUEADA' : 'BLOCKED') + '</span></div>' : ''}
        <div class="credit-card-chip"></div>
        <div class="credit-card-number">**** **** **** ${card.number}</div>
        <div class="credit-card-name">${card.name}</div>
        <div class="credit-card-balance">${card.type === 'credit' ? (lang === 'es' ? 'Límite: ' : 'Limit: ') : (lang === 'es' ? 'Saldo: ' : 'Balance: ')}$${card.balance.toLocaleString()}</div>
        ${!isBlocked ? '<button class="credit-card-delete" onclick="event.stopPropagation(); App.removeCard(\'' + card.id + '\')">' + this.getIcon('trash', 18) + '</button>' : ''}
      </div>
    `).join('') : `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">${lang === 'es' ? 'No tienes tarjetas añadidas' : 'No cards added yet'}</div>`;

    return `
      <div class="fade-in">
        <div class="profile-header">
          <div class="profile-avatar">${initials}</div>
          <div class="profile-info">
            <div class="profile-name">${user.name}</div>
            <div class="profile-email">${user.email}</div>
          </div>
          <button class="btn btn-outline btn-sm" data-i18n="editProfile">${i18n.t('editProfile')}</button>
        </div>

        <!-- Wallet / Cards Section -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">${this.getIcon('credit-card', 24)}</div>
            <div>
              <h3 class="card-title">${lang === 'es' ? 'Mis Tarjetas' : 'My Cards'}</h3>
              <p class="card-subtitle">${lang === 'es' ? 'Tarjetas de débito y crédito' : 'Debit and credit cards'}</p>
            </div>
          </div>
          <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            ${cardsHtml}
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button class="btn btn-outline btn-sm" onclick="App.showAddCardModal('debit')" style="flex: 1;${isBlocked ? '; opacity: 0.5; pointer-events: none;' : ''}" ${isBlocked ? 'disabled' : ''}>
              ➕ ${addDebitText}
            </button>
            <button class="btn btn-outline btn-sm" onclick="App.showAddCardModal('credit')" style="flex: 1;${isBlocked ? '; opacity: 0.5; pointer-events: none;' : ''}" ${isBlocked ? 'disabled' : ''}>
              ➕ ${addCreditText}
            </button>
          </div>
          ${isBlocked ? '<div style="text-align: center; margin-top: 0.5rem; color: var(--warning); font-size: 0.875rem;">' + (lang === 'es' ? 'Tarjetas bloqueadas. Ve a Opciones para desbloquear.' : 'Cards blocked. Go to Options to unblock.') + '</div>' : ''}
        </div>

        <!-- Money Management Section -->
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon success">${this.getIcon('coin', 24)}</div>
            <div>
              <h3 class="card-title">${lang === 'es' ? 'Dinero Ficticio' : 'Fictional Money'}</h3>
              <p class="card-subtitle">${lang === 'es' ? 'Añade o retira dinero para practicar' : 'Add or withdraw money to practice'}</p>
            </div>
          </div>
          <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700; color: var(--success);">$${user.coins.toLocaleString()}</div>
            <div style="font-size: 0.875rem; color: var(--text-muted);">${lang === 'es' ? 'Saldo disponible' : 'Available balance'}</div>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button class="btn btn-success btn-sm" onclick="App.showMoneyManagementModal()" style="flex: 1;">
              📥📤 ${manageMoneyText}
            </button>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">${this.getIcon('target', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="financialGoals">${i18n.t('financialGoals')}</h3>
            </div>
          </div>
          <div style="padding: 1rem 0;">
            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
              <span>${this.getIcon('home', 24)}</span>
              <div>
                <div style="font-weight: 600;">Comprar Casa</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">$50,000 / $200,000</div>
              </div>
              <div style="margin-left: auto; font-weight: 600; color: var(--primary);">25%</div>
            </div>
            <div style="height: 6px; background: var(--bg-tertiary); border-radius: 3px;">
              <div style="height: 100%; width: 25%; background: var(--success-gradient); border-radius: 3px;"></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon">${this.getIcon('settings', 24)}</div>
            <div>
              <h3 class="card-title" data-i18n="systemPreferences">${i18n.t('systemPreferences')}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.toggleSetting('darkMode')">
              <span class="settings-label">
                <span class="settings-icon">${this.getIcon('moon', 20)}</span>
                <span data-i18n="darkMode">${i18n.t('darkMode')}</span>
              </span>
              <div class="toggle ${this.state.settings.darkMode ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-item" onclick="App.toggleSetting('notifications')">
              <span class="settings-label">
                <span class="settings-icon">${this.getIcon('bell', 20)}</span>
                <span data-i18n="notifications">${i18n.t('notifications')}</span>
              </span>
              <div class="toggle ${this.state.settings.notifications ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-item">
              <span class="settings-label">
                <span class="settings-icon">${this.getIcon('globe', 20)}</span>
                <span data-i18n="language">${i18n.t('language')}</span>
              </span>
              <span style="font-weight: 600; color: var(--primary);">
                ${i18n.currentLang === 'es' ? 'Español' : 'English'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Render Wallet Section
  renderWalletSection() {
    const user = this.state.user;
    const lang = i18n.currentLang || 'es';
    const investments = user.investments || [];
    const transactions = (user.transactions || []).slice().reverse();
    const now = Date.now();

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => {
      const days = Math.max((now - new Date(inv.startDate)) / (1000 * 60 * 60 * 24), 1);
      const rates = { stocks: 0.08, etfs: 0.07, creditCards: 0.12, mortgages: 0.06, crypto: 0.15 };
      const rate = rates[inv.type] || 0.08;
      const dailyGrowth = Math.pow(1 + rate, days / 365) - 1;
      return sum + inv.amount * (1 + dailyGrowth);
    }, 0);
    const totalReturn = totalCurrentValue - totalInvested;
    const totalReturnPct = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(1) : 0;

    const returnColor = totalReturn >= 0 ? 'var(--success)' : 'var(--error)';
    const returnSign = totalReturn >= 0 ? '+' : '';
    const returnLabel = totalReturn >= 0 ? i18n.t('profit') : i18n.t('loss');
    const invReturnSign = totalReturn >= 0 ? '+' : '';

    const investmentsHtml = investments.length > 0 ? investments.map(inv => {
      const days = Math.max((now - new Date(inv.startDate)) / (1000 * 60 * 60 * 24), 1);
      const rates = { stocks: 0.08, etfs: 0.07, creditCards: 0.12, mortgages: 0.06, crypto: 0.15 };
      const rate = rates[inv.type] || 0.08;
      const currentVal = inv.amount * Math.pow(1 + rate, days / 365);
      const invReturn = currentVal - inv.amount;
      const invReturnPct = ((invReturn / inv.amount) * 100).toFixed(1);
      const startDate = new Date(inv.startDate).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US');
      return `
        <div class="investment-card clickable" onclick="App.showInvestmentDetails('${inv.id}')" style="position: relative;">
          <div class="investment-icon ${inv.type}" style="position: absolute; top: 0.75rem; right: 0.75rem; font-size: 1.5rem; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">${inv.icon}</div>
          <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;" data-i18n="${inv.name}">${i18n.t(inv.name)}</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: var(--success);">$${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style="font-size: 0.75rem; margin-bottom: 0.5rem; ${invReturn >= 0 ? 'color: var(--success);' : 'color: var(--error);'}">${invReturn >= 0 ? '+' : '-'}$${Math.abs(invReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${invReturn >= 0 ? '+' : ''}${invReturnPct}%)</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
            <span>${i18n.t('invested')}: $${inv.amount.toLocaleString()}</span>
            <span>${startDate}</span>
          </div>
        </div>
      `;
    }).join('') : `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
        <p style="font-weight: 600; margin-bottom: 0.5rem;">${i18n.t('noInvestments')}</p>
        <p style="font-size: 0.875rem;">${i18n.t('startInvesting')}</p>
        <button class="btn btn-primary btn-sm mt-3" onclick="App.navigateTo('invest')">${i18n.t('invest')}</button>
      </div>
    `;

    const txTypeIcons = {
      deposit: { icon: '📥', color: 'var(--success)' },
      withdrawal: { icon: '📤', color: 'var(--error)' },
      investment: { icon: '📈', color: 'var(--primary)' },
      sale: { icon: '📉', color: 'var(--accent)' }
    };

    const txHtml = transactions.length > 0 ? transactions.slice(0, 15).map(tx => {
      const txInfo = txTypeIcons[tx.type] || { icon: '💱', color: 'var(--text-muted)' };
      const txDate = new Date(tx.date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' });
      const isPositive = tx.type === 'sale' || tx.type === 'deposit';
      return `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(37, 99, 235, 0.1); display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;">${txInfo.icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${tx.description || tx.type}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${txDate}</div>
          </div>
          <div style="font-size: 0.875rem; font-weight: 700; color: ${isPositive ? 'var(--success)' : 'var(--error)'}; white-space: nowrap;">
            ${isPositive ? '+' : '-'}$${Math.abs(tx.amount || tx.salePrice || 0).toLocaleString()}
          </div>
        </div>
      `;
    }).join('') : `<div style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.875rem;">${lang === 'es' ? 'Sin transacciones aún' : 'No transactions yet'}</div>`;

    return `
      <div class="fade-in">
        <div class="card mb-4" style="background: linear-gradient(135deg, #1e3a5f, #2d5a87);">
          <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">${i18n.t('availableBalance')}</div>
            <div style="font-size: 2rem; font-weight: 800; color: #fff;">$${user.coins.toLocaleString()}</div>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; justify-content: center;">
              <button class="btn btn-success btn-sm" onclick="App.showAddFundsModal()" style="font-size: 0.8rem;">📥 ${i18n.t('addMoney')}</button>
              <button class="btn btn-outline btn-sm" onclick="App.showWithdrawModal()" style="font-size: 0.8rem; border-color: rgba(255,255,255,0.5); color: #fff;">📤 ${i18n.t('withdraw')}</button>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon success">💼</div>
            <div>
              <h3 class="card-title" data-i18n="portfolio">${i18n.t('portfolio')}</h3>
              <p class="card-subtitle">${investments.length} ${lang === 'es' ? 'inversiones' : 'investments'}</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem 0;">
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">${i18n.t('totalInvested')}</div>
              <div style="font-size: 1.25rem; font-weight: 700;">$${totalInvested.toLocaleString()}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">${returnLabel} ${i18n.t('returns')}</div>
              <div style="font-size: 1.25rem; font-weight: 700; color: ${returnColor};">${returnSign}$${Math.abs(totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">📈</div>
            <div>
              <h3 class="card-title" data-i18n="myInvestments">${i18n.t('myInvestments')}</h3>
              <p class="card-subtitle">${i18n.t('activeInvestments')}</p>
            </div>
          </div>
        </div>

        <div class="investment-grid">
          ${investmentsHtml}
        </div>

        <div class="card mt-4">
          <div class="card-header">
            <div class="card-icon accent">📊</div>
            <div>
              <h3 class="card-title" data-i18n="assetAllocation">${i18n.t('assetAllocation')}</h3>
            </div>
          </div>
          <div style="padding: 1rem 0;">
            ${investments.length > 0 ? this.renderAllocationChart(investments, totalInvested) : '<p style="text-align: center; color: var(--text-muted); font-size: 0.875rem;">' + (lang === 'es' ? 'Sin datos aún' : 'No data yet') + '</p>'}
          </div>
        </div>

        <div class="card mt-4">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">📜</div>
            <div>
              <h3 class="card-title">${i18n.t('investmentHistory')}</h3>
              <p class="card-subtitle">${transactions.length} ${lang === 'es' ? 'transacciones' : 'transactions'}</p>
            </div>
          </div>
          <div style="max-height: 300px; overflow-y: auto;">
            ${txHtml}
          </div>
        </div>
      </div>
    `;
  },

  // Render allocation chart (simple bar)
  renderAllocationChart(investments, total) {
    if (investments.length === 0 || total === 0) return '';
    const lang = i18n.currentLang || 'es';
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    return investments.map((inv, i) => {
      const pct = ((inv.amount / total) * 100).toFixed(1);
      return `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
            <span>${inv.icon} ${i18n.t(inv.name)}</span>
            <span style="font-weight: 600;">${pct}%</span>
          </div>
          <div style="height: 6px; background: var(--bg-tertiary); border-radius: 3px;">
            <div style="height: 100%; width: ${pct}%; background: ${colors[i % colors.length]}; border-radius: 3px;"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Show investment details modal
  showInvestmentDetails(invId) {
    const inv = this.state.user.investments.find(i => i.id === invId);
    if (!inv) return;
    const lang = i18n.currentLang || 'es';
    const now = Date.now();
    const daysInvested = Math.max((now - new Date(inv.startDate)) / (1000 * 60 * 60 * 24), 1);
    const rates = { stocks: 0.08, etfs: 0.07, creditCards: 0.12, mortgages: 0.06, crypto: 0.15 };
    const rate = rates[inv.type] || 0.08;
    const currentVal = inv.amount * Math.pow(1 + rate, daysInvested / 365);
    const invReturn = currentVal - inv.amount;
    const invReturnPct = ((invReturn / inv.amount) * 100).toFixed(2);
    const startDate = new Date(inv.startDate).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US');
    const returnColor = invReturn >= 0 ? 'var(--success)' : 'var(--error)';
    const returnSign = invReturn >= 0 ? '+' : '';
    const monthlyReturn = (Math.pow(1 + invReturn / inv.amount, 30 / daysInvested) - 1) * 100;
    const annualReturn = (Math.pow(1 + invReturn / inv.amount, 365 / daysInvested) - 1) * 100;

    const modalContent = `
      <div style="text-align: center; padding: 0.5rem 0;">
        <div class="investment-icon ${inv.type}" style="width: 60px; height: 60px; font-size: 2rem; margin: 0 auto 0.5rem;">${inv.icon}</div>
        <h3 style="margin-bottom: 0.25rem;" data-i18n="${inv.name}">${i18n.t(inv.name)}</h3>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">$${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div style="font-size: 1rem; font-weight: 600; color: ${returnColor}; margin-bottom: 1rem;">${returnSign}$${Math.abs(invReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${returnSign}${invReturnPct}%)</div>

        <div style="background: var(--bg-secondary); border-radius: 0.5rem; padding: 1rem; text-align: left; font-size: 0.875rem;">
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-muted);">${i18n.t('investmentAmountLabel')}</span>
            <span style="font-weight: 600;">$${inv.amount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-muted);">${i18n.t('currentValue')}</span>
            <span style="font-weight: 600;">$${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-muted);">${i18n.t('purchasedOn')}</span>
            <span style="font-weight: 600;">${startDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-muted);">${i18n.t('daysInvested')}</span>
            <span style="font-weight: 600;">${Math.floor(daysInvested)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-muted);">${i18n.t('monthlyReturn')}</span>
            <span style="font-weight: 600; color: ${monthlyReturn >= 0 ? 'var(--success)' : 'var(--error)'};">${monthlyReturn >= 0 ? '+' : ''}${monthlyReturn.toFixed(2)}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.4rem 0;">
            <span style="color: var(--text-muted);">${i18n.t('annualReturn')}</span>
            <span style="font-weight: 600; color: ${annualReturn >= 0 ? 'var(--success)' : 'var(--error)'};">${annualReturn >= 0 ? '+' : ''}${annualReturn.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    `;

    this.showModal('investmentDetails', {
      title: i18n.t('investmentDetails'),
      content: modalContent,
      buttons: `
        <button class="btn btn-danger btn-sm" onclick="App.confirmSellInvestment('${inv.id}')">${i18n.t('sellInvestment')}</button>
        <button class="btn btn-secondary" onclick="App.closeModal()">${i18n.t('close')}</button>
      `
    });
  },

  // Confirm sell investment
  confirmSellInvestment(invId) {
    this.closeModal();
    const inv = this.state.user.investments.find(i => i.id === invId);
    if (!inv) return;
    const rates = { stocks: 0.08, etfs: 0.07, creditCards: 0.12, mortgages: 0.06, crypto: 0.15 };
    const rate = rates[inv.type] || 0.08;
    const days = Math.max((Date.now() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24), 1);
    const currentVal = inv.amount * Math.pow(1 + rate, days / 365);
    const returnAmt = currentVal - inv.amount;
    const returnSign = returnAmt >= 0 ? '+' : '';
    const returnColor = returnAmt >= 0 ? 'var(--success)' : 'var(--error)';
    const returnLbl = returnAmt >= 0 ? i18n.t('profit') : i18n.t('loss');

    this.showModal('confirmSell', {
      title: i18n.t('confirmSale'),
      content: `
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">${inv.icon}</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;" data-i18n="${inv.name}">${i18n.t(inv.name)}</p>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">${i18n.t('saleConfirmation')}</p>
          <div style="background: var(--bg-secondary); border-radius: 0.5rem; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>${i18n.t('invested')}</span>
              <span>$${inv.amount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>${i18n.t('currentValue')}</span>
              <span>$${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; color: ${returnColor};">
              <span>${returnLbl}</span>
              <span>${returnSign}$${Math.abs(returnAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      `,
      buttons: `
        <button class="btn btn-secondary" onclick="App.closeModal()">${i18n.t('cancel')}</button>
        <button class="btn btn-success" onclick="App.sellInvestment('${inv.id}')">${i18n.t('confirm')}</button>
      `
    });
  },

  // Sell investment
  sellInvestment(invId) {
    const inv = this.state.user.investments.find(i => i.id === invId);
    if (!inv) return;
    const rates = { stocks: 0.08, etfs: 0.07, creditCards: 0.12, mortgages: 0.06, crypto: 0.15 };
    const rate = rates[inv.type] || 0.08;
    const days = Math.max((Date.now() - new Date(inv.startDate)) / (1000 * 60 * 60 * 24), 1);
    const currentVal = inv.amount * Math.pow(1 + rate, days / 365);
    const returnAmt = currentVal - inv.amount;
    this.state.user.coins += currentVal;
    this.state.user.investments = this.state.user.investments.filter(i => i.id !== invId);
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'sale',
      investmentType: inv.type,
      amount: inv.amount,
      salePrice: currentVal,
      profit: returnAmt,
      date: new Date().toISOString(),
      description: `${i18n.t('sellInvestment')} ${i18n.t(inv.name)}`
    });
    this.closeModal();
    this.saveState();
    if (returnAmt > 0) {
      this.showToast('success', `${i18n.t('investmentSold')}! ${i18n.t('profit')}: +$${returnAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
      this.showToast('warning', `${i18n.t('investmentSold')}. ${i18n.t('loss')}: -$${Math.abs(returnAmt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }
    this.navigateTo('wallet');
  },

  // Render Options Section
  renderOptionsSection() {
    return `
      <div class="fade-in">
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">🔊</div>
            <div>
              <h3 class="card-title" data-i18n="musicAndSound">${i18n.t('musicAndSound')}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.toggleSetting('music')">
              <span class="settings-label">
                <span class="settings-icon">🎵</span>
                <span>Música</span>
              </span>
              <div class="toggle ${this.state.settings.music ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-item" onclick="App.toggleSetting('sound')">
              <span class="settings-label">
                <span class="settings-icon">🔔</span>
                <span>Efectos de Sonido</span>
              </span>
              <div class="toggle ${this.state.settings.sound ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">🔒</div>
            <div>
              <h3 class="card-title" data-i18n="privacyNotice">${i18n.t('privacyNotice')}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.showModal('privacy')">
              <span class="settings-label">
                <span class="settings-icon">📄</span>
                <span>Leer Aviso de Privacidad</span>
              </span>
              <span style="color: var(--primary);">-></span>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">💳</div>
            <div>
              <h3 class="card-title" data-i18n="blockCards">${i18n.t('blockCards')}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" style="border-color: var(--warning);">
              <span class="settings-label">
                <span class="settings-icon">⚠️</span>
                <span>${this.state.settings.cardsBlocked ? (i18n.currentLang === 'es' ? 'Tarjetas Bloqueadas' : 'Cards Blocked') : (i18n.currentLang === 'es' ? 'Bloquear Tarjetas' : 'Block Cards')}</span>
              </span>
              <button class="btn btn-outline btn-sm" style="border-color: var(--warning); color: var(--warning);" onclick="App.toggleCardsBlocked()">
                ${this.state.settings.cardsBlocked ? (i18n.currentLang === 'es' ? 'Desbloquear' : 'Unblock') : (i18n.currentLang === 'es' ? 'Bloquear' : 'Block')}
              </button>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">🔐</div>
            <div>
              <h3 class="card-title">${i18n.currentLang === 'es' ? 'Seguridad' : 'Security'}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.showCreatePasswordModal()">
              <span class="settings-label">
                <span class="settings-icon">🔑</span>
                <span>${this.state.settings.hasPassword ? (i18n.currentLang === 'es' ? 'Cambiar Contraseña' : 'Change Password') : (i18n.currentLang === 'es' ? 'Crear Contraseña' : 'Create Password')}</span>
              </span>
              <span style="color: var(--primary);">${this.state.settings.hasPassword ? '✓' : '->'}</span>
            </div>
            <div class="settings-item" style="border-color: var(--error);">
              <span class="settings-label">
                <span class="settings-icon">🚫</span>
                <span>${this.state.settings.accountBlocked ? (i18n.currentLang === 'es' ? 'Cuenta Bloqueada' : 'Account Blocked') : (i18n.currentLang === 'es' ? 'Bloquear Cuenta' : 'Block Account')}</span>
              </span>
              <button class="btn btn-outline btn-sm" style="border-color: var(--error); color: var(--error);" onclick="App.toggleAccountBlocked()">
                ${this.state.settings.accountBlocked ? (i18n.currentLang === 'es' ? 'Desbloquear' : 'Unblock') : (i18n.currentLang === 'es' ? 'Bloquear' : 'Block')}
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: var(--error);">⚠️</div>
            <div>
              <h3 class="card-title" style="color: var(--error);">Zona de Peligro</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.showModal('deactivate')">
              <span class="settings-label">
                <span class="settings-icon">😴</span>
                <span data-i18n="deactivateOptions">${i18n.t('deactivateOptions')}</span>
              </span>
              <span style="color: var(--warning);">-></span>
            </div>
            <div class="settings-item" onclick="App.showModal('delete')">
              <span class="settings-label">
                <span class="settings-icon">🗑️</span>
                <span data-i18n="deleteAccount">${i18n.t('deleteAccount')}</span>
              </span>
              <span style="color: var(--error);">-></span>
            </div>
          </div>
        </div>

        <div class="card mt-4" style="border-color: var(--primary);">
          <div class="settings-list">
            <div class="settings-item" style="border: none;" onclick="App.logout()">
              <span class="settings-label">
                <span class="settings-icon">🚪</span>
                <span data-i18n="closeSession">${i18n.t('closeSession')}</span>
              </span>
              <button class="btn btn-outline btn-sm">${i18n.currentLang === 'es' ? 'Salir' : 'Logout'}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Setup section-specific event listeners
  setupSectionListeners(section) {
    // Get the main content container (either dev mode or normal mode)
    const mainContainer = document.getElementById('devMainContent') || document.getElementById('mainContent');
    
    if (section === 'invest' || section === 'progress') {
      mainContainer.querySelectorAll('.investment-card').forEach(card => {
        card.addEventListener('click', () => {
          this.openInvestmentModal(card.dataset.investment);
        });
      });
    }
  },

  // Open investment modal with interactive simulation
  openInvestmentModal(investmentId) {
    const investment = this.investments.find(i => i.id === investmentId);
    if (!investment) return;

    const lang = i18n.currentLang || 'es';
    const learnMoreText = lang === 'es' ? '📖 Cómo Funciona' : '📖 How It Works';
    const defaultAmount = 1000;

    const modalContent = `
      <div style="padding: 1rem 0;">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 64px; height: 64px; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--primary), var(--purple)); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
            ${this.getIcon(investment.iconName, 32)}
          </div>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">${i18n.t(investmentId + 'Desc')}</p>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">${lang === 'es' ? 'Cantidad a Invertir' : 'Amount to Invest'}</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="number" id="investAmount" value="${defaultAmount}" style="flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
        </div>

        <button class="btn btn-outline btn-full" onclick="App.showInvestmentBreakdown('${investmentId}')" style="margin-bottom: 0.5rem;">
          ${learnMoreText}
        </button>
      </div>
    `;

    this.showModal('investment', {
      title: i18n.t(investmentId),
      content: modalContent,
      buttons: `
        <button class="btn btn-secondary" onclick="App.closeModal()">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.confirmInvestment('${investmentId}')">${i18n.t('confirm')}</button>
      `
    });
  },

  // Run investment simulation
  runInvestmentSimulation(investmentId) {
    const amountInput = document.getElementById('simAmount');
    const resultsDiv = document.getElementById('simResults');
    const tipDiv = document.getElementById('simTip');
    const lang = i18n.currentLang || 'es';

    if (!amountInput) return;
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
      this.showToast('error', lang === 'es' ? 'Ingresa una cantidad válida' : 'Enter a valid amount');
      return;
    }
    const investAmountInput = document.getElementById('investAmount');
    if (investAmountInput) investAmountInput.value = amount;

    // Simulation multipliers for each investment type
    const simulations = {
      stocks: { optimistic: 1.12, neutral: 1.0, pessimistic: 0.85 },
      etfs: { optimistic: 1.10, neutral: 1.07, pessimistic: 0.92 },
      creditCards: { optimistic: 1.18, neutral: 1.12, pessimistic: 0.95 },
      mortgages: { optimistic: 1.06, neutral: 1.04, pessimistic: 0.98 },
      crypto: { optimistic: 1.50, neutral: 1.05, pessimistic: 0.60 }
    };

    const sim = simulations[investmentId];
    if (!sim) return;

    // Calculate results
    const result1 = amount * sim.optimistic;
    const result2 = amount * sim.neutral;
    const result3 = amount * sim.pessimistic;

    const profit1 = result1 - amount;
    const profit2 = result2 - amount;
    const profit3 = result3 - amount;

    const formatMoney = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const formatProfit = (n) => {
      const sign = n >= 0 ? '+' : '';
      const color = n >= 0 ? 'var(--success)' : 'var(--error)';
      return `<span style="color: ${color}">${sign}${formatMoney(n)}</span>`;
    };

    // Display results
    document.getElementById('simResult1').innerHTML = `${formatMoney(amount)} -> ${formatMoney(result1)} ${formatProfit(profit1)}`;
    document.getElementById('simResult2').innerHTML = `${formatMoney(amount)} -> ${formatMoney(result2)} ${formatProfit(profit2)}`;
    document.getElementById('simResult3').innerHTML = `${formatMoney(amount)} -> ${formatMoney(result3)} ${formatProfit(profit3)}`;

    resultsDiv.style.display = 'block';

    // Show tip
    const tips = {
      stocks: {
        es: '💡 Consejo: Las acciones son volátiles a corto plazo, pero históricamente tienden a crecer a largo plazo. Diversifica para reducir riesgo.',
        en: '💡 Tip: Stocks are volatile short-term but historically grow long-term. Diversify to reduce risk.'
      },
      etfs: {
        es: '💡 Consejo: Los ETFs ofrecen diversificación automática y menor riesgo que acciones individuales. Ideal para principiantes.',
        en: '💡 Tip: ETFs offer automatic diversification and lower risk than individual stocks. Great for beginners.'
      },
      creditCards: {
        es: '💡 Consejo: Monitorea las tasas de morosidad - afectan directamente tus retornos. La diversificación es clave.',
        en: '💡 Tip: Monitor default rates - they directly affect your returns. Diversification is key.'
      },
      mortgages: {
        es: '💡 Consejo: Las hipotecas son inversiones estables con propiedad como garantía. Retornos predecibles a largo plazo.',
        en: '💡 Tip: Mortgages are stable investments with property as collateral. Predictable long-term returns.'
      },
      crypto: {
        es: '💡 Consejo: Nunca inviertas más de lo que puedes permitirte perder. La volatilidad es extrema en crypto.',
        en: '💡 Tip: Never invest more than you can afford to lose. Volatility is extreme in crypto.'
      }
    };

    tipDiv.innerHTML = tips[investmentId][lang];
    tipDiv.style.display = 'block';
  },

  // Confirm investment
  confirmInvestment(investmentId) {
    const amountInput = document.getElementById('investAmount');
    const amount = amountInput ? parseFloat(amountInput.value) || 1000 : 1000;

    const investment = this.investments.find(i => i.id === investmentId);
    const multipliers = { stocks: 1.08, etfs: 1.07, creditCards: 1.12, mortgages: 1.06, crypto: 1.15 };
    const mult = multipliers[investmentId] || 1.08;
    const currentValue = amount * mult;

    const newInvestment = {
      id: Date.now().toString(),
      type: investmentId,
      icon: investment.icon,
      name: investment.id,
      amount: amount,
      currentValue: currentValue,
      startDate: new Date().toISOString(),
      riskLevel: investment.riskLevel,
      potentialReturn: investment.potentialReturn
    };

    this.state.user.investments.push(newInvestment);
    this.state.user.coins -= amount;
    this.state.user.xp += 50;
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'investment',
      investmentType: investmentId,
      amount: amount,
      date: new Date().toISOString(),
      description: `${i18n.t('invest')} ${i18n.t(investmentId)} - $${amount.toLocaleString()}`
    });

    if (this.state.user.xp >= this.state.user.xpToNext) {
      this.levelUp();
    }

    this.closeModal();
    this.showToast('success', i18n.t('investmentConfirmed'));
    this.saveState();
    this.navigateTo('wallet');
  },

  // Level up
  levelUp() {
    this.state.user.level++;
    this.state.user.xp = 0;
    this.state.user.xpToNext = Math.floor(this.state.user.xpToNext * 1.5);
    this.showToast('success', `${i18n.t('levelUp')} ${this.state.user.level}!`);
  },

  // Toggle setting
  toggleSetting(setting) {
    this.state.settings[setting] = !this.state.settings[setting];
    this.saveState();

    // Apply dark mode immediately
    if (setting === 'darkMode') {
      const theme = this.state.settings.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }

    this.navigateTo(this.state.currentSection);
  },

  // Show modal
  showModal(type, data = {}) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');

    this.state.currentModal = type;

    if (type === 'privacy') {
      title.textContent = i18n.t('privacyNotice');
      body.innerHTML = `
        <div style="max-height: 300px; overflow-y: auto; font-size: 0.875rem; line-height: 1.8;">
          <p><strong>1. Información que recopilamos</strong></p>
          <p>Recopilamos información personal que nos proporcionas directamente, como tu nombre, correo electrónico y preferencias de configuración.</p>

          <p><strong>2. Cómo usamos tu información</strong></p>
          <p>Usamos tu información para proporcionarte la aplicación, personalizar tu experiencia y comunicarnos contigo sobre actualizaciones.</p>

          <p><strong>3. Compartir información</strong></p>
          <p>No vendemos ni compartimos tu información personal con terceros para fines de marketing.</p>

          <p><strong>4. Seguridad</strong></p>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal.</p>

          <p><strong>5. Tus derechos</strong></p>
          <p>Tienes derecho a acceder, rectificar o eliminar tu información personal. Contáctanos para ejercer estos derechos.</p>
        </div>
      `;
      footer.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.closeModal()" data-i18n="close">${i18n.t('close')}</button>`;
    } else if (type === 'delete') {
      title.textContent = i18n.t('deleteAccount');
      title.style.color = 'var(--error)';
      body.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <p style="font-weight: 600; margin-bottom: 1rem;">${i18n.currentLang === 'es' ? '¿Estás seguro de que quieres eliminar tu cuenta?' : 'Are you sure you want to delete your account?'}</p>
          <p style="font-size: 0.875rem; color: var(--text-muted);">${i18n.currentLang === 'es' ? 'Esta acción no se puede deshacer. Se perderán todos tus datos, progreso e inversiones.' : 'This action cannot be undone. All your data, progress and investments will be lost.'}</p>
          ${this.state.settings.hasPassword ? `
          <div style="margin-top: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${i18n.t('enterPasswordToContinue')}</label>
            <input type="password" id="deletePassword" placeholder="${i18n.t('password')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          ` : ''}
        </div>
      `;
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" style="background: var(--error);" onclick="App.confirmDeleteAccount()" data-i18n="deleteAccount">${i18n.t('deleteAccount')}</button>
      `;
    } else if (type === 'deactivate') {
      title.textContent = i18n.t('deactivateOptions');
      body.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">😴</div>
          <p style="font-weight: 600; margin-bottom: 1rem;">¿Quieres desactivar temporalmente tu cuenta?</p>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Puedes reactivar tu cuenta en cualquier momento iniciando sesión nuevamente.</p>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.deactivateAccount()" data-i18n="deactivateOptions">${i18n.t('deactivateOptions')}</button>
      `;
    } else if (type === 'investment') {
      title.textContent = data.title;
      body.innerHTML = data.content;
      footer.innerHTML = data.buttons;
    } else if (type === 'reward') {
      title.textContent = i18n.t('rewardReceived');
      body.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🎁</div>
          <p style="font-size: 1.25rem; font-weight: 600;">+${data.coins} 💰</p>
          <p style="font-size: 1.25rem; font-weight: 600;">+${data.xp} XP</p>
        </div>
      `;
      footer.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.closeModal()" data-i18n="ok">${i18n.t('ok')}</button>`;
    } else if (type === 'addCard') {
      const lang = i18n.currentLang || 'es';
      const placeholders = {
        debit: { es: 'Nombre para tu tarjeta', en: 'Name for your card' },
        credit: { es: 'Nombre para tu tarjeta de crédito', en: 'Name for your credit card' }
      };
      const submitText = lang === 'es' ? 'Añadir Tarjeta' : 'Add Card';

      title.textContent = data.title;
      body.innerHTML = `
        <form id="addCardForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${lang === 'es' ? 'Nombre del Titular' : 'Cardholder Name'}</label>
            <input type="text" id="cardName" placeholder="${placeholders[data.type][lang]}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${lang === 'es' ? 'Número de Tarjeta' : 'Card Number'}</label>
            <input type="text" id="cardNumber" placeholder="1234567890123456" maxlength="16" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${lang === 'es' ? 'Saldo Inicial (Opcional)' : 'Initial Balance (Optional)'}</label>
            <input type="number" id="cardBalance" placeholder="0" value="0" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
        </form>
      `;
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="App.closeModal()">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.submitAddCard('${data.type}')">${submitText}</button>
      `;
    } else if (type === 'moneyManagement') {
      const lang = i18n.currentLang || 'es';
      const currentBalance = this.state.user.coins;

      title.textContent = data.title;
      body.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 2.5rem; font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">$${currentBalance.toLocaleString()}</div>
          <div style="color: var(--text-muted);">${lang === 'es' ? 'Saldo Actual' : 'Current Balance'}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
          <button class="btn btn-success" id="depositBtn" style="flex: 1;" onclick="App.showDepositSubModal('deposit')">
            [Add] ${lang === 'es' ? 'Anadir Dinero' : 'Add Money'}
          </button>
          <button class="btn btn-outline" id="withdrawBtn" style="flex: 1; border-color: var(--error); color: var(--error);" onclick="App.showDepositSubModal('withdraw')">
            [Remove] ${lang === 'es' ? 'Retirar Dinero' : 'Withdraw Money'}
          </button>
        </div>
        <div id="moneyInputContainer" style="display: none; margin-top: 1rem;">
          <input type="number" id="moneyAmount" placeholder="Amount" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary); margin-bottom: 1rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="App.closeMoneySubModal()" style="flex: 1;">${i18n.t('cancel')}</button>
            <button class="btn btn-primary" id="confirmMoneyBtn" style="flex: 1;">Confirmar</button>
          </div>
        </div>
      `;
      footer.innerHTML = '';
    } else if (type === 'forgotPassword') {
      title.textContent = data.title;
      body.innerHTML = data.content;
      footer.innerHTML = data.buttons;
    } else if (type === 'investmentBreakdown') {
      title.textContent = data.title;
      body.innerHTML = data.content;
      footer.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.closeModal()">${i18n.t('close')}</button>`;
    }

    modal.classList.add('active');
    i18n.updateUI();
  },

  // Submit add card form
  submitAddCard(type) {
    const name = document.getElementById('cardName').value || (type === 'debit' ? 'Mi Débito' : 'Mi Crédito');
    const number = document.getElementById('cardNumber').value || Math.floor(Math.random() * 10000000000000000).toString();
    const balance = parseFloat(document.getElementById('cardBalance').value) || 0;

    this.addCard(type, name, number, balance);
    this.closeModal();
  },

  // Show deposit/withdraw sub-modal
  showDepositSubModal(action) {
    const container = document.getElementById('moneyInputContainer');
    const confirmBtn = document.getElementById('confirmMoneyBtn');
    container.style.display = 'block';

    confirmBtn.onclick = () => {
      const amount = document.getElementById('moneyAmount').value;
      if (action === 'deposit') {
        this.addMoney(amount, 'manual_deposit');
      } else {
        this.subtractMoney(amount, 'manual_withdrawal');
      }
      this.closeMoneySubModal();
      this.closeModal();
    };
  },

  // Close money sub-modal
  closeMoneySubModal() {
    const container = document.getElementById('moneyInputContainer');
    if (container) container.style.display = 'none';
  },

  // Close modal
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    this.state.currentModal = null;
  },

  // Show toast notification
  showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Set language
  setLanguage(lang) {
    i18n.setLang(lang);
    document.getElementById('currentLang').textContent = lang.toUpperCase();
    document.getElementById('langDropdown').classList.remove('active');

    // Re-render current section
    this.navigateTo(this.state.currentSection);
  },

  // Show tutorial
  showTutorial() {
    document.getElementById('tutorialOverlay').classList.remove('hidden');
    this.state.tutorialStep = 0;
    this.updateTutorialText();
  },

  // Update tutorial text
  updateTutorialText() {
    const texts = {
      es: [
        '¡Bienvenido! Vamos a aprender sobre inversiones de forma divertida',
        'Explora las diferentes opciones del menú para comenzar',
        'Completa misiones para ganar recompensas y subir de nivel'
      ],
      en: [
        'Welcome! Let\'s learn about investing in a fun way',
        'Explore the different menu options to get started',
        'Complete missions to earn rewards and level up'
      ]
    };

    const lang = i18n.currentLang;
    document.getElementById('tutorialText').textContent = texts[lang][this.state.tutorialStep];

    // Update dots
    document.querySelectorAll('.tutorial-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.state.tutorialStep);
    });
  },

  // Next tutorial step
  nextTutorialStep() {
    this.state.tutorialStep++;
    if (this.state.tutorialStep >= 3) {
      this.completeTutorial();
    } else {
      this.updateTutorialText();
    }
  },

  // Complete tutorial
  completeTutorial() {
    document.getElementById('tutorialOverlay').classList.add('hidden');
    this.state.tutorialCompleted = true;

    // Give first reward
    this.state.user.coins += 100;
    this.state.user.xp += 50;
    this.saveState();

    this.showToast('success', `${i18n.t('firstReward')}: +100 💰 +50 XP`);
  },

  // Auth Functions
  showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
  },

  showSignupForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('signupTab').classList.add('active');
  },

  showForgotPasswordModal(e) {
    if (e) e.preventDefault();
    const lang = i18n.currentLang || 'es';
    const content = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="width: 64px; height: 64px; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--primary), var(--purple)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          ${this.getIcon('key', 32)}
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
          ${lang === 'es' ? 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.' : 'Enter your email address and we will send you a link to reset your password.'}
        </p>
        <div class="form-group">
          <label>${i18n.t('email')}</label>
          <input type="email" id="resetPasswordEmail" placeholder="correo@ejemplo.com" required>
        </div>
        <div class="form-error" id="resetPasswordError" style="min-height: 1.5rem;"></div>
        
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
          <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
            ${lang === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
          </p>
          <div class="form-group">
            <label>${i18n.t('newPassword')}</label>
            <input type="password" id="devResetNewPassword" placeholder="${i18n.t('passwordHint')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div class="form-group">
            <label>${i18n.t('confirmPassword')}</label>
            <input type="password" id="devResetConfirmPassword" placeholder="${i18n.t('confirmPassword')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div class="form-error" id="devResetError" style="min-height: 1.5rem; color: var(--error);"></div>
        </div>
      </div>
    `;
    this.showModal('forgotPassword', {
      title: lang === 'es' ? 'Restablecer Contraseña' : 'Reset Password',
      content: content,
      buttons: `
        <button class="btn btn-secondary" onclick="App.closeModal()">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.handleResetPassword()">${lang === 'es' ? 'Enviar Enlace' : 'Send Link'}</button>
        <button class="btn btn-accent" onclick="App.handleDevResetPassword()" style="background: var(--purple); color: white;">${lang === 'es' ? 'Restablecer (Dev)' : 'Reset (Dev)'}</button>
      `
    });
  },

  handleDevResetPassword() {
    const lang = i18n.currentLang || 'es';
    const email = document.getElementById('resetPasswordEmail').value;
    const newPassword = document.getElementById('devResetNewPassword').value;
    const confirmPassword = document.getElementById('devResetConfirmPassword').value;
    const errorEl = document.getElementById('devResetError');

    errorEl.textContent = '';

    if (!email) {
      errorEl.textContent = lang === 'es' ? 'Por favor ingresa tu correo' : 'Please enter your email';
      return;
    }

    if (!newPassword) {
      errorEl.textContent = lang === 'es' ? 'Por favor ingresa tu nueva contraseña' : 'Please enter your new password';
      return;
    }

    if (newPassword.length < 6) {
      errorEl.textContent = lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorEl.textContent = i18n.t('passwordsDoNotMatch');
      return;
    }

    // Dev mode: Try to update password via Supabase
    this.supabase.auth.updateUser({ email: email, password: newPassword })
      .then(({ data, error }) => {
        if (error) {
          // If Supabase fails, just show success for dev mode
          console.log('Dev reset (no Supabase auth):', email, '->', newPassword);
          this.closeModal();
          this.showToast('success', lang === 'es' ? 'Contraseña restablecida (Dev Mode)' : 'Password reset (Dev Mode)');
        } else {
          this.closeModal();
          this.showToast('success', i18n.currentLang === 'es' ? '¡Contraseña actualizada!' : 'Password updated!');
        }
      });
  },

  // Dev Login
  DEV_PIN: '123456789',

  toggleDevLogin(e) {
    if (e) e.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const devForm = document.getElementById('devLoginForm');
    const toggle = document.getElementById('devLoginToggle');

    if (devForm.classList.contains('hidden')) {
      loginForm.classList.add('hidden');
      devForm.classList.remove('hidden');
      toggle.textContent = '← Back to Login';
    } else {
      devForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      toggle.textContent = '🔧 Dev Login';
    }
  },

  handleDevLogin(e) {
    e.preventDefault();
    const passkey = document.getElementById('devPasskey').value;
    const errorEl = document.getElementById('devLoginError');

    if (passkey === this.DEV_PIN) {
      this.devLogin();
    } else {
      errorEl.textContent = i18n.currentLang === 'es' ? 'Passkey inválido' : 'Invalid passkey';
    }
  },

  devLogin() {
    const lang = i18n.currentLang || 'es';

    // Set up dev user
    this.currentUser = { id: 'dev-user', email: 'dev@invexa.local', name: 'Dev User' };
    localStorage.setItem('invexa_session', JSON.stringify({ user: this.currentUser }));

    this.state.user = {
      name: lang === 'es' ? 'Usuario Dev' : 'Dev User',
      email: 'dev@invexa.local',
      password: null,
      level: 3,
      xp: 250,
      xpToNext: 500,
      coins: 5000,
      investments: [],
      missions: [],
      skills: [],
      cards: [],
      transactions: []
    };
    this.state.userLevel = 'intermediate';

    localStorage.setItem('invexa_level', 'intermediate');
    this.saveState();

    // Close dev login modal
    this.closeModal();

    // Hide everything
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');

    // Create a NEW app container directly in body
    this.createDevApp(lang);
  },

  createDevApp(lang) {
    // Remove existing dev app if any
    const existingDevApp = document.getElementById('devAppContainer');
    if (existingDevApp) existingDevApp.remove();

    // Create new app container
    const devApp = document.createElement('div');
    devApp.id = 'devAppContainer';
    devApp.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-primary); display: flex; flex-direction: column; z-index: 100; overflow: hidden;';

    // Create header
    const header = document.createElement('div');
    header.style.cssText = 'padding: 16px 24px; background: var(--card-bg); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 20;';
    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.5rem;">🔧</span>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--purple);">Dev Mode</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="color: var(--text-secondary);">
          <span style="margin-right: 8px;">🪙</span>
          <span>${this.state.user.coins}</span>
        </div>
        <div style="color: var(--text-secondary);">
          <span style="margin-right: 8px;">⭐</span>
          <span>${this.state.userLevel}</span>
        </div>
        <button onclick="App.exitDevMode()" style="background: var(--error); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
          ${lang === 'es' ? 'Salir' : 'Exit'}
        </button>
      </div>
    `;

    // Create main content area
    const mainContent = document.createElement('div');
    mainContent.id = 'devMainContent';
    mainContent.style.cssText = 'flex: 1; padding: 24px; overflow-y: auto; overflow-x: hidden; position: relative; z-index: 10;';

    // Create bottom nav
    const nav = document.createElement('div');
    nav.style.cssText = 'padding: 12px 24px; background: var(--card-bg); border-top: 1px solid var(--border); display: flex; justify-content: space-around; position: relative; z-index: 20;';
    nav.innerHTML = `
      <button onclick="App.showDevSection('invest')" class="dev-nav-btn" data-section="invest" style="background: none; border: none; color: var(--primary); padding: 8px 16px; cursor: pointer; font-weight: 600;">📊</button>
      <button onclick="App.showDevSection('missions')" class="dev-nav-btn" data-section="missions" style="background: none; border: none; color: var(--text-secondary); padding: 8px 16px; cursor: pointer;">🎯</button>
      <button onclick="App.showDevSection('progress')" class="dev-nav-btn" data-section="progress" style="background: none; border: none; color: var(--text-secondary); padding: 8px 16px; cursor: pointer;">📈</button>
      <button onclick="App.showDevSection('wallet')" class="dev-nav-btn" data-section="wallet" style="background: none; border: none; color: var(--text-secondary); padding: 8px 16px; cursor: pointer;">💳</button>
      <button onclick="App.showDevSection('profile')" class="dev-nav-btn" data-section="profile" style="background: none; border: none; color: var(--text-secondary); padding: 8px 16px; cursor: pointer;">👤</button>
      <button onclick="App.showDevSection('options')" class="dev-nav-btn" data-section="options" style="background: none; border: none; color: var(--text-secondary); padding: 8px 16px; cursor: pointer;">⚙️</button>
    `;

    devApp.appendChild(header);
    devApp.appendChild(mainContent);
    devApp.appendChild(nav);
    document.body.appendChild(devApp);

    // Show invest section by default
    this.showDevSection('invest');
  },

  showDevSection(section) {
    const mainContent = document.getElementById('devMainContent');
    if (!mainContent) return;

    // Update nav active state
    document.querySelectorAll('.dev-nav-btn').forEach(btn => {
      if (btn.dataset.section === section) {
        btn.style.color = 'var(--primary)';
        btn.style.fontWeight = '600';
      } else {
        btn.style.color = 'var(--text-secondary)';
        btn.style.fontWeight = 'normal';
      }
    });

    let html = '';
    switch(section) {
      case 'invest':
        html = this.renderInvestSection();
        break;
      case 'missions':
        html = this.renderMissionsSection();
        break;
      case 'progress':
        html = this.renderProgressSection();
        break;
      case 'wallet':
        html = this.renderWalletSection();
        break;
      case 'profile':
        html = this.renderProfileSection();
        break;
      case 'options':
        html = this.renderOptionsSection();
        break;
      default:
        html = this.renderInvestSection();
    }

    mainContent.innerHTML = html;

    // Setup event listeners for the section
    this.setupSectionListeners(section);
  },

  exitDevMode() {
    // Remove dev app
    const devApp = document.getElementById('devAppContainer');
    if (devApp) devApp.remove();

    // Clear ALL session data
    localStorage.removeItem('invexa_session');
    localStorage.removeItem('invexa_level');
    this.state = this.getDefaultState();
    this.currentUser = null;

    // Reset all screens to hidden
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('hidden');
  },

  async handleResetPassword() {
    const email = document.getElementById('resetPasswordEmail').value;
    const errorEl = document.getElementById('resetPasswordError');

    if (!email) {
      errorEl.textContent = i18n.currentLang === 'es' ? 'Por favor ingresa tu correo' : 'Please enter your email';
      return;
    }

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://vicbojodev10.github.io/Invexa-Project/'
      });
      if (error) throw error;

      this.closeModal();
      this.showToast('success', i18n.currentLang === 'es' ?
        '¡Enlace enviado! Revisa tu correo.' :
        'Link sent! Check your email.');
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    errorEl.textContent = '';

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;
      localStorage.setItem('invexa_session', JSON.stringify(data));
      this.showToast('success', i18n.t('welcomeBack'));
      this.showLoginSuccess();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  async handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const errorEl = document.getElementById('signupError');

    errorEl.textContent = '';

    if (password !== confirmPassword) {
      errorEl.textContent = i18n.t('passwordsDoNotMatch');
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = i18n.t('passwordTooShort');
      return;
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      if (data.user) {
        this.currentUser = data.user;
        if (data.session) {
          localStorage.setItem('invexa_session', JSON.stringify(data));
        } else {
          localStorage.setItem('invexa_session', JSON.stringify({ user: data.user }));
        }
        if (name && this.state.user.name === 'Usuario') {
          this.state.user.name = name;
          this.saveState();
        }
        this.showToast('success', i18n.t('accountCreated'));
        this.showLoginSuccess();
      }
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  async loginWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/'
        }
      });

      if (error) throw error;
    } catch (err) {
      this.showToast('error', err.message);
    }
  },

  skipLogin() {
    this.showLoginScreen();
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    localStorage.setItem('invexa_level', '');
  },

  // Logout
  logout() {
    if (confirm(i18n.currentLang === 'es' ? '¿Cerrar sesión?' : 'Logout?')) {
      localStorage.removeItem('invexa_level');
      localStorage.removeItem('invexa_state');
      location.reload();
    }
  },

  // Delete account
  confirmDeleteAccount() {
    if (this.state.settings.hasPassword) {
      const input = document.getElementById('deletePassword');
      if (!input || !this.verifyPassword(input.value)) {
        this.showToast('error', i18n.t('incorrectPassword'));
        return;
      }
    }
    this.deleteAccount();
  },

  deleteAccount() {
    if (this.supabaseClient) {
      this.supabaseClient.from('users').delete().eq('email', this.state.user.email);
    }
    localStorage.clear();
    this.showToast('success', i18n.t('accountDeleted'));
    setTimeout(() => location.reload(), 1000);
  },

  // Deactivate account
  deactivateAccount() {
    this.closeModal();
    this.showToast('success', i18n.currentLang === 'es' ? 'Cuenta desactivada' : 'Account deactivated');
  },

  // Password Functions
  createPassword(password, confirmPassword) {
    const lang = i18n.currentLang || 'es';
    
    if (!password || password.length < 6) {
      this.showToast('error', lang === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      this.showToast('error', i18n.t('passwordsDoNotMatch'));
      return false;
    }
    
    this.state.user.password = this.hashPassword(password);
    this.state.settings.hasPassword = true;
    this.saveState();
    this.showToast('success', i18n.t('passwordCreated'));
    return true;
  },

  verifyPassword(inputPassword) {
    const hashed = this.hashPassword(inputPassword);
    return hashed === this.state.user.password;
  },

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hashed_' + Math.abs(hash).toString(16);
  },

  showPasswordModal(callback) {
    const lang = i18n.currentLang || 'es';
    const title = lang === 'es' ? 'Verificación de Seguridad' : 'Security Verification';
    
    this.showModal('passwordVerify', {
      title: title,
      content: `
        <div style="text-align: center;">
          <p style="margin-bottom: 1rem; color: var(--text-muted);">${i18n.t('enterPasswordToContinue')}</p>
          <input type="password" id="verifyPassword" placeholder="${i18n.t('password')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary); margin-bottom: 1rem;">
        </div>
      `,
      buttons: `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.verifyPasswordAndProceed('${callback}')">${i18n.t('confirm')}</button>
      `
    });
  },

  verifyPasswordAndProceed(callback) {
    const input = document.getElementById('verifyPassword').value;
    if (!input) {
      this.showToast('error', i18n.t('passwordRequired'));
      return;
    }
    
    if (this.verifyPassword(input)) {
      this.closeModal();
      if (this[callback]) {
        this[callback]();
      }
    } else {
      this.showToast('error', i18n.t('incorrectPassword'));
    }
  },

  showCreatePasswordModal() {
    const lang = i18n.currentLang || 'es';
    const title = lang === 'es' ? 'Crear Contraseña' : 'Create Password';
    
    this.showModal('createPassword', {
      title: title,
      content: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${i18n.t('newPassword')}</label>
            <input type="password" id="newPassword" placeholder="${i18n.t('passwordHint')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">${i18n.t('confirmNewPassword')}</label>
            <input type="password" id="confirmNewPassword" placeholder="${i18n.t('confirmPassword')}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
        </div>
      `,
      buttons: `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.submitCreatePassword()">${i18n.t('confirm')}</button>
      `
    });
  },

  submitCreatePassword() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (this.createPassword(password, confirmPassword)) {
      this.closeModal();
      this.navigateTo('options');
    }
  },

  toggleAccountBlocked() {
    if (this.state.settings.accountBlocked) {
      if (this.state.settings.hasPassword) {
        this.showPasswordModal('confirmUnblockAccount');
      } else {
        this.confirmUnblockAccount();
      }
    } else {
      this.state.settings.accountBlocked = true;
      this.saveState();
      this.showToast('success', i18n.t('accountBlocked'));
      this.navigateTo(this.state.currentSection);
    }
  },

  confirmUnblockAccount() {
    this.state.settings.accountBlocked = false;
    this.saveState();
    this.showToast('success', i18n.currentLang === 'es' ? 'Cuenta desbloqueada' : 'Account unblocked');
    this.navigateTo(this.state.currentSection);
  },

  // Supabase Functions
  supabaseClient: null,

  initSupabase(url, key) {
    try {
      this.supabase = window.supabase.createClient(url, key);
      this.supabaseClient = this.supabase;
    } catch (e) {
      console.error('Supabase init error:', e);
    }
  },

  syncUserData() {
    if (!this.supabaseClient) {
      return;
    }
    const state = this.state;
    this.supabaseClient.from('users').insert({
      id: state.user.id || Date.now().toString(),
      name: state.user.name,
      email: state.user.email,
      level: state.user.level,
      xp: state.user.xp,
      coins: state.user.coins,
      settings: JSON.stringify(state.settings),
      updated_at: new Date().toISOString()
    });
  },

  async handleAuthCallback(code) {
    if (!code) return;
    try {
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      if (data.session) {
        this.currentUser = data.session.user;
        localStorage.setItem('invexa_session', JSON.stringify(data.session));
        this.showToast('success', i18n.t('welcomeBack'));
        this.showLoginSuccess();
      }
    } catch (err) {
      this.showToast('error', err.message);
      this.showLoginScreen();
    }
  },

  showSupabaseModal() {
    const lang = i18n.currentLang || 'es';
    const connected = this.supabase ? '✅ ' + (lang === 'es' ? 'Conectado' : 'Connected') : '❌ ' + (lang === 'es' ? 'No conectado' : 'Not connected');
    this.showModal('supabase', {
      title: 'Supabase',
      content: `
        <div style="text-align: center; padding: 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">☁️</div>
          <p style="font-weight: 600; margin-bottom: 0.5rem;">${connected}</p>
          <p style="font-size: 0.75rem; color: var(--text-muted);">${this.SUPABASE_URL}</p>
        </div>
      `,
      buttons: `<button class="btn btn-primary btn-full" onclick="App.closeModal()">${i18n.t('close')}</button>`
    });
  },

  submitSupabaseConfig() {
    const url = document.getElementById('supabaseUrl').value;
    const key = document.getElementById('supabaseKey').value;
    
    if (!url || !key) {
      this.showToast('error', i18n.t('supabaseError'));
      return;
    }
    
    this.initSupabase(url, key);
    localStorage.setItem('invexa_supabase', JSON.stringify({ url, key }));
    this.closeModal();
    this.showToast('success', i18n.t('supabaseConnected'));
  },

  loadSupabaseConfig() {
    const saved = localStorage.getItem('invexa_supabase');
    if (saved) {
      try {
        const { url, key } = JSON.parse(saved);
        this.initSupabase(url, key);
      } catch (e) {
        console.error('Error loading Supabase config:', e);
      }
    }
  },

  // Toggle cards blocked
  toggleCardsBlocked() {
    if (!this.state.settings.cardsBlocked && this.state.settings.hasPassword) {
      this.showPasswordModal('confirmToggleCardsBlocked');
    } else {
      this.confirmToggleCardsBlocked();
    }
  },

  confirmToggleCardsBlocked() {
    this.state.settings.cardsBlocked = !this.state.settings.cardsBlocked;
    this.saveState();
    const msg = this.state.settings.cardsBlocked 
      ? (i18n.currentLang === 'es' ? 'Tarjetas bloqueadas' : 'Cards blocked')
      : (i18n.currentLang === 'es' ? 'Tarjetas desbloqueadas' : 'Cards unblocked');
    this.showToast('success', msg);
    this.navigateTo(this.state.currentSection);
  },

  // Add fictional card
  addCard(type, name, number, balance = 0) {
    const card = {
      id: Date.now().toString(),
      type: type, // 'debit' or 'credit'
      name: name,
      number: number.slice(-4), // Store only last 4 digits
      fullNumber: number, // For demo purposes
      balance: balance,
      color: type === 'debit' ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-purple-700',
      addedDate: new Date().toISOString()
    };

    this.state.user.cards.push(card);
    this.saveState();
    this.showToast('success', type === 'debit' ? 'Tarjeta añadida' : 'Tarjeta de crédito añadida');
    this.navigateTo('profile');
  },

  // Remove card
  removeCard(cardId) {
    this.state.user.cards = this.state.user.cards.filter(c => c.id !== cardId);
    this.saveState();
    this.showToast('success', 'Tarjeta eliminada');
    this.navigateTo('profile');
  },

  // Add fictional money
  addMoney(amount, source = 'deposit', extra = {}) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    this.state.user.coins += numAmount;
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'deposit',
      amount: numAmount,
      source: source,
      date: new Date().toISOString(),
      description: extra.description || (i18n.currentLang === 'es' ? 'Depósito manual' : 'Manual deposit')
    });

    this.saveState();
    this.showToast('success', `+$${numAmount.toLocaleString()} ${i18n.currentLang === 'es' ? 'añadidos' : 'added'}`);
    this.navigateTo('wallet');
  },

  // Subtract fictional money
  subtractMoney(amount, reason = 'withdrawal', extra = {}) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (numAmount > this.state.user.coins) {
      this.showToast('error', i18n.t('insufficientFunds'));
      return;
    }

    this.state.user.coins -= numAmount;
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: numAmount,
      reason: reason,
      date: new Date().toISOString(),
      description: extra.description || (i18n.currentLang === 'es' ? 'Retiro manual' : 'Manual withdrawal')
    });

    this.saveState();
    this.showToast('success', `-$${numAmount.toLocaleString()} ${i18n.currentLang === 'es' ? 'retirados' : 'withdrawn'}`);
    this.navigateTo('wallet');
  },

  // Open add card modal
  showAddCardModal(type) {
    const lang = i18n.currentLang || 'es';
    const titles = {
      debit: { es: 'Añadir Tarjeta de Débito', en: 'Add Debit Card' },
      credit: { es: 'Añadir Tarjeta de Crédito', en: 'Add Credit Card' }
    };

    this.showModal('addCard', {
      title: titles[type][lang],
      type: type
    });
  },

  // Open money management modal
  showMoneyManagementModal() {
    const lang = i18n.currentLang || 'es';
    const title = lang === 'es' ? 'Gestionar Dinero Ficticio' : 'Manage Fictional Money';

    this.showModal('moneyManagement', {
      title: title
    });
  },

  // Add funds modal
  showAddFundsModal() {
    const lang = i18n.currentLang || 'es';
    this.showModal('addFunds', {
      title: lang === 'es' ? 'Añadir Fondos' : 'Add Funds',
      content: `
        <div style="padding: 0.5rem 0;">
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">${lang === 'es' ? 'Selecciona una cantidad o ingresa la tuya:' : 'Select an amount or enter your own:'}</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
            ${[500, 1000, 2500, 5000, 10000, 25000].map(amt => `
              <button class="btn btn-outline btn-sm" onclick="App.quickAddFunds(${amt})" style="font-weight: 600;">$${amt.toLocaleString()}</button>
            `).join('')}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <input type="number" id="addFundsAmount" placeholder="${lang === 'es' ? 'Otra cantidad...' : 'Other amount...'}" style="flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.875rem;">
            <button class="btn btn-success" onclick="App.confirmAddFunds()" style="white-space: nowrap;">${i18n.t('addMoney')}</button>
          </div>
        </div>
      `,
      buttons: `<button class="btn btn-secondary btn-full" onclick="App.closeModal()">${i18n.t('cancel')}</button>`
    });
  },

  // Quick add funds
  quickAddFunds(amount) {
    this.addMoney(amount, 'quick_deposit', { description: i18n.currentLang === 'es' ? `Depósito rápido $${amount.toLocaleString()}` : `Quick deposit $${amount.toLocaleString()}` });
    this.closeModal();
  },

  // Confirm add funds from input
  confirmAddFunds() {
    const amount = document.getElementById('addFundsAmount').value;
    if (!amount || parseFloat(amount) <= 0) return;
    this.addMoney(amount, 'manual_deposit', { description: i18n.currentLang === 'es' ? `Depósito manual $${parseFloat(amount).toLocaleString()}` : `Manual deposit $${parseFloat(amount).toLocaleString()}` });
    this.closeModal();
  },

  // Withdraw modal
  showWithdrawModal() {
    const lang = i18n.currentLang || 'es';
    const available = this.state.user.coins;
    this.showModal('withdraw', {
      title: lang === 'es' ? 'Retirar Fondos' : 'Withdraw Funds',
      content: `
        <div style="padding: 0.5rem 0;">
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted);">${i18n.t('availableBalance')}</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">$${available.toLocaleString()}</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
            ${[500, 1000, 2500].map(amt => `
              <button class="btn btn-outline btn-sm" onclick="App.quickWithdraw(${amt})" style="font-weight: 600; ${amt > available ? 'opacity: 0.4; pointer-events: none;' : ''}">$${amt.toLocaleString()}</button>
            `).join('')}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <input type="number" id="withdrawAmount" placeholder="${lang === 'es' ? 'Cantidad a retirar...' : 'Amount to withdraw...'}" style="flex: 1; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.875rem;">
            <button class="btn btn-outline" onclick="App.confirmWithdraw()" style="white-space: nowrap; border-color: var(--error); color: var(--error);">${i18n.t('withdraw')}</button>
          </div>
        </div>
      `,
      buttons: `<button class="btn btn-secondary btn-full" onclick="App.closeModal()">${i18n.t('cancel')}</button>`
    });
  },

  // Quick withdraw
  quickWithdraw(amount) {
    this.subtractMoney(amount, 'quick_withdrawal', { description: i18n.currentLang === 'es' ? `Retiro rápido $${amount.toLocaleString()}` : `Quick withdrawal $${amount.toLocaleString()}` });
    this.closeModal();
  },

  // Confirm withdraw from input
  confirmWithdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    if (!amount || parseFloat(amount) <= 0) return;
    this.subtractMoney(amount, 'manual_withdrawal', { description: i18n.currentLang === 'es' ? `Retiro manual $${parseFloat(amount).toLocaleString()}` : `Manual withdrawal $${parseFloat(amount).toLocaleString()}` });
    this.closeModal();
  },

  // Open investment breakdown modal
  showInvestmentBreakdown(investmentId) {
    const investment = this.investments.find(i => i.id === investmentId);
    if (!investment) return;

    const lang = i18n.currentLang || 'es';

    const breakdowns = {
      stocks: {
        es: {
          howItWorks: 'Cómo funciona',
          steps: [
            'Seleccionas una empresa para invertir',
            'Compras acciones a precio actual del mercado',
            'El valor fluctúa según el rendimiento de la empresa',
            'Puedes vender cuando el precio suba para obtener ganancias'
          ],
          technicalDemo: 'Demo Técnica',
          demoSteps: [
            'Precio de acción: $100',
            'Inviertes: $1,000 -> 10 acciones',
            'Si sube 10%: $110 × 10 = $1,100 (Ganancia: $100)',
            'Si baja 10%: $90 × 10 = $900 (Pérdida: $100)'
          ],
          risk: 'Riesgo: Medio - Las acciones pueden subir o bajar',
          tip: 'Consejo: Diversifica entre varias empresas'
        },
        en: {
          howItWorks: 'How it Works',
          steps: [
            'You select a company to invest in',
            'You buy shares at current market price',
            'Value fluctuates based on company performance',
            'You can sell when price goes up to make profit'
          ],
          technicalDemo: 'Technical Demo',
          demoSteps: [
            'Share price: $100',
            'You invest: $1,000 -> 10 shares',
            'If up 10%: $110 × 10 = $1,100 (Profit: $100)',
            'If down 10%: $90 × 10 = $900 (Loss: $100)'
          ],
          risk: 'Risk: Medium - Stocks can go up or down',
          tip: 'Tip: Diversify across multiple companies'
        }
      },
      etfs: {
        es: {
          howItWorks: 'Cómo funciona',
          steps: [
            'Compras una canasta diversificada de acciones',
            'Sigues un índice como S&P 500',
            'Menor riesgo que acciones individuales',
            'Ganas con el crecimiento del mercado general'
          ],
          technicalDemo: 'Demo Técnica',
          demoSteps: [
            'ETF del S&P 500: $400 por acción',
            'Inviertes: $1,000 -> 2.5 acciones',
            'Si el índice sube 8%: $432 × 2.5 = $1,080',
            'Ganancia anual promedio histórica: ~10%'
          ],
          risk: 'Riesgo: Bajo - Diversificación automática',
          tip: 'Consejo: Ideal para inversión a largo plazo'
        },
        en: {
          howItWorks: 'How it Works',
          steps: [
            'You buy a diversified basket of stocks',
            'Tracks an index like S&P 500',
            'Lower risk than individual stocks',
            'Profit from overall market growth'
          ],
          technicalDemo: 'Technical Demo',
          demoSteps: [
            'S&P 500 ETF: $400 per share',
            'You invest: $1,000 -> 2.5 shares',
            'If index up 8%: $432 × 2.5 = $1,080',
            'Historical average annual return: ~10%'
          ],
          risk: 'Risk: Low - Automatic diversification',
          tip: 'Tip: Ideal for long-term investing'
        }
      },
      creditCards: {
        es: {
          howItWorks: 'Cómo funciona',
          steps: [
            'Inviertes en un pool de tarjetas de crédito',
            'Ganas intereses de los pagos de los usuarios',
            'Alto rendimiento pero mayor riesgo',
            'Los ingresos dependen del uso y pagos'
          ],
          technicalDemo: 'Demo Técnica',
          demoSteps: [
            'Inviertes: $1,000 en pool de tarjetas',
            'Tasa de interés promedio: 18% APR',
            'Retorno mensual estimado: 1.5% = $15',
            'Riesgo: Morosidad de los tarjetahabientes'
          ],
          risk: 'Riesgo: Alto - Depende de pagos de usuarios',
          tip: 'Consejo: Monitorea tasas de morosidad'
        },
        en: {
          howItWorks: 'How it Works',
          steps: [
            'You invest in a credit card pool',
            'Earn interest from user payments',
            'High returns but higher risk',
            'Income depends on usage and payments'
          ],
          technicalDemo: 'Technical Demo',
          demoSteps: [
            'You invest: $1,000 in card pool',
            'Average interest rate: 18% APR',
            'Estimated monthly return: 1.5% = $15',
            'Risk: Cardholder default rates'
          ],
          risk: 'Risk: High - Depends on user payments',
          tip: 'Tip: Monitor delinquency rates'
        }
      },
      mortgages: {
        es: {
          howItWorks: 'Cómo funciona',
          steps: [
            'Inviertes en hipotecas residenciales',
            'Recibes pagos mensuales con intereses',
            'Bajo riesgo con propiedad como garantía',
            'Retorno estable a largo plazo'
          ],
          technicalDemo: 'Demo Técnica',
          demoSteps: [
            'Inviertes: $10,000 en hipoteca',
            'Tasa de interés: 6% anual',
            'Pago mensual recibido: ~$60',
            'Duración: 30 años con retorno garantizado'
          ],
          risk: 'Riesgo: Bajo - Propiedad como colateral',
          tip: 'Consejo: Inversión estable para ingresos pasivos'
        },
        en: {
          howItWorks: 'How it Works',
          steps: [
            'You invest in residential mortgages',
            'Receive monthly payments with interest',
            'Low risk with property as collateral',
            'Stable long-term returns'
          ],
          technicalDemo: 'Technical Demo',
          demoSteps: [
            'You invest: $10,000 in mortgage',
            'Interest rate: 6% annually',
            'Monthly payment received: ~$60',
            'Duration: 30 years with guaranteed return'
          ],
          risk: 'Risk: Low - Property as collateral',
          tip: 'Tip: Stable investment for passive income'
        }
      },
      crypto: {
        es: {
          howItWorks: 'Cómo funciona',
          steps: [
            'Compras criptomonedas como Bitcoin o Ethereum',
            'Mercado abierto 24/7 altamente volátil',
            'Potencial de ganancias muy altas',
            'Riesgo extremo de pérdida'
          ],
          technicalDemo: 'Demo Técnica',
          demoSteps: [
            'Bitcoin: $50,000 por BTC',
            'Inviertes: $1,000 -> 0.02 BTC',
            'Si sube 50%: $75,000 × 0.02 = $1,500',
            'Si baja 50%: $25,000 × 0.02 = $500'
          ],
          risk: 'Riesgo: Muy Alto - Volatilidad extrema',
          tip: 'Consejo: Solo invierte lo que puedas perder'
        },
        en: {
          howItWorks: 'How it Works',
          steps: [
            'Buy cryptocurrencies like Bitcoin or Ethereum',
            '24/7 market with high volatility',
            'Potential for very high gains',
            'Extreme risk of loss'
          ],
          technicalDemo: 'Technical Demo',
          demoSteps: [
            'Bitcoin: $50,000 per BTC',
            'You invest: $1,000 -> 0.02 BTC',
            'If up 50%: $75,000 × 0.02 = $1,500',
            'If down 50%: $25,000 × 0.02 = $500'
          ],
          risk: 'Risk: Very High - Extreme volatility',
          tip: 'Tip: Only invest what you can afford to lose'
        }
      }
    };

    const t = breakdowns[investmentId][lang];

    const content = `
      <div style="text-align: left;">
        <div style="margin-bottom: 1.5rem;">
          <h4 style="color: var(--primary); margin-bottom: 0.75rem;">📖 ${t.howItWorks}</h4>
          <ol style="padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.8;">
            ${t.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>

        <div style="margin-bottom: 1.5rem; background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem;">
          <h4 style="color: var(--accent); margin-bottom: 0.75rem;">💻 ${t.technicalDemo}</h4>
          <div style="font-family: monospace; font-size: 0.875rem; color: var(--text-primary); line-height: 2;">
            ${t.demoSteps.map(step => `<div>${step}</div>`).join('')}
          </div>
        </div>

        <div style="padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; margin-bottom: 0.75rem;">
          <span style="color: var(--error); font-weight: 600;">⚠️ ${t.risk}</span>
        </div>

        <div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem;">
          <span style="color: var(--success); font-weight: 600;">💡 ${t.tip}</span>
        </div>
      </div>
    `;

    this.showModal('investmentBreakdown', {
      title: `${investment.icon} ${i18n.t(investmentId)}`,
      content: content
    });
  }
};

// App object is defined above - init is called from main.js
