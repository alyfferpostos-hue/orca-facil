/* Orça Fácil - Main Application Logic */

const STORAGE_KEYS = {
  profile: 'orcafacil_profile',
  lastNumber: 'orcafacil_last_number'
};

// ========== STATE ==========
let profile = {
  companyName: '',
  document: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  logo: null // base64
};

let items = [];
let currentBudgetId = null;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  renderItems();
  setupEventListeners();
  updateLivePreview();
  showView('home');
  
  // Auto-generate budget number
  generateBudgetNumber();
});

function setupEventListeners() {
  // Mobile menu
  document.getElementById('menuBtn').addEventListener('click', toggleMobile);
  
  // Profile form
  document.getElementById('profileForm').addEventListener('submit', saveProfile);
  document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
  document.getElementById('removeLogo').addEventListener('click', removeLogo);
  
  // Live updates on budget form
  const budgetInputs = ['clientName', 'clientPhone', 'clientEmail', 'budgetNumber', 'validity', 'paymentTerms', 'notes', 'discount', 'surcharge'];
  budgetInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => { updateTotals(); updateLivePreview(); });
      el.addEventListener('change', updateLivePreview);
    }
  });
}

function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('hidden');
}

// ========== VIEWS ==========
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.remove('hidden');
  
  // Nav active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  
  // Close mobile
  document.getElementById('mobileMenu').classList.add('hidden');
  
  if (name === 'budget') {
    updateLivePreview();
  }
  if (name === 'profile') {
    fillProfileForm();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== PROFILE ==========
function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profile);
    if (raw) {
      profile = { ...profile, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Erro ao carregar perfil', e);
  }
}

function fillProfileForm() {
  document.getElementById('companyName').value = profile.companyName || '';
  document.getElementById('document').value = profile.document || '';
  document.getElementById('phone').value = profile.phone || '';
  document.getElementById('email').value = profile.email || '';
  document.getElementById('website').value = profile.website || '';
  document.getElementById('address').value = profile.address || '';
  
  const preview = document.getElementById('logoPreview');
  const removeBtn = document.getElementById('removeLogo');
  if (profile.logo) {
    preview.innerHTML = `<img src="${profile.logo}" class="w-full h-full object-contain">`;
    removeBtn.classList.remove('hidden');
  } else {
    preview.innerHTML = `<span class="text-xs text-slate-400 text-center px-1">Sem logo</span>`;
    removeBtn.classList.add('hidden');
  }
}

function saveProfile(e) {
  e.preventDefault();
  profile.companyName = document.getElementById('companyName').value.trim();
  profile.document = document.getElementById('document').value.trim();
  profile.phone = document.getElementById('phone').value.trim();
  profile.email = document.getElementById('email').value.trim();
  profile.website = document.getElementById('website').value.trim();
  profile.address = document.getElementById('address').value.trim();
  
  try { localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile)); } catch(e) { console.warn('Armazenamento indisponível',e); }
  
  const msg = document.getElementById('profileSavedMsg');
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 2500);
  
  showToast('Dados salvos com sucesso!');
  updateLivePreview();
}

async function handleLogoUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem'));
      reader.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Formato de imagem não suportado. Tente JPG ou PNG.'));
      image.src = source;
    });
    const canvas = document.createElement('canvas');
    const factor = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * factor));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * factor));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível processar a imagem');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    profile.logo = canvas.toDataURL('image/jpeg', 0.84);
    fillProfileForm();
    try { localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile)); }
    catch (storageError) { showToast('Logo carregada nesta sessão, mas não foi possível salvá-la no aparelho.'); }
    updateLivePreview();
    showToast('Logotipo carregado!');
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Não foi possível carregar a imagem.');
  } finally {
    e.target.value = '';
  }
}

function removeLogo() {
  profile.logo = null;
  document.getElementById('logoInput').value = '';
  fillProfileForm();
  try { localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile)); } catch(e) { console.warn('Armazenamento indisponível',e); }
  updateLivePreview();
}

