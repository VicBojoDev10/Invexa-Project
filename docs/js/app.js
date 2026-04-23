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
      skills: []
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
      </div>
    `;
  },

  // Render Profile Section
  renderProfileSection() {
    const user = this.state.user;
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

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
    if (section === 'invest') {
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
          <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Simulación de inversión</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">$1,000 → $1,${Math.floor(1000 + Math.random() * 200)}</div>
        </div>
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
    this.navigateTo(this.state.currentSection);

    if (setting === 'darkMode') {
      document.documentElement.setAttribute('data-theme', this.state.settings.darkMode ? 'dark' : 'light');
    }
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
    }

    modal.classList.add('active');
    i18n.updateUI();
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
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing App...');
  App.init();
});
