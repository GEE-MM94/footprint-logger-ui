function getToken() {
  return localStorage.getItem("token");
}

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const token = getToken();

const defaultActivityData = JSON.parse(
  localStorage.getItem("activityData")
) || {
  "car travel": 2.3,
  "meat consumption": 5.0,
  "electricity use": 1.2,
};
let activities = JSON.parse(localStorage.getItem("activities")) || [];
let activityTypes =
  JSON.parse(localStorage.getItem("activityTypes")) ||
  Object.keys(defaultActivityData);
let activityCategories = JSON.parse(
  localStorage.getItem("activityCategories")
) || {
  "car travel": "transport",
  "meat consumption": "food",
  "electricity use": "energy",
};
const chartColors = [
  "#f87171",
  "#34d399",
  "#60a5fa",
  "#fbbf24",
  "#c084fc",
  "#a3e635",
  "#f472b6",
  "#38bdf8",
  "#fb923c",
  "#4ade80",
  "#818cf8",
  "#facc15",
  "#2dd4bf",
  "#e879f9",
  "#10b981",
];
const form = document.getElementById("activity-form");
const co2Input = document.getElementById("activity-co2");
const activitySelect = document.getElementById("activity");
const newActivityInput = document.getElementById("new-activity");
const activityList = document.getElementById("activity-list");
const totalDisplay = document.getElementById("total-co2");
const totalContainer = document.getElementById("total-co2-container");
const chartTypeSelect = document.getElementById("chart-type");
const toggleDetails = document.getElementById("toggle-details");
const chartCanvas = document.getElementById("co2-chart");
const resetButton = document.getElementById("reset-data");
const categoryFilter = document.getElementById("category-filter");
const categorySelect = document.getElementById("category-select");
const newCategoryInput = document.getElementById("new-category");
const dateInput = document.getElementById("activity-date");
const activityFilter = document.getElementById("activity-filter");
const userIcon = document.getElementById("user-icon");
const dropdown = document.getElementById("user-dropdown");
let chart;

function saveToLocalStorage() {
  localStorage.setItem("activities", JSON.stringify(activities));
  localStorage.setItem("activityTypes", JSON.stringify(activityTypes));
  localStorage.setItem("activityData", JSON.stringify(defaultActivityData));
  localStorage.setItem(
    "activityCategories",
    JSON.stringify(activityCategories)
  );
}

function getAllCategories() {
  return [...new Set(Object.values(activityCategories))];
}

function renderCategorySelect() {
  categorySelect.innerHTML = "";
  let selectOption = document.createElement("option");
  selectOption.value = "";
  selectOption.textContent = "Select Category";
  categorySelect.appendChild(selectOption);
  getAllCategories().forEach((cat) => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(opt);
  });
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  getAllCategories().forEach((cat) => {
    let opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(opt);
  });
}

function renderActivitySelect() {
  activitySelect.innerHTML = "";
  let selectOption = document.createElement("option");
  selectOption.value = "";
  selectOption.textContent = "Select";
  activitySelect.appendChild(selectOption);
  activityTypes.forEach((act) => {
    let option = document.createElement("option");
    option.value = act;
    option.textContent = act;
    activitySelect.appendChild(option);
  });
  activityFilter.innerHTML = `<option value="all">All</option>`;
  activityTypes.forEach((act) => {
    let opt = document.createElement("option");
    opt.value = act;
    opt.textContent = act;
    activityFilter.appendChild(opt);
  });
}

function renderList() {
  const selectedActivity = activityFilter.value;
  const selectedCategory = categoryFilter.value;
  const filtered = activities.filter((a) => {
    const matchesActivity =
      selectedActivity === "all" || a.activity === selectedActivity;
    const matchesCategory =
      selectedCategory === "all" ||
      activityCategories[a.activity] === selectedCategory;
    return matchesActivity && matchesCategory;
  });
  totalContainer.style.display =
    selectedActivity === "all" && selectedCategory === "all" ? "block" : "none";
  activityList.innerHTML = "";
  if (toggleDetails.checked) {
    filtered.forEach((activity) => {
      let li = document.createElement("li");
      let category = activityCategories[activity.activity] || "uncategorized";
      li.textContent = `${activity.co2} kg - ${activity.activity} (${category}) on ${activity.date}`;
      activityList.appendChild(li);
    });
  }
  totalDisplay.textContent = calculateTotal(filtered);
  updateChart(filtered);
}

function calculateTotal(data) {
  return data.reduce((sum, item) => sum + item.co2, 0).toFixed(2);
}

