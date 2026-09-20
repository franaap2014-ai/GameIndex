const $=id=>document.getElementById(id),esc=v=>GV.safe(v??"");
const from=new URLSearchParams(location.search).get("from");
$("bugPageUrl").value=from?new URL(from,location.origin).href:location.href;
function message(text,type=""){const el=$("bugMessage");el.textContent=text;el.className=`beta95-message ${type}`;}
function diagnostics(){
  const richer=window.GameIndexDiagnostics?.snapshot?.();
  return richer||{viewport:`${innerWidth}x${innerHeight}`,browserFamily:navigator.userAgent.includes("Edg/")?"Edge":navigator.userAgent.includes("Chrome/")?"Chromium":"Browser",platform:navigator.platform||"",locale:document.documentElement.lang||navigator.language||"",theme:document.documentElement.dataset.theme||"",area:"Report Bug",reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches};
}
$("bugReportForm").addEventListener("submit",async event=>{
  event.preventDefault();message("Enviando relatório sanitizado...");
  try{
    const data=await GV.api("/api/public/bug-reports",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
      category:$("bugCategory").value,title:$("bugTitle").value,description:$("bugDescription").value,steps:$("bugSteps").value,
      expectedResult:$("bugExpected").value,actualResult:$("bugActual").value,pageUrl:$("bugPageUrl").value,consent:$("bugConsent").checked,clientMetadata:diagnostics()
    })});
    $("bugReceipt").innerHTML=`<div class="receipt-box"><strong>${esc(data.report.bugCode||data.report.code)}</strong><p>Referência pública: <code>${esc(data.report.code)}</code></p><p>Comprovante secreto:</p><code>${esc(data.report.receipt)}</code><p>Status: ${esc(data.report.status)}</p></div>`;
    $("receiptInput").value=data.report.receipt;event.target.reset();$("bugPageUrl").value=from?new URL(from,location.origin).href:location.href;message(data.message,"good");
  }catch(e){message(e.message,"error");}
});
$("receiptForm").addEventListener("submit",async event=>{
  event.preventDefault();const el=$("receiptStatus");
  try{const data=await GV.api(`/api/public/bug-reports/${encodeURIComponent($("receiptInput").value.trim())}/status`);el.textContent=`${data.report.code}: ${data.report.status} · atualizado ${new Date(data.report.updatedAt).toLocaleString()}`;el.className="beta95-message good";}
  catch(e){el.textContent=e.message;el.className="beta95-message error";}
});
