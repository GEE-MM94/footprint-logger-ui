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
const checkboxContainer = document.getElementById("activity-checkboxes");
const selectAllButton = document.getElementById("select-all");
const clearAllButton = document.getElementById("clear-all");
const dropdown = document.getElementById("activity-dropdown");
const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
const categoryFilter = document.getElementById("category-filter");
const categorySelect = document.getElementById("category-select");
const newCategoryInput = document.getElementById("new-category");
const dateInput = document.getElementById("activity-date");

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
  const selectOption = document.createElement("option");
  selectOption.value = "";
  selectOption.textContent = "Select Category";
  categorySelect.appendChild(selectOption);
  getAllCategories().forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(opt);
  });
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  getAllCategories().forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(opt);
  });
}

function renderActivityOptions() {
  activitySelect.innerHTML = "";
  const selectOption = document.createElement("option");
  selectOption.value = "";
  selectOption.textContent = "Select";
  activitySelect.appendChild(selectOption);
  checkboxContainer.innerHTML = "";
  activityTypes.forEach((act) => {
    const option = document.createElement("option");
    option.value = act;
    option.textContent = act;
    activitySelect.appendChild(option);
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = act;
    checkbox.checked = true;
    checkbox.addEventListener("change", () => renderList());
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${act}`));
    checkboxContainer.appendChild(label);
  });
}

function renderList() {
  const checkedActivities = Array.from(
    checkboxContainer.querySelectorAll("input[type='checkbox']:checked")
  ).map((cb) => cb.value);
  const selectedCategory = categoryFilter.value;
  const filtered = activities.filter((a) => {
    const matchesCategory =
      selectedCategory === "all" ||
      activityCategories[a.activity] === selectedCategory;
    return checkedActivities.includes(a.activity) && matchesCategory;
  });
  totalContainer.style.display =
    checkedActivities.length === activityTypes.length &&
    selectedCategory === "all"
      ? "block"
      : "none";
  activityList.innerHTML = "";
  if (toggleDetails.checked) {
    filtered.forEach((activity) => {
      const li = document.createElement("li");
      const category = activityCategories[activity.activity] || "uncategorized";
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
        const entry = data.find(
          (a) => a.date === date && a.activity === activity
        );
        return entry ? entry.co2 : 0;
      });
      return {
        label: activity,
        data: activityData,
        fill: false,
        borderColor: chartColors[idx % chartColors.length],
        tension: 0.2,
      };
    });
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekStartIndex = allDates.findIndex(
      (d) => new Date(d) >= startOfWeek
    );
    const scrollIndex = Math.max(weekStartIndex - 3, 0);
    chart = new Chart(chartCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels: allDates,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { beginAtZero: true, title: { display: true, text: "CO₂ (kg)" } },
        },
      },
      plugins: [
        {
          id: "scrollToWeek",
          afterRender: (chartInstance) => {
            const chartArea = chartInstance.chartArea;
            const xAxis = chartInstance.scales.x;
            if (xAxis && xAxis.getPixelForTick) {
              const scrollPixel = xAxis.getPixelForTick(scrollIndex);
              chartCanvas.parentElement.scrollLeft =
                scrollPixel - chartArea.width / 2;
            }
          },
        },
      ],
    });
    return;
  }

  const activitySums = data.reduce((acc, a) => {
    acc[a.activity] = (acc[a.activity] || 0) + a.co2;
    return acc;
  }, {});
  const activities = Object.keys(activitySums);
  const values = Object.values(activitySums);
  chart = new Chart(chartCanvas.getContext("2d"), {
    type,
    data: {
      labels: activities,
      datasets: [
        {
          label: "CO₂ by Activity",
          data: values,
          backgroundColor: chartColors.slice(0, activities.length),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
    },
  });
}

form.addEventListener("submit", (e) => {
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
  activities.push({
    activity,
    co2,
    date: selectedDate || new Date().toISOString().split("T")[0],
  });
  saveToLocalStorage();
  renderActivityOptions();
  renderCategorySelect();
  renderList();
  form.reset();
  setDefaultDate();
});

activitySelect.addEventListener("change", () => {
  const selected = activitySelect.value;
  co2Input.value = defaultActivityData[selected] || "";
});

chartTypeSelect.addEventListener("change", renderList);
toggleDetails.addEventListener("change", renderList);
categoryFilter.addEventListener("change", renderList);

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
    renderActivityOptions();
    renderCategorySelect();
    renderList();
    setDefaultDate();
  }
});

selectAllButton.addEventListener("click", () => {
  checkboxContainer.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.checked = true;
  });
  renderList();
});

clearAllButton.addEventListener("click", () => {
  checkboxContainer.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.checked = false;
  });
  renderList();
});

dropdownToggle.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

renderActivityOptions();
renderCategorySelect();
setDefaultDate();
renderList();
