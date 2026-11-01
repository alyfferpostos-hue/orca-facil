/* Carrega bibliotecas PDF com fontes alternativas e relata erros reais. */
window.orcaPdfReady=(async()=>{
 const load=async(urls,check)=>{for(const url of urls){try{await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.async=false;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('Falha em '+url))};document.head.appendChild(s)});if(check())return true}catch(e){console.warn(e.message)}}return false};
 const jspdf=await load(['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'],()=>!!window.jspdf?.jsPDF);
 if(!jspdf)return false;
 return load(['https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js','https://unpkg.com/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js'],()=>typeof new window.jspdf.jsPDF().autoTable==='function');
})();
