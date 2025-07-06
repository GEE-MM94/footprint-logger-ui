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

let chart;

function saveToLocalStorage() {
  localStorage.setItem("activities", JSON.stringify(activities));
  localStorage.setItem("activityTypes", JSON.stringify(activityTypes));
  localStorage.setItem("activityData", JSON.stringify(defaultActivityData));
}

function calculateTotal(data) {
  return data.reduce((sum, item) => sum + item.co2, 0).toFixed(2);
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

  const filtered = activities.filter((a) =>
    checkedActivities.includes(a.activity)
  );

  totalContainer.style.display =
    checkedActivities.length === activityTypes.length ? "block" : "none";

  activityList.innerHTML = "";

  if (toggleDetails.checked) {
    filtered.forEach((activity) => {
      const li = document.createElement("li");
      li.textContent = `${activity.co2} kg - ${activity.activity}`;
      activityList.appendChild(li);
    });
  }

  totalDisplay.textContent = calculateTotal(filtered);
  updateChart(filtered);
}

function updateChart(data) {
  const activitySums = data.reduce((acc, a) => {
    acc[a.activity] = (acc[a.activity] || 0) + a.co2;
    return acc;
  }, {});

  const activities = Object.keys(activitySums);
  const values = Object.values(activitySums);
  const type = chartTypeSelect.value;

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas.getContext("2d"), {
    type,
    data: {
      labels: activities,
      datasets: [
        {
          label: "CO₂ by Activity",
          data: values,
          backgroundColor: [
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
          ],
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

  chartCanvas.classList.add("tilt");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let co2 = parseFloat(co2Input.value);
  const selectedActivity = activitySelect.value;
  const newActivity = newActivityInput.value.trim();
  const activity = newActivity || selectedActivity;

  if (!activity) {
    alert("Please select or enter an activity.");
    return;
  }

  if (!activityTypes.includes(activity)) {
    activityTypes.push(activity);
  }

  if (!isNaN(co2)) {
    defaultActivityData[activity] = co2;
  } else if (defaultActivityData[activity] !== undefined) {
    co2 = defaultActivityData[activity];
  }

  if (!isNaN(co2)) {
    activities.push({
      activity,
      co2,
      date: new Date().toISOString(),
    });

    saveToLocalStorage();
    renderActivityOptions();
    renderList();
    form.reset();
  } else {
    alert("Please enter a valid CO₂ value.");
  }
});

activitySelect.addEventListener("change", () => {
  const selected = activitySelect.value;
  if (defaultActivityData[selected] !== undefined) {
    co2Input.value = defaultActivityData[selected];
  } else {
    co2Input.value = "";
  }
});

chartTypeSelect.addEventListener("change", () => {
  renderList();
});

toggleDetails.addEventListener("change", () => {
  renderList();
});

resetButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    localStorage.removeItem("activities");
    localStorage.removeItem("activityTypes");
    localStorage.removeItem("activityData");
    activities = [];
    activityTypes = Object.keys(defaultActivityData);
    saveToLocalStorage();
    renderActivityOptions();
    renderList();
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

renderActivityOptions();
renderList();
