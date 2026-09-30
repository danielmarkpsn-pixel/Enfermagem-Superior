let DB=read(), mode="login", page="dashboard", sem="1º";

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function read(){
  try{
    const saved=JSON.parse(localStorage.getItem("enf_v6"));

    if(
      !saved ||
      !Array.isArray(saved.users) ||
      !Array.isArray(saved.materials) ||
      !Array.isArray(saved.grades) ||
      !Array.isArray(saved.attendance) ||
      !Array.isArray(saved.questions) ||
      !Array.isArray(saved.exams)
    ){
      return fresh();
    }

    return saved;

  }catch(e){
    return fresh();
  }
}

function save(){
  localStorage.setItem("enf_v6",JSON.stringify(DB));
}

function me(){
  return DB.users.find(u=>u.id===DB.session);
}

function d(c){
  return DISC.find(x=>x[1]===c)||["","",c];
}

function role(r){
  return r==="aluno"?"Aluno":
         r==="professor"?"Professor":
         "Administrador";
}

function ini(n){
  return n.split(" ")
    .map(x=>x[0])
    .slice(0,2)
    .join("")
    .toUpperCase();
}

function esc(x){
  return String(x??"").replace(
    /[&<>"']/g,
    m=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m])
  );
}

function toast(t){
  let e=document.createElement("div");
  e.className="toast";
  e.textContent=t;
  document.body.append(e);
  setTimeout(()=>e.remove(),2400);
}

function head(t,s,b=""){
  return `
  <div class="head">
    <div>
      <h1>${t}</h1>
      <p>${s}</p>
    </div>
    ${b}
  </div>`;
}

function stat(a,b,c){
  return `
  <div class="card stat">
    <div class="label">${a}</div>
    <div class="value">${b}</div>
    <div class="hint">${c}</div>
  </div>`;
}

