const API = "http://localhost:5000/api";
let token = localStorage.getItem("token");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login");
const registerBtn = document.getElementById("register");
const logoutBtn = document.getElementById("logout");
const dashboard = document.getElementById("dashboard");
const auth = document.getElementById("auth");
const userNameDisplay = document.getElementById("user-name");

const activityInput = document.getElementById("activity");
const co2Input = document.getElementById("co2");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const addBtn = document.getElementById("add-activity");

const totalDisplay = document.getElementById("total-co2");
const averageDisplay = document.getElementById("average");
const leaderboardList = document.getElementById("leaderboard");

const chartCanvas = document.getElementById("weekly-chart");
let weeklyChart;

function setDateToday() {
  dateInput.value = new Date().toISOString().split("T")[0];
}

async function loginOrRegister(path) {
  const res = await fetch(`${API}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  });
  if (!res.ok) return alert("Authentication failed.");
  const data = await res.json();
  if (data.token) {
    token = data.token;
    localStorage.setItem("token", token);
    loadDashboard();
  } else {
    alert("Registered. Now log in.");
  }
}

loginBtn.onclick = () => loginOrRegister("login");
registerBtn.onclick = () => loginOrRegister("register");

logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  token = null;
  dashboard.style.display = "none";
  auth.style.display = "block";
};

addBtn.onclick = async () => {
  await fetch(`${API}/activities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      activity: activityInput.value,
      co2: parseFloat(co2Input.value),
      category: categoryInput.value,
      date: dateInput.value,
    }),
  });
  activityInput.value = "";
  co2Input.value = "";
  categoryInput.value = "";
  setDateToday();
  loadDashboard();
};

async function loadDashboard() {
  auth.style.display = "none";
  dashboard.style.display = "block";

  const headers = { Authorization: `Bearer ${token}` };

  const me = await fetch(`${API}/activities/me`, { headers });
  const meData = await me.json();
  userNameDisplay.textContent = usernameInput.value;
  totalDisplay.textContent = meData.total.toFixed(2);

  const summary = await fetch(`${API}/activities/summary`, { headers });
  const summaryData = await summary.json();
  renderChart(summaryData);

  const leaderboard = await fetch(`${API}/activities/leaderboard`);
  const lbData = await leaderboard.json();
  leaderboardList.innerHTML = lbData
    .map((u) => `<li>${u.username}: ${u.total.toFixed(2)} kg</li>`)
    .join("");

  const avg = await fetch(`${API}/activities/average`);
  const avgData = await avg.json();
  averageDisplay.textContent = `${avgData.average} kg`;
}

function renderChart(data) {
  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(chartCanvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: "CO₂ (kg)",
          data: data.map((d) => d.total),
          backgroundColor: "#34d399",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

if (token) loadDashboard();
setDateToday();