// ========== ITEMS ==========
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 9); }
function moneyNumber(id) { return Number(document.getElementById(id).value) || 0; }
function addItem() {
  const description = document.getElementById('newDescription').value.trim();
  const qty = moneyNumber('newQty');
  const price = moneyNumber('newPrice');
  if (!description || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0 || document.getElementById('newPrice').value.trim() === '') {
    showToast('Preencha descrição, quantidade positiva e valor unitário válido.'); return;
  }
  items.push({id:uid(),description,qty,price});
  document.getElementById('newDescription').value = '';
  document.getElementById('newQty').value = '1';
  document.getElementById('newPrice').value = '';
  renderItems(); updateLivePreview();
  document.getElementById('newDescription').focus();
}
function removeItem(id) { items = items.filter(i=>i.id!==id); renderItems(); updateLivePreview(); }
function updateItem(id,field,value) {
  const item=items.find(i=>i.id===id); if(!item)return;
  if(field==='qty'||field==='price') item[field]=Number(value);
  else item[field]=value;
  const row=document.querySelector(`[data-id="${id}"]`);
  if(row) row.querySelector('.item-total-box').textContent=formatCurrency(item.qty*item.price);
  updateTotals(); updateLivePreview();
}
function renderItems() {
  const container=document.getElementById('itemsContainer');
  container.innerHTML=items.length ? items.map((item,index)=>`<div class="item-row" data-id="${item.id}">
    <div class="item-row-top"><strong>Item ${index+1}</strong><button type="button" class="item-remove" onclick="removeItem('${item.id}')" aria-label="Excluir item ${index+1}">Excluir</button></div>
    <div class="item-grid">
      <div><label>Descrição</label><input class="input" aria-label="Descrição item ${index+1}" value="${escapeHtml(item.description)}" oninput="updateItem('${item.id}','description',this.value)"></div>
      <div><label>Qtd</label><input class="input" aria-label="Quantidade item ${index+1}" type="number" min="0.01" step="0.01" value="${item.qty}" oninput="updateItem('${item.id}','qty',this.value)"></div>
      <div><label>Valor unit. (R$)</label><input class="input" aria-label="Preço item ${index+1}" type="number" min="0" step="0.01" value="${item.price}" oninput="updateItem('${item.id}','price',this.value)"></div>
      <div><label>Total</label><div class="item-total-box">${formatCurrency(item.qty*item.price)}</div></div>
    </div></div>`).join('') : '<p class="empty-items">Nenhum item adicionado. Preencha os campos acima e toque em Adicionar item.</p>';
  updateTotals();
}
function getSubtotal(){return items.reduce((sum,i)=>sum+Math.round(i.qty*i.price*100),0)/100;}
function getTotal(){return Math.max(0,Math.round((getSubtotal()-moneyNumber('discount')+moneyNumber('surcharge'))*100)/100);}
function updateTotals(){
 document.getElementById('subtotalDisplay').textContent=formatCurrency(getSubtotal());
 document.getElementById('totalDisplay').textContent=formatCurrency(getTotal());
}
function clearForm(){
 if(!confirm('Limpar todos os dados deste orçamento e do prestador?'))return;
 document.getElementById('profileForm').reset();
 ['clientName','clientPhone','clientEmail','paymentTerms','notes','newDescription','newPrice'].forEach(id=>document.getElementById(id).value='');
 document.getElementById('newQty').value='1'; document.getElementById('validity').value='15';
 document.getElementById('discount').value='0'; document.getElementById('surcharge').value='0';
 profile={companyName:'',document:'',phone:'',email:'',website:'',address:'',logo:null};
 localStorage.removeItem(STORAGE_KEYS.profile); items=[];
 document.getElementById('logoInput').value=''; fillProfileForm(); generateBudgetNumber(); renderItems(); updateLivePreview();
 closePreview(); showToast('Formulário limpo.');
}
// ========== BUDGET NUMBER ==========
function generateBudgetNumber() {
  const year = new Date().getFullYear();
  let last = 0;
  try { last = parseInt(localStorage.getItem(STORAGE_KEYS.lastNumber) || '0', 10) || 0; } catch(e) {}
  last += 1;
  try { localStorage.setItem(STORAGE_KEYS.lastNumber, last.toString()); } catch(e) {}
  const num = `${year}-${String(last).padStart(3, '0')}`;
  document.getElementById('budgetNumber').value = num;
}