function nav(){

  let u=me();

  if(!u){
    return [];
  }

  let n=[
    ["dashboard","⌂","Dashboard"]
  ];

  if(u.role==="aluno")
    n.push(
      ["curso","🎓","Meu Curso"],
      ["biblioteca","📚","Biblioteca"],
      ["avaliacoes","📝","Avaliações"],
      ["notas","📊","Notas"],
      ["frequencia","📅","Frequência"],
      ["agenda","🗓️","Calendário"],
      ["perfil","👤","Meu Perfil"]
    );

  if(u.role==="professor")
    n.push(
      ["turmas","👥","Turmas"],
      ["materiais","📄","Materiais"],
      ["questoes","❓","Questões"],
      ["provas","📝","Avaliações"],
      ["lancamentos","📊","Notas"],
      ["avisos","📣","Avisos"],
      ["agenda","🗓️","Calendário"]
    );

  if(u.role==="admin")
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

function render(){

  /*
   * Verifica se existe uma sessão antiga/inválida.
   * Se existir, encerra a sessão.
   */
  if(
    DB.session &&
    !DB.users.some(u=>u.id===DB.session)
  ){
    DB.session=null;
    save();
  }

  /*
   * Usuário não logado
   */
  if(!DB.session){

    $("#login").classList.remove("hidden");
    $("#app").classList.add("hidden");

    renderAuth();

    return;
  }

  /*
   * Usuário logado
   */

  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");

  let u=me();

  if(!u){

    DB.session=null;
    save();
    render();

    return;
  }

  $("#headUser").textContent=u.name;
  $("#avatar").textContent=ini(u.name);
  $("#sideName").textContent=u.name;
  $("#sideRole").textContent=role(u.role);

  $("#nav").innerHTML=
    nav()
    .map(x=>`
      <button
        class="${page===x[0]?"active":""}"
        data-p="${x[0]}"
      >
        ${x[1]} ${x[2]}
      </button>
    `)
    .join("");

  $$("[data-p]").forEach(x=>{
    x.onclick=()=>{
      page=x.dataset.p;
      $("#side").classList.remove("open");
      render();
    };
  });

  $("#main").innerHTML=
    (P[page]||P.dashboard)();

  bind();

  document.body.classList.toggle(
    "dark",
    DB.theme==="dark"
  );
}

function renderAuth(){

  const f=$("#authForm");

  if(!f){
    return;
  }

  f.innerHTML=
    mode==="login"
    ?
    `
    <label>
      E-mail
      <input
        id="email"
        type="email"
        required
      >
    </label>

    <label>
      Senha
      <input
        id="pass"
        type="password"
        required
      >
    </label>

    <button class="btn primary full">
      Entrar
    </button>
    `
    :
    `
    <label>
      Nome completo
      <input id="rname" required>
    </label>

    <label>
      E-mail
      <input
        id="remail"
        type="email"
        required
      >
    </label>

    <label>
      Senha
      <input
        id="rpass"
        type="password"
        minlength="4"
        required
      >
    </label>

    <label>
      Perfil
      <select id="rrole">
        <option value="aluno">Aluno</option>
        <option value="professor">Professor</option>
      </select>
    </label>

    <label>
      Semestre
      <select id="rsem">
        ${
          [...new Set(DISC.map(x=>x[0]))]
          .map(x=>`<option>${x}</option>`)
          .join("")
        }
      </select>
    </label>

    <button class="btn primary full">
      Criar conta local
    </button>
    `;

  f.onsubmit=e=>{

    e.preventDefault();

    /*
     * LOGIN
     */
    if(mode==="login"){

      const email=$("#email").value.trim();
      const pass=$("#pass").value;

      const u=DB.users.find(
        x=>
          x.email.toLowerCase()===email.toLowerCase() &&
          x.pass===pass &&
          x.active!==false
      );

      if(!u){

        toast("E-mail ou senha incorretos.");

        return;
      }

      DB.session=u.id;

      save();

      page="dashboard";

      render();

      toast("Login realizado com sucesso.");

      return;
    }

    /*
     * CADASTRO
     */

    const email=$("#remail").value
      .trim()
      .toLowerCase();

    if(
      DB.users.some(
        x=>x.email.toLowerCase()===email
      )
    ){

      toast("Este e-mail já está cadastrado.");

      return;
    }

    let u={
      id:"u"+Date.now(),
      name:$("#rname").value.trim(),
      email:email,
      pass:$("#rpass").value,
      role:$("#rrole").value,
      semester:$("#rsem").value,
      active:true
    };

    DB.users.push(u);

    DB.session=u.id;

    save();

    page="dashboard";

    render();

    toast("Conta criada localmente.");
  };
}

function bind(){

  /*
   * CORREÇÃO:
   * Botões data-p criados dentro das páginas
   * também funcionam.
   */
  $$("[data-p]").forEach(x=>{
    x.onclick=()=>{
      page=x.dataset.p;
      $("#side").classList.remove("open");
      render();
    };
  });

  if($("#searchMat")){

    $("#searchMat").oninput=()=>{

      $("#matGrid").innerHTML=
        matCards(
          DB.materials.filter(
            m=>
              (m.title+" "+d(m.disc)[2])
              .toLowerCase()
              .includes(
                $("#searchMat")
                .value
                .toLowerCase()
              )
          )
        );
    };
  }

  $$("[data-sem]").forEach(x=>{
    x.onclick=()=>{
      sem=x.dataset.sem;
      render();
    };
  });

  $$("[data-fav]").forEach(x=>{
    x.onclick=()=>{

      DB.fav=
        DB.fav.includes(x.dataset.fav)
        ?
        DB.fav.filter(a=>a!==x.dataset.fav)
        :
        [...DB.fav,x.dataset.fav];

      save();

      render();
    };
  });

  $$("[data-act]").forEach(x=>{
    x.onclick=()=>{
      action(x.dataset.act);
    };
  });

  $$("[data-deluser]").forEach(x=>{
    x.onclick=()=>{

      DB.users=
        DB.users.filter(
          u=>u.id!==x.dataset.deluser
        );

      save();

      render();

      toast("Usuário removido.");
    };
  });

  $$("[data-delq]").forEach(x=>{
    x.onclick=()=>{

      DB.questions=
        DB.questions.filter(
          q=>q.id!==x.dataset.delq
        );

      save();

      render();

      toast("Questão removida.");
    };
  });

  $$("[data-grade]").forEach(x=>{
    x.onchange=()=>{

      DB.grades[
        x.dataset.grade
      ].grade=
        Number(x.value)||0;

      save();

      toast("Nota salva.");
    };
  });

  const pf=$("#profile");

  if(pf){

    pf.onsubmit=e=>{

      e.preventDefault();

      let u=me();

      u.name=$("#pn").value;
      u.semester=$("#ps").value;

      save();

      render();

      toast("Perfil atualizado.");
    };
  }
}

function matCards(a){

  return a.length

    ?

    a.map(m=>`
      <div class="card">

        <div class="row">

          <span class="badge">
            ${m.type}
          </span>

          <button
            data-fav="${m.id}"
            class="btn secondary"
          >
            ${
              DB.fav.includes(m.id)
              ?"★"
              :"☆"
            }
          </button>

        </div>

        <h3>
          ${esc(m.title)}
        </h3>

        <p class="muted">
          ${d(m.disc)[2]} • ${m.sem} semestre
        </p>

        <div class="actions">

          <a
            class="btn secondary"
            href="${esc(m.file)}"
            target="_blank"
          >
            Abrir
          </a>

        </div>

      </div>
    `).join("")

    :

    `
    <div class="card empty">
      Nenhum material encontrado.
    </div>
    `;
}

function dashboardAluno(){

  let u=me();

  let g=DB.grades.filter(
    x=>x.student===u.id
  );

  let a=DB.attendance.filter(
    x=>x.student===u.id
  );

  let av=
    g.length
    ?
    (
      g.reduce(
        (s,x)=>s+x.grade,
        0
      )/g.length
    ).toFixed(1)
    :
    "0,0";

  let at=
    a.length
    ?
    Math.round(
      a.reduce(
        (s,x)=>s+x.pct,
        0
      )/a.length
    )
    :
    0;

  return head(
    "Olá, "+u.name.split(" ")[0]+"! 👋",
    "Seu resumo acadêmico.",
    `
    <button
      class="btn primary"
      data-p="curso"
    >
      Estudar
    </button>
    `
  )

  +

  `
  <div class="grid stats">

    ${stat(
      "Média",
      av,
      "Notas registradas"
    )}

    ${stat(
      "Frequência",
      at+"%",
      "Média"
    )}

    ${stat(
      "Materiais",
      DB.materials.length,
      "Biblioteca"
    )}

    ${stat(
      "Avaliações",
      DB.exams.length,
      "Agendadas"
    )}

  </div>

  <div class="grid two">

    <div class="card">

      <div class="section">
        <h2>Próximas avaliações</h2>
      </div>

      ${
        DB.exams.map(e=>`
          <div class="row">

            <span>
              <b>${e.title}</b>
              <small>${d(e.disc)[2]}</small>
            </span>

            <span class="badge">
              ${e.date}
            </span>

          </div>
        `).join("")
      }

    </div>

    <div class="card">

      <div class="section">
        <h2>Avisos</h2>
      </div>

      ${
        DB.notices.map(n=>`
          <div class="notice">
            <b>${n.title}</b>
            <div>${n.text}</div>
          </div>
        `).join("")
      }

    </div>

  </div>
  `;
}

function dashboardProf(){

  let st=DB.users.filter(
    u=>u.role==="aluno"
  );

  return head(
    "Painel do Professor",
    "Gestão acadêmica da turma.",
    `
    <button
      class="btn primary"
      data-act="material"
    >
      + Material
    </button>
    `
  )

  +

  `
  <div class="grid stats">

    ${stat(
      "Alunos",
      st.length,
      "Cadastrados"
    )}

    ${stat(
      "Materiais",
      DB.materials.length,
      "Biblioteca"
    )}

    ${stat(
      "Questões",
      DB.questions.length,
      "Banco"
    )}

    ${stat(
      "Avaliações",
      DB.exams.length,
      "Agenda"
    )}

  </div>

  <div class="grid two">

    <div class="card">

      <div class="section">
        <h2>Ações rápidas</h2>
      </div>

      <div class="actions">

        <button
          class="btn secondary"
          data-act="material"
        >
          Material
        </button>

        <button
          class="btn secondary"
          data-act="question"
        >
          Questão
        </button>

        <button
          class="btn secondary"
          data-act="exam"
        >
          Avaliação
        </button>

        <button
          class="btn secondary"
          data-act="notice"
        >
          Aviso
        </button>

      </div>

    </div>

    <div class="card">

      <h2>Próximos eventos</h2>

      ${
        DB.exams.map(e=>`
          <div class="row">
            ${e.title}
            <span class="badge">
              ${e.date}
            </span>
          </div>
        `).join("")
      }

    </div>

  </div>
  `;
}

function dashboardAdmin(){

  return head(
    "Painel Administrativo",
    "Controle da plataforma acadêmica."
  )

  +

  `
  <div class="grid stats">

    ${stat(
      "Usuários",
      DB.users.length,
      "Contas locais"
    )}

    ${stat(
      "Disciplinas",
      DISC.length,
      "8 semestres"
    )}

    ${stat(
      "Materiais",
      DB.materials.length,
      "Arquivos"
    )}

    ${stat(
      "Notas",
      DB.grades.length,
      "Lançamentos"
    )}

  </div>

  <div class="grid two">

    <div class="card">

      <h2>Gestão do sistema</h2>

      <p class="muted">
        Cadastre usuários, acompanhe a estrutura
        curricular e mantenha a biblioteca.
      </p>

      <div class="actions">

        <button
          class="btn primary"
          data-p="usuarios"
        >
          Usuários
        </button>

        <button
          class="btn secondary"
          data-p="estrutura"
        >
          Curso
        </button>

      </div>

    </div>

    <div class="card">

      <h2>Backup</h2>

      <p class="muted">
        Faça cópia dos dados locais para outro navegador.
      </p>

      <button
        class="btn primary"
        data-act="export"
      >
        Exportar JSON
      </button>

    </div>

  </div>
  `;
}

function curso(){

  let u=me();

  sem=u.semester||sem;

  let ss=[
    ...new Set(
      DISC.map(x=>x[0])
    )
  ];

  let ds=DISC.filter(
    x=>x[0]===sem
  );

  return head(
    "Meu Curso",
    "Estrutura curricular completa."
  )

  +

  `
  <div class="tabs">

    ${
      ss.map(s=>`
        <button
          class="tab ${s===sem?"active":""}"
          data-sem="${s}"
        >
          ${s} semestre
        </button>
      `).join("")
    }

  </div>

  <div class="grid three">

    ${
      ds.map(x=>`
        <div class="card discipline">

          <span class="code">
            ${x[1]}
          </span>

          <h3>
            ${x[2]}
          </h3>

          <p class="muted">
            Conteúdos, materiais e avaliações.
          </p>

          <button
            class="btn secondary"
            data-p="biblioteca"
          >
            Ver biblioteca
          </button>

        </div>
      `).join("")
    }

  </div>
  `;
}

function biblioteca(){

  return head(
    "Biblioteca",
    "Materiais para estudo e consulta.",
    `
    <button
      class="btn primary"
      data-act="material"
    >
      + Material
    </button>
    `
  )

  +

  `
  <div class="search">
    <input
      id="searchMat"
      placeholder="Pesquisar material..."
    >
  </div>

  <div
    id="matGrid"
    class="grid three"
  >
    ${matCards(DB.materials)}
  </div>
  `;
}

function avaliacoes(){

  return head(
    "Avaliações",
    "Provas e questionários."
  )

  +

  `
  <div class="grid two">

    <div class="card">

      <h2>Agenda</h2>

      ${
        DB.exams.map(e=>`
          <div class="row">

            <div>
              <b>${e.title}</b>
              <small>${d(e.disc)[2]}</small>
            </div>

            <span class="badge">
              ${e.date}
            </span>

          </div>
        `).join("")
      }

    </div>

    <div class="card">

      <h2>Questionário</h2>

      <p class="muted">
        Faça uma avaliação rápida usando o banco de questões.
      </p>

      <button
        class="btn primary"
        data-act="quiz"
      >
        Iniciar
      </button>

    </div>

  </div>
  `;
}

function notas(){

  let g=DB.grades.filter(
    x=>x.student===me().id
  );

  let av=
    g.length
    ?
    (
      g.reduce(
        (s,x)=>s+x.grade,
        0
      )/g.length
    ).toFixed(1)
    :
    "0,0";

  return head(
    "Minhas Notas",
    "Desempenho acadêmico registrado."
  )

  +

  `
  <div class="card">

    <div class="score">
      ${av}
    </div>

    <p class="muted">
      Média
    </p>

    <table class="table">

      <tr>
        <th>Disciplina</th>
        <th>Nota</th>
      </tr>

      ${
        g.map(x=>`
          <tr>
            <td>${d(x.disc)[2]}</td>
            <td>${x.grade.toFixed(1)}</td>
          </tr>
        `).join("")
      }

    </table>

  </div>
  `;
}

function frequencia(){

  let a=DB.attendance.filter(
    x=>x.student===me().id
  );

  return head(
    "Minha Frequência",
    "Acompanhamento de presença."
  )

  +

  `
  <div class="grid three">

    ${
      a.map(x=>`
        <div class="card">

          <b>
            ${d(x.disc)[2]}
          </b>

          <h2>
            ${x.pct}%
          </h2>

          <div class="kpi">
            <span
              style="width:${x.pct}%"
            ></span>
          </div>

        </div>
      `).join("")
    }

  </div>
  `;
}

function agenda(){

  let z=new Date();

  let y=z.getFullYear();
  let m=z.getMonth();

  let first=
    new Date(y,m,1).getDay();

  let days=
    new Date(y,m+1,0).getDate();

  let s=
    ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
    .map(x=>`<div class="calh">${x}</div>`)
    .join("");

  for(
    let i=0;
    i<first;
    i++
  ){
    s+="<div></div>";
  }

  for(
    let day=1;
    day<=days;
    day++
  ){

    let iso=
      `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    let ev=
      DB.events.find(
        e=>e.date===iso
      );

    s+=`
      <div class="cal ${ev?"event":""}">
        <b>${day}</b>
        ${
          ev
          ?
          `<div>${ev.title}</div>`
          :
          ""
        }
      </div>
    `;
  }

  return head(
    "Calendário",
    "Eventos acadêmicos."
  )

  +

  `
  <div
    class="card"
    style="overflow:auto"
  >
    <div class="calendar">
      ${s}
    </div>
  </div>
  `;
}

function perfil(){

  let u=me();

  return head(
    "Meu Perfil",
    "Atualize seus dados básicos."
  )

  +

  `
  <div class="card">

    <form id="profile">

      <label>
        Nome
        <input
          id="pn"
          value="${esc(u.name)}"
        >
      </label>

      <label>
        E-mail
        <input
          value="${esc(u.email)}"
          disabled
        >
      </label>

      <label>
        Semestre

        <select id="ps">

          ${
            [...new Set(DISC.map(x=>x[0]))]
            .map(x=>`
              <option
                ${x===u.semester?"selected":""}
              >
                ${x}
              </option>
            `).join("")
          }

        </select>

      </label>

      <button class="btn primary">
        Salvar
      </button>

    </form>

  </div>
  `;
}

function turmas(){

  return head(
    "Turmas",
    "Alunos cadastrados e indicadores."
  )

  +

  `
  <div class="card table-wrap">

    <table class="table">

      <tr>
        <th>Aluno</th>
        <th>Semestre</th>
        <th>Média</th>
        <th>Frequência</th>
      </tr>

      ${
        DB.users
        .filter(u=>u.role==="aluno")
        .map(u=>{

          let g=
            DB.grades.filter(
              x=>x.student===u.id
            );

          let a=
            DB.attendance.filter(
              x=>x.student===u.id
            );

          let av=
            g.length
            ?
            (
              g.reduce(
                (s,x)=>s+x.grade,
                0
              )/g.length
            ).toFixed(1)
            :
            "-";

          let at=
            a.length
            ?
            Math.round(
              a.reduce(
                (s,x)=>s+x.pct,
                0
              )/a.length
            )+"%"
            :
            "-";

          return `
            <tr>
              <td>${u.name}</td>
              <td>${u.semester}</td>
              <td>${av}</td>
              <td>${at}</td>
            </tr>
          `;
        })
        .join("")
      }

    </table>

  </div>
  `;
}

function materiais(){
  return biblioteca();
}

function questoes(){

  return head(
    "Banco de Questões",
    "Gerencie questões.",
    `
    <button
      class="btn primary"
      data-act="question"
    >
      + Questão
    </button>
    `
  )

  +

  `
  <div class="card">

    ${
      DB.questions.map(q=>`
        <div class="row">

          <span>
            <b>${q.text}</b>
            <small>
              ${d(q.disc)[2]}
            </small>
          </span>

          <button
            class="btn danger"
            data-delq="${q.id}"
          >
            Excluir
          </button>

        </div>
      `).join("")
    }

  </div>
  `;
}

function provas(){

  return head(
    "Avaliações",
    "Gerencie provas.",
    `
    <button
      class="btn primary"
      data-act="exam"
    >
      + Avaliação
    </button>
    `
  )

  +

  `
  <div class="card">

    ${
      DB.exams.map(e=>`
        <div class="row">

          <span>
            <b>${e.title}</b>
            <small>
              ${d(e.disc)[2]}
            </small>
          </span>

          <span class="badge">
            ${e.date}
          </span>

        </div>
      `).join("")
    }

  </div>
  `;
}

function lancamentos(){

  return head(
    "Notas",
    "Lançamento de notas dos alunos."
  )

  +

  `
  <div class="card table-wrap">

    <table class="table">

      <tr>
        <th>Aluno</th>
        <th>Disciplina</th>
        <th>Nota</th>
      </tr>

      ${
        DB.grades.map((g,i)=>`

          <tr>

            <td>
              ${
                DB.users.find(
                  u=>u.id===g.student
                )?.name||""
              }
            </td>

            <td>
              ${d(g.disc)[2]}
            </td>

            <td>
              <input
                data-grade="${i}"
                value="${g.grade}"
              >
            </td>

          </tr>

        `).join("")
      }

    </table>

  </div>
  `;
}

function avisos(){

  return head(
    "Avisos",
    "Comunicação acadêmica.",
    `
    <button
      class="btn primary"
      data-act="notice"
    >
      + Aviso
    </button>
    `
  )

  +

  `
  <div class="card">

    ${
      DB.notices.map(n=>`
        <div class="notice">

          <b>${n.title}</b>

          <small>
            ${n.date}
          </small>

          <div>
            ${n.text}
          </div>

        </div>
      `).join("")
    }

  </div>
  `;
}

function usuarios(){

  return head(
    "Usuários",
    "Cadastro e gerenciamento de contas.",
    `
    <button
      class="btn primary"
      data-act="user"
    >
      + Usuário
    </button>
    `
  )

  +

  `
  <div class="card table-wrap">

    <table class="table">

      <tr>
        <th>Nome</th>
        <th>E-mail</th>
        <th>Perfil</th>
        <th>Status</th>
        <th></th>
      </tr>

      ${
        DB.users.map(u=>`

          <tr>

            <td>${u.name}</td>

            <td>${u.email}</td>

            <td>
              <span class="badge">
                ${role(u.role)}
              </span>
            </td>

            <td>
              ${u.active?"Ativo":"Inativo"}
            </td>

            <td>

              ${
                u.id===DB.session
                ?
                ""
                :
                `
                <button
                  class="btn danger"
                  data-deluser="${u.id}"
                >
                  Excluir
                </button>
                `
              }

            </td>

          </tr>

        `).join("")
      }

    </table>

  </div>
  `;
}

function estrutura(){

  return head(
    "Curso e Disciplinas",
    "Estrutura curricular em 8 semestres."
  )

  +

  `
  <div class="grid three">

    ${
      [
        ...new Set(
          DISC.map(x=>x[0])
        )
      ]
      .map(s=>`

        <div class="card">

          <h2>
            ${s} semestre
          </h2>

          ${
            DISC
            .filter(x=>x[0]===s)
            .map(x=>`
              <div class="row">

                <span>
                  ${x[1]} — ${x[2]}
                </span>

                <span class="badge">
                  Ativa
                </span>

              </div>
            `).join("")
          }

        </div>

      `).join("")
    }

  </div>
  `;
}

function relatorios(){

  let av=
    DB.grades.length
    ?
    (
      DB.grades.reduce(
        (s,x)=>s+x.grade,
        0
      )/DB.grades.length
    ).toFixed(1)
    :
    "0,0";

  let at=
    DB.attendance.length
    ?
    Math.round(
      DB.attendance.reduce(
        (s,x)=>s+x.pct,
        0
      )/DB.attendance.length
    )
    :
    0;

  return head(
    "Relatórios",
    "Indicadores do ambiente local."
  )

  +

  `
  <div class="grid three">

    ${stat(
      "Média geral",
      av,
      "Notas"
    )}

    ${stat(
      "Frequência",
      at+"%",
      "Registros"
    )}

    ${stat(
      "Usuários",
      DB.users.length,
      "Contas"
    )}

  </div>

  <div class="card">

    <h2>Backup</h2>

    <button
      class="btn primary"
      data-act="export"
    >
      Exportar JSON
    </button>

    <button
      class="btn secondary"
      data-act="import"
    >
      Importar JSON
    </button>

  </div>
  `;
}

function config(){

  return head(
    "Configurações",
    "Preferências e manutenção."
  )

  +

  `
  <div class="grid two">

    <div class="card">

      <h2>Tema</h2>

      <button
        class="btn primary"
        data-act="theme"
      >
        Alternar tema
      </button>

    </div>

    <div class="card">

      <h2>Dados locais</h2>

      <button
        class="btn danger"
        data-act="reset"
      >
        Restaurar demonstração
      </button>

    </div>

  </div>
  `;
}

const P={
  dashboard:()=>{

    let u=me();

    if(!u){
      return "";
    }

    return
      u.role==="aluno"
      ?
      dashboardAluno()
      :
      u.role==="professor"
      ?
      dashboardProf()
      :
      dashboardAdmin();
  },

  curso,
  biblioteca,
  avaliacoes,
  notas,
  frequencia,
  agenda,
  perfil,
  turmas,
  materiais,
  questoes,
  provas,
  lancamentos,
  avisos,
  usuarios,
  estrutura,
  relatorios,
  config
};

function modal(t,b){

  $("#mtitle").textContent=t;
  $("#mbody").innerHTML=b;
  $("#modal").classList.remove("hidden");
}

function close(){

  $("#modal").classList.add("hidden");
}

function action(a){

  if(a==="theme"){

    DB.theme=
      DB.theme==="dark"
      ?
      "light"
      :
      "dark";

    save();
    render();

    return;
  }

  if(a==="reset"){

    if(
      confirm(
        "Restaurar os dados demonstrativos?"
      )
    ){

      let s=DB.session;

      DB=fresh();

      DB.session=s;

      save();

      render();
    }

    return;
  }

  if(a==="export"){

    let a=document.createElement("a");

    let u=
      URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              DB,
              null,
              2
            )
          ],
          {
            type:"application/json"
          }
        )
      );

    a.href=u;
    a.download="enfermagem-v6-backup.json";
    a.click();

    URL.revokeObjectURL(u);

    return;
  }

  if(a==="import"){

    let i=document.createElement("input");

    i.type="file";
    i.accept=".json";

    i.onchange=()=>{

      let r=new FileReader();

      r.onload=()=>{

        try{

          DB=
            JSON.parse(
              r.result
            );

          save();
          render();

          toast(
            "Backup importado."
          );

        }catch{

          toast(
            "JSON inválido."
          );
        }
      };

      r.readAsText(
        i.files[0]
      );
    };

    i.click();

    return;
  }

  if(a==="user"){

    modal(
      "Novo usuário",
      `
      <form id="uf">

        <label>
          Nome
          <input id="un" required>
        </label>

        <label>
          E-mail
          <input
            id="ue"
            type="email"
            required
          >
        </label>

        <label>
          Senha
          <input
            id="up"
            required
          >
        </label>

        <label>
          Perfil

          <select id="ur">
            <option value="aluno">
              Aluno
            </option>
            <option value="professor">
              Professor
            </option>
            <option value="admin">
              Administrador
            </option>
          </select>

        </label>

        <label>
          Semestre

          <select id="us">

            ${
              [
                ...new Set(
                  DISC.map(x=>x[0])
                )
              ]
              .map(x=>`
                <option>
                  ${x}
                </option>
              `).join("")
            }

          </select>

        </label>

        <button class="btn primary">
          Cadastrar
        </button>

      </form>
      `
    );

    $("#uf").onsubmit=e=>{

      e.preventDefault();

      if(
        DB.users.some(
          x=>
            x.email.toLowerCase()===
            $("#ue").value
              .trim()
              .toLowerCase()
        )
      ){

        return toast(
          "E-mail já cadastrado."
        );
      }

      DB.users.push({

        id:"u"+Date.now(),

        name:$("#un").value,

        email:
          $("#ue")
          .value
          .trim()
          .toLowerCase(),

        pass:$("#up").value,

        role:$("#ur").value,

        semester:$("#us").value,

        active:true
      });

      save();

      close();

      render();

      toast(
        "Usuário cadastrado."
      );
    };

    return;
  }

  if(a==="material"){

    modal(
      "Novo material",
      `
      <form id="mf">

        <label>
          Título
          <input id="mn" required>
        </label>

        <label>
          Disciplina

          <select id="md">

            ${
              DISC.map(x=>`
                <option value="${x[1]}">
                  ${x[1]} — ${x[2]}
                </option>
              `).join("")
            }

          </select>

        </label>

        <label>
          PDF
          <input
            id="file"
            type="file"
            accept="application/pdf"
          >
        </label>

        <p class="muted">
          No modo estático, o PDF selecionado fica
          disponível somente nesta sessão.
        </p>

        <button class="btn primary">
          Cadastrar
        </button>

      </form>
      `
    );

    $("#mf").onsubmit=e=>{

      e.preventDefault();

      let f=$("#file").files[0];

      DB.materials.push({

        id:"m"+Date.now(),

        title:$("#mn").value,

        disc:$("#md").value,

        sem:d(
          $("#md").value
        )[0],

        file:
          f
          ?
          URL.createObjectURL(f)
          :
          "materiais/LEIA-ME.txt",

        type:"PDF"
      });

      save();

      close();

      render();

      toast(
        "Material cadastrado."
      );
    };

    return;
  }

  if(a==="question"){

    modal(
      "Nova questão",
      `
      <form id="qf">

        <label>
          Disciplina

          <select id="qd">

            ${
              DISC.map(x=>`
                <option value="${x[1]}">
                  ${x[1]} — ${x[2]}
                </option>
              `).join("")
            }

          </select>

        </label>

        <label>
          Enunciado
          <textarea id="qt" required></textarea>
        </label>

        ${
          [0,1,2,3]
          .map(i=>`
            <label>
              Alternativa ${i+1}
              <input
                id="qo${i}"
                required
              >
            </label>
          `).join("")
        }

        <label>
          Resposta

          <select id="qa">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>

        </label>

        <button class="btn primary">
          Salvar
        </button>

      </form>
      `
    );

    $("#qf").onsubmit=e=>{

      e.preventDefault();

      DB.questions.push({

        id:"q"+Date.now(),

        disc:$("#qd").value,

        text:$("#qt").value,

        opts:
          [0,1,2,3]
          .map(
            i=>$("#qo"+i).value
          ),

        ans:
          +$("#qa").value-1
      });

      save();

      close();

      render();

      toast(
        "Questão salva."
      );
    };

    return;
  }

  if(a==="exam"){

    modal(
      "Nova avaliação",
      `
      <form id="ef">

        <label>
          Título
          <input id="et" required>
        </label>

        <label>
          Disciplina

          <select id="ed">

            ${
              DISC.map(x=>`
                <option value="${x[1]}">
                  ${x[1]} — ${x[2]}
                </option>
              `).join("")
            }

          </select>

        </label>

        <label>
          Data
          <input
            id="ee"
            type="date"
            required
          >
        </label>

        <button class="btn primary">
          Cadastrar
        </button>

      </form>
      `
    );

    $("#ef").onsubmit=e=>{

      e.preventDefault();

      DB.exams.push({

        id:"e"+Date.now(),

        title:$("#et").value,

        disc:$("#ed").value,

        date:
          new Date(
            $("#ee").value+"T12:00"
          ).toLocaleDateString(
            "pt-BR"
          )
      });

      save();

      close();

      render();

      toast(
        "Avaliação cadastrada."
      );
    };

    return;
  }

  if(a==="notice"){

    modal(
      "Novo aviso",
      `
      <form id="nf">

        <label>
          Título
          <input id="nt" required>
        </label>

        <label>
          Mensagem
          <textarea
            id="nx"
            required
          ></textarea>
        </label>

        <button class="btn primary">
          Publicar
        </button>

      </form>
      `
    );

    $("#nf").onsubmit=e=>{

      e.preventDefault();

      DB.notices.unshift({

        id:"n"+Date.now(),

        title:$("#nt").value,

        text:$("#nx").value,

        date:
          new Date()
          .toLocaleDateString(
            "pt-BR"
          )
      });

      save();

      close();

      render();

      toast(
        "Aviso publicado."
      );
    };

    return;
  }

  if(a==="quiz"){

    let qs=
      [...DB.questions]
      .sort(
        ()=>Math.random()-.5
      );

    if(!qs.length){

      toast(
        "Não existem questões cadastradas."
      );

      return;
    }

    modal(
      "Questionário",
      `
      <form id="quiz">

        ${
          qs.map((q,i)=>`

            <div class="card">

              <b>
                ${i+1}. ${esc(q.text)}
              </b>

              ${
                q.opts.map((o,j)=>`

                  <label class="check">

                    <input
                      type="radio"
                      name="q${i}"
                      value="${j}"
                      required
                    >

                    ${esc(o)}

                  </label>

                `).join("")
              }

            </div>

          `).join("")
        }

        <button class="btn primary">
          Finalizar
        </button>

      </form>
      `
    );

    $("#quiz").onsubmit=e=>{

      e.preventDefault();

      let fd=new FormData(
        e.target
      );

      let s=0;

      qs.forEach((q,i)=>{

        if(
          +fd.get("q"+i)===
          q.ans
        ){
          s++;
        }

      });

      close();

      toast(
        "Resultado: "+
        s+
        "/"+
        qs.length
      );
    };

    return;
  }
}

/*
 * Botões da tela de login
 */
$("#authForm");

$$(".lt").forEach(x=>{

  x.onclick=()=>{

    mode=x.dataset.mode;

    $$(".lt").forEach(
      b=>
        b.classList.toggle(
          "active",
          b===x
        )
    );

    renderAuth();
  };
});

/*
 * Sair
 */
$("#logout").onclick=()=>{

  DB.session=null;

  save();

  page="dashboard";

  render();

};

/*
 * Menu mobile
 */
$("#hamb").onclick=()=>{

  $("#side")
    .classList
    .toggle("open");

};

/*
 * Tema
 */
$("#theme").onclick=()=>{

  action("theme");

};

/*
 * Modal
 */
$("#mclose").onclick=close;

$("#modal").onclick=e=>{

  if(
    e.target.id==="modal"
  ){
    close();
  }

};

/*
 * Inicia o sistema
 */
render();
