/* =========================================================
   DADOS BASE (faltavam no arquivo original)
   ========================================================= */

// Estrutura curricular: [semestre, código, nome]
const DISC = [
  ["1º","ENF101","Anatomia Humana"],
  ["1º","ENF102","Fisiologia Humana"],
  ["1º","ENF103","Fundamentos de Enfermagem"],
  ["2º","ENF201","Farmacologia"],
  ["2º","ENF202","Semiologia e Semiotécnica"],
  ["3º","ENF301","Saúde Coletiva"],
  ["3º","ENF302","Epidemiologia"],
  ["4º","ENF401","Enfermagem Médico-Cirúrgica"],
  ["5º","ENF501","Enfermagem em UTI"],
  ["6º","ENF601","Saúde Mental"],
  ["7º","ENF701","Gestão em Enfermagem"],
  ["8º","ENF801","TCC"]
];

function fresh(){
  return {
    users: [
      {
        id: "u1",
        name: "Administrador",
        email: "admin@local",
        pass: "admin",
        role: "admin",
        semester: "1º",
        active: true
      }
    ],
    materials: [],
    grades: [],
    attendance: [],
    questions: [],
    exams: [],
    notices: [],
    events: [],
    fav: [],
    theme: "light",
    session: null
  };
}

/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

let DB = read();
let mode = "login";
let page = "dashboard";
let sem = "1º";

const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* =========================================================
   PERSISTÊNCIA
   ========================================================= */

function read(){
  try {
    const saved = JSON.parse(localStorage.getItem("enf_v6"));

    if (
      !saved ||
      !Array.isArray(saved.users) ||
      !Array.isArray(saved.materials) ||
      !Array.isArray(saved.grades) ||
      !Array.isArray(saved.attendance) ||
      !Array.isArray(saved.questions) ||
      !Array.isArray(saved.exams)
    ) {
      return fresh();
    }

    // Garante campos que podem faltar em versões antigas
    saved.notices  = Array.isArray(saved.notices)  ? saved.notices  : [];
    saved.events   = Array.isArray(saved.events)   ? saved.events   : [];
    saved.fav      = Array.isArray(saved.fav)      ? saved.fav      : [];
    saved.theme    = saved.theme === "dark" ? "dark" : "light";
    saved.session  = saved.session ?? null;

    return saved;
  } catch (e) {
    return fresh();
  }
}

function save(){
  localStorage.setItem("enf_v6", JSON.stringify(DB));
}

function me(){
  return DB.users.find(u => u.id === DB.session);
}

function d(c){
  return DISC.find(x => x[1] === c) || ["", "", c];
}

function role(r){
  return r === "aluno"     ? "Aluno"
       : r === "professor" ? "Professor"
       :                     "Administrador";
}

function ini(n){
  return String(n || "")
    .split(" ")
    .filter(Boolean)
    .map(x => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function esc(x){
  return String(x ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m])
  );
}

function toast(t){
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = t;
  document.body.append(e);
  setTimeout(() => e.remove(), 2400);
}

/* =========================================================
   COMPONENTES DE UI
   ========================================================= */

function head(t, s, b = ""){
  return `
  <div class="head">
    <div>
      <h1>${t}</h1>
      <p>${s}</p>
    </div>
    ${b}
  </div>`;
}

