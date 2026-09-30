# V6.0 — Backend real

A V6.0 funciona imediatamente como protótipo local e pode ser publicada no GitHub Pages. O cadastro e login atuais usam `localStorage`, portanto NÃO são autenticação segura nem compartilhada entre alunos.

## Evolução para produção

Para transformar o projeto em portal multiusuário, conecte um serviço como Supabase ou Firebase.

### Estrutura sugerida

- users — contas e perfis
- courses — cursos
- disciplines — disciplinas
- enrollments — matrícula aluno/disciplina
- materials — PDFs e materiais
- exams — avaliações
- questions — banco de questões
- grades — notas
- attendance — frequência
- notices — avisos
- events — calendário

### Regras importantes

1. Senhas devem ser administradas pelo provedor de autenticação.
2. PDFs devem ficar em armazenamento privado/público conforme a regra definida pela instituição.
3. Um aluno deve consultar somente seus próprios dados.
4. Professores devem ter permissão apenas sobre turmas/disciplina autorizadas.
5. Administradores devem ter permissões administrativas separadas.
6. Use HTTPS e políticas de acesso do backend.

### Publicação

O frontend desta pasta pode continuar no GitHub Pages. O backend fica no serviço escolhido.

### PDFs

Na V6, o professor pode selecionar um PDF no formulário, mas um navegador estático não faz upload permanente para todos os usuários. Em produção, o formulário deve enviar o arquivo para Storage e gravar a URL/ID em `materials`.

## Próxima versão

A arquitetura está pronta para uma V7 com integração efetiva ao Supabase, caso você forneça/crie o projeto no Supabase.
