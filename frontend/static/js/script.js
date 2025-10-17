document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = process.env.API_BASE_URL;

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
  const toggleChart = document.getElementById("toggle-chart");
  const chartSection = document.querySelector(".chart-section");
  const profileDetails = document.getElementById("profile-details");
  const avgBtn = document.getElementById("avg-btn");
  const weekBtn = document.getElementById("week-btn");
  const leaderBtn = document.getElementById("leader-btn");
  const profileBtn = document.getElementById("profile-btn");
  const reportSection = document.getElementById("report-section");
  const reportTitle = document.getElementById("report-title");
  const reportContent = document.getElementById("report-content");

  const userIcon = document.getElementById("user-icon");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");
  const usernameDisplay = document.getElementById("username");

  let chart = null;

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

  if (toggleChart && chartSection) {
    toggleChart.addEventListener("change", () => {
      if (toggleChart.checked) {
        chartSection.classList.remove("hidden");
      } else {
        chartSection.classList.add("hidden");
      }
    });
  }

  function updateUserInfo() {
    const token = getToken();
    if (!token || !usernameDisplay) return;
    const payload = parseJwt(token);
    if (payload && payload.username) {
      usernameDisplay.textContent = `Hello, ${payload.username}`;
    }
  }

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
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Category";
    categorySelect.appendChild(defaultOption);

    getAllCategories().forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });

    if (categoryFilter) {
      categoryFilter.innerHTML = `<option value="all">All</option>`;
      getAllCategories().forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        categoryFilter.appendChild(opt);
      });
    }
  }

  function renderActivitySelect() {
    activitySelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select";
    activitySelect.appendChild(defaultOption);

    activityTypes.forEach((act) => {
      const opt = document.createElement("option");
      opt.value = act;
      opt.textContent = act;
      activitySelect.appendChild(opt);
    });

    if (activityFilter) {
      activityFilter.innerHTML = `<option value="all">All</option>`;
      activityTypes.forEach((act) => {
        const opt = document.createElement("option");
        opt.value = act;
        opt.textContent = act;
        activityFilter.appendChild(opt);
      });
    }
  }

  function renderList() {
    const selectedActivity = activityFilter?.value || "all";
    const selectedCategory = categoryFilter?.value || "all";
    const filtered = activities.filter((a) => {
      const matchActivity =
        selectedActivity === "all" || a.activity === selectedActivity;
      const matchCategory =
        selectedCategory === "all" ||
        activityCategories[a.activity] === selectedCategory;
      return matchActivity && matchCategory;
    });

    if (totalContainer) {
      totalContainer.style.display =
        selectedActivity === "all" && selectedCategory === "all"
          ? "block"
          : "none";
    }

    if (activityList) {
      activityList.innerHTML = "";
      if (toggleDetails?.checked) {
        filtered.forEach((activity) => {
          const li = document.createElement("li");
          const category =
            activityCategories[activity.activity] || "uncategorized";
          li.textContent = `${activity.co2} kg - ${activity.activity} (${category}) on ${activity.date}`;
          activityList.appendChild(li);
        });
      }
    }

    if (totalDisplay) {
      totalDisplay.textContent = calculateTotal(filtered);
    }

    updateChart(filtered);
  }

  function showReport(title, content) {
    reportTitle.textContent = title;
    reportContent.textContent = content;
    reportSection.classList.remove("hidden");
    form.classList.add("hidden");
    toggleChart.checked = false;
    toggleChart.dispatchEvent(new Event("change"));
  }

  function updateChart(data) {
    const type = chartTypeSelect?.value || "bar";
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
          return entries.reduce((sum, a) => sum + a.co2, 0);
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
            y: {
              beginAtZero: true,
              title: { display: true, text: "CO₂ (kg)" },
            },
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

  function calculateTotal(data) {
    return data.reduce((sum, item) => sum + item.co2, 0).toFixed(2);
  }

  if (!window.formSubmitListenerAdded) {
    window.formSubmitListenerAdded = true;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const co2 = parseFloat(co2Input.value);
      const selectedActivity = activitySelect.value.trim();
      const newActivity = newActivityInput.value.trim();
      const selectedCategory = categorySelect.value.trim();
      const newCategory = newCategoryInput.value.trim();
      const date = dateInput.value || new Date().toISOString().split("T")[0];

      const activity = newActivity !== "" ? newActivity : selectedActivity;
      const category = newCategory !== "" ? newCategory : selectedCategory;

      if (!activity || activity === "Select...")
        return alert("Please enter or select a valid activity.");
      if (!category || category === "Select...")
        return alert("Please enter or select a valid category.");
      if (isNaN(co2)) return alert("Please enter a valid CO₂ value.");

      if (!activityTypes.includes(activity)) activityTypes.push(activity);

      activityCategories[activity] = category.toLowerCase();
      defaultActivityData[activity] = co2;
      activities.push({ activity, co2, date });

      saveToLocalStorage();
      renderActivitySelect();
      renderCategorySelect();
      renderList();
      form.reset();
      setDefaultDate();

      const token = getToken();
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

          if (!resp.ok) console.error("Failed to post activity", resp.status);
        } catch (err) {
          console.error("Network error", err);
        }
      }
    });
  }

  avgBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/average-emissions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      showReport("Average CO₂ Emissions", `${data.average} kg`);
    } catch {
      alert("Error fetching average emissions");
    }
  });

  weekBtn?.addEventListener("click", async () => {
    const token = getToken();
    if (!token) return alert("Please log in");

    try {
      const res = await fetch(`${API_BASE_URL}/activities/weekly-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const summary = Object.entries(data.daily)
        .map(([date, co2]) => `${date}: ${co2.toFixed(2)} kg`)
        .join("\n");

      showReport("Weekly CO₂ Summary", summary);
    } catch {
      alert("Error fetching weekly summary");
    }
  });

  leaderBtn?.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/activities/leaderboard`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      const leaderboard = data.leaderboard
        .map(
          ({ username, total }, index) =>
            `#${index + 1} - ${username} has only used  ${total} kg`
        )
        .join("\n\n\n");

      showReport("Leaderboard (Lowest CO₂)", leaderboard);
    } catch {
      alert("Error fetching leaderboard");
    }
  });

  activitySelect.addEventListener("change", () => {
    const selected = activitySelect.value;
    co2Input.value = defaultActivityData[selected] || "";
  });

  chartTypeSelect?.addEventListener("change", renderList);
  toggleDetails?.addEventListener("change", renderList);
  categoryFilter?.addEventListener("change", renderList);
  activityFilter?.addEventListener("change", renderList);

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
    if (dateInput) dateInput.value = today;
  }

  function logout() {
    localStorage.clear();
    window.location.href = "../public/home.html";
  }

  async function loadFromApi() {
    const token = getToken();
    if (!token) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/activities/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const body = await resp.json();
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
      console.error("Error loading activities", err);
    }
  }

  profileBtn?.addEventListener("click", () => {
    const token = getToken();
    const user = token ? parseJwt(token) : null;

    if (user) {
      const modal = document.getElementById("profile-modal");
      profileDetails.textContent = `Are you sure you want to log out ${user.username} ?`;
      modal.classList.remove("hidden");
    } else {
      alert("You are not logged in.");
    }
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    logout();
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("profile-modal").classList.add("hidden");
  });

  renderActivitySelect();
  renderCategorySelect();
  setDefaultDate();
  renderList();
  updateUserInfo();
  loadFromApi();
});
