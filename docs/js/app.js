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
      darkMode: false
    },
    user: {
      name: 'Usuario',
      email: 'usuario@invexa.com',
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
    i18n.init();

    // Apply dark mode immediately on load
    if (this.state.settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Check if user has completed onboarding
    const savedLevel = localStorage.getItem('invexa_level');
    if (savedLevel) {
      this.state.userLevel = savedLevel;
      this.showMainApp();
    }
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

    // Render user's cards
    const cardsHtml = user.cards.length > 0 ? user.cards.map(card => `
      <div class="credit-card ${card.type}" style="background: linear-gradient(135deg, ${card.type === 'debit' ? '#3b82f6, #1d4ed8' : '#8b5cf6, #7c3aed'});">
        <div class="credit-card-chip"></div>
        <div class="credit-card-number">**** **** **** ${card.number}</div>
        <div class="credit-card-name">${card.name}</div>
        <div class="credit-card-balance">${card.type === 'credit' ? (lang === 'es' ? 'Límite: ' : 'Limit: ') : (lang === 'es' ? 'Saldo: ' : 'Balance: ')}$${card.balance.toLocaleString()}</div>
        <button class="credit-card-delete" onclick="event.stopPropagation(); App.removeCard('${card.id}')">🗑️</button>
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
            <button class="btn btn-outline btn-sm" onclick="App.showAddCardModal('debit')" style="flex: 1;">
              ➕ ${addDebitText}
            </button>
            <button class="btn btn-outline btn-sm" onclick="App.showAddCardModal('credit')" style="flex: 1;">
              ➕ ${addCreditText}
            </button>
          </div>
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
              <span style="color: var(--primary);">→</span>
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
                <span>Bloquear Tarjetas Temporalmente</span>
              </span>
              <button class="btn btn-outline btn-sm" style="border-color: var(--warning); color: var(--warning);">
                ${i18n.currentLang === 'es' ? 'Bloquear' : 'Block'}
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
              <span style="color: var(--warning);">→</span>
            </div>
            <div class="settings-item" onclick="App.showModal('delete')">
              <span class="settings-label">
                <span class="settings-icon">🗑️</span>
                <span data-i18n="deleteAccount">${i18n.t('deleteAccount')}</span>
              </span>
              <span style="color: var(--error);">→</span>
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

  // Open investment modal
  openInvestmentModal(investmentId) {
    const investment = this.investments.find(i => i.id === investmentId);
    if (!investment) return;

    const lang = i18n.currentLang || 'es';
    const learnMoreText = lang === 'es' ? '📖 Cómo Funciona' : '📖 How It Works';
    const investText = lang === 'es' ? 'Invertir Ahora' : 'Invest Now';

    const modalContent = `
      <div style="text-align: center; padding: 1rem 0;">
        <div class="investment-icon ${investmentId}" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto 1rem;">
          ${investment.icon}
        </div>
        <h3 style="margin-bottom: 0.5rem;" data-i18n="${investmentId}">${i18n.t(investmentId)}</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;" data-i18n="${investmentId}Desc">${i18n.t(investmentId + 'Desc')}</p>

        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
          <span style="padding: 0.25rem 0.75rem; background: rgba(37, 99, 235, 0.1); border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: var(--primary);">
            Risk: ${investment.riskLevel}
          </span>
          <span style="padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 99px; font-size: 0.75rem; font-weight: 600; color: var(--success);">
            Return: ${investment.potentialReturn}
          </span>
        </div>

        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">${lang === 'es' ? 'Simulación de inversión' : 'Investment Simulation'}</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">$1,000 → $1,${Math.floor(1000 + Math.random() * 200)}</div>
        </div>

        <button class="btn btn-outline btn-full" onclick="App.showInvestmentBreakdown('${investmentId}')" style="margin-bottom: 1rem;">
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
          <p style="font-weight: 600; margin-bottom: 1rem;">¿Estás seguro de que quieres eliminar tu cuenta?</p>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Esta acción no se puede deshacer. Se perderán todos tus datos, progreso e inversiones.</p>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn btn-secondary" onclick="App.closeModal()" data-i18n="cancel">${i18n.t('cancel')}</button>
        <button class="btn btn-primary" style="background: var(--error);" onclick="App.deleteAccount()" data-i18n="deleteAccount">${i18n.t('deleteAccount')}</button>
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
            📥 ${lang === 'es' ? 'Añadir Dinero' : 'Add Money'}
          </button>
          <button class="btn btn-outline" id="withdrawBtn" style="flex: 1; border-color: var(--error); color: var(--error);" onclick="App.showDepositSubModal('withdraw')">
            📤 ${lang === 'es' ? 'Retirar Dinero' : 'Withdraw Money'}
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

  // Logout
  logout() {
    if (confirm(i18n.currentLang === 'es' ? '¿Cerrar sesión?' : 'Logout?')) {
      localStorage.removeItem('invexa_level');
      localStorage.removeItem('invexa_state');
      location.reload();
    }
  },

  // Delete account
  deleteAccount() {
    localStorage.clear();
    alert(i18n.currentLang === 'es' ? 'Cuenta eliminada' : 'Account deleted');
    location.reload();
  },

  // Deactivate account
  deactivateAccount() {
    this.closeModal();
    this.showToast('success', i18n.currentLang === 'es' ? 'Cuenta desactivada' : 'Account deactivated');
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
            'Inviertes: $1,000 → 10 acciones',
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
            'You invest: $1,000 → 10 shares',
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
            'Inviertes: $1,000 → 2.5 acciones',
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
            'You invest: $1,000 → 2.5 shares',
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
            'Inviertes: $1,000 → 0.02 BTC',
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
            'You invest: $1,000 → 0.02 BTC',
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
