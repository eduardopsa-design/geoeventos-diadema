// ============================================================
// GEOEVENTOS DIADEMA - VERSÃO 1.0
// Troque a URL abaixo pela URL do seu Google Apps Script.
// ============================================================

const DATA_URL = "https://script.google.com/macros/s/AKfycbzGzyd-VJWqKfHzpgY5ME_NWQfQa4tYE4yjM-tDeHj1XWeaqPRTmiGosVjBdFT5p-XX/exec";

// Centro aproximado de Diadema
const map = L.map("map").setView([-23.6865, -46.6234], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markersLayer = L.markerClusterGroup();
let heatLayer = null;
let heatActive = false;
let allEvents = [];

const statusBox = document.getElementById("statusBox");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const regionFilter = document.getElementById("regionFilter");
const secretariaFilter = document.getElementById("secretariaFilter");
const heatBtn = document.getElementById("heatBtn");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseDateBR(value) {
  if (!value) return null;

  // Aceita formatos: YYYY-MM-DD ou DD/MM/YYYY
  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(text + "T00:00:00");
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [d, m, y] = text.split("/");
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }

  const date = new Date(text);
  return isNaN(date.getTime()) ? null : date;
}

function sameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function inNextDays(date, days) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(today.getDate() + days);

  return date >= today && date <= limit;
}

function getWeight(evento) {
  const prioridade = normalize(evento.prioridade);

  if (prioridade.includes("muito alta")) return 8;
  if (prioridade.includes("alta")) return 5;
  if (prioridade.includes("media")) return 3;
  return 1;
}

function buildPopup(evento) {
  return `
    <div class="popup-title">${evento.evento || "Evento"}</div>
    <div class="popup-row"><span class="popup-label">📅 Data:</span> ${evento.data || "-"}</div>
    <div class="popup-row"><span class="popup-label">🕒 Horário:</span> ${evento.horaInicio || "-"} às ${evento.horaFim || "-"}</div>
    <div class="popup-row"><span class="popup-label">📍 Local:</span> ${evento.local || evento.endereco || "-"}</div>
    <div class="popup-row"><span class="popup-label">🏘 Bairro:</span> ${evento.bairro || "-"} / ${evento.regiao || "-"}</div>
    <div class="popup-row"><span class="popup-label">🏛 Secretaria:</span> ${evento.secretariaResponsavel || evento.secretaria || "-"}</div>
    <div class="popup-row"><span class="popup-label">👥 Público:</span> ${evento.publicoEstimado || "-"}</div>
    <div class="popup-row"><span class="popup-label">Status:</span> ${evento.status || "-"}</div>
  `;
}

function fillSelects(events) {
  const regioes = [...new Set(events.map(e => e.regiao).filter(Boolean))].sort();
  const secretarias = [...new Set(events.map(e => e.secretariaResponsavel || e.secretaria).filter(Boolean))].sort();

  regionFilter.innerHTML = `<option value="">Todas as regiões</option>`;
  secretariaFilter.innerHTML = `<option value="">Todas as secretarias</option>`;

  regioes.forEach(regiao => {
    regionFilter.innerHTML += `<option value="${regiao}">${regiao}</option>`;
  });

  secretarias.forEach(sec => {
    secretariaFilter.innerHTML += `<option value="${sec}">${sec}</option>`;
  });
}

function filterEvents() {
  const search = normalize(searchInput.value);
  const dateMode = dateFilter.value;
  const regiao = normalize(regionFilter.value);
  const secretaria = normalize(secretariaFilter.value);
  const today = new Date();

  return allEvents.filter(evento => {
    const eventDate = parseDateBR(evento.data);

    const text = normalize([
      evento.evento,
      evento.bairro,
      evento.regiao,
      evento.endereco,
      evento.local,
      evento.secretariaResponsavel,
      evento.secretaria
    ].join(" "));

    if (search && !text.includes(search)) return false;
    if (regiao && normalize(evento.regiao) !== regiao) return false;

    const secValue = normalize(evento.secretariaResponsavel || evento.secretaria);
    if (secretaria && secValue !== secretaria) return false;

    if (dateMode === "hoje" && !sameDay(eventDate, today)) return false;

    if (dateMode === "amanha") {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      if (!sameDay(eventDate, tomorrow)) return false;
    }

    if (dateMode === "semana" && !inNextDays(eventDate, 7)) return false;

    return true;
  });
}

function renderMap() {
  const events = filterEvents();

  markersLayer.clearLayers();

  if (heatLayer) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }

  const heatPoints = [];

  events.forEach(evento => {
    const lat = Number(String(evento.latitude || "").replace(",", "."));
    const lng = Number(String(evento.longitude || "").replace(",", "."));

    if (!lat || !lng) return;

    const marker = L.marker([lat, lng]).bindPopup(buildPopup(evento));
    markersLayer.addLayer(marker);

    heatPoints.push([lat, lng, getWeight(evento)]);
  });

  if (!map.hasLayer(markersLayer)) {
    map.addLayer(markersLayer);
  }

  if (heatActive && heatPoints.length) {
    heatLayer = L.heatLayer(heatPoints, {
      radius: 35,
      blur: 25,
      maxZoom: 17
    }).addTo(map);
  }

  statusBox.textContent = `${events.length} evento(s) encontrado(s)`;

  if (events.length > 0) {
    const group = new L.featureGroup(markersLayer.getLayers());
    if (group.getLayers().length) {
      map.fitBounds(group.getBounds().pad(0.18));
    }
  }
}

async function loadEvents() {
  try {
    if (DATA_URL.includes("COLE_AQUI")) {
      statusBox.textContent = "Cole a URL do Apps Script no arquivo script.js";
      return;
    }

    const response = await fetch(DATA_URL);
    allEvents = await response.json();

    fillSelects(allEvents);
    renderMap();

  } catch (error) {
    console.error(error);
    statusBox.textContent = "Erro ao carregar eventos. Verifique a URL do Apps Script.";
  }
}

searchInput.addEventListener("input", renderMap);
dateFilter.addEventListener("change", renderMap);
regionFilter.addEventListener("change", renderMap);
secretariaFilter.addEventListener("change", renderMap);

heatBtn.addEventListener("click", () => {
  heatActive = !heatActive;
  heatBtn.classList.toggle("active", heatActive);
  renderMap();
});

loadEvents();