// ========== LIVE PREVIEW & PDF ==========
function buildPDFHTML() {
  const clientName = document.getElementById('clientName').value.trim() || 'Cliente';
  const clientPhone = document.getElementById('clientPhone').value.trim();
  const clientEmail = document.getElementById('clientEmail').value.trim();
  const budgetNumber = document.getElementById('budgetNumber').value.trim() || '—';
  const validity = parseInt(document.getElementById('validity').value) || 15;
  const paymentTerms = document.getElementById('paymentTerms').value.trim();
  const notes = document.getElementById('notes').value.trim();
  
  const today = new Date();
  const dateStr = formatDate(today);
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + validity);
  const validStr = formatDate(validUntil);
  
  const total = getTotal();
  const subtotal=getSubtotal(), discount=moneyNumber('discount'), surcharge=moneyNumber('surcharge');
  
  // Company side
  let logoHTML = '';
  if (profile.logo) {
    logoHTML = `<img src="${profile.logo}" class="pdf-logo" alt="Logo">`;
  }
  
  const companyLines = [];
  if (profile.document) companyLines.push(profile.document);
  if (profile.phone) companyLines.push(profile.phone);
  if (profile.email) companyLines.push(profile.email);
  if (profile.website) companyLines.push(profile.website);
  if (profile.address) companyLines.push(profile.address);
  
  // Items rows
  const rows = items
    .filter(i => i.description.trim() || i.price > 0)
    .map(i => {
      const lineTotal = i.qty * i.price;
      return `
        <tr>
          <td class="col-desc">${escapeHtml(i.description) || '—'}</td>
          <td class="col-qty">${formatNumber(i.qty)}</td>
          <td class="col-price">${formatCurrency(i.price)}</td>
          <td class="col-total">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    }).join('');
  
  const emptyRows = rows ? '' : `
    <tr>
      <td colspan="4" style="text-align:center; color:#94a3b8; padding: 24px;">Nenhum item adicionado</td>
    </tr>
  `;
  
  return `
    <div class="pdf-page" id="pdfExportArea">
      <div class="pdf-header">
        <div class="pdf-company">
          <div class="pdf-company-name">${escapeHtml(profile.companyName) || 'Sua Empresa'}</div>
          <div class="pdf-company-info">${companyLines.map(l => escapeHtml(l)).join('<br>')}</div>
        </div>
        <div class="pdf-logo-box">
          ${logoHTML || `<div class="pdf-logo-placeholder">OF</div>`}
        </div>
      </div>
      
      <div class="pdf-title-block">
        <div>
          <div class="pdf-doc-title">ORÇAMENTO</div>
        </div>
        <div class="pdf-doc-meta">
          <div class="pdf-doc-number">Nº ${escapeHtml(budgetNumber)}</div>
          <div>Data: ${dateStr}</div>
          <div>Válido até: ${validStr}</div>
        </div>
      </div>
      
      <div class="pdf-client-box">
        <div class="pdf-client-label">Cliente</div>
        <div class="pdf-client-name">${escapeHtml(clientName)}</div>
        <div class="pdf-client-details">
          ${[clientPhone, clientEmail].filter(Boolean).map(v => escapeHtml(v)).join(' • ')}
        </div>
      </div>
      
      <table class="pdf-table">
        <thead>
          <tr>
            <th class="col-desc">Descrição</th>
            <th class="col-qty">Qtd</th>
            <th class="col-price">Valor Unit.</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows || emptyRows}
        </tbody>
      </table>
      
      <div class="pdf-totals">
        <div class="pdf-total-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        ${discount ? `<div class="pdf-total-row"><span>Desconto</span><span>- ${formatCurrency(discount)}</span></div>` : ''}
        ${surcharge ? `<div class="pdf-total-row"><span>Acréscimos</span><span>${formatCurrency(surcharge)}</span></div>` : ''}
        <div class="pdf-total-row grand">
          <span>Total</span>
          <span>${formatCurrency(total)}</span>
        </div>
      </div>
      
      ${paymentTerms ? `
        <div class="pdf-section">
          <div class="pdf-section-title">Condições de Pagamento</div>
          <div class="pdf-section-content">${escapeHtml(paymentTerms)}</div>
        </div>
      ` : ''}
      
      ${notes ? `
        <div class="pdf-section">
          <div class="pdf-section-title">Observações</div>
          <div class="pdf-section-content">${escapeHtml(notes)}</div>
        </div>
      ` : ''}
      
      <div class="pdf-footer">
        <span class="pdf-brand">Criado com <strong>ORÇAFÁCIL</strong></span>
        <span>${dateStr}</span>
      </div>
    </div>
  `;
}

function updateLivePreview() {
  const container = document.getElementById('livePreview');
  if (!container) return;
  container.innerHTML = buildPDFHTML();
}

function previewBudget() {
  if (!validateBudget()) return;
  const content = document.getElementById('modalPreviewContent');
  content.innerHTML = buildPDFHTML();
  document.getElementById('previewModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  document.getElementById('previewModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function validateBudget(){
 if (!profile.companyName.trim()) { showToast('Preencha e salve o nome do prestador em Meus Dados.'); showView('profile'); return false; }
 if (!document.getElementById('clientName').value.trim()) { showToast('Informe o nome do cliente.'); return false; }
 if (!items.length || items.some(i=>!i.description.trim()||!Number.isFinite(i.qty)||i.qty<=0||!Number.isFinite(i.price)||i.price<0)) { showToast('Adicione itens válidos com descrição, quantidade e preço.'); return false; }
 if (moneyNumber('discount')<0||moneyNumber('surcharge')<0) { showToast('Desconto e acréscimos não podem ser negativos.'); return false; }
 return true;
}
// Gera o arquivo PDF real no navegador, sem criar URL pública no Render.
async function createPDFFile() {
  if (!validateBudget()) return null;
  if (typeof html2pdf !== 'function') {
    showToast('Gerador de PDF indisponível. Verifique a conexão.');
    return null;
  }
  const clientName = document.getElementById('clientName').value.trim();
  const filename = `Orcamento_${sanitizeFilename(clientName)}_${sanitizeFilename(document.getElementById('budgetNumber').value || 'OF')}.pdf`;
  const temp = document.createElement('div');
  temp.style.cssText = 'position:fixed;left:0;top:0;z-index:-1;pointer-events:none;';
  temp.innerHTML = buildPDFHTML();
  document.body.appendChild(temp);
  try {
    const element = temp.querySelector('.pdf-page');
    const options = {
      margin: 0, filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    const blob = await html2pdf().set(options).from(element).outputPdf('blob');
    if (!(blob instanceof Blob) || !blob.size) throw new Error('PDF vazio');
    return new File([blob], filename, { type: 'application/pdf' });
  } finally {
    temp.remove();
  }
}

function downloadPDFFile(file) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // O Safari pode demorar para iniciar o salvamento.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function generatePDF() {
  try {
    const file = await createPDFFile();
    if (!file) return;
    downloadPDFFile(file);
    showToast('PDF gerado. Confira os downloads do navegador.');
  } catch (error) {
    console.error('Falha ao baixar PDF:', error);
    showToast('Não foi possível baixar o PDF. Tente novamente.');
  }
}

async function sharePDF() {
  try {
    const file = await createPDFFile();
    if (!file) return;
    // Compartilha os bytes do arquivo, jamais o endereço do site.
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({ files: [file], title: 'Orçamento em PDF' });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.warn('Compartilhamento nativo indisponível:', error);
      }
    }
    downloadPDFFile(file);
    showToast('Compartilhamento indisponível. PDF enviado aos downloads.');
  } catch (error) {
    console.error('Falha ao compartilhar PDF:', error);
    showToast('Não foi possível preparar o PDF.');
  }
}

// Valor zero é opcional: facilita digitar, mas campo vazio vale zero.
['discount', 'surcharge'].forEach(id => {
  const field = document.getElementById(id);
  if (!field) return;
  field.addEventListener('focus', () => {
    if (Number(field.value) === 0) field.value = '';
  });
  field.addEventListener('blur', () => {
    if (field.value.trim() === '') field.value = '0';
  });
});

// ========== HELPERS ==========
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9À-ÿ\s\-]/g, '').replace(/\s+/g, '_').slice(0, 40);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}
