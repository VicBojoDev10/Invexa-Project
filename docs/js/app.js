// Invexa - Main Application Logic

const App = {
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

  // Financial Concepts Data
  financialConcepts: [
    {
      key: 'diversification',
      icon: '🔄',
      colors: { from: '#3b82f6', to: '#1d4ed8' }
    },
    {
      key: 'compoundInterest',
      icon: '📈',
      colors: { from: '#10b981', to: '#059669' }
    },
    {
      key: 'financialLiteracy',
      icon: '📚',
      colors: { from: '#f59e0b', to: '#d97706' }
    },
    {
      key: 'riskProfile',
      icon: '⚠️',
      colors: { from: '#8b5cf6', to: '#7c3aed' }
    },
    {
      key: 'volatility',
      icon: '📊',
      colors: { from: '#ec4899', to: '#db2777' }
    }
  ],

  // Investment Types Data
  investments: [
    {
      id: 'stocks',
      icon: '📊',
      minLevel: 1,
      riskLevel: 'medium',
      potentialReturn: '8-12%'
    },
    {
      id: 'etfs',
      icon: '📦',
      minLevel: 1,
      riskLevel: 'low',
      potentialReturn: '6-10%'
    },
    {
      id: 'creditCards',
      icon: '💳',
      minLevel: 2,
      riskLevel: 'high',
      potentialReturn: '15-25%'
    },
    {
      id: 'mortgages',
      icon: '🏠',
      minLevel: 3,
      riskLevel: 'low',
      potentialReturn: '4-8%'
    },
    {
      id: 'crypto',
      icon: '₿',
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
    this.loadSupabaseConfig();
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
  },

  checkAuth() {
    const session = localStorage.getItem('invexa_session');
    if (session) {
      try {
        const sess = JSON.parse(session);
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
      document.getElementById('welcomeScreen').classList.remove('hidden');
      document.getElementById('appContainer').classList.add('hidden');
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
    console.log('Level selected:', card.dataset.level);
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
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
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
      <div class="investment-card" data-investment="${inv.id}">
        <div class="investment-icon ${inv.id}">${inv.icon}</div>
        <div class="investment-name" data-i18n="${inv.id}">${i18n.t(inv.id)}</div>
        <p class="investment-description" data-i18n="${inv.id}Desc">${i18n.t(inv.id + 'Desc')}</p>
      </div>
    `).join('');

    return `
      <div class="fade-in">
        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon">💰</div>
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
              <div class="card-icon accent">📖</div>
              <div>
                <h3 class="card-title" data-i18n="concepts">${i18n.t('concepts')}</h3>
                <p class="card-subtitle">${this.financialConcepts.length} ${i18n.t('concepts').toLowerCase()}</p>
              </div>
            </div>
            <div class="skills-grid">
              ${this.financialConcepts.map(concept => `
                <div class="skill-card unlocked">
                  <div class="skill-icon">${concept.icon}</div>
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
      { id: 1, title: 'loginStreak', progress: 3, target: 7, status: 'in-progress', reward: '100 💰' },
      { id: 2, title: 'dailyCollection', progress: 0, target: 1, status: 'new', reward: '50 💰' },
      { id: 3, title: 'firstInvestment', progress: 0, target: 1, status: 'new', reward: '200 💰' },
      { id: 4, title: 'achievements', progress: 2, target: 5, status: 'in-progress', reward: '150 💰 + 🎨' }
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
            <span class="mission-reward-icon">🎁</span>
            <span>${mission.reward}</span>
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
            <div class="card-icon success">🎯</div>
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
      { name: 'diversification', icon: '🔄', unlocked: true },
      { name: 'compoundInterest', icon: '📈', unlocked: true },
      { name: 'riskProfile', icon: '⚠️', unlocked: user.level >= 2 },
      { name: 'financialLiteracy', icon: '📚', unlocked: user.level >= 3 },
      { name: 'volatility', icon: '📊', unlocked: user.level >= 4 },
      { name: 'portfolio', icon: '💼', unlocked: user.level >= 5 }
    ];

    const skillsHtml = skills.map(skill => `
      <div class="skill-card ${skill.unlocked ? 'unlocked' : 'locked'}">
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-name" data-i18n="${skill.name}">${i18n.t(skill.name)}</div>
        ${!skill.unlocked ? '<div style="font-size: 0.75rem; margin-top: 0.5rem;">🔒</div>' : ''}
      </div>
    `).join('');

    // Get available investments based on user level
    const availableInvestments = this.investments.filter(inv => user.level >= inv.minLevel);
    const investmentsHtml = availableInvestments.map(inv => `
      <div class="investment-card clickable" data-investment="${inv.id}">
        <div class="investment-icon ${inv.id}">${inv.icon}</div>
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
            <div class="card-icon purple">🎓</div>
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
              <div class="card-icon success">💼</div>
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
            <div class="card-icon accent">📜</div>
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
              <span>${user.coins} 💰</span>
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
        ${!isBlocked ? '<button class="credit-card-delete" onclick="event.stopPropagation(); App.removeCard(\'' + card.id + '\')">🗑️</button>' : ''}
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
            <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">💳</div>
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
            <div class="card-icon success">💰</div>
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
            <div class="card-icon">🎯</div>
            <div>
              <h3 class="card-title" data-i18n="financialGoals">${i18n.t('financialGoals')}</h3>
            </div>
          </div>
          <div style="padding: 1rem 0;">
            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
              <span style="font-size: 1.5rem;">🏠</span>
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
            <div class="card-icon">⚙️</div>
            <div>
              <h3 class="card-title" data-i18n="systemPreferences">${i18n.t('systemPreferences')}</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.toggleSetting('darkMode')">
              <span class="settings-label">
                <span class="settings-icon">🌙</span>
                <span data-i18n="darkMode">${i18n.t('darkMode')}</span>
              </span>
              <div class="toggle ${this.state.settings.darkMode ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-item" onclick="App.toggleSetting('notifications')">
              <span class="settings-label">
                <span class="settings-icon">🔔</span>
                <span data-i18n="notifications">${i18n.t('notifications')}</span>
              </span>
              <div class="toggle ${this.state.settings.notifications ? 'active' : ''}">
                <div class="toggle-knob"></div>
              </div>
            </div>
            <div class="settings-item">
              <span class="settings-label">
                <span class="settings-icon">🌐</span>
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

        <div class="card mb-4">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);">☁️</div>
            <div>
              <h3 class="card-title">Supabase</h3>
            </div>
          </div>
          <div class="settings-list">
            <div class="settings-item" onclick="App.showSupabaseModal()">
              <span class="settings-label">
                <span class="settings-icon">🔗</span>
                <span>${i18n.currentLang === 'es' ? 'Conectar Base de Datos' : 'Connect Database'}</span>
              </span>
              <span style="color: var(--primary);">-></span>
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
    if (section === 'invest' || section === 'progress') {
      document.querySelectorAll('.investment-card').forEach(card => {
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

    // Simulation data for each investment type
    const simulations = {
      stocks: {
        es: {
          title: 'Simula tu Inversión en Acciones',
          description: 'Elige cuánto invertir y observa cómo puede crecer (o disminuir) tu dinero',
          investLabel: 'Cantidad a Invertir',
          simulateBtn: 'Ejecutar Simulación',
          scenario1: '📈 Escenario Optimista (+12%)',
          scenario2: '📊 Escenario Neutral (0%)',
          scenario3: '📉 Escenario Pesimista (-15%)',
          tip: '💡 Consejo: Las acciones son volátiles a corto plazo, pero históricamente tienden a crecer a largo plazo.'
        },
        en: {
          title: 'Simulate Stock Investment',
          description: 'Choose how much to invest and see how your money can grow (or decrease)',
          investLabel: 'Investment Amount',
          simulateBtn: 'Run Simulation',
          scenario1: '📈 Optimistic Scenario (+12%)',
          scenario2: '📊 Neutral Scenario (0%)',
          scenario3: '📉 Pessimistic Scenario (-15%)',
          tip: '💡 Tip: Stocks are volatile short-term but historically grow long-term.'
        }
      },
      etfs: {
        es: {
          title: 'Simula tu Inversión en ETFs',
          description: 'Los ETFs son más estables - sigue el rendimiento del S&P 500',
          investLabel: 'Cantidad a Invertir',
          simulateBtn: 'Ejecutar Simulación',
          scenario1: '📈 Año Bueno (+10%)',
          scenario2: '📊 Año Promedio (+7%)',
          scenario3: '📉 Año Malo (-8%)',
          tip: '💡 Consejo: Los ETFs ofrecen diversificación automática y menor riesgo que acciones individuales.'
        },
        en: {
          title: 'Simulate ETF Investment',
          description: 'ETFs are more stable - follows S&P 500 performance',
          investLabel: 'Investment Amount',
          simulateBtn: 'Run Simulation',
          scenario1: '📈 Good Year (+10%)',
          scenario2: '📊 Average Year (+7%)',
          scenario3: '📉 Bad Year (-8%)',
          tip: '💡 Tip: ETFs offer automatic diversification and lower risk than individual stocks.'
        }
      },
      creditCards: {
        es: {
          title: 'Simula Inversión en Tarjetas',
          description: 'Invierte en un pool de tarjetas de crédito y gana intereses',
          investLabel: 'Cantidad a Invertir',
          simulateBtn: 'Ejecutar Simulación',
          scenario1: '📈 Baja Morosidad (+18% APR)',
          scenario2: '📊 Morosidad Normal (+12% APR)',
          scenario3: '📉 Alta Morosidad (-5%)',
          tip: '💡 Consejo: Monitorea las tasas de morosidad - afectan directamente tus retornos.'
        },
        en: {
          title: 'Simulate Credit Card Investment',
          description: 'Invest in credit card pools and earn interest',
          investLabel: 'Investment Amount',
          simulateBtn: 'Run Simulation',
          scenario1: '📈 Low Default (+18% APR)',
          scenario2: '📊 Normal Default (+12% APR)',
          scenario3: '📉 High Default (-5%)',
          tip: '💡 Tip: Monitor default rates - they directly affect your returns.'
        }
      },
      mortgages: {
        es: {
          title: 'Simula Inversión Hipotecaria',
          description: 'Invierte en hipotecas y recibe pagos mensuales estables',
          investLabel: 'Cantidad a Invertir',
          simulateBtn: 'Ejecutar Simulación',
          scenario1: '📈 Sin Incumplimiento (+6% anual)',
          scenario2: '📊 Incumplimiento Bajo (+4% anual)',
          scenario3: '📉 Incumplimiento Alto (-2%)',
          tip: '💡 Consejo: Las hipotecas son inversiones estables con propiedad como garantía.'
        },
        en: {
          title: 'Simulate Mortgage Investment',
          description: 'Invest in mortgages and receive stable monthly payments',
          investLabel: 'Investment Amount',
          simulateBtn: 'Run Simulation',
          scenario1: '📈 No Default (+6% annual)',
          scenario2: '📊 Low Default (+4% annual)',
          scenario3: '📉 High Default (-2%)',
          tip: '💡 Tip: Mortgages are stable investments with property as collateral.'
        }
      },
      crypto: {
        es: {
          title: 'Simula Inversión en Crypto',
          description: 'Alto riesgo, alta recompensa - el mercado crypto es muy volátil',
          investLabel: 'Cantidad a Invertir',
          simulateBtn: 'Ejecutar Simulación',
          scenario1: '📈 Bull Market (+50%)',
          scenario2: '📊 Mercado Lateral (+5%)',
          scenario3: '📉 Bear Market (-40%)',
          tip: '💡 Consejo: Nunca inviertas más de lo que puedes permitirte perder en crypto.'
        },
        en: {
          title: 'Simulate Crypto Investment',
          description: 'High risk, high reward - crypto market is very volatile',
          investLabel: 'Investment Amount',
          simulateBtn: 'Run Simulation',
          scenario1: '📈 Bull Market (+50%)',
          scenario2: '📊 Sideways Market (+5%)',
          scenario3: '📉 Bear Market (-40%)',
          tip: '💡 Tip: Never invest more than you can afford to lose in crypto.'
        }
      }
    };

    const t = simulations[investmentId][lang];
    const defaultAmount = investmentId === 'mortgages' ? 10000 : 1000;

    const modalContent = `
      <div style="text-align: center; padding: 1rem 0;">
        <div class="investment-icon ${investmentId}" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto 0.5rem;">
          ${investment.icon}
        </div>
        <h3 style="margin-bottom: 0.25rem;" data-i18n="${investmentId}">${i18n.t(investmentId)}</h3>
        <p style="color: var(--text-muted); margin-bottom: 1rem; font-size: 0.875rem;" data-i18n="${investmentId}Desc">${i18n.t(investmentId + 'Desc')}</p>

        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
          <span style="padding: 0.25rem 0.75rem; background: rgba(37, 99, 235, 0.1); border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: var(--primary);">
            ⚠️ ${lang === 'es' ? 'Riesgo' : 'Risk'}: ${investment.riskLevel}
          </span>
          <span style="padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: var(--success);">
            📈 ${lang === 'es' ? 'Retorno' : 'Return'}: ${investment.potentialReturn}
          </span>
        </div>

        <!-- Interactive Simulation -->
        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: left;">
          <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--primary);">${t.title}</h4>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">${t.description}</p>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-secondary);">${t.investLabel}</label>
            <div style="display: flex; gap: 0.5rem;">
              <input type="number" id="simAmount" value="${defaultAmount}" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-tertiary); color: var(--text-primary); font-size: 0.875rem;">
              <button class="btn btn-primary btn-sm" onclick="App.runInvestmentSimulation('${investmentId}')" style="white-space: nowrap;">${t.simulateBtn}</button>
            </div>
          </div>

          <div id="simResults" style="display: none;">
            <div style="padding: 0.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8rem;">
              <div style="font-weight: 600; color: var(--success);">${t.scenario1}</div>
              <div id="simResult1" style="font-family: monospace;"></div>
            </div>
            <div style="padding: 0.5rem; background: rgba(136, 136, 136, 0.1); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.8rem;">
              <div style="font-weight: 600; color: var(--text-secondary);">${t.scenario2}</div>
              <div id="simResult2" style="font-family: monospace;"></div>
            </div>
            <div style="padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; font-size: 0.8rem;">
              <div style="font-weight: 600; color: var(--error);">${t.scenario3}</div>
              <div id="simResult3" style="font-family: monospace;"></div>
            </div>
          </div>

          <div id="simTip" style="display: none; padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: 0.5rem; margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-secondary);">
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
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.confirmInvestment('${investmentId}')" data-i18n="confirm">${i18n.t('confirm')}</button>
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
    this.closeModal();
    this.showToast('success', i18n.t('investmentConfirmed'));

    // Add XP and coins
    this.state.user.xp += 50;
    this.state.user.coins += 100;

    if (this.state.user.xp >= this.state.user.xpToNext) {
      this.levelUp();
    }

    this.saveState();
    this.navigateTo('progress');
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
      console.log('Dark mode toggled:', theme);
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
    } else if (type === 'supabase') {
      title.textContent = 'Supabase';
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Project URL</label>
            <input type="url" id="supabaseUrl" placeholder="https://your-project.supabase.co" value="${this.supabaseClient ? this.supabaseClient.url : ''}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Anon Key</label>
            <input type="text" id="supabaseKey" placeholder="eyJhbGciOiJIUzI1NiIs..." value="${this.supabaseClient ? this.supabaseClient.key : ''}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--bg-secondary); color: var(--text-primary);">
          </div>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Supabase Settings</p>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" onclick="App.submitSupabaseConfig()">${i18n.t('confirm')}</button>
      `;
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

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    errorEl.textContent = '';

    if (!this.supabase) {
      this.showToast('warning', i18n.currentLang === 'es' ? 'Conecta Supabase en Opciones primero' : 'Connect Supabase in Options first');
      return;
    }

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

    if (!this.supabase) {
      this.showToast('warning', i18n.currentLang === 'es' ? 'Conecta Supabase en Opciones primero' : 'Connect Supabase in Options first');
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
        localStorage.setItem('invexa_session', JSON.stringify(data));
        this.showToast('success', i18n.t('accountCreated'));
        this.showLoginSuccess();
      } else if (data.session) {
        localStorage.setItem('invexa_session', JSON.stringify(data));
        this.showToast('success', i18n.t('accountCreated'));
        this.showLoginSuccess();
      } else {
        this.showToast('success', i18n.currentLang === 'es' ? 'Revisa tu correo para confirmar' : 'Check your email to confirm');
      }
    } catch (err) {
      errorEl.textContent = err.message;
    }
  },

  async loginWithGoogle() {
    if (!this.supabase) {
      this.showToast('warning', i18n.currentLang === 'es' ? 'Conecta Supabase en Opciones primero' : 'Connect Supabase in Options first');
      return;
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google'
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

  async logout() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    localStorage.removeItem('invexa_session');
    localStorage.removeItem('invexa_level');
    localStorage.removeItem('invexa_state');
    location.reload();
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
      console.log('Supabase initialized:', url);
    } catch (e) {
      console.error('Supabase init error:', e);
    }
  },

  syncUserData() {
    if (!this.supabaseClient) {
      console.log('Supabase not initialized');
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
    console.log('Data synced to Supabase');
  },

  showSupabaseModal() {
    this.showModal('supabase');
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
  addMoney(amount, source = 'deposit') {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    this.state.user.coins += numAmount;
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'deposit',
      amount: numAmount,
      source: source,
      date: new Date().toISOString()
    });

    this.saveState();
    this.showToast('success', `+${numAmount} ${i18n.t('xp') === 'XP' ? '$' : '$'} añadidos`);
    this.navigateTo('progress');
  },

  // Subtract fictional money
  subtractMoney(amount, reason = 'withdrawal') {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (numAmount > this.state.user.coins) {
      this.showToast('error', i18n.currentLang === 'es' ? 'Fondos insuficientes' : 'Insufficient funds');
      return;
    }

    this.state.user.coins -= numAmount;
    this.state.user.transactions.push({
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: numAmount,
      reason: reason,
      date: new Date().toISOString()
    });

    this.saveState();
    this.showToast('success', `-${numAmount} ${i18n.t('xp') === 'XP' ? '$' : '$'} retirados`);
    this.navigateTo('progress');
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing App...');
  App.init();
});
