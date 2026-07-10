console.log("GeoEventos v1.4.1 carregado");
const DATA_URL = "https://script.google.com/macros/s/AKfycbxBp7RUuULIm7Kbus-lIsogGKLZ78cgr_YIWBh2xX9hRCCPglTOnO2_DLQJqE-x6jih/exec";

const map = L.map("map").setView([-23.6865, -46.6234], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markersLayer = L.markerClusterGroup();
let heatLayer = null;
let heatActive = false;
let allEvents = [];
let selectedCalendarDate = null;
const nowForCalendar = new Date();
let calendarYear = nowForCalendar.getFullYear();
let calendarMonth = nowForCalendar.getMonth();

const statusBox = document.getElementById("statusBox");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const regionFilter = document.getElementById("regionFilter");
const secretariaFilter = document.getElementById("secretariaFilter");
const dashboardBtn = document.getElementById("dashboardBtn");
const dashboardPanel = document.getElementById("dashboardPanel");
const closeDashboardBtn = document.getElementById("closeDashboardBtn");
const dashboardShowAllBtn = document.getElementById("dashboardShowAllBtn");
const metricToday = document.getElementById("metricToday");
const metricWeek = document.getElementById("metricWeek");
const metricMonth = document.getElementById("metricMonth");
const metricMayor = document.getElementById("metricMayor");
const metricRecurring = document.getElementById("metricRecurring");
const metricRegions = document.getElementById("metricRegions");
const regionRanking = document.getElementById("regionRanking");
const secretariaRanking = document.getElementById("secretariaRanking");
const regionTotalLabel = document.getElementById("regionTotalLabel");
const secretariaTotalLabel = document.getElementById("secretariaTotalLabel");
const dashboardUpdated = document.getElementById("dashboardUpdated");
const calendarBtn = document.getElementById("calendarBtn");
const calendarPanel = document.getElementById("calendarPanel");
const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");
const calendarSelection = document.getElementById("calendarSelection");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const closeCalendarBtn = document.getElementById("closeCalendarBtn");
const clearCalendarDateBtn = document.getElementById("clearCalendarDateBtn");
const todayBtn = document.getElementById("todayBtn");
const heatBtn = document.getElementById("heatBtn");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseCoordinate(value) {
  const parsed = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDateBR(value) {
  if (!value) return null;

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(text + "T00:00:00");
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDay(a, b) {
  return Boolean(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inNextDays(date, days) {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  limit.setHours(23, 59, 59, 999);

  return date >= today && date <= limit;
}

function getWeight(evento) {
  const prioridade = normalize(evento.prioridade);

  if (prioridade.includes("muito alta")) return 8;
  if (prioridade === "alta") return 5;
  if (prioridade === "media") return 3;

  const publico = Number(evento.publicoEstimado || 0);
  if (publico >= 1000) return 6;
  if (publico >= 500) return 4;
  if (publico >= 100) return 2;

  return 1;
}

function getCategory(evento) {
  return normalize(evento.categoria || evento.tipoEvento);
}

function createIcon(evento) {
  const category = getCategory(evento);

  let pinClass = "pin-evento";
  let symbol = "●";

  if (category.includes("agenda prefeito")) {
    pinClass = "pin-agenda";
    symbol = "★";
  } else if (category.includes("recorrente")) {
    pinClass = "pin-recorrente";
    symbol = "↻";
  }

  return L.divIcon({
    className: "",
    html: `<div class="custom-pin ${pinClass}"><span>${symbol}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
}

function buildDestination(evento) {
  const lat = parseCoordinate(evento.latitude);
  const lng = parseCoordinate(evento.longitude);

  if (lat !== null && lng !== null) {
    return `${lat},${lng}`;
  }

  return [
    evento.local,
    evento.endereco,
    evento.bairro,
    "Diadema - SP"
  ]
    .filter(Boolean)
    .join(", ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPopup(evento) {
  const destino = buildDestination(evento);
  const linkComoChegar =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destino) +
    "&travelmode=driving";

  const categoria = evento.categoria || evento.tipoEvento || "Evento";
  const enderecoCompleto = [
    evento.local,
    evento.endereco,
    evento.bairro,
    evento.regiao
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <div class="event-popup">
      <div class="popup-badge">${escapeHtml(categoria)}</div>
      <h3 class="popup-title">${escapeHtml(evento.evento || "Evento")}</h3>

      <div class="popup-row">
        <span>📅</span>
        <div><span class="popup-label">Data:</span> ${escapeHtml(evento.data || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🕒</span>
        <div><span class="popup-label">Horário:</span> ${escapeHtml(evento.horaInicio || "-")} às ${escapeHtml(evento.horaFim || "-")}</div>
      </div>

      <div class="popup-row">
        <span>📍</span>
        <div><span class="popup-label">Local:</span> ${escapeHtml(evento.local || evento.endereco || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🏘️</span>
        <div><span class="popup-label">Bairro/Região:</span> ${escapeHtml(evento.bairro || "-")} / ${escapeHtml(evento.regiao || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🏛️</span>
        <div><span class="popup-label">Secretaria:</span> ${escapeHtml(evento.secretariaResponsavel || evento.secretaria || "-")}</div>
      </div>

      <div class="popup-row">
        <span>👥</span>
        <div><span class="popup-label">Público estimado:</span> ${escapeHtml(evento.publicoEstimado || "-")}</div>
      </div>

      <div class="popup-row">
        <span>✅</span>
        <div><span class="popup-label">Status:</span> ${escapeHtml(evento.status || "-")}</div>
      </div>

      <div class="popup-actions">
        <a
          class="como-chegar-btn"
          href="${linkComoChegar}"
          target="_blank"
          rel="noopener noreferrer"
        >
          🚗 Como chegar
        </a>

        <button
          type="button"
          class="copiar-endereco-btn"
          data-address="${escapeHtml(enderecoCompleto)}"
          onclick="copyAddress(this)"
        >
          📋 Copiar endereço
        </button>
      </div>
    </div>
  `;
}

window.copyAddress = async function(button) {
  const address = button.dataset.address || "";

  if (!address) {
    button.textContent = "Endereço não informado";
    return;
  }

  try {
    await navigator.clipboard.writeText(address);
    const original = button.textContent;
    button.textContent = "✅ Endereço copiado";

    setTimeout(() => {
      button.textContent = original;
    }, 1800);
  } catch (error) {
    window.prompt("Copie o endereço:", address);
  }
};



function countBy(items, getKey) {
  const counts = new Map();

  items.forEach((item) => {
    const rawKey = getKey(item);
    const key = String(rawKey || "").trim();

    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "pt-BR"));
}

function renderRanking(container, data, limit = 8) {
  container.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("div");
    empty.className = "ranking-empty";
    empty.textContent = "Nenhum dado disponível.";
    container.appendChild(empty);
    return;
  }

  const shown = data.slice(0, limit);
  const maxValue = Math.max(...shown.map((item) => item.value), 1);

  shown.forEach((item) => {
    const row = document.createElement("div");
    row.className = "ranking-item";

    const name = document.createElement("span");
    name.className = "ranking-name";
    name.title = item.name;
    name.textContent = item.name;

    const track = document.createElement("div");
    track.className = "ranking-track";

    const bar = document.createElement("div");
    bar.className = "ranking-bar";
    bar.style.width = `${Math.max((item.value / maxValue) * 100, 4)}%`;
    track.appendChild(bar);

    const value = document.createElement("span");
    value.className = "ranking-value";
    value.textContent = item.value;

    row.append(name, track, value);
    container.appendChild(row);
  });
}

function updateDashboard() {
  const today = new Date();

  const todayCount = allEvents.filter((evento) =>
    sameDay(parseDateBR(evento.data), today)
  ).length;

  const weekCount = allEvents.filter((evento) =>
    inNextDays(parseDateBR(evento.data), 7)
  ).length;

  const monthCount = allEvents.filter((evento) =>
    inNextDays(parseDateBR(evento.data), 30)
  ).length;

  const mayorCount = allEvents.filter((evento) =>
    getCategory(evento).includes("agenda prefeito")
  ).length;

  const recurringCount = allEvents.filter((evento) =>
    getCategory(evento).includes("recorrente")
  ).length;

  const uniqueRegions = new Set(
    allEvents.map((evento) => String(evento.regiao || "").trim()).filter(Boolean)
  );

  metricToday.textContent = todayCount;
  metricWeek.textContent = weekCount;
  metricMonth.textContent = monthCount;
  metricMayor.textContent = mayorCount;
  metricRecurring.textContent = recurringCount;
  metricRegions.textContent = uniqueRegions.size;

  const byRegion = countBy(allEvents, (evento) => evento.regiao);
  const bySecretaria = countBy(
    allEvents,
    (evento) => evento.secretariaResponsavel || evento.secretaria
  );

  renderRanking(regionRanking, byRegion);
  renderRanking(secretariaRanking, bySecretaria);

  regionTotalLabel.textContent = `${allEvents.length} registros`;
  secretariaTotalLabel.textContent = `${allEvents.length} registros`;

  dashboardUpdated.textContent =
    `Atualizado em ${new Date().toLocaleString("pt-BR")}.`;
}

function openDashboard() {
  closeCalendar();
  dashboardPanel.classList.add("open");
  dashboardPanel.setAttribute("aria-hidden", "false");
  dashboardBtn.classList.add("active");
  updateDashboard();
}

function closeDashboard() {
  dashboardPanel.classList.remove("open");
  dashboardPanel.setAttribute("aria-hidden", "true");
  dashboardBtn.classList.remove("active");
}

function dateKey(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function eventCountsByDate() {
  const counts = new Map();

  allEvents.forEach((evento) => {
    const parsedDate = parseDateBR(evento.data);
    if (!parsedDate) return;

    const key = dateKey(parsedDate);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
}

function countClass(count) {
  if (count >= 8) return "many";
  if (count >= 4) return "medium";
  return "few";
}

function renderCalendar() {
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const today = new Date();
  const counts = eventCountsByDate();

  calendarTitle.textContent = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(firstDay);

  calendarGrid.innerHTML = "";

  // Converte domingo=0 para calendário começando na segunda.
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < leadingEmptyDays; i += 1) {
    const empty = document.createElement("div");
    empty.className = "calendar-empty-day";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(calendarYear, calendarMonth, day);
    const key = dateKey(date);
    const count = counts.get(key) || 0;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.dataset.date = key;
    button.setAttribute(
      "aria-label",
      `${formatLongDate(date)}: ${count} evento(s)`
    );

    if (sameDay(date, today)) {
      button.classList.add("today");
    }

    if (selectedCalendarDate && sameDay(date, selectedCalendarDate)) {
      button.classList.add("selected");
    }

    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = day;
    button.appendChild(number);

    if (count > 0) {
      const countBadge = document.createElement("span");
      countBadge.className = `calendar-event-count ${countClass(count)}`;
      countBadge.textContent = count;
      button.appendChild(countBadge);
    }

    button.addEventListener("click", () => {
      selectedCalendarDate = date;
      dateFilter.value = "todos";

      todayBtn.classList.remove("active");
      todayBtn.textContent = "📅 O que tem hoje?";

      calendarSelection.textContent =
        `${formatLongDate(date)} — ${count} evento(s) cadastrado(s).`;

      renderCalendar();
      renderMap();
    });

    calendarGrid.appendChild(button);
  }
}

function openCalendar() {
  closeDashboard();
  calendarPanel.classList.add("open");
  calendarPanel.setAttribute("aria-hidden", "false");
  calendarBtn.classList.add("active");
  renderCalendar();
}

function closeCalendar() {
  calendarPanel.classList.remove("open");
  calendarPanel.setAttribute("aria-hidden", "true");
  calendarBtn.classList.remove("active");
}

function fillSelects(events) {
  const regioes = [...new Set(events.map((item) => item.regiao).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  const secretarias = [
    ...new Set(
      events
        .map((item) => item.secretariaResponsavel || item.secretaria)
        .filter(Boolean)
    )
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  regionFilter.innerHTML = '<option value="">Todas as regiões</option>';
  secretariaFilter.innerHTML =
    '<option value="">Todas as secretarias</option>';

  regioes.forEach((regiao) => {
    const option = document.createElement("option");
    option.value = regiao;
    option.textContent = regiao;
    regionFilter.appendChild(option);
  });

  secretarias.forEach((secretaria) => {
    const option = document.createElement("option");
    option.value = secretaria;
    option.textContent = secretaria;
    secretariaFilter.appendChild(option);
  });
}

function filterEvents() {
  const search = normalize(searchInput.value);
  const dateMode = dateFilter.value;
  const regiao = normalize(regionFilter.value);
  const secretaria = normalize(secretariaFilter.value);
  const today = new Date();

  return allEvents.filter((evento) => {
    const eventDate = parseDateBR(evento.data);

    if (
      selectedCalendarDate &&
      !sameDay(eventDate, selectedCalendarDate)
    ) {
      return false;
    }

    const searchableText = normalize(
      [
        evento.evento,
        evento.tipoEvento,
        evento.categoria,
        evento.bairro,
        evento.regiao,
        evento.endereco,
        evento.local,
        evento.secretariaResponsavel,
        evento.secretaria
      ].join(" ")
    );

    if (search && !searchableText.includes(search)) return false;
    if (regiao && normalize(evento.regiao) !== regiao) return false;

    const eventSecretary = normalize(
      evento.secretariaResponsavel || evento.secretaria
    );

    if (secretaria && eventSecretary !== secretaria) return false;

    if (dateMode === "hoje" && !sameDay(eventDate, today)) return false;

    if (dateMode === "amanha") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (!sameDay(eventDate, tomorrow)) return false;
    }

    if (dateMode === "semana" && !inNextDays(eventDate, 7)) return false;
    if (dateMode === "mes" && !inNextDays(eventDate, 30)) return false;

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
  const validMarkers = [];

  events.forEach((evento) => {
    const lat = parseCoordinate(evento.latitude);
    const lng = parseCoordinate(evento.longitude);

    if (lat === null || lng === null) return;

    const marker = L.marker([lat, lng], {
      icon: createIcon(evento)
    }).bindPopup(buildPopup(evento), {
      maxWidth: 330
    });

    markersLayer.addLayer(marker);
    validMarkers.push(marker);
    heatPoints.push([lat, lng, getWeight(evento)]);
  });

  if (!map.hasLayer(markersLayer)) {
    map.addLayer(markersLayer);
  }

  if (heatActive && heatPoints.length) {
    heatLayer = L.heatLayer(heatPoints, {
      radius: 38,
      blur: 28,
      maxZoom: 17,
      minOpacity: 0.35
    }).addTo(map);
  }

  if (selectedCalendarDate && events.length === 0) {
    statusBox.textContent =
      `Nenhum evento cadastrado em ${selectedCalendarDate.toLocaleDateString("pt-BR")}.`;
  } else if (dateFilter.value === "hoje" && events.length === 0) {
    statusBox.textContent = "Nenhum evento cadastrado para hoje.";
  } else {
    statusBox.textContent =
      `${events.length} evento(s) encontrado(s) · ` +
      `${validMarkers.length} ponto(s) no mapa`;
  }

  if (validMarkers.length > 0) {
    const group = L.featureGroup(validMarkers);
    map.fitBounds(group.getBounds().pad(0.16), {
      maxZoom: 16
    });
  }
}

async function loadEvents() {
  try {
    statusBox.textContent = "Carregando eventos...";

    const response = await fetch(DATA_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("A resposta do Apps Script não é uma lista de eventos.");
    }

    allEvents = data;

    fillSelects(allEvents);
    renderCalendar();
    updateDashboard();
    renderMap();
  } catch (error) {
    console.error(error);
    statusBox.textContent =
      "Erro ao carregar eventos. Verifique a planilha e o Apps Script.";
  }
}

searchInput.addEventListener("input", renderMap);
dateFilter.addEventListener("change", () => {
  selectedCalendarDate = null;
  calendarSelection.textContent = "Clique em uma data para filtrar o mapa.";
  renderCalendar();

  todayBtn.classList.toggle("active", dateFilter.value === "hoje");
  todayBtn.textContent =
    dateFilter.value === "hoje"
      ? "✅ Mostrando eventos de hoje"
      : "📅 O que tem hoje?";
  renderMap();
});
regionFilter.addEventListener("change", renderMap);
secretariaFilter.addEventListener("change", renderMap);



dashboardBtn.addEventListener("click", () => {
  if (dashboardPanel.classList.contains("open")) {
    closeDashboard();
  } else {
    openDashboard();
  }
});

closeDashboardBtn.addEventListener("click", closeDashboard);

dashboardShowAllBtn.addEventListener("click", () => {
  searchInput.value = "";
  dateFilter.value = "todos";
  regionFilter.value = "";
  secretariaFilter.value = "";
  selectedCalendarDate = null;
  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  closeDashboard();
  renderCalendar();
  renderMap();
});

calendarBtn.addEventListener("click", () => {
  if (calendarPanel.classList.contains("open")) {
    closeCalendar();
  } else {
    openCalendar();
  }
});

closeCalendarBtn.addEventListener("click", closeCalendar);

prevMonthBtn.addEventListener("click", () => {
  calendarMonth -= 1;

  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear -= 1;
  }

  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  calendarMonth += 1;

  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear += 1;
  }

  renderCalendar();
});

clearCalendarDateBtn.addEventListener("click", () => {
  selectedCalendarDate = null;
  dateFilter.value = "todos";
  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  calendarSelection.textContent = "Mostrando eventos de todas as datas.";
  renderCalendar();
  renderMap();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCalendar();
    closeDashboard();
  }
});

todayBtn.addEventListener("click", () => {
  selectedCalendarDate = null;
  calendarSelection.textContent = "Clique em uma data para filtrar o mapa.";
  renderCalendar();

  const showingToday = dateFilter.value === "hoje";

  if (showingToday) {
    dateFilter.value = "todos";
    todayBtn.classList.remove("active");
    todayBtn.textContent = "📅 O que tem hoje?";
  } else {
    dateFilter.value = "hoje";
    todayBtn.classList.add("active");
    todayBtn.textContent = "✅ Mostrando eventos de hoje";
  }

  renderMap();
});

heatBtn.addEventListener("click", () => {
  heatActive = !heatActive;
  heatBtn.classList.toggle("active", heatActive);
  heatBtn.textContent = heatActive
    ? "🔥 Desligar Mapa de Calor"
    : "🔥 Mapa de Calor";
  renderMap();
});

loadEvents();
