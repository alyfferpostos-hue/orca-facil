# Orça Fácil

Aplicativo web simples e profissional para criar orçamentos em PDF, ideal para autônomos, prestadores de serviço e pequenos negócios.

## Funcionalidades

- Cadastro dos dados da empresa / profissional (nome, logo, CPF/CNPJ, telefone, e-mail, endereço)
- Criação de orçamentos com múltiplos itens (descrição, quantidade, valor unitário)
- Pré-visualização em tempo real do PDF
- Geração de PDF limpo e profissional (A4)
- Histórico local dos últimos orçamentos (localStorage)
- Layout responsivo (funciona bem no celular)
- Pronto para monetização com Google AdSense (espaços reservados)

## Como usar localmente

1. Abra o arquivo `index.html` no navegador  
   ou  
2. Sirva a pasta com qualquer servidor estático:

```bash
npx serve .
# ou
python -m http.server 8080
```

## Deploy no Render (recomendado)

1. Crie um repositório no GitHub com os arquivos desta pasta.
2. No [Render.com](https://render.com):
   - New → Static Site
   - Conecte o repositório
   - Build Command: deixe vazio (ou `echo "static"`)
   - Publish Directory: `.` (raiz)
3. Pronto! O site ficará online com HTTPS.

## Deploy no GitHub Pages

1. Suba os arquivos para um repositório.
2. Settings → Pages → Source: Deploy from a branch → main / root.
3. Acesse `https://seu-usuario.github.io/nome-do-repo`

## Monetização (Google AdSense)

Os espaços de anúncio já estão marcados com a classe `.ad-slot`.

Depois de aprovar o site no AdSense:

1. Substitua o conteúdo de cada `.ad-content` pelo código do AdSense.
2. Ou use o formato de anúncio responsivo do Google.

Exemplo:

```html
<div class="ad-slot my-8">
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXX"
       data-ad-slot="YYYYYYYY"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

## Tecnologias

- HTML + Tailwind CSS (CDN)
- JavaScript vanilla
- html2pdf.js (geração de PDF no cliente)
- localStorage (persistência)

Nenhum backend necessário. Tudo roda no navegador do usuário.

## Licença

Uso livre. Pode modificar e comercializar.
