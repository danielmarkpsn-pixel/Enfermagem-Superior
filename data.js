const DISC=[
["1º","AN101","Anatomia Humana"],["1º","HI102","Histologia"],["1º","FI103","Fisiologia"],["1º","BQ104","Bioquímica"],["1º","GE105","Genética"],["1º","IE106","Introdução à Enfermagem"],["1º","EB107","Ética e Bioética"],
["2º","MI201","Microbiologia"],["2º","IM202","Imunologia"],["2º","PA203","Parasitologia"],["2º","FA204","Farmacologia"],["2º","PT205","Patologia"],["2º","SE206","Semiologia"],["2º","SC207","Saúde Coletiva"],
["3º","FU301","Fundamentos de Enfermagem"],["3º","SS302","Semiologia e Semiotécnica"],["3º","SA303","Saúde do Adulto"],["3º","NU304","Nutrição"],["3º","EP305","Epidemiologia"],["3º","PE306","Processo de Enfermagem"],
["4º","MC401","Enfermagem Médico-Cirúrgica"],["4º","SM402","Saúde da Mulher"],["4º","SC403","Saúde da Criança e do Adolescente"],["4º","SM404","Saúde Mental"],["4º","UE405","Urgência e Emergência"],
["5º","CC501","Centro Cirúrgico"],["5º","TI502","Terapia Intensiva"],["5º","SI503","Saúde do Idoso"],["5º","DT504","Doenças Transmissíveis"],["5º","GE505","Gestão em Enfermagem"],
["6º","EO601","Enfermagem Obstétrica"],["6º","EP602","Enfermagem Pediátrica"],["6º","EQ603","Enfermagem Psiquiátrica"],["6º","EM604","Emergências"],["6º","GL605","Gestão e Liderança"],
["7º","ES701","Estágio Supervisionado"],["7º","GS702","Gestão dos Serviços"],["7º","SP703","Saúde Pública"],["7º","VS704","Vigilância em Saúde"],["7º","PE705","Pesquisa em Enfermagem"],
["8º","ES801","Estágio Supervisionado"],["8º","TC802","TCC"],["8º","ES803","Educação em Saúde"],["8º","AE804","Administração em Enfermagem"],["8º","PP805","Práticas Profissionais"]];
const USERS=[
{id:"u1",name:"Daniel Marques",email:"aluno@demo.com",pass:"1234",role:"aluno",semester:"4º",active:true},
{id:"u2",name:"Prof. Ana Souza",email:"professor@demo.com",pass:"1234",role:"professor",semester:"",active:true},
{id:"u3",name:"Administrador",email:"admin@demo.com",pass:"1234",role:"admin",semester:"",active:true}];
const INITIAL={users:USERS,materials:[
{id:"m1",title:"Fundamentos de Enfermagem — Guia de estudos",disc:"FU301",sem:"3º",file:"materiais/LEIA-ME.txt",type:"PDF"},
{id:"m2",title:"Semiologia — roteiro de revisão",disc:"SE206",sem:"2º",file:"materiais/LEIA-ME.txt",type:"PDF"},
{id:"m3",title:"Urgência e Emergência — revisão",disc:"UE405",sem:"4º",file:"materiais/LEIA-ME.txt",type:"PDF"}],
notices:[{id:"n1",title:"Bem-vindo ao Portal",text:"A V6.0 reúne gestão acadêmica, biblioteca, avaliações e acompanhamento do aluno.",date:"29/09/2026"}],
grades:[{student:"u1",disc:"AN101",grade:8.6},{student:"u1",disc:"SE206",grade:9.1},{student:"u1",disc:"FU301",grade:8.2},{student:"u1",disc:"UE405",grade:7.8},{student:"u1",disc:"SM402",grade:6.9}],
attendance:[{student:"u1",disc:"AN101",pct:92},{student:"u1",disc:"SE206",pct:88},{student:"u1",disc:"FU301",pct:96},{student:"u1",disc:"UE405",pct:90}],
questions:[{id:"q1",disc:"AN101",text:"Qual estrutura é responsável principalmente pelas trocas gasosas nos pulmões?",opts:["Alvéolos","Traqueia","Laringe","Pleura"],ans:0},{id:"q2",disc:"SE206",text:"Na avaliação de enfermagem, inspeção corresponde a:",opts:["Observar sistematicamente","Palpar","Percutir","Auscultar"],ans:0}],
exams:[{id:"e1",title:"Avaliação de Fundamentos",disc:"FU301",date:"05/10/2026"},{id:"e2",title:"Avaliação de Semiologia",disc:"SE206",date:"12/10/2026"}],
events:[{date:"2026-10-05",title:"Avaliação de Fundamentos"},{date:"2026-10-12",title:"Avaliação de Semiologia"}],
fav:["m1"],logs:[],theme:"light"};
function fresh(){return JSON.parse(JSON.stringify(INITIAL))}
