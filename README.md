# OrçaFácil v6 — versão de testes

Site estático responsivo, sem backend. Arquivos: `index.html`, `styles.css`, `app.js`.

## Publicar no GitHub/Render

Extraia o ZIP e envie os três arquivos da raiz para a raiz do repositório `orca-facil`, substituindo os antigos. No Render, use Static Site, publish directory `.`. Não é necessário build command. Aguarde o deploy. Para testar sem substituir o site atual, publique em outro Static Site ou teste localmente.

## Recursos

- Layout responsivo para celular e computador.
- Cadastro de empresa, logo, duas cores; remoção experimental **somente de fundo branco**, sem IA/API.
- Orçamentos com itens editáveis, descontos, acréscimos, prévia, PDF A4, download e compartilhamento quando o navegador permite.
- Rodapé numerado em cada página do PDF; tabela com quebra automática de páginas.
- Salvamento local e backup JSON.

## Limitações

- jsPDF e AutoTable são carregados de CDN; internet é necessária para gerar PDFs, a menos que as bibliotecas sejam hospedadas localmente.
- Dados ficam no localStorage do navegador, sem sincronização. Não são garantidos se limpar dados do navegador ou usar aba anônima.
- Remoção de fundo é simples, não equivale a remoção por IA; pode apagar partes brancas do logotipo.
- Prévia HTML é uma representação visual; paginação exata deve ser conferida no PDF baixado.
- O arquivo foi verificado sintaticamente, mas **não foi testado em Safari/iPhone nem em Render**. Teste os fluxos antes de substituir a versão publicada.