function stat(a, b, c){
  return `
  <div class="card stat">
    <div class="label">${a}</div>
    <div class="value">${b}</div>
    <div class="hint">${c}</div>
  </div>`;
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function nav(){
  const u = me();
  if (!u) return [];

  const n = [["dashboard","⌂","Dashboard"]];

  if (u.role === "aluno")
    n.push(
      ["curso","🎓","Meu Curso"],
      ["biblioteca","📚","Biblioteca"],
      ["avaliacoes","📝","Avaliações"],
      ["notas","📊","Notas"],
      ["frequencia","📅","Frequência"],
      ["agenda","🗓️","Calendário"],
      ["perfil","👤","Meu Perfil"]
    );

  if (u.role === "professor")
    n.push(
      ["turmas","👥","Turmas"],
      ["materiais","📄","Materiais"],
      ["questoes","❓","Questões"],
      ["provas","📝","Avaliações"],
      ["lancamentos","📊","Notas"],
      ["avisos","📣","Avisos"],
      ["agenda","🗓️","Calendário"]
    );

  if (u.role === "admin")
    n.push(
      ["usuarios","👥","Usuários"],
      ["estrutura","🎓","Curso"],
      ["materiais","📄","Biblioteca"],
      ["relatorios","📈","Relatórios"],
      ["avisos","📣","Avisos"],
      ["agenda","🗓️","Calendário"],
      ["config","⚙️","Configurações"]
    );

  return n;
}

/* =========================================================
   RENDER PRINCIPAL
   ========================================================= */

function render(){

  // Sessão inválida
  if (DB.session && !DB.users.some(u => u.id === DB.session)){
    DB.session = null;
    save();
  }

  // Não logado
  if (!DB.session){
    $("#login")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");
    renderAuth();
    return;
  }

  // Logado
  $("#login")?.classList.add("hidden");
  $("#app")?.classList.remove("hidden");

  const u = me();
  if (!u){
    DB.session = null;
    save();
    render();
    return;
  }

  if ($("#headUser")) $("#headUser").textContent = u.name;
  if ($("#avatar"))   $("#avatar").textContent   = ini(u.name);
  if ($("#sideName")) $("#sideName").textContent = u.name;
  if ($("#sideRole")) $("#sideRole").textContent = role(u.role);

  const navEl = $("#nav");
  if (navEl){
    navEl.innerHTML = nav().map(x => `
      <button class="${page === x[0] ? "active" : ""}" data-p="${x[0]}">
        ${x[1]} ${x[2]}
      </button>
    `).join("");
  }

  $$("[data-p]").forEach(x => {
    x.onclick = () => {
      page = x.dataset.p;
      $("#side")?.classList.remove("open");
      render();
    };
  });

  const main = $("#main");
  if (main){
    const fn = P[page] || P.dashboard;
    main.innerHTML = fn ? fn() : "";
  }

  bind();

  document.body.classList.toggle("dark", DB.theme === "dark");
}

/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

function renderAuth(){
  const f = $("#authForm");
  if (!f) return;

  f.innerHTML = mode === "login" ? `
    <label>E-mail <input id="email" type="email" required></label>
    <label>Senha  <input id="pass"  type="password" required></label>
    <button class="btn primary full">Entrar</button>
  ` : `
    <label>Nome completo <input id="rname" required></label>
    <label>E-mail <input id="remail" type="email" required></label>
    <label>Senha  <input id="rpass"  type="password" minlength="4" required></label>
    <label>Perfil
      <select id="rrole">
        <option value="aluno">Aluno</option>
        <option value="professor">Professor</option>
      </select>
    </label>
    <label>Semestre
      <select id="rsem">
        ${[...new Set(DISC.map(x => x[0]))].map(x => `<option>${x}</option>`).join("")}
      </select>
    </label>
    <button class="btn primary full">Criar conta local</button>
  `;

  f.onsubmit = (e) => {
    e.preventDefault();

    if (mode === "login"){
      const email = $("#email").value.trim();
      const pass  = $("#pass").value;

      const u = DB.users.find(x =>
        x.email.toLowerCase() === email.toLowerCase() &&
        x.pass === pass &&
        x.active !== false
      );

      if (!u){
        toast("E-mail ou senha incorretos.");
        return;
      }

      DB.session = u.id;
      save();
      page = "dashboard";
      render();
      toast("Login realizado com sucesso.");
      return;
    }

    // Cadastro
    const email = $("#remail").value.trim().toLowerCase();

    if (DB.users.some(x => x.email.toLowerCase() === email)){
      toast("Este e-mail já está cadastrado.");
      return;
    }

    const u = {
      id: "u" + Date.now(),
      name: $("#rname").value.trim(),
      email,
      pass: $("#rpass").value,
      role: $("#rrole").value,
      semester: $("#rsem").value,
      active: true
    };

    DB.users.push(u);
    DB.session = u.id;
    save();
    page = "dashboard";
    render();
    toast("Conta criada localmente.");
  };
}

/* =========================================================
   BIND (eventos após render)
   ========================================================= */

function bind(){

  $$("[data-p]").forEach(x => {
    x.onclick = () => {
      page = x.dataset.p;
      $("#side")?.classList.remove("open");
      render();
    };
  });

  if ($("#searchMat")){
    $("#searchMat").oninput = () => {
      const grid = $("#matGrid");
      if (!grid) return;
      grid.innerHTML = matCards(
        DB.materials.filter(m =>
          (m.title + " " + d(m.disc)[2])
            .toLowerCase()
            .includes($("#searchMat").value.toLowerCase())
        )
      );
    };
  }

  $$("[data-sem]").forEach(x => {
    x.onclick = () => {
      sem = x.dataset.sem;
      render();
    };
  });

  $$("[data-fav]").forEach(x => {
    x.onclick = () => {
      const id = x.dataset.fav;
      DB.fav = DB.fav.includes(id)
        ? DB.fav.filter(a => a !== id)
        : [...DB.fav, id];
      save();
      render();
    };
  });

  $$("[data-act]").forEach(x => {
    x.onclick = () => action(x.dataset.act);
  });

  $$("[data-deluser]").forEach(x => {
    x.onclick = () => {
      DB.users = DB.users.filter(u => u.id !== x.dataset.deluser);
      save();
      render();
      toast("Usuário removido.");
    };
  });

  $$("[data-delq]").forEach(x => {
    x.onclick = () => {
      DB.questions = DB.questions.filter(q => q.id !== x.dataset.delq);
      save();
      render();
      toast("Questão removida.");
    };
  });

  $$("[data-grade]").forEach(x => {
    x.onchange = () => {
      const g = DB.grades[x.dataset.grade];
      if (g){
        g.grade = Number(x.value) || 0;
        save();
        toast("Nota salva.");
      }
    };
  });

  const pf = $("#profile");
  if (pf){
    pf.onsubmit = (e) => {
      e.preventDefault();
      const u = me();
      if (!u) return;
      u.name     = $("#pn").value;
      u.semester = $("#ps").value;
      save();
      render();
      toast("Perfil atualizado.");
    };
  }
}

/* =========================================================
   COMPONENTES
   ========================================================= */

function matCards(a){
  if (!a.length){
    return `<div class="card empty">Nenhum material encontrado.</div>`;
  }

  return a.map(m => `
    <div class="card">
      <div class="row">
        <span class="badge">${m.type}</span>
        <button data-fav="${m.id}" class="btn secondary">
          ${DB.fav.includes(m.id) ? "★" : "☆"}
        </button>
      </div>
      <h3>${esc(m.title)}</h3>
      <p class="muted">${d(m.disc)[2]} • ${m.sem} semestre</p>
      <div class="actions">
        <a class="btn secondary" href="${esc(m.file)}" target="_blank">Abrir</a>
      </div>
    </div>
  `).join("");
}

/* =========================================================
   DASHBOARDS
   ========================================================= */

function dashboardAluno(){
  const u = me();
  const g = DB.grades.filter(x => x.student === u.id);
  const a = DB.attendance.filter(x => x.student === u.id);

  const av = g.length
    ? (g.reduce((s,x) => s + x.grade, 0) / g.length).toFixed(1)
    : "0,0";

  const at = a.length
    ? Math.round(a.reduce((s,x) => s + x.pct, 0) / a.length)
    : 0;

  return head(
    "Olá, " + u.name.split(" ")[0] + "! 👋",
    "Seu resumo acadêmico.",
    `<button class="btn primary" data-p="curso">Estudar</button>`
  ) + `
  <div class="grid stats">
    ${stat("Média", av, "Notas registradas")}
    ${stat("Frequência", at + "%", "Média")}
    ${stat("Materiais", DB.materials.length, "Biblioteca")}
    ${stat("Avaliações", DB.exams.length, "Agendadas")}
  </div>

  <div class="grid two">
    <div class="card">
      <div class="section"><h2>Próximas avaliações</h2></div>
      ${DB.exams.length
        ? DB.exams.map(e => `
          <div class="row">
            <span><b>${esc(e.title)}</b><small>${d(e.disc)[2]}</small></span>
            <span class="badge">${esc(e.date)}</span>
          </div>`).join("")
        : `<p class="muted">Nenhuma avaliação agendada.</p>`}
    </div>

    <div class="card">
      <div class="section"><h2>Avisos</h2></div>
      ${DB.notices.length
        ? DB.notices.map(n => `
          <div class="notice">
            <b>${esc(n.title)}</b>
            <div>${esc(n.text)}</div>
          </div>`).join("")
        : `<p class="muted">Nenhum aviso publicado.</p>`}
    </div>
  </div>`;
}

function dashboardProf(){
  const st = DB.users.filter(u => u.role === "aluno");

  return head(
    "Painel do Professor",
    "Gestão acadêmica da turma.",
    `<button class="btn primary" data-act="material">+ Material</button>`
  ) + `
  <div class="grid stats">
    ${stat("Alunos", st.length, "Cadastrados")}
    ${stat("Materiais", DB.materials.length, "Biblioteca")}
    ${stat("Questões", DB.questions.length, "Banco")}
    ${stat("Avaliações", DB.exams.length, "Agenda")}
  </div>

  <div class="grid two">
    <div class="card">
      <div class="section"><h2>Ações rápidas</h2></div>
      <div class="actions">
        <button class="btn secondary" data-act="material">Material</button>
        <button class="btn secondary" data-act="question">Questão</button>
        <button class="btn secondary" data-act="exam">Avaliação</button>
        <button class="btn secondary" data-act="notice">Aviso</button>
      </div>
    </div>

    <div class="card">
      <h2>Próximos eventos</h2>
      ${DB.exams.length
        ? DB.exams.map(e => `
          <div class="row">
            ${esc(e.title)}
            <span class="badge">${esc(e.date)}</span>
          </div>`).join("")
        : `<p class="muted">Sem eventos.</p>`}
    </div>
  </div>`;
}

function dashboardAdmin(){
  return head(
    "Painel Administrativo",
    "Controle da plataforma acadêmica."
  ) + `
  <div class="grid stats">
    ${stat("Usuários", DB.users.length, "Contas locais")}
    ${stat("Disciplinas", DISC.length, "8 semestres")}
    ${stat("Materiais", DB.materials.length, "Arquivos")}
    ${stat("Notas", DB.grades.length, "Lançamentos")}
  </div>

  <div class="grid two">
    <div class="card">
      <h2>Gestão do sistema</h2>
      <p class="muted">Cadastre usuários, acompanhe a estrutura curricular e mantenha a biblioteca.</p>
      <div class="actions">
        <button class="btn primary" data-p="usuarios">Usuários</button>
        <button class="btn secondary" data-p="estrutura">Curso</button>
      </div>
    </div>

    <div class="card">
      <h2>Backup</h2>
      <p class="muted">Faça cópia dos dados locais para outro navegador.</p>
      <button class="btn primary" data-act="export">Exportar JSON</button>
    </div>
  </div>`;
}

/* =========================================================
   PÁGINAS
   ========================================================= */

function curso(){
  const u = me();
  sem = u.semester || sem;

  const ss = [...new Set(DISC.map(x => x[0]))];
  const ds = DISC.filter(x => x[0] === sem);

  return head("Meu Curso", "Estrutura curricular completa.") + `
  <div class="tabs">
    ${ss.map(s => `
      <button class="tab ${s === sem ? "active" : ""}" data-sem="${s}">
        ${s} semestre
      </button>`).join("")}
  </div>

  <div class="grid three">
    ${ds.map(x => `
      <div class="card discipline">
        <span class="code">${x[1]}</span>
        <h3>${x[2]}</h3>
        <p class="muted">Conteúdos, materiais e avaliações.</p>
        <button class="btn secondary" data-p="biblioteca">Ver biblioteca</button>
      </div>`).join("")}
  </div>`;
}

function biblioteca(){
  return head(
    "Biblioteca",
    "Materiais para estudo e consulta.",
    `<button class="btn primary" data-act="material">+ Material</button>`
  ) + `
  <div class="search">
    <input id="searchMat" placeholder="Pesquisar material...">
  </div>

  <div id="matGrid" class="grid three">
    ${matCards(DB.materials)}
  </div>`;
}

function avaliacoes(){
  return head("Avaliações", "Provas e questionários.") + `
  <div class="grid two">
    <div class="card">
      <h2>Agenda</h2>
      ${DB.exams.length
        ? DB.exams.map(e => `
          <div class="row">
            <div><b>${esc(e.title)}</b><small>${d(e.disc)[2]}</small></div>
            <span class="badge">${esc(e.date)}</span>
          </div>`).join("")
        : `<p class="muted">Sem avaliações.</p>`}
    </div>

    <div class="card">
      <h2>Questionário</h2>
      <p class="muted">Faça uma avaliação rápida usando o banco de questões.</p>
      <button class="btn primary" data-act="quiz">Iniciar</button>
    </div>
  </div>`;
}

function notas(){
  const g = DB.grades.filter(x => x.student === me().id);
  const av = g.length
    ? (g.reduce((s,x) => s + x.grade, 0) / g.length).toFixed(1)
    : "0,0";

  return head("Minhas Notas", "Desempenho acadêmico registrado.") + `
  <div class="card">
    <div class="score">${av}</div>
    <p class="muted">Média</p>
    <table class="table">
      <tr><th>Disciplina</th><th>Nota</th></tr>
      ${g.length
        ? g.map(x => `
          <tr>
            <td>${d(x.disc)[2]}</td>
            <td>${x.grade.toFixed(1)}</td>
          </tr>`).join("")
        : `<tr><td colspan="2">Sem notas lançadas.</td></tr>`}
    </table>
  </div>`;
}

function frequencia(){
  const a = DB.attendance.filter(x => x.student === me().id);

  return head("Minha Frequência", "Acompanhamento de presença.") + `
  <div class="grid three">
    ${a.length
      ? a.map(x => `
        <div class="card">
          <b>${d(x.disc)[2]}</b>
          <h2>${x.pct}%</h2>
          <div class="kpi"><span style="width:${x.pct}%"></span></div>
        </div>`).join("")
      : `<p class="muted">Sem registros de frequência.</p>`}
  </div>`;
}

function agenda(){
  const z = new Date();
  const y = z.getFullYear();
  const m = z.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  let s = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
    .map(x => `<div class="calh">${x}</div>`).join("");

  for (let i = 0; i < first; i++) s += "<div></div>";

  for (let day = 1; day <= days; day++){
    const iso = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const ev = DB.events.find(e => e.date === iso);

    s += `
      <div class="cal ${ev ? "event" : ""}">
        <b>${day}</b>
        ${ev ? `<div>${esc(ev.title)}</div>` : ""}
      </div>`;
  }

  return head("Calendário", "Eventos acadêmicos.") + `
  <div class="card" style="overflow:auto">
    <div class="calendar">${s}</div>
  </div>`;
}

function perfil(){
  const u = me();

  return head("Meu Perfil", "Atualize seus dados básicos.") + `
  <div class="card">
    <form id="profile">
      <label>Nome <input id="pn" value="${esc(u.name)}"></label>
      <label>E-mail <input value="${esc(u.email)}" disabled></label>
      <label>Semestre
        <select id="ps">
          ${[...new Set(DISC.map(x => x[0]))].map(x => `
            <option ${x === u.semester ? "selected" : ""}>${x}</option>
          `).join("")}
        </select>
      </label>
      <button class="btn primary">Salvar</button>
    </form>
  </div>`;
}

function turmas(){
  return head("Turmas", "Alunos cadastrados e indicadores.") + `
  <div class="card table-wrap">
    <table class="table">
      <tr><th>Aluno</th><th>Semestre</th><th>Média</th><th>Frequência</th></tr>
      ${DB.users.filter(u => u.role === "aluno").map(u => {
        const g = DB.grades.filter(x => x.student === u.id);
        const a = DB.attendance.filter(x => x.student === u.id);
        const av = g.length ? (g.reduce((s,x) => s + x.grade, 0)/g.length).toFixed(1) : "-";
        const at = a.length ? Math.round(a.reduce((s,x) => s + x.pct, 0)/a.length) + "%" : "-";
        return `<tr>
          <td>${esc(u.name)}</td>
          <td>${esc(u.semester)}</td>
          <td>${av}</td>
          <td>${at}</td>
        </tr>`;
      }).join("")}
    </table>
  </div>`;
}

function materiais(){ return biblioteca(); }

function questoes(){
  return head(
    "Banco de Questões",
    "Gerencie questões.",
    `<button class="btn primary" data-act="question">+ Questão</button>`
  ) + `
  <div class="card">
    ${DB.questions.length
      ? DB.questions.map(q => `
        <div class="row">
          <span><b>${esc(q.text)}</b><small>${d(q.disc)[2]}</small></span>
          <button class="btn danger" data-delq="${q.id}">Excluir</button>
        </div>`).join("")
      : `<p class="muted">Nenhuma questão cadastrada.</p>`}
  </div>`;
}

function provas(){
  return head(
    "Avaliações",
    "Gerencie provas.",
    `<button class="btn primary" data-act="exam">+ Avaliação</button>`
  ) + `
  <div class="card">
    ${DB.exams.length
      ? DB.exams.map(e => `
        <div class="row">
          <span><b>${esc(e.title)}</b><small>${d(e.disc)[2]}</small></span>
          <span class="badge">${esc(e.date)}</span>
        </div>`).join("")
      : `<p class="muted">Nenhuma avaliação cadastrada.</p>`}
  </div>`;
}

function lancamentos(){
  return head("Notas", "Lançamento de notas dos alunos.") + `
  <div class="card table-wrap">
    <table class="table">
      <tr><th>Aluno</th><th>Disciplina</th><th>Nota</th></tr>
      ${DB.grades.length
        ? DB.grades.map((g, i) => `
          <tr>
            <td>${esc(DB.users.find(u => u.id === g.student)?.name || "")}</td>
            <td>${d(g.disc)[2]}</td>
            <td><input data-grade="${i}" value="${g.grade}"></td>
          </tr>`).join("")
        : `<tr><td colspan="3">Sem lançamentos.</td></tr>`}
    </table>
  </div>`;
}

function avisos(){
  return head(
    "Avisos",
    "Comunicação acadêmica.",
    `<button class="btn primary" data-act="notice">+ Aviso</button>`
  ) + `
  <div class="card">
    ${DB.notices.length
      ? DB.notices.map(n => `
        <div class="notice">
          <b>${esc(n.title)}</b>
          <small>${esc(n.date)}</small>
          <div>${esc(n.text)}</div>
        </div>`).join("")
      : `<p class="muted">Nenhum aviso.</p>`}
  </div>`;
}

function usuarios(){
  return head(
    "Usuários",
    "Cadastro e gerenciamento de contas.",
    `<button class="btn primary" data-act="user">+ Usuário</button>`
  ) + `
  <div class="card table-wrap">
    <table class="table">
      <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th></tr>
      ${DB.users.map(u => `
        <tr>
          <td>${esc(u.name)}</td>
          <td>${esc(u.email)}</td>
          <td><span class="badge">${role(u.role)}</span></td>
          <td>${u.active ? "Ativo" : "Inativo"}</td>
          <td>
            ${u.id === DB.session ? "" :
              `<button class="btn danger" data-deluser="${u.id}">Excluir</button>`}
          </td>
        </tr>`).join("")}
    </table>
  </div>`;
}

function estrutura(){
  return head(
    "Curso e Disciplinas",
    "Estrutura curricular em 8 semestres."
  ) + `
  <div class="grid three">
    ${[...new Set(DISC.map(x => x[0]))].map(s => `
      <div class="card">
        <h2>${s} semestre</h2>
        ${DISC.filter(x => x[0] === s).map(x => `
          <div class="row">
            <span>${x[1]} — ${x[2]}</span>
            <span class="badge">Ativa</span>
          </div>`).join("")}
      </div>`).join("")}
  </div>`;
}

function relatorios(){
  const av = DB.grades.length
    ? (DB.grades.reduce((s,x) => s + x.grade, 0)/DB.grades.length).toFixed(1)
    : "0,0";
  const at = DB.attendance.length
    ? Math.round(DB.attendance.reduce((s,x) => s + x.pct, 0)/DB.attendance.length)
    : 0;

  return head("Relatórios", "Indicadores do ambiente local.") + `
  <div class="grid three">
    ${stat("Média geral", av, "Notas")}
    ${stat("Frequência", at + "%", "Registros")}
    ${stat("Usuários", DB.users.length, "Contas")}
  </div>

  <div class="card">
    <h2>Backup</h2>
    <button class="btn primary" data-act="export">Exportar JSON</button>
    <button class="btn secondary" data-act="import">Importar JSON</button>
  </div>`;
}

function config(){
  return head("Configurações", "Preferências e manutenção.") + `
  <div class="grid two">
    <div class="card">
      <h2>Tema</h2>
      <button class="btn primary" data-act="theme">Alternar tema</button>
    </div>
    <div class="card">
      <h2>Dados locais</h2>
      <button class="btn danger" data-act="