function updateChart(data) {
  const type = chartTypeSelect.value;
  if (chart) chart.destroy();
  if (type === "line") {
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    const allDates = [...new Set(data.map((a) => a.date))].sort();
    const allActivities = [...new Set(data.map((a) => a.activity))];
    const datasets = allActivities.map((activity, idx) => {
      const activityData = allDates.map((date) => {
        const entries = data.filter(
          (a) => a.date === date && a.activity === activity
        );
        const total = entries.reduce((sum, a) => sum + a.co2, 0);
        return total;
      });
      return {
        label: activity,
        data: activityData,
        fill: false,
        borderColor: chartColors[idx % chartColors.length],
        tension: 0.2,
      };
    });
    chart = new Chart(chartCanvas.getContext("2d"), {
      type: "line",
      data: { labels: allDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: "nearest", axis: "x", intersect: false },
        plugins: { legend: { position: "top" } },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { beginAtZero: true, title: { display: true, text: "CO₂ (kg)" } },
        },
      },
    });
    return;
  }
  const activitySums = data.reduce((acc, a) => {
    acc[a.activity] = (acc[a.activity] || 0) + a.co2;
    return acc;
  }, {});
  const acts = Object.keys(activitySums);
  const values = Object.values(activitySums);
  chart = new Chart(chartCanvas.getContext("2d"), {
    type,
    data: {
      labels: acts,
      datasets: [
        {
          label: "CO₂ by Activity",
          data: values,
          backgroundColor: chartColors.slice(0, acts.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "top" } },
      scales: type === "bar" ? { y: { beginAtZero: true } } : {},
    },
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const co2 = parseFloat(co2Input.value);
  const selectedActivity = activitySelect.value;
  const newActivity = newActivityInput.value.trim();
  const activity = newActivity || selectedActivity;
  const selectedCategory = categorySelect.value;
  const newCategory = newCategoryInput.value.trim();
  const category = newCategory || selectedCategory;
  const selectedDate = dateInput.value;
  if (!activity || !category) return alert("Select activity and category.");
  if (isNaN(co2)) return alert("Enter a valid CO₂ value.");
  if (!activityTypes.includes(activity)) {
    activityTypes.push(activity);
    activityCategories[activity] = category.toLowerCase();
  }
  if (!getAllCategories().includes(category.toLowerCase())) {
    activityCategories[activity] = category.toLowerCase();
  }
  defaultActivityData[activity] = co2;

  const date = selectedDate || new Date().toISOString().split("T")[0];
  const newEntry = { activity, co2, category: category.toLowerCase(), date };
  activities.push({ activity, co2, date });
  saveToLocalStorage();
  renderActivitySelect();
  renderCategorySelect();
  renderList();
  form.reset();
  setDefaultDate();

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const resp = await fetch(`${API_BASE_URL}/activities/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity,
          co2,
          category: category.toLowerCase(),
          date,
        }),
      });
      if (!resp.ok) {
        console.error("Failed to post to API", resp.status);
      }
    } catch (err) {
      console.error("Network error posting activity", err);
    }
  }
});

activitySelect.addEventListener("change", () => {
  const selected = activitySelect.value;
  co2Input.value = defaultActivityData[selected] || "";
});
chartTypeSelect.addEventListener("change", renderList);
toggleDetails.addEventListener("change", renderList);
categoryFilter.addEventListener("change", renderList);
activityFilter.addEventListener("change", renderList);
resetButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    localStorage.clear();
    activities = [];
    activityTypes = Object.keys(defaultActivityData);
    activityCategories = {
      "car travel": "transport",
      "meat consumption": "food",
      "electricity use": "energy",
    };
    saveToLocalStorage();
    renderActivitySelect();
    renderCategorySelect();
    renderList();
    setDefaultDate();
  }
});

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

userIcon.addEventListener("click", () => {
  dropdown.style.display =
    dropdown.style.display === "block" ? "none" : "block";
});
document.addEventListener("click", (event) => {
  if (!userIcon.contains(event.target)) {
    dropdown.style.display = "none";
  }
});
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../home.html";
});

async function loadFromApi() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    let resp = await fetch(`${API_BASE_URL}/activities/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      let body = await resp.json();
      const { logs } = body;
      activities = logs.map((a) => ({
        activity: a.activity,
        co2: a.co2,
        date: a.date,
      }));
      saveToLocalStorage();
      renderActivitySelect();
      renderCategorySelect();
      renderList();
    }
  } catch (err) {
    console.error("Error loading my activities", err);
  }
}

renderActivitySelect();
renderCategorySelect();
setDefaultDate();
renderList();
loadFromApi();
