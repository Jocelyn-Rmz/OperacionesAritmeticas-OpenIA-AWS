// ⚠️ Coloca aquí tu URL EXACTA del Webhook de n8n que responde SOLO el número (texto plano)
const WEBHOOK_URL = "https://joce17.app.n8n.cloud/webhook/386d1aec-2931-4e04-9dd3-397497ea090e";

// ✅ URL pública de tu Google Sheet (abre en nueva pestaña)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/12kjVySDqun-vjCkncx3P9QLW29nZamI12izX5vJ3rmQ/edit?usp=sharing";

const $ = s => document.querySelector(s);
const btn = $("#btn"), btnText = $("#btnText"), btnSpin = $("#btnSpin");
const resultadoEl = $("#resultado"), alertBox = $("#alertBox"), opInput = $("#operacion");
const estado = $("#estado"), copyBtn = $("#copyBtn"), clearBtn = $("#clearBtn");
const docLink = $("#docLink");

// Enlazar el botón "Ver hoja" al Google Sheet
if (docLink) {
  docLink.setAttribute("href", SHEET_URL);
  docLink.setAttribute("target", "_blank");
  docLink.setAttribute("rel", "noopener");
}

function setLoading(v){
  btn.disabled = v;
  btnSpin.classList.toggle("d-none", !v);
  btnText.innerHTML = v ? '<i class="bi bi-hourglass-split"></i> Calculando...' : '<i class="bi bi-lightning-charge"></i> Calcular';
  estado.innerHTML = v ? '<span class="dot"></span>Procesando' : '<span class="dot"></span>Listo';
}
function showAlert(msg, type="danger"){
  alertBox.className = 'alert mt-3 d-block ' + (type==='danger' ? 'alert-soft' : 'alert-success');
  alertBox.textContent = msg;
}
function clearAlert(){
  alertBox.classList.add("d-none");
  alertBox.textContent = "";
}
function flashResult(){
  resultadoEl.classList.remove("fade-num");
  void resultadoEl.offsetWidth; // reflow para reiniciar animación
  resultadoEl.classList.add("fade-num");
}

async function enviar() {
  clearAlert();
  const expr = opInput.value.trim();
  if(!expr){
    showAlert("Ingresa una operación (ej. 12/3).");
    return;
  }
  setLoading(true);
  resultadoEl.textContent = "…";

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: expr })
    });

    const raw = await res.text(); // el backend responde SOLO el número como texto
    if(!res.ok) throw new Error(`Error ${res.status}: ${raw || "sin cuerpo"}`);

    const num = Number(raw.trim());
    if(Number.isNaN(num)) throw new Error(`Respuesta no numérica: ${raw}`);

    // Mostrar SOLO el número
    resultadoEl.textContent = num;
    flashResult();
  } catch (e) {
    console.error(e);
    estado.innerHTML = '<span class="dot err"></span>Error';
    showAlert(e.message || "Error al procesar la operación");
    resultadoEl.textContent = "—";
  } finally {
    setLoading(false);
  }
}

// Copiar resultado
copyBtn.addEventListener("click", async () => {
  const val = resultadoEl.textContent.trim();
  if(!val || val === "—" || val === "…") return;
  try{
    await navigator.clipboard.writeText(val);
    showAlert("Resultado copiado al portapapeles.", "success");
    setTimeout(clearAlert, 1200);
  }catch{ /* ignore */ }
});

// Limpiar
clearBtn.addEventListener("click", () => {
  opInput.value = "";
  resultadoEl.textContent = "—";
  clearAlert();
  estado.innerHTML = '<span class="dot"></span>Listo';
  opInput.focus();
});

// Eventos
btn.addEventListener("click", enviar);
opInput.addEventListener("keydown", e => { if(e.key==="Enter") enviar(); });

// Autofocus al cargar
window.addEventListener("load", () => opInput.focus());
