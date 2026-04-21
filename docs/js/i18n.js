// i18n - Internationalization System
const i18n = {
  currentLang: 'es',

  translations: {
    es: {
      // Welcome & Onboarding
      welcome: '¡Bienvenido a Invexa!',
      welcomeSubtitle: 'Tu camino hacia la libertad financiera comienza aquí',
      loading: 'Cargando...',
      selectKnowledge: '¿Cuál es tu nivel de conocimiento financiero?',
      beginner: 'No sé nada de finanzas y quiero aprender a generar ingresos desde cero',
      basic: 'Sé algunos conceptos básicos pero quiero aprender a manejar mis inversiones mejor',
      intermediate: 'Tengo conocimientos intermedios, sé cómo invertir y necesito control y sugerencias',
      advanced: 'Tengo conocimientos avanzados y quiero saber qué rinde más en el mercado',
      continue: 'Continuar',

      // Main Menu
      home: 'Inicio',
      invest: 'Invertir',
      missions: 'Misiones',
      progress: 'Progreso',
      profile: 'Perfil',
      options: 'Opciones',

      // Invest Module
      selectInvestment: 'Selecciona el tipo de inversión',
      explanation: 'Explicación',
      simulate: 'Simular',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
      back: 'Volver',
      investmentConfirmed: '¡Inversión confirmada!',
      rewardReceived: 'Recompensa recibida',

      // Investment Types
      stocks: 'Acciones',
      stocksDesc: 'Representan el capital de una empresa y permiten participar en ganancias o pérdidas',
      etfs: 'ETFs',
      etfsDesc: 'Agrupan diversos activos para cotizar en bolsa y diversificar en finanzas',
      creditCards: 'Tarjetas de Crédito',
      creditCardsDesc: 'Herramientas con préstamo otorgado por instituciones financieras',
      mortgages: 'Hipotecas',
      mortgagesDesc: 'Préstamos a largo plazo para la adquisición de bienes inmuebles',
      crypto: 'Criptomonedas',
      cryptoDesc: 'Activos digitales basados en Blockchain',

      // Missions Module
      availableMissions: 'Misiones Disponibles',
      completedMissions: 'Misiones Completadas',
      claimReward: 'Reclamar Recompensa',
      missionInProgress: 'Misión en Progreso',
      loginStreak: 'Racha de Inicio de Sesión',
      dailyCollection: 'Recolección Diaria',
      achievements: 'Logros',
      unlockSkins: 'Desbloquear Skins',
      missionCompleted: '¡Misión Completada!',

      // Progress Module
      currentLevel: 'Nivel Actual',
      unlockedSkills: 'Habilidades Desbloqueadas',
      userHistory: 'Historial de Usuario',
      xp: 'Experiencia',
      nextLevel: 'Siguiente Nivel',
      levelUp: '¡Nivel Completado!',

      // Profile Module
      userData: 'Datos de Usuario',
      accountSettings: 'Configuración de Cuenta',
      financialGoals: 'Objetivos Financieros',
      systemPreferences: 'Preferencias del Sistema',
      editProfile: 'Editar Perfil',
      saveChanges: 'Guardar Cambios',

      // Options Module
      musicAndSound: 'Música y Sonido',
      privacyNotice: 'Aviso de Privacidad',
      deleteAccount: 'Eliminar Cuenta',
      deactivateOptions: 'Desactivar Opciones',
      closeSession: 'Cerrar Sesión',
      changeAccount: 'Cambiar Cuenta',
      blockCards: 'Bloquear Tarjetas',
      language: 'Idioma',
      notifications: 'Notificaciones',
      darkMode: 'Modo Oscuro',

      // Authentication
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      loginWithGoogle: 'Continuar con Google',
      loginWithFacebook: 'Continuar con Facebook',
      loginWithApple: 'Continuar con Apple',
      biometricAuth: 'Autenticación Biométrica',

      // Financial Concepts (Educational)
      concepts: 'Conceptos Financieros',
      diversification: 'Diversificación de Activos',
      diversificationDesc: 'Repartir el capital en varias inversiones para reducir el riesgo',
      compoundInterest: 'Interés Compuesto',
      compoundInterestDesc: 'Crecimiento del valor al reinvertir las ganancias obtenidas',
      financialLiteracy: 'Alfabetización Financiera',
      financialLiteracyDesc: 'Conocimientos necesarios para tomar decisiones financieras inteligentes',
      riskProfile: 'Perfil de Riesgo',
      riskProfileDesc: 'Evaluación de posibles pérdidas para minimizar riesgos',
      volatility: 'Volatilidad',
      volatilityDesc: 'Probabilidad de que los precios varíen bruscamente en poco tiempo',

      // Common
      next: 'Siguiente',
      previous: 'Anterior',
      finish: 'Finalizar',
      skip: 'Saltar',
      close: 'Cerrar',
      ok: 'Aceptar',
      yes: 'Sí',
      no: 'No',
      loading: 'Cargando...',
      error: 'Error',
      success: '¡Éxito!',

      // Tutorial
      tutorialTitle: 'Tutorial de Bienvenida',
      tutorialStep1: '¡Bienvenido! Vamos a aprender sobre inversiones de forma divertida',
      tutorialStep2: 'Explora las diferentes opciones del menú para comenzar',
      tutorialStep3: 'Completa misiones para ganar recompensas y subir de nivel',
      tutorialComplete: '¡Tutorial Completado!',
      firstReward: 'Tu primera recompensa'
    },

    en: {
      // Welcome & Onboarding
      welcome: 'Welcome to Invexa!',
      welcomeSubtitle: 'Your journey to financial freedom starts here',
      loading: 'Loading...',
      selectKnowledge: 'What is your level of financial knowledge?',
      beginner: 'I know nothing about finance and want to learn to generate income from scratch',
      basic: 'I know some basic concepts but want to learn to manage my investments better',
      intermediate: 'I have intermediate knowledge, I know how to invest and need control and suggestions',
      advanced: 'I have advanced knowledge and want to know what yields more in the market',
      continue: 'Continue',

      // Main Menu
      home: 'Home',
      invest: 'Invest',
      missions: 'Missions',
      progress: 'Progress',
      profile: 'Profile',
      options: 'Options',

      // Invest Module
      selectInvestment: 'Select investment type',
      explanation: 'Explanation',
      simulate: 'Simulate',
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      investmentConfirmed: 'Investment confirmed!',
      rewardReceived: 'Reward received',

      // Investment Types
      stocks: 'Stocks',
      stocksDesc: 'Represent company capital and allow participation in profits or losses',
      etfs: 'ETFs',
      etfsDesc: 'Group various assets to trade on the stock market and diversify finances',
      creditCards: 'Credit Cards',
      creditCardsDesc: 'Tools with loans provided by financial institutions',
      mortgages: 'Mortgages',
      mortgagesDesc: 'Long-term loans for real estate acquisition',
      crypto: 'Cryptocurrencies',
      cryptoDesc: 'Digital assets based on Blockchain',

      // Missions Module
      availableMissions: 'Available Missions',
      completedMissions: 'Completed Missions',
      claimReward: 'Claim Reward',
      missionInProgress: 'Mission in Progress',
      loginStreak: 'Login Streak',
      dailyCollection: 'Daily Collection',
      achievements: 'Achievements',
      unlockSkins: 'Unlock Skins',
      missionCompleted: 'Mission Completed!',

      // Progress Module
      currentLevel: 'Current Level',
      unlockedSkills: 'Unlocked Skills',
      userHistory: 'User History',
      xp: 'Experience',
      nextLevel: 'Next Level',
      levelUp: 'Level Up!',

      // Profile Module
      userData: 'User Data',
      accountSettings: 'Account Settings',
      financialGoals: 'Financial Goals',
      systemPreferences: 'System Preferences',
      editProfile: 'Edit Profile',
      saveChanges: 'Save Changes',

      // Options Module
      musicAndSound: 'Music and Sound',
      privacyNotice: 'Privacy Notice',
      deleteAccount: 'Delete Account',
      deactivateOptions: 'Deactivate Options',
      closeSession: 'Close Session',
      changeAccount: 'Change Account',
      blockCards: 'Block Cards',
      language: 'Language',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',

      // Authentication
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot your password?',
      loginWithGoogle: 'Continue with Google',
      loginWithFacebook: 'Continue with Facebook',
      loginWithApple: 'Continue with Apple',
      biometricAuth: 'Biometric Authentication',

      // Financial Concepts (Educational)
      concepts: 'Financial Concepts',
      diversification: 'Asset Diversification',
      diversificationDesc: 'Spread capital across multiple investments to reduce risk',
      compoundInterest: 'Compound Interest',
      compoundInterestDesc: 'Growth of value by reinvesting earned profits',
      financialLiteracy: 'Financial Literacy',
      financialLiteracyDesc: 'Knowledge needed to make smart financial decisions',
      riskProfile: 'Risk Profile',
      riskProfileDesc: 'Assessment of potential losses to minimize risks',
      volatility: 'Volatility',
      volatilityDesc: 'Probability of prices changing sharply in a short time',

      // Common
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      skip: 'Skip',
      close: 'Close',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success!',

      // Tutorial
      tutorialTitle: 'Welcome Tutorial',
      tutorialStep1: 'Welcome! Let\'s learn about investing in a fun way',
      tutorialStep2: 'Explore the different menu options to get started',
      tutorialStep3: 'Complete missions to earn rewards and level up',
      tutorialComplete: 'Tutorial Completed!',
      firstReward: 'Your first reward'
    }
  },

  // Initialize language from localStorage or default
  init() {
    const saved = localStorage.getItem('invexa_lang');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    }
  },

  // Get translation by key
  t(key) {
    return this.translations[this.currentLang][key] || key;
  },

  // Set language and update UI
  setLang(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('invexa_lang', lang);
      this.updateUI();
    }
  },

  // Update all elements with data-i18n attribute
  updateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    document.documentElement.lang = this.currentLang;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});
