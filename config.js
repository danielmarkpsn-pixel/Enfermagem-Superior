// config.js - Configuracao do Enfermagem Superior V7
window.APP_CONFIG = {
  appName: "Enfermagem Superior",
  version: "7.0.0",
  environment: "production",
  demoMode: true,
  demoUsers: {
    aluno:         { email: "aluno@demo.com",     senha: "1234", role: "aluno" },
    professor:     { email: "professor@demo.com", senha: "1234", role: "professor" },
    administrador: { email: "admin@demo.com",     senha: "1234", role: "admin" }
  },
  apiUrl: null,
  features: { pwa: true, offlineMode: true, darkMode: true, backup: true },
  storageKeys: {
    usuarios: "enf_usuarios", sessao: "enf_sessao",
    tema: "enf_tema", dados: "enf_dados"
  },
  buildDate: new Date().toISOString().split("T")[0]
};
console.log(`%c${window.APP_CONFIG.appName} v${window.APP_CONFIG.version}`, "color:#667eea;font-size:16px;font-weight:bold;");
