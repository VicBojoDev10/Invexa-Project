// Invexa - Main Entry Point
// Initialize App
(function initApp() {
  try {
    if (window.App) {
      App.init();
    }
  } catch (e) {
    console.error('App init error:', e);
    document.body.innerHTML = '<div style="padding:2rem;color:red;">Error loading app: ' + e.message + '</div>';
  }
})();

// OAuth redirect callback handler
(function() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (code || error) {
    const lang = document.documentElement.lang || 'es';
    document.body.insertAdjacentHTML('beforeend', `
      <div id="authLoading" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-primary);z-index:9999;flex-direction:column;gap:1rem;">
        <div style="font-size:3rem;">🔐</div>
        <p>${lang === 'es' ? 'Conectando...' : 'Connecting...'}</p>
      </div>
    `);

    window.addEventListener('load', function() {
      if (window.App && window.App.handleAuthCallback) {
        window.App.handleAuthCallback(code).then(function() {
          var el = document.getElementById('authLoading');
          if (el) el.remove();
          history.replaceState({}, '', window.location.pathname);
        });
      }
    });
  }
})();