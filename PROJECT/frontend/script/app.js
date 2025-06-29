// ===========================
// GLOBAL VARIABLES & CONFIG
// ===========================

// API Configuration
const API_BASE_URL = "http://localhost/backend/api"

// Global state variables
let goals = []
let tugasList = []
let notesList = []
let trashItems = []
let editingIndex = -1
let editingNoteIndex = -1
let currentPage = ""
let currentPreviewItem = null
let confirmAction = null

// Calendar variables
let currentDate = new Date()
let currentView = "month"
let selectedDate = null
let events = []
let currentWeekStart = null

// Notes variables
let notesView = "grid"

// ===========================
// USER SESSION MANAGEMENT
// ===========================

class UserSession {
  static setUser(userData) {
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("user_id", userData.user_id)
    localStorage.setItem("token", userData.token)
  }

  static getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }

  static getUserId() {
    return localStorage.getItem("user_id")
  }

  static getToken() {
    return localStorage.getItem("token")
  }

  static clearSession() {
    localStorage.removeItem("user")
    localStorage.removeItem("user_id")
    localStorage.removeItem("token")
  }

  static isLoggedIn() {
    return this.getUser() !== null && this.getUserId() !== null
  }
}

// ===========================
// API HELPER FUNCTIONS
// ===========================

class API {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  static async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url)
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async delete(endpoint, data) {
    return this.request(endpoint, {
      method: "DELETE",
      body: JSON.stringify(data),
    })
  }
}

// Auth API
class AuthAPI {
  static async login(email, password) {
    return API.post("auth.php", {
      action: "login",
      email: email,
      password: password,
    })
  }

  static async register(nama, email, password) {
    return API.post("auth.php", {
      action: "register",
      nama: nama,
      email: email,
      password: password,
    })
  }

  static async deleteAccount() {
    const userId = UserSession.getUserId();
    return API.post("auth.php", {
      action: "delete_account",
      user_id: userId,
    });
  }

}

// Tujuan API
class TujuanAPI {
  static async getAll() {
    const userId = UserSession.getUserId()
    return API.get("tujuan.php", { user_id: userId })
  }

  static async create(tujuanData) {
    const userId = UserSession.getUserId()
    return API.post("tujuan.php", { ...tujuanData, user_id: userId })
  }

  static async update(tujuanData) {
    const userId = UserSession.getUserId()
    return API.put("tujuan.php", { ...tujuanData, user_id: userId })
  }

  static async delete(tujuanId) {
    const userId = UserSession.getUserId()
    return API.delete("tujuan.php", { id: tujuanId, user_id: userId })
  }
}

// Tugas API
class TugasAPI {
  static async getAll() {
    const userId = UserSession.getUserId()
    return API.get("tugas.php", { user_id: userId })
  }

  static async create(tugasData) {
    const userId = UserSession.getUserId()
    return API.post("tugas.php", { ...tugasData, user_id: userId })
  }

  static async update(tugasData) {
    const userId = UserSession.getUserId()
    return API.put("tugas.php", { ...tugasData, user_id: userId })
  }

  static async delete(tugasId) {
    const userId = UserSession.getUserId()
    return API.delete("tugas.php", { id: tugasId, user_id: userId })
  }
}

// Catatan API
class CatatanAPI {
  static async getAll() {
    const userId = UserSession.getUserId()
    return API.get("catatan.php", { user_id: userId })
  }

  static async create(catatanData) {
    const userId = UserSession.getUserId()
    return API.post("catatan.php", { ...catatanData, user_id: userId })
  }

  static async update(catatanData) {
    const userId = UserSession.getUserId()
    return API.put("catatan.php", { ...catatanData, user_id: userId })
  }

  static async delete(catatanId) {
    const userId = UserSession.getUserId()
    return API.delete("catatan.php", { id: catatanId, user_id: userId })
  }
}

// ===========================
// SIDEBAR & NAVIGATION
// ===========================

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  sidebar.style.pointerEvents = "none"
  sidebar.classList.toggle("collapsed")
  setTimeout(() => {
    sidebar.style.pointerEvents = "auto"
  }, 400)
}

function handleResize() {
  const sidebar = document.getElementById("sidebar")
  if (window.innerWidth <= 768) {
    sidebar.classList.add("collapsed")
  } else {
    sidebar.classList.remove("collapsed")
  }
}

window.addEventListener("load", () => {
  document.getElementById("sidebar").style.transition = "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
})
window.addEventListener("resize", handleResize)
handleResize()

// Enhanced dropdown functionality
document.querySelectorAll(".dropdown-btn").forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    const navItem = this.closest(".nav-item")
    const isCurrentlyOpen = navItem.classList.contains("open")

    // Close all other dropdowns
    document.querySelectorAll(".nav-item.open").forEach((item) => {
      if (item !== navItem) {
        item.classList.remove("open")
      }
    })

    // Toggle current dropdown
    navItem.classList.toggle("open")
  })
})

// Enhanced Rencana menu click functionality
document.addEventListener("DOMContentLoaded", () => {
  const rencanaNavLink = document.getElementById("rencanaNavLink")
  const rencanaNavItem = document.getElementById("rencanaNavItem")

  const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
  if (logoutBtnSidebar) {
      logoutBtnSidebar.addEventListener("click", () => {
          confirmLogout(); // Panggil fungsi konfirmasi yang sama dengan di settings
      });
  }

  if (rencanaNavLink) {
    rencanaNavLink.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Toggle dropdown when clicking on Rencana menu
      const isCurrentlyOpen = rencanaNavItem.classList.contains("open")

      // Close all other dropdowns first
      document.querySelectorAll(".nav-item.open").forEach((item) => {
        if (item !== rencanaNavItem) {
          item.classList.remove("open")
        }
      })

      // Toggle the Rencana dropdown
      rencanaNavItem.classList.toggle("open")

      // If opening and no submenu is active, load the first submenu item (Tujuan)
      if (!isCurrentlyOpen && !document.querySelector(".nav-sublink.active")) {
        setTimeout(() => {
          loadPage("Tujuan")
        }, 300) // Small delay to allow dropdown animation
      }
    })
  }
})

// Enhanced active menu management
function setActiveMenu(page) {
  // Clear all active states
  document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"))
  document.querySelectorAll(".nav-sublink").forEach((item) => item.classList.remove("active"))

  // Check if it's a submenu page (Tujuan or Tugas)
  const isSubMenuPage = ["Tujuan", "Tugas"].includes(page)

  if (isSubMenuPage) {
    // Activate the submenu item
    const activeSubMenu = document.querySelector(`.nav-sublink[data-page="${page}"]`)
    if (activeSubMenu) {
      activeSubMenu.classList.add("active")

      // Also activate the parent Rencana menu
      const rencanaMenuItem = document.getElementById("rencanaMenuItem")
      if (rencanaMenuItem) {
        rencanaMenuItem.classList.add("active")
      }

      // Ensure the dropdown is open
      const rencanaNavItem = document.getElementById("rencanaNavItem")
      if (rencanaNavItem) {
        rencanaNavItem.classList.add("open")
      }
    }
  } else {
    // For non-submenu pages, activate normally
    const activeMenu = document.querySelector(`.nav-link[data-page="${page}"]`)
    if (activeMenu) {
      activeMenu.closest(".menu-item").classList.add("active")
    }

    // Close Rencana dropdown if it's open and we're not on a submenu page
    const rencanaNavItem = document.getElementById("rencanaNavItem")
    if (rencanaNavItem && !isSubMenuPage) {
      rencanaNavItem.classList.remove("open")
    }
  }
}

function loadPage(page) {
  // Check if it's the Settings page - open popup
  if (page === "Setting") {
    openSettings()
    return
  }

  const content = document.getElementById("content")
  const pageFile = `pages/${page}.html`

  fetch(pageFile)
    .then((response) => {
      if (!response.ok) throw new Error("Halaman tidak ditemukan")
      return response.text()
    })
    .then(async (data) => {
      content.innerHTML = data
      setActiveMenu(page)
      window.location.hash = page

      // Initialize pages with async support
      if (page === "Beranda") {
        await initBerandaPage()
      } else if (page === "Tujuan") {
        await initTujuanPage()
      } else if (page === "Tugas") {
        await initTugasPage()
      } else if (page === "Kalender") {
        initKalenderPage()
      } else if (page === "Catatan") {
        await initCatatanPage()
      } else if (page === "Sampah") {
        initSampahPage()
      }
    })
    .catch((error) => {
      console.error("Error loading page:", error)
      content.innerHTML = `<h2>${error.message}</h2>`
    })
}

// Enhanced navigation event listeners
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    const page = this.getAttribute("data-page")

    // Don't prevent default for Rencana menu - it's handled separately
    if (page !== null && page !== "Rencana") {
      e.preventDefault()
      loadPage(page)
    }
  })
})

// Enhanced submenu navigation
document.querySelectorAll(".nav-sublink").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault()
    const page = this.getAttribute("data-page")
    if (page) {
      loadPage(page)
    }
  })
})

window.addEventListener("hashchange", () => {
  const page = window.location.hash.replace("#", "")
  if (page && page !== "Setting") loadPage(page)
})

window.addEventListener("load", () => {
  if (window.location.hash) {
    const page = window.location.hash.replace("#", "")
    if (page !== "Setting") {
      loadPage(page)
    }
  } else {
    loadPage("Beranda")
  }
})

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const isDropdownClick = e.target.closest(".dropdown-btn") || e.target.closest('.nav-link[data-page="Rencana"]')
  const isInsideDropdown = e.target.closest(".nav-item.open")

  if (!isDropdownClick && !isInsideDropdown) {
    document.querySelectorAll(".nav-item.open").forEach((item) => {
      item.classList.remove("open")
    })
  }
})

// ===========================
// DASHBOARD/BERANDA FUNCTIONS
// ===========================

// Initialize dashboard when Beranda page loads
async function initBerandaPage() {
  updateTodayDate();
  await loadDashboardSummary();
  await loadTodayActivities();
  updateProgressOverview();
  const user = UserSession.getUser();
  const subtitleElement = document.querySelector('.content-subtitle');
  if (user && subtitleElement) {
      subtitleElement.textContent = `Selamat datang kembali, ${user.nama}! Berikut ringkasan aktivitas Anda hari ini.`;
  }
}

// Update today's date display
function updateTodayDate() {
  const today = new Date()
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const dayName = days[today.getDay()]
  const dayNumber = today.getDate()
  const monthYear = `${months[today.getMonth()]} ${today.getFullYear()}`

  const todayDayElement = document.getElementById("todayDay")
  const todayNumberElement = document.getElementById("todayNumber")
  const todayMonthYearElement = document.getElementById("todayMonthYear")

  if (todayDayElement) todayDayElement.textContent = dayName
  if (todayNumberElement) todayNumberElement.textContent = dayNumber
  if (todayMonthYearElement) todayMonthYearElement.textContent = monthYear
}

// Load dashboard summary data
async function loadDashboardSummary() {
  try {
    // Load Notes Summary
    const notesSummary = await getNotesData()
    updateNotesDisplay(notesSummary)

    // Load Goals Summary
    const goalsSummary = await getGoalsData()
    updateGoalsDisplay(goalsSummary)

    // Load Tasks Summary
    const tasksSummary = await getTasksData()
    updateTasksDisplay(tasksSummary)
  } catch (error) {
    console.error("Error loading dashboard summary:", error)
  }
}

// Get notes data for summary
async function getNotesData() {
  try {
    const notes = await CatatanAPI.getAll()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    return {
      total: notes.length,
      pinned: notes.filter((note) => note.isPinned).length,
      recent: notes.filter((note) => new Date(note.createdAt) >= oneWeekAgo).length,
    }
  } catch (error) {
    console.error("Error loading notes data:", error)
    return { total: 0, pinned: 0, recent: 0 }
  }
}

// Get goals data for summary
async function getGoalsData() {
  try {
    const goals = await TujuanAPI.getAll()
    return {
      total: goals.length,
      completed: goals.filter((goal) => goal.completed).length,
      active: goals.filter((goal) => !goal.completed).length,
      averageProgress:
        goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) : 0,
    }
  } catch (error) {
    console.error("Error loading goals data:", error)
    return { total: 0, completed: 0, active: 0, averageProgress: 0 }
  }
}

// Get tasks data for summary
async function getTasksData() {
  try {
    const tasks = await TugasAPI.getAll()
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
    }
  } catch (error) {
    console.error("Error loading tasks data:", error)
    return { total: 0, completed: 0, pending: 0 }
  }
}

// Update notes display
function updateNotesDisplay(summary) {
  const totalElement = document.getElementById("totalNotes")
  const pinnedElement = document.getElementById("pinnedNotes")
  const recentElement = document.getElementById("recentNotes")

  if (totalElement) totalElement.textContent = summary.total
  if (pinnedElement) pinnedElement.textContent = summary.pinned
  if (recentElement) recentElement.textContent = summary.recent
}

// Update goals display
function updateGoalsDisplay(summary) {
  const totalElement = document.getElementById("totalGoals")
  const completedElement = document.getElementById("completedGoals")
  const activeElement = document.getElementById("activeGoals")

  if (totalElement) totalElement.textContent = summary.total
  if (completedElement) completedElement.textContent = summary.completed
  if (activeElement) activeElement.textContent = summary.active
}

// Update tasks display
function updateTasksDisplay(summary) {
  const totalElement = document.getElementById("totalTasks")
  const completedElement = document.getElementById("completedTasks")
  const pendingElement = document.getElementById("pendingTasks")

  if (totalElement) totalElement.textContent = summary.total
  if (completedElement) completedElement.textContent = summary.completed
  if (pendingElement) pendingElement.textContent = summary.pending
}

// Load today's activities
async function loadTodayActivities() {
  await loadTodayTasks()
  await loadUpcomingGoals()
}

// Load tasks for today
async function loadTodayTasks() {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    // Get tasks from goals and standalone tasks
    const goals = await TujuanAPI.getAll()
    const tasks = await TugasAPI.getAll()

    const todayTasks = []

    // Get tasks from goals
    goals.forEach((goal) => {
      if (goal.tasks && goal.tasks.length > 0) {
        goal.tasks.forEach((task) => {
          if (task.deadline === todayStr && !task.completed) {
            todayTasks.push({
              ...task,
              type: "goal-task",
              parentGoal: goal.title,
              category: goal.category,
            })
          }
        })
      }
    })

    // Get standalone tasks due today
    tasks.forEach((task) => {
      if (task.targetDate === todayStr && !task.completed) {
        todayTasks.push({
          ...task,
          type: "standalone-task",
        })
      }
    })

    // Sort by priority
    todayTasks.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    })

    updateTodayTasksDisplay(todayTasks)
  } catch (error) {
    console.error("Error loading today tasks:", error)
  }
}

// Load goals with upcoming deadlines
async function loadUpcomingGoals() {
  try {
    const goals = await TujuanAPI.getAll()
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const upcomingGoals = goals
      .filter((goal) => {
        if (goal.completed) return false

        const targetDate = new Date(goal.targetDate)
        return targetDate >= today && targetDate <= nextWeek
      })
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))

    updateUpcomingGoalsDisplay(upcomingGoals)
  } catch (error) {
    console.error("Error loading upcoming goals:", error)
  }
}

// Update today's tasks display
function updateTodayTasksDisplay(tasks) {
  const countElement = document.getElementById("todayTaskCount")
  const listElement = document.getElementById("todayTasksList")

  if (countElement) countElement.textContent = tasks.length

  if (listElement) {
    if (tasks.length === 0) {
      listElement.innerHTML = `
                <div class="empty-activity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <p>Tidak ada tugas untuk hari ini</p>
                </div>
            `
    } else {
      listElement.innerHTML = tasks.map((task) => createTaskItemHTML(task)).join("")
    }
  }
}

// Update upcoming goals display
function updateUpcomingGoalsDisplay(goals) {
  const countElement = document.getElementById("upcomingGoalCount")
  const listElement = document.getElementById("upcomingGoalsList")

  if (countElement) countElement.textContent = goals.length

  if (listElement) {
    if (goals.length === 0) {
      listElement.innerHTML = `
                <div class="empty-activity">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <p>Tidak ada deadline yang mendekat</p>
                </div>
            `
    } else {
      listElement.innerHTML = goals.map((goal) => createGoalItemHTML(goal)).join("")
    }
  }
}

// Create task item HTML
function createTaskItemHTML(task) {
  const today = new Date()
  const deadline = new Date(task.deadline || task.targetDate)
  const isUrgent = deadline.toDateString() === today.toDateString()

  const priorityColors = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
  }

  return `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">${escapeHtml(task.title)}</div>
                <div class="activity-meta">
                    <span class="activity-category" style="background-color: ${priorityColors[task.priority] || "#6B7280"}20; color: ${priorityColors[task.priority] || "#6B7280"};">
                        ${task.priority || "Normal"}
                    </span>
                    ${task.parentGoal ? `<span>dari: ${escapeHtml(task.parentGoal)}</span>` : ""}
                    <div class="activity-deadline ${isUrgent ? "urgent" : ""}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${isUrgent ? "Hari ini" : formatDate(task.deadline || task.targetDate)}
                    </div>
                </div>
            </div>
        </div>
    `
}

// Create goal item HTML
function createGoalItemHTML(goal) {
  const today = new Date()
  const deadline = new Date(goal.targetDate)
  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))

  let deadlineClass = ""
  let deadlineText = ""

  if (daysLeft <= 1) {
    deadlineClass = "urgent"
    deadlineText = daysLeft === 0 ? "Hari ini" : "Besok"
  } else if (daysLeft <= 3) {
    deadlineClass = "soon"
    deadlineText = `${daysLeft} hari lagi`
  } else {
    deadlineText = `${daysLeft} hari lagi`
  }

  return `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">${escapeHtml(goal.title)}</div>
                <div class="activity-meta">
                    <span class="activity-category">${escapeHtml(goal.category)}</span>
                    <span>Progress: ${goal.progress || 0}%</span>
                    <div class="activity-deadline ${deadlineClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${deadlineText}
                    </div>
                </div>
            </div>
        </div>
    `
}

// Update progress overview
async function updateProgressOverview() {
  try {
    // Calculate productivity based on completed tasks
    const goals = await TujuanAPI.getAll()
    const tasks = await TugasAPI.getAll()

    // Productivity calculation
    const totalTasks = tasks.length + goals.reduce((sum, goal) => sum + (goal.tasks ? goal.tasks.length : 0), 0)
    const completedTasks =
      tasks.filter((t) => t.completed).length +
      goals.reduce((sum, goal) => sum + (goal.tasks ? goal.tasks.filter((t) => t.completed).length : 0), 0)

    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Goals progress calculation
    const goalsProgress =
      goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) : 0

    // Consistency calculation (simulated based on activity)
    const consistency = Math.min(85 + Math.floor(Math.random() * 15), 100)

    // Update displays
    updateProgressDisplay("productivity", productivity)
    updateProgressDisplay("goals", goalsProgress)
    updateProgressDisplay("consistency", consistency)
  } catch (error) {
    console.error("Error updating progress overview:", error)
  }
}

// Update individual progress display
function updateProgressDisplay(type, percentage) {
  const percentageElement = document.getElementById(`${type}Percentage`)
  const progressElement = document.getElementById(`${type}Progress`)

  if (percentageElement) percentageElement.textContent = `${percentage}%`
  if (progressElement) {
    progressElement.style.width = `${percentage}%`
  }
}

// ===========================
// TUJUAN (GOALS) MANAGEMENT
// ===========================

// Initialize goals
async function initGoals() {
  try {
    goals = await TujuanAPI.getAll()
    goals.forEach((goal) => {
      if (!goal.tasks || !Array.isArray(goal.tasks)) {
        goal.tasks = []
      }
    })
  } catch (error) {
    console.error("Error loading goals:", error)
    goals = []
  }
}

// Render goals
function renderGoals() {
  const goalsGrid = document.getElementById("goalsGrid")
  const emptyState = document.getElementById("emptyState")
  if (!goalsGrid || !emptyState) return

  const filteredGoals = getFilteredGoals()

  if (filteredGoals.length === 0) {
    goalsGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }
  goalsGrid.style.display = "grid"
  emptyState.style.display = "none"

  goalsGrid.innerHTML = filteredGoals
    .map((goal) => {
      const originalIndex = goals.findIndex((g) => g.id === goal.id)
      const totalTasks = Array.isArray(goal.tasks) ? goal.tasks.length : 0
      const completedTasks = goal.tasks.filter((task) => task.completed).length
      const progress = totalTasks == 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

      return `
        <div class="goal-card ${goal.completed ? "completed" : ""}">
            <div class="goal-header">
                <div>
                    <h3 class="goal-title">${goal.title}</h3>
                    <span class="goal-category">${goal.category || ""}</span>
                    <button class="add-task-btn" onclick="openTaskModal(${originalIndex})">+ Add Task</button>
                </div>
            </div>
            <p class="goal-description">${goal.description || "Tidak ada deskripsi"}</p>
            <div class="goal-progress">
                <div class="progress-header">
                    <span class="progress-label">Progress</span>
                    <span class="progress-percentage">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="goal-tasks" id="taskList-${originalIndex}">
                <h4 style="color: var(--primary-color);">Tasks:</h4>
                <ul>
                    ${goal.tasks
                      .map(
                        (task) => `
                        <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
                            <span class="task-title">${task.title}</span>
                            <span class="task-priority">${task.priority}</span>
                            <span class="task-deadline">${task.deadline}</span>
                            <button class="task-complete-btn" onclick="toggleTaskCompletion(${originalIndex}, ${task.id})">
                                ${task.completed ? "Undo" : "Complete"}
                            </button>
                            <button class="task-delete-btn" onclick="deleteTask(${originalIndex}, ${task.id})">Delete</button>
                        </li>
                    `,
                      )
                      .join("")}
                </ul>
            </div>
            <div class="goal-timeline">
                <div class="timeline-item">
                    <span class="timeline-label">Mulai</span>
                    <span class="timeline-date">${formatDate(goal.startDate)}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Target</span>
                    <span class="timeline-date">${formatDate(goal.targetDate)}</span>
                </div>
            </div>
            <div class="goal-actions">
                ${
                  !goal.completed
                    ? `
                    <button class="action-btn complete-btn" onclick="toggleComplete(${originalIndex}, goals, renderGoals)">Selesai</button>
                `
                    : `
                    <button class="action-btn" style="background: var(--subtext);" onclick="toggleComplete(${originalIndex}, goals, renderGoals)">Batal</button>
                `
                }
                <button class="action-btn edit-btn" onclick="editGoal(${originalIndex})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteGoal(${originalIndex})">Hapus</button>
            </div>
        </div>
        `
    })
    .join("")
}

// Get filtered goals
function getFilteredGoals() {
  if (!goals) return []

  let filtered = [...goals]

  // Filter berdasarkan search term
  const searchTerm = document.getElementById("searchTujuan")?.value.toLowerCase().trim()
  if (searchTerm) {
    filtered = filtered.filter(
      (goal) =>
        goal.title.toLowerCase().includes(searchTerm) ||
        goal.description.toLowerCase().includes(searchTerm) ||
        goal.category.toLowerCase().includes(searchTerm),
    )
  }

  return filtered
}

// Handle goal form submission
async function handleGoalFormSubmit(e) {
  e.preventDefault()

  const titleInput = document.getElementById("goalTitle")
  if (!titleInput || !titleInput.value.trim()) {
    alert("Judul tujuan harus diisi")
    return
  }

  const startDate = document.getElementById("startDate").value
  const targetDate = document.getElementById("targetDate").value
  if (startDate && targetDate && targetDate < startDate) {
    alert("Tanggal target selesai tidak boleh sebelum tanggal mulai!")
    return
  }

  const goalData = {
    title: titleInput.value.trim(),
    description: document.getElementById("goalDescription").value.trim(),
    category: document.getElementById("goalCategory").value,
    startDate,
    targetDate,
    progress: editingIndex >= 0 ? goals[editingIndex].progress : 0,
    completed: editingIndex >= 0 ? goals[editingIndex].completed : false,
  }

  try {
    if (editingIndex >= 0) {
      // Update existing goal
      goalData.id = goals[editingIndex].id
      await TujuanAPI.update(goalData)
      goals[editingIndex] = { ...goals[editingIndex], ...goalData }
    } else {
      // Create new goal
      await TujuanAPI.create(goalData)
      // Reload goals from server
      await initGoals()
    }

    renderGoals()
    closeModal()
    editingIndex = -1

    // Show success message
    showNotification("Tujuan berhasil disimpan!", "success")
  } catch (error) {
    console.error("Error saving goal:", error)
    alert("Gagal menyimpan tujuan: " + error.message)
  }
}

// Delete goal
async function deleteGoal(index) {
  if (confirm("Apakah Anda yakin ingin menghapus tujuan ini? Item akan dipindahkan ke sampah.")) {
    try {
      const goal = goals[index]
      await TujuanAPI.delete(goal.id)
      goals.splice(index, 1)
      renderGoals()
      showNotification("Tujuan berhasil dihapus!", "success")
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Gagal menghapus tujuan: " + error.message)
    }
  }
}

// Edit goal
function editGoal(index) {
  if (index < 0 || index >= goals.length) return
  const goal = goals[index]
  editingIndex = index
  document.getElementById("goalTitle").value = goal.title
  document.getElementById("goalDescription").value = goal.description || ""
  document.getElementById("goalCategory").value = goal.category
  document.getElementById("startDate").value = goal.startDate
  document.getElementById("targetDate").value = goal.targetDate
  document.getElementById("modalTitle").textContent = "Edit Tujuan"
  const startDateInput = document.getElementById("startDate")
  const targetDateInput = document.getElementById("targetDate")
  if (startDateInput && targetDateInput) {
    startDateInput.min = ""
    targetDateInput.min = goal.startDate
  }
  document.getElementById("goalModal").classList.add("active")
  setTimeout(() => {
    dateValidation()
  }, 100)
}

// Toggle complete
async function toggleComplete(index, dataList, renderFunction) {
  if (index < 0 || index >= dataList.length) return;

  const goal = dataList[index];
  // Toggle status
  goal.completed = !goal.completed;

  // Set progress ke 100 jika selesai, atau kembali ke kalkulasi jika dibatalkan
  if (goal.completed) {
      goal.progress = 100;
  } else {
      const totalTasks = Array.isArray(goal.tasks) ? goal.tasks.length : 0;
      const completedTasks = goal.tasks.filter(task => task.completed).length;
      goal.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  }

  try {
    await TujuanAPI.update(goal);
    showNotification(`Status tujuan "${goal.title}" berhasil diperbarui.`, 'success');
    renderFunction();
  } catch (error) {
    // Kembalikan status jika gagal
    goal.completed = !goal.completed; 
    console.error("Gagal memperbarui status tujuan:", error);
    showNotification("Gagal memperbarui status tujuan.", "error");
    renderFunction();
  }
}

// Initialize Tujuan page
async function initTujuanPage() {
  currentPage = "Tujuan"
  await initGoals()
  renderGoals()

  const form = document.getElementById("goalForm")
  if (form) {
    form.removeEventListener("submit", handleGoalFormSubmit)
    form.addEventListener("submit", handleGoalFormSubmit)
  }
  const goalModal = document.getElementById("goalModal")
  if (goalModal) {
    goalModal.addEventListener("click", function (e) {
      if (e.target === this) closeModal()
    })
  }
  const startDateInput = document.getElementById("startDate")
  if (startDateInput && !startDateInput.value) {
    startDateInput.value = new Date().toISOString().split("T")[0]
  }
  dateValidation()
  setupSearchFunctionality()
}

// ===========================
// TUGAS (TASKS) MANAGEMENT
// ===========================

// Initialize tugas
async function initTugas() {
  try {
    tugasList = await TugasAPI.getAll()
  } catch (error) {
    console.error("Error loading tugas:", error)
    tugasList = []
  }
}

// Save tugas (handled by API)
async function saveTugas() {
  console.log("Tugas saved to database")
}

// Render tugas
function renderTugas() {
  const tugasGrid = document.getElementById("goalsGrid")
  const emptyState = document.getElementById("emptyState")
  if (!tugasGrid || !emptyState) return

  const filteredTugas = getFilteredTugas()

  if (filteredTugas.length === 0) {
    tugasGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }
  tugasGrid.style.display = "grid"
  emptyState.style.display = "none"

  tugasGrid.innerHTML = filteredTugas
    .map((tugas) => {
      // Cari index asli dari tugasList
      const originalIndex = tugasList.findIndex((t) => t.id === tugas.id)

      return `
        <div class="goal-card ${tugas.completed ? "completed" : ""}">
            <div class="goal-header">
                <h3 class="goal-title">${tugas.title}</h3>
                <span class="goal-category">${tugas.category || ""}</span>
            </div>
            <p class="goal-description">${tugas.description || "Tidak ada deskripsi"}</p>
            <div class="goal-timeline">
                <div class="timeline-item">
                    <span class="timeline-label">Mulai</span>
                    <span class="timeline-date">${formatDate(tugas.startDate)}</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-label">Deadline</span>
                    <span class="timeline-date">${formatDate(tugas.targetDate)}</span>
                </div>
            </div>
            <div class="goal-actions">
                ${
                  !tugas.completed
                    ? `
                    <button class="action-btn complete-btn" onclick="toggleCompleteTugas(${originalIndex})">Selesai</button>
                `
                    : `
                    <button class="action-btn" style="background: var(--subtext);" onclick="toggleCompleteTugas(${originalIndex})">Batal</button>
                `
                }
                <button class="action-btn edit-btn" onclick="editTugas(${originalIndex})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteTugas(${originalIndex})">Hapus</button>
            </div>
        </div>
    `
    })
    .join("")
}

// Get filtered tugas
function getFilteredTugas() {
  if (!tugasList) return []

  let filtered = [...tugasList]

  // Filter berdasarkan search term
  const searchTerm = document.getElementById("searchTugas")?.value.toLowerCase().trim()
  if (searchTerm) {
    filtered = filtered.filter(
      (tugas) =>
        tugas.title.toLowerCase().includes(searchTerm) ||
        tugas.description.toLowerCase().includes(searchTerm) ||
        tugas.category.toLowerCase().includes(searchTerm),
    )
  }

  return filtered
}

// Handle tugas form submission
async function handleTugasFormSubmit(e) {
  e.preventDefault()

  const titleInput = document.getElementById("goalTitle")
  if (!titleInput || !titleInput.value.trim()) {
    alert("Judul tugas harus diisi")
    return
  }

  const startDate = document.getElementById("startDate").value
  const targetDate = document.getElementById("targetDate").value
  if (startDate && targetDate && targetDate < startDate) {
    alert("Tanggal target selesai tidak boleh sebelum tanggal mulai!")
    return
  }

  const tugasData = {
    title: titleInput.value.trim(),
    description: document.getElementById("goalDescription").value.trim(),
    category: document.getElementById("goalCategory").value,
    startDate,
    targetDate,
    completed: editingIndex >= 0 ? tugasList[editingIndex].completed : false,
  }

  try {
    if (editingIndex >= 0) {
      // Update existing tugas
      tugasData.id = tugasList[editingIndex].id
      await TugasAPI.update(tugasData)
      tugasList[editingIndex] = { ...tugasList[editingIndex], ...tugasData }
    } else {
      // Create new tugas
      await TugasAPI.create(tugasData)
      // Reload tugas from server
      await initTugas()
    }

    renderTugas()
    closeModal()
    editingIndex = -1

    // Show success message
    showNotification("Tugas berhasil disimpan!", "success")
  } catch (error) {
    console.error("Error saving tugas:", error)
    alert("Gagal menyimpan tugas: " + error.message)
  }
}

// Delete tugas
async function deleteTugas(index) {
  if (confirm("Apakah Anda yakin ingin menghapus tugas ini? Item akan dipindahkan ke sampah.")) {
    try {
      const tugas = tugasList[index]
      await TugasAPI.delete(tugas.id)
      tugasList.splice(index, 1)
      renderTugas()
      showNotification("Tugas berhasil dihapus!", "success")
    } catch (error) {
      console.error("Error deleting tugas:", error)
      alert("Gagal menghapus tugas: " + error.message)
    }
  }
}

// Edit tugas
function editTugas(index) {
  if (index < 0 || index >= tugasList.length) return
  const tugas = tugasList[index]
  editingIndex = index
  document.getElementById("goalTitle").value = tugas.title
  document.getElementById("goalDescription").value = tugas.description || ""
  document.getElementById("goalCategory").value = tugas.category
  document.getElementById("startDate").value = tugas.startDate
  document.getElementById("targetDate").value = tugas.targetDate
  document.getElementById("modalTitle").textContent = "Edit Tugas"
  const startDateInput = document.getElementById("startDate")
  const targetDateInput = document.getElementById("targetDate")
  if (startDateInput && targetDateInput) {
    startDateInput.min = ""
    targetDateInput.min = tugas.startDate
  }
  document.getElementById("goalModal").classList.add("active")
  setTimeout(() => {
    dateValidation()
  }, 100)
}

// Toggle complete tugas
async function toggleCompleteTugas(index) {
    if (index < 0 || index >= tugasList.length) return;

    const tugas = tugasList[index];
    tugas.completed = !tugas.completed;

    try {
        await TugasAPI.update(tugas);
        showNotification(`Status tugas "${tugas.title}" berhasil diperbarui.`, 'success');
        renderTugas();
    } catch (error) {
        // Kembalikan status jika gagal
        tugas.completed = !tugas.completed;
        console.error("Gagal memperbarui status tugas:", error);
        showNotification("Gagal memperbarui status tugas.", "error");
        renderTugas();
    }
}

// Initialize Tugas page
async function initTugasPage() {
  currentPage = "Tugas"
  await initTugas()
  renderTugas()

  const form = document.getElementById("goalForm")
  if (form) {
    form.removeEventListener("submit", handleTugasFormSubmit)
    form.addEventListener("submit", handleTugasFormSubmit)
  }
  const goalModal = document.getElementById("goalModal")
  if (goalModal) {
    goalModal.addEventListener("click", function (e) {
      if (e.target === this) closeModal()
    })
  }
  const startDateInput = document.getElementById("startDate")
  if (startDateInput && !startDateInput.value) {
    startDateInput.value = new Date().toISOString().split("T")[0]
  }
  dateValidation()
  setupSearchFunctionality()
}

// ===========================
// MODAL & FORM FUNCTIONS
// ===========================

// Open modal
function openModal() {
  const modal = document.getElementById("goalModal")
  const form = document.getElementById("goalForm")
  const modalTitle = document.getElementById("modalTitle")
  if (!modal || !form || !modalTitle) return

  modalTitle.textContent = currentPage === "Tugas" ? "Tambah Tugas Baru" : "Tambah Tujuan Baru"
  form.reset()
  editingIndex = -1

  const startDateInput = document.getElementById("startDate")
  if (startDateInput) {
    const today = new Date().toISOString().split("T")[0]
    startDateInput.value = today
    startDateInput.min = today
  }
  const targetDateInput = document.getElementById("targetDate")
  if (targetDateInput) {
    targetDateInput.min = startDateInput ? startDateInput.value : ""
  }
  modal.classList.add("active")
  setTimeout(() => {
    dateValidation()
  }, 100)
}

// Close modal
function closeModal() {
  const modal = document.getElementById("goalModal")
  const form = document.getElementById("goalForm")
  if (modal) modal.classList.remove("active")
  if (form) form.reset()
  editingIndex = -1
}

// Date validation
function dateValidation() {
  const startDateInput = document.getElementById("startDate")
  const targetDateInput = document.getElementById("targetDate")
  if (!startDateInput || !targetDateInput) return
  startDateInput.addEventListener("change", function () {
    const startDate = this.value
    if (startDate) targetDateInput.min = startDate
    if (targetDateInput.value && targetDateInput.value < startDate) {
      targetDateInput.value = ""
      alert("Tanggal target selesai harus setelah atau sama dengan tanggal mulai. Silahkan pilih ulang tanggal target.")
    }
  })
  targetDateInput.addEventListener("change", function () {
    const targetDate = this.value
    const startDate = startDateInput.value
    if (startDate && targetDate && targetDate < startDate) {
      this.value = ""
      alert("Target selesai tidak boleh sebelum tanggal mulai!")
      return false
    }
  })
  const today = new Date().toISOString().split("T")[0]
  startDateInput.min = today
}

// Setup search functionality
function setupSearchFunctionality() {
  // Search untuk Tugas
  const searchTugas = document.getElementById("searchTugas")
  if (searchTugas) {
    searchTugas.addEventListener("input", () => {
      renderTugas()
    })
  }

  // Search untuk Tujuan
  const searchTujuan = document.getElementById("searchTujuan")
  if (searchTujuan) {
    searchTujuan.addEventListener("input", () => {
      renderGoals()
    })
  }
}

// ===========================
// TASK MANAGEMENT (SUB-TASKS)
// ===========================

// Open task modal
function openTaskModal(goalIndex) {
  const goal = goals[goalIndex]
  const taskModal = document.getElementById("taskModal")
  const taskForm = document.getElementById("taskForm")
  if (!taskModal || !taskForm || !goal) return

  taskForm.reset()
  document.getElementById("taskModalTitle").textContent = `Tambah Task untuk Tujuan: ${goal.title}`
  taskModal.classList.add("active")
  taskForm.onsubmit = (e) => addTask(goalIndex, e)
}

// Add task
async function addTask(goalIndex, event) {
    event.preventDefault();

    const taskTitle = document.getElementById("taskTitle").value.trim();
    const taskPriority = document.getElementById("taskPriority").value;
    const taskDeadline = document.getElementById("taskDeadline").value;

    // Validate inputs
    if (!taskTitle) {
        showNotification("Judul task harus diisi!", "error");
        return;
    }
    if (!taskDeadline) {
        showNotification("Deadline task harus diisi!", "error");
        return;
    }

    // Validate that deadline is not before today
    const today = new Date().toISOString().split("T")[0];
    if (taskDeadline < today) {
        showNotification("Deadline tidak boleh sebelum hari ini!", "error");
        return;
    }

    const newTask = {
        title: taskTitle,
        priority: taskPriority,
        deadline: taskDeadline,
        completed: false,
    };

    const goalToUpdate = goals[goalIndex];
    if (!goalToUpdate.tasks) {
        goalToUpdate.tasks = [];
    }
    goalToUpdate.tasks.push(newTask);

    try {
        showLoading(true);
        await TujuanAPI.update(goalToUpdate);
        showNotification("Subtujuan berhasil ditambahkan!", "success");
        await initTujuanPage(); // Reload goals to get updated data
    } catch (error) {
        showNotification("Gagal menambahkan subtujuan: " + error.message, "error");
        goalToUpdate.tasks.pop(); // Remove the task if the API call fails
        renderGoals();
    } finally {
        showLoading(false);
        closeTaskModal();
    }
}

// Toggle task completion
async function toggleTaskCompletion(goalIndex, taskId) {
    const goal = goals[goalIndex];
    if (!goal || !goal.tasks) return;

    const task = goal.tasks.find((t) => t.id === taskId);
    if (task) {
        task.completed = !task.completed;

        // Hitung ulang progress tujuan induk
        const totalTasks = goal.tasks.length;
        const completedTasks = goal.tasks.filter(t => t.completed).length;
        goal.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Jika semua sub-tugas selesai, tandai tujuan utama sebagai selesai
        if(completedTasks === totalTasks && totalTasks > 0) {
            goal.completed = true;
        } else {
            goal.completed = false;
        }

        try {
            // Kirim seluruh data tujuan yang sudah diupdate
            await TujuanAPI.update(goal);
            showNotification(`Status task "${task.title}" berhasil diperbarui.`, 'success');
            renderGoals();
        } catch (error) {
            // Kembalikan status jika gagal
            task.completed = !task.completed;
            console.error("Gagal memperbarui task:", error);
            showNotification("Gagal memperbarui status task.", "error");
            renderGoals();
        }
    }
}

// Close task modal
function closeTaskModal() {
  const taskModal = document.getElementById("taskModal")
  const taskForm = document.getElementById("taskForm")
  if (taskModal) {
    taskModal.classList.remove("active")
  }
  if (taskForm) {
    taskForm.reset()
  }
}

// Delete task
async function deleteTask(goalIndex, taskId) {
  if (confirm("Apakah Anda yakin ingin menghapus subtujuan ini?")) {
    const goalToUpdate = goals[goalIndex]
    const taskIndex = goalToUpdate.tasks.findIndex((task) => task.id === taskId)

    if (taskIndex >= 0) {
      // Simpan task yang akan dihapus untuk rollback jika gagal
      const removedTask = goalToUpdate.tasks.splice(taskIndex, 1)[0]

      // MODIFIKASI: Panggil API untuk menyimpan perubahan
      try {
        showLoading(true)
        await TujuanAPI.update(goalToUpdate)
        showNotification("Subtujuan berhasil dihapus.", "success")
      } catch (error) {
        showNotification("Gagal menghapus subtujuan: " + error.message, "error")
        // Kembalikan task jika API gagal
        goalToUpdate.tasks.splice(taskIndex, 0, removedTask)
      } finally {
        showLoading(false)
        renderGoals() // Selalu render ulang untuk menampilkan kondisi terakhir
      }
    }
  }
}

// ===========================
// CATATAN (NOTES) MANAGEMENT
// ===========================

// Initialize notes page
async function initCatatanPage() {
  console.log("Initializing Catatan Page...")
  await loadNotes()
  renderNotes()
  setupNotesEventListeners()
  loadUserPreferences()
}

// Load notes from database only
async function loadNotes() {
  try {
    notesList = await CatatanAPI.getAll()
    console.log("Notes loaded from database:", notesList.length)
  } catch (error) {
    console.error("Error loading notes:", error)
    notesList = []
    // showNotification("Gagal memuat catatan dari database", "error")
  }
}

// Save notes (handled by API)
async function saveNotes() {
  console.log("Notes saved to database")
}

// Setup notes event listeners
function setupNotesEventListeners() {
  // Form submission
  const noteForm = document.getElementById("noteForm")
  if (noteForm) {
    noteForm.addEventListener("submit", handleNoteFormSubmit)
  }

  // Real-time validation
  const titleInput = document.getElementById("noteTitle")
  const contentInput = document.getElementById("noteContent")

  if (titleInput) {
    titleInput.addEventListener("blur", validateNoteForm)
    titleInput.addEventListener("input", () => {
      if (titleInput.classList.contains("error")) {
        validateNoteForm()
      }
    })
  }

  if (contentInput) {
    contentInput.addEventListener("blur", validateNoteForm)
    contentInput.addEventListener("input", () => {
      updateCharacterCount()
      if (contentInput.classList.contains("error")) {
        validateNoteForm()
      }
    })
  }

  // Search functionality
  const searchInput = document.getElementById("searchNotes")
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderNotes()
    })
  }

  // Modal close on outside click
  const noteModal = document.getElementById("noteModal")
  if (noteModal) {
    noteModal.addEventListener("click", function (e) {
      if (e.target === this) closeNoteModal()
    })
  }

  const previewModal = document.getElementById("notePreviewModal")
  if (previewModal) {
    previewModal.addEventListener("click", function (e) {
      if (e.target === this) closePreviewModal()
    })
  }
}

// Render notes
function renderNotes() {
  const notesGrid = document.getElementById("notesGrid")
  const emptyState = document.getElementById("emptyState")

  if (!notesGrid || !emptyState) return

  const filteredNotes = getFilteredNotes()

  if (filteredNotes.length === 0) {
    notesGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  notesGrid.style.display = "grid"
  emptyState.style.display = "none"

  // Sort notes: pinned first, then by updated date
  filteredNotes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  notesGrid.innerHTML = filteredNotes
    .map((note) => {
      const originalIndex = notesList.findIndex((n) => n.id === note.id)
      return createNoteCardHTML(note, originalIndex)
    })
    .join("")
}

// Get filtered notes
function getFilteredNotes() {
  if (!notesList) return []

  let filtered = [...notesList]

  // Filter by search term
  const searchTerm = document.getElementById("searchNotes")?.value.toLowerCase().trim()
  if (searchTerm) {
    filtered = filtered.filter(
      (note) => note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm),
    )
  }

  return filtered
}

// Create note card HTML
function createNoteCardHTML(note, originalIndex) {
  const truncatedContent = truncateText(note.content, 150)
  const formattedDate = formatDate(note.updatedAt)

  return `
        <div class="note-card ${note.category} ${note.isPinned ? "pinned" : ""}" onclick="openNotePreview(${originalIndex})">
            <div class="note-header">
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                ${
                  note.isPinned
                    ? `
        <svg class="note-pin" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-pin-angle" viewBox="0 0 16 16" id="Pin-Angle--Streamline-Bootstrap" height="16" width="16">
            <path d="M9.828 0.722a0.5 0.5 0 0 1 0.354 0.146l4.95 4.95a0.5 0.5 0 0 1 0 0.707c-0.48 0.48 -1.072 0.588 -1.503 0.588 -0.177 0 -0.335 -0.018 -0.46 -0.039l-3.134 3.134a6 6 0 0 1 0.16 1.013c0.046 0.702 -0.032 1.687 -0.72 2.375a0.5 0.5 0 0 1 -0.707 0l-2.829 -2.828 -3.182 3.182c-0.195 0.195 -1.219 0.902 -1.414 0.707s0.512 -1.22 0.707 -1.414l3.182 -3.182 -2.828 -2.829a0.5 0.5 0 0 1 0 -0.707c0.688 -0.688 1.673 -0.767 2.375 -0.72a6 6 0 0 1 1.013 0.16l3.134 -3.133a3 3 0 0 1 -0.04 -0.461c0 -0.43 0.108 -1.022 0.589 -1.503a0.5 0.5 0 0 1 0.353 -0.146m0.122 2.112v-0.002zm0 -0.002v0.002a0.5 0.5 0 0 1 -0.122 0.51L6.293 6.878a0.5 0.5 0 0 1 -0.511 0.12H5.78l-0.014 -0.004a5 5 0 0 0 -0.288 -0.076 5 5 0 0 0 -0.765 -0.116c-0.422 -0.028 -0.836 0.008 -1.175 0.15l5.51 5.509c0.141 -0.34 0.177 -0.753 0.149 -1.175a5 5 0 0 0 -0.192 -1.054l-0.004 -0.013v-0.001a0.5 0.5 0 0 1 0.12 -0.512l3.536 -3.535a0.5 0.5 0 0 1 0.532 -0.115l0.096 0.022c0.087 0.017 0.208 0.034 0.344 0.034q0.172 0.002 0.343 -0.04L9.927 2.028q-0.042 0.172 -0.04 0.343a1.8 1.8 0 0 0 0.062 0.46z" stroke-width="1"></path>
        </svg>
`
                    : ""
                }
            </div>
            <div class="note-content">${escapeHtml(truncatedContent)}</div>
            <div class="note-meta">
                <span class="note-category">${escapeHtml(note.category)}</span>
                <span class="note-date">${formattedDate}</span>
            </div>
            <div class="note-actions" onclick="event.stopPropagation()">
                <button class="note-action-btn view-btn" onclick="openNotePreview(${originalIndex})" title="Lihat catatan">
                    Lihat
                </button>
                <button class="note-action-btn edit-btn" onclick="editNote(${originalIndex})" title="Edit catatan">
                    Edit
                </button>
                <button class="note-action-btn delete-btn" onclick="deleteNote(${originalIndex})" title="Hapus catatan">
                    Hapus
                </button>
            </div>
        </div>
    `
}

// Handle note form submission
async function handleNoteFormSubmit(e) {
  e.preventDefault()

  if (!validateNoteForm()) {
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  if (submitBtn) {
    submitBtn.classList.add("loading")
    submitBtn.disabled = true
  }

  try {
    const titleInput = document.getElementById("noteTitle")
    const contentInput = document.getElementById("noteContent")
    const categoryInput = document.getElementById("noteCategory")
    const isPinnedInput = document.getElementById("noteIsPinned")

    const noteData = {
      title: titleInput?.value.trim() || "",
      content: contentInput?.value.trim() || "",
      category: categoryInput?.value || "Lainnya",
      isPinned: isPinnedInput?.checked || false,
    }

    if (editingNoteIndex >= 0) {
      // Update existing note
      noteData.id = notesList[editingNoteIndex].id
      await CatatanAPI.update(noteData)
      // Reload notes from server
      await loadNotes()
    } else {
      // Create new note
      await CatatanAPI.create(noteData)
      // Reload notes from server
      await loadNotes()
    }

    renderNotes()
    closeNoteModal()
    showNotification("Catatan berhasil disimpan!", "success")
  } catch (error) {
    console.error("Error saving note:", error)
    showNotification("Gagal menyimpan catatan: " + error.message, "error")
  } finally {
    if (submitBtn) {
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false
    }
  }
}

// Delete note
async function deleteNote(index) {
  if (!notesList || index < 0 || index >= notesList.length) return

  const note = notesList[index]
  if (confirm(`Apakah Anda yakin ingin menghapus catatan "${note.title}"? Item akan dipindahkan ke sampah.`)) {
    try {
      await CatatanAPI.delete(note.id)
      notesList.splice(index, 1)
      renderNotes()
      showNotification("Catatan berhasil dihapus!", "success")
    } catch (error) {
      console.error("Error deleting note:", error)
      showNotification("Gagal menghapus catatan: " + error.message, "error")
    }
  }
}

// Edit note
function editNote(index) {
  if (!notesList || index < 0 || index >= notesList.length) return

  const note = notesList[index]
  editingNoteIndex = index

  // Fill form
  const titleInput = document.getElementById("noteTitle")
  const contentInput = document.getElementById("noteContent")
  const categoryInput = document.getElementById("noteCategory")
  const isPinnedInput = document.getElementById("noteIsPinned")

  if (titleInput) titleInput.value = note.title
  if (contentInput) contentInput.value = note.content
  if (categoryInput) categoryInput.value = note.category
  if (isPinnedInput) isPinnedInput.checked = note.isPinned || false

  openNoteModal()
}

// Open note modal
function openNoteModal() {
  const modal = document.getElementById("noteModal")
  const form = document.getElementById("noteForm")
  const modalTitle = document.getElementById("noteModalTitle")

  if (!modal) return

  if (modalTitle) {
    modalTitle.textContent = editingNoteIndex >= 0 ? "Edit Catatan" : "Tambah Catatan Baru"
  }

  if (editingNoteIndex < 0) {
    if (form) form.reset()
  }

  modal.classList.add("active")

  // Initialize character count
  updateCharacterCount()

  // Focus on title input
  setTimeout(() => {
    const titleInput = document.getElementById("noteTitle")
    if (titleInput) titleInput.focus()
  }, 100)
}

// Close note modal
function closeNoteModal() {
  const modal = document.getElementById("noteModal")
  const form = document.getElementById("noteForm")

  if (modal) modal.classList.remove("active")
  if (form) form.reset()
  editingNoteIndex = -1
}

// Open note preview
function openNotePreview(index) {
  if (!notesList || index < 0 || index >= notesList.length) return

  const note = notesList[index]
  const modal = document.getElementById("notePreviewModal")
  const previewTitle = document.getElementById("previewTitle")
  const previewContent = document.getElementById("previewContent")

  if (!modal) return

  if (previewTitle) previewTitle.textContent = note.title
  if (previewContent) {
    previewContent.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <span class="note-category" style="background: ${getCategoryColor(note.category)}20; color: ${getCategoryColor(note.category)};">
                    ${escapeHtml(note.category)}
                </span>
                <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--subtext);">
                    Dibuat: ${formatDate(note.createdAt)} | Diperbarui: ${formatDate(note.updatedAt)}
                </div>
            </div>
            <div class="preview-content">${escapeHtml(note.content).replace(/\n/g, "<br>")}</div>
        `
  }

  modal.classList.add("active")
}

// Close preview modal
function closePreviewModal() {
  const modal = document.getElementById("notePreviewModal")
  if (modal) {
    modal.classList.remove("active")
  }
}

// Validate note form
function validateNoteForm() {
  const titleInput = document.getElementById("noteTitle")
  const contentInput = document.getElementById("noteContent")
  const titleError = document.getElementById("titleError")
  const contentError = document.getElementById("contentError")

  let isValid = true

  // Clear previous errors
  clearFieldError(titleInput, titleError)
  clearFieldError(contentInput, contentError)

  // Validate title
  const title = titleInput?.value.trim() || ""
  if (!title) {
    showFieldError(titleInput, titleError, "Judul catatan wajib diisi")
    isValid = false
  } else if (title.length < 3) {
    showFieldError(titleInput, titleError, "Judul minimal 3 karakter")
    isValid = false
  } else if (title.length > 100) {
    showFieldError(titleInput, titleError, "Judul maksimal 100 karakter")
    isValid = false
  } else {
    showFieldSuccess(titleInput)
  }

  // Validate content
  const content = contentInput?.value.trim() || ""
  if (!content) {
    showFieldError(contentInput, contentError, "Isi catatan wajib diisi")
    isValid = false
  } else if (content.length < 10) {
    showFieldError(contentInput, contentError, "Isi catatan minimal 10 karakter")
    isValid = false
  } else if (content.length > 5000) {
    showFieldError(contentInput, contentError, "Isi catatan maksimal 5000 karakter")
    isValid = false
  } else {
    showFieldSuccess(contentInput)
  }

  return isValid
}

// Show field error
function showFieldError(input, errorElement, message) {
  if (input) {
    input.classList.add("error")
    input.classList.remove("success")
  }
  if (errorElement) {
    errorElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            ${message}
        `
  }
}

// Show field success
function showFieldSuccess(input) {
  if (input) {
    input.classList.add("success")
    input.classList.remove("error")
  }
}

// Clear field error
function clearFieldError(input, errorElement) {
  if (input) {
    input.classList.remove("error", "success")
  }
  if (errorElement) {
    errorElement.innerHTML = ""
  }
}

// Update character count
function updateCharacterCount() {
  const contentInput = document.getElementById("noteContent")
  const countElement = document.getElementById("contentCount")
  const countContainer = countElement?.parentElement

  if (!contentInput || !countElement) return

  const length = contentInput.value.length
  const maxLength = 5000

  countElement.textContent = length

  if (countContainer) {
    countContainer.classList.remove("warning", "danger")
    if (length > maxLength * 0.9) {
      countContainer.classList.add("danger")
    } else if (length > maxLength * 0.8) {
      countContainer.classList.add("warning")
    }
  }
}

// Change notes view
function changeNotesView(view) {
  if (!["grid", "list"].includes(view)) return

  notesView = view
  const grid = document.getElementById("notesGrid")
  if (grid) {
    grid.className = `notes-grid view-${view}`
  }

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view)
  })

  localStorage.setItem("notesView", view)
}

// Load user preferences
function loadUserPreferences() {
  const savedView = localStorage.getItem("notesView")
  if (savedView && ["grid", "list"].includes(savedView)) {
    changeNotesView(savedView)
  }
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    Personal: "#8B5CF6",
    Kerja: "#059669",
    Ide: "#F59E0B",
    Penting: "#EF4444",
    Lainnya: "#6B7280",
  }
  return colors[category] || colors.Lainnya
}

// ===========================
// TRASH MANAGEMENT
// ===========================

/**
 * Kelas untuk mengelola semua interaksi API dengan endpoint sampah.php.
 */
class SampahAPI {
  /**
   * Mengambil semua item dari sampah untuk pengguna yang sedang login.
   * @returns {Promise<Array>} Promise yang resolve dengan array item sampah.
   */
  static async getAll() {
    const userId = UserSession.getUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }
    // Ganti pemanggilan API dari GET ke POST untuk menyertakan body jika diperlukan di masa depan
    const response = await API.get("sampah.php", { user_id: userId });
    // Pastikan respons dari backend selalu dalam format yang diharapkan
    return response.success && Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Memulihkan item sampah kembali ke lokasi aslinya.
   * @param {string|number} sampahId - ID item sampah yang akan dipulihkan.
   * @returns {Promise<Object>} Promise yang resolve dengan respons dari API.
   */
  static async restore(sampahId) {
    const userId = UserSession.getUserId();
    return API.post("sampah.php", {
      action: "restore",
      id: sampahId,
      user_id: userId,
    });
  }

  /**
   * Menghapus item sampah secara permanen.
   * @param {string|number} sampahId - ID item sampah yang akan dihapus.
   * @returns {Promise<Object>} Promise yang resolve dengan respons dari API.
   */
  static async deletePermanent(sampahId) {
    const userId = UserSession.getUserId();
    // Menggunakan metode DELETE dengan parameter querystring
    return API.request(`sampah.php?id=${sampahId}&user_id=${userId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Mengosongkan semua item dari sampah pengguna.
   * @returns {Promise<Object>} Promise yang resolve dengan respons dari API.
   */
  static async emptyTrash() {
    const userId = UserSession.getUserId();
    return API.post("sampah.php", {
      action: "emptyTrash",
      user_id: userId,
    });
  }
  
  /**
   * Membersihkan item yang sudah kedaluwarsa dari sampah.
   * @returns {Promise<Object>} Promise yang resolve dengan respons dari API.
   */
  static async cleanupExpired() {
    const userId = UserSession.getUserId();
    return API.post("sampah.php", {
        action: "cleanupExpired",
        user_id: userId,
    });
  }
}

/**
 * Menginisialisasi halaman Sampah.
 * Mengambil data dari API, me-render item, dan mengatur event listener.
 */
async function initSampahPage() {
  try {
    showLoading(true);
    trashItems = await SampahAPI.getAll();
    renderTrashItems();
    updateTrashStats();
    setupTrashEventListeners();
  } catch (error) {
    console.error("Error initializing trash page:", error);
    showTrashNotification("Gagal memuat item sampah. Silakan coba lagi.", "error");
    document.getElementById("trashItems").innerHTML = ""; // Kosongkan list jika gagal
    document.getElementById("emptyTrashState").style.display = "block";
  } finally {
    showLoading(false);
  }
}

/**
 * Menampilkan atau menyembunyikan overlay loading.
 * @param {boolean} isLoading - True untuk menampilkan, false untuk menyembunyikan.
 */
function showLoading(isLoading) {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 10001; transition: opacity 0.3s;
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = isLoading ? 'flex' : 'none';
}


/**
 * Mengatur event listener untuk semua elemen interaktif di halaman sampah.
 */
function setupTrashEventListeners() {
    document.getElementById('cleanupBtn').onclick = () => cleanupExpiredItems();
    document.getElementById('emptyTrashBtn').onclick = () => confirmEmptyTrash();
    document.getElementById('typeFilter').onchange = () => filterTrashItems();
    document.getElementById('trashSearch').oninput = () => filterTrashItems();
    document.getElementById('confirmActionBtn').onclick = () => executeConfirmAction();
    document.querySelector('#confirmModal .close-btn').onclick = () => closeConfirmModal();
    document.querySelector('#confirmModal .btn-secondary').onclick = () => closeConfirmModal();
    document.querySelector('#previewModal .close-btn').onclick = () => closeViewModal();
    document.querySelector('#previewModal .btn-secondary').onclick = () => closeViewModal();
}


/**
 * Me-render item sampah ke dalam DOM.
 */
function renderTrashItems() {
  const container = document.getElementById("trashItems");
  const emptyState = document.getElementById("emptyTrashState");

  if (!container || !emptyState) return;

  const filteredItems = getFilteredTrashItems();

  if (filteredItems.length === 0) {
    container.innerHTML = '';
    container.style.display = "none";
    emptyState.style.display = "block";
  } else {
    container.style.display = "flex";
    emptyState.style.display = "none";
    container.innerHTML = filteredItems.map((item) => createTrashItemHTML(item)).join("");
  }
}

/**
 * Memfilter dan menyortir item sampah berdasarkan kriteria yang dipilih.
 * @returns {Array} Array item sampah yang sudah difilter.
 */
function getFilteredTrashItems() {
  let filtered = [...trashItems];

  const typeFilter = document.getElementById("typeFilter")?.value;
  if (typeFilter && typeFilter !== "all") {
    // Sesuaikan dengan nilai 'tipe' dari database ('tujuan', 'tugas', 'catatan')
    const typeMap = { 'goals': 'tujuan', 'tasks': 'tugas', 'notes': 'catatan' };
    filtered = filtered.filter((item) => item.type === typeMap[typeFilter]);
  }

  const searchTerm = document.getElementById("trashSearch")?.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        (item.details.deskripsi && item.details.deskripsi.toLowerCase().includes(searchTerm)) ||
        (item.details.kategori && item.details.kategori.toLowerCase().includes(searchTerm))
    );
  }

  // Sortir berdasarkan tanggal dihapus (terbaru dulu)
  filtered.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
  return filtered;
}

/**
 * Membuat HTML untuk satu item sampah.
 * @param {Object} item - Objek item sampah dari API.
 * @returns {string} String HTML untuk item tersebut.
 */
function createTrashItemHTML(item) {
    const deletedDate = formatTrashDate(item.deleted_at);
    const expiryDate = formatTrashDate(item.expires_at);
    const daysLeft = Math.ceil((new Date(item.expires_at) - new Date()) / (1000 * 60 * 60 * 24));

    let expiryClass = "";
    let expiryText = daysLeft > 0 ? `${daysLeft} hari lagi` : "Kedaluwarsa";
    if (daysLeft <= 0) expiryClass = "expiry-danger";
    else if (daysLeft <= 7) expiryClass = "expiry-warning";

    const content = item.details.deskripsi || item.details.content || "";
    const truncatedContent = truncateText(content, 100);
    
    return `
        <div class="trash-item ${item.type}" data-id="${item.id}">
            <div class="trash-item-header">
                <div class="trash-item-info">
                    <div class="trash-item-title">
                        <span class="trash-item-type ${item.type}">${getTypeDisplayName(item.type)}</span>
                        ${escapeHtml(item.title)}
                    </div>
                    <div class="trash-item-meta">
                        <div>Kategori: ${escapeHtml(item.details.kategori || 'N/A')}</div>
                        <div>Dihapus: ${deletedDate}</div>
                        <div>Kedaluwarsa: ${expiryDate}</div>
                    </div>
                </div>
            </div>
            
            ${truncatedContent ? `<div class="trash-item-content">${escapeHtml(truncatedContent)}</div>` : ''}
            
            <div class="trash-item-footer">
                <div class="expiry-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span class="${expiryClass}">${expiryText}</span>
                </div>
                
                <div class="trash-item-actions">
                    <button class="action-btn-small preview-btn" onclick="previewTrashItem('${item.id}')" title="Lihat detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Lihat
                    </button>
                    <button class="action-btn-small restore-btn" onclick="confirmRestore('${item.id}')" title="Pulihkan item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.5 -0.5 16 16" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" height="16" width="16"><path d="M2.1875 5c0.87-1.987 3.014-3.125 5.326-3.125 2.924 0 5.328 2.22 5.611 5.063" stroke-width="1"></path><path d="M4.694 5.25h-2.48a0.338 0.338 0 0 1-0.338-0.337V2.438M12.812 10c-0.87 1.987-3.014 3.125-5.326 3.125C4.562 13.125 2.158 10.905 1.875 8.062" stroke-width="1"></path><path d="M10.306 9.75h2.481a0.338 0.338 0 0 1 0.338 0.338v2.475" stroke-width="1"></path></svg>
                        Pulihkan
                    </button>
                    <button class="action-btn-small delete-permanent-btn" onclick="confirmPermanentDelete('${item.id}')" title="Hapus permanen">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Memperbarui statistik jumlah item di header sampah.
 */
function updateTrashStats() {
    const notesCount = trashItems.filter((item) => item.type === "catatan").length;
    const goalsCount = trashItems.filter((item) => item.type === "tujuan").length;
    const tasksCount = trashItems.filter((item) => item.type === "tugas").length;

    document.getElementById("deletedNotesCount").textContent = notesCount;
    document.getElementById("deletedGoalsCount").textContent = goalsCount;
    document.getElementById("deletedTasksCount").textContent = tasksCount;
    
    const cleanupBtn = document.getElementById("cleanupBtn");
    const emptyTrashBtn = document.getElementById("emptyTrashBtn");
    const hasItems = trashItems.length > 0;
    const hasExpiredItems = trashItems.some(item => new Date(item.expires_at) <= new Date());

    if (cleanupBtn) {
        cleanupBtn.disabled = !hasExpiredItems;
        cleanupBtn.style.opacity = hasExpiredItems ? "1" : "0.5";
    }
    if (emptyTrashBtn) {
        emptyTrashBtn.disabled = !hasItems;
        emptyTrashBtn.style.opacity = hasItems ? "1" : "0.5";
    }
}


/**
 * Membersihkan item yang sudah kedaluwarsa dari API dan UI.
 */
async function cleanupExpiredItems() {
    showLoading(true);
    try {
        const result = await SampahAPI.cleanupExpired();
        if (result.success) {
            showTrashNotification("Item kedaluwarsa telah dibersihkan.", "success");
            await initSampahPage(); // Muat ulang data
        } else {
            throw new Error(result.message || "Gagal membersihkan item.");
        }
    } catch (error) {
        showTrashNotification(error.message, "error");
    } finally {
        showLoading(false);
    }
}

/**
 * Memfilter item sampah saat pengguna mengetik atau mengubah filter.
 */
function filterTrashItems() {
  renderTrashItems();
}

/**
 * Menampilkan pratinjau detail item sampah dalam modal.
 * @param {string|number} itemId - ID item sampah.
 */
function previewTrashItem(itemId) {
    const item = trashItems.find((i) => i.id == itemId);
    if (!item) return;

    currentPreviewItem = item;

    const modal = document.getElementById("previewModal");
    const title = document.getElementById("previewModalTitle");
    const content = document.getElementById("previewModalContent");
    const restoreBtn = document.getElementById("restoreFromPreviewBtn");
    if (!modal || !title || !content || !restoreBtn) return;
    
    title.textContent = `Preview ${getTypeDisplayName(item.type)}: ${item.title}`;
    const details = item.details;
    const itemContent = details.deskripsi || details.content || "";
    
    content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <span class="trash-item-type ${item.type}">${getTypeDisplayName(item.type)}</span>
                <span style="background: rgba(107, 114, 128, 0.1); color: #6B7280; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                    ${escapeHtml(details.kategori || 'N/A')}
                </span>
            </div>
            <div style="font-size: 0.875rem; color: var(--subtext); margin-bottom: 1rem;">
                <div>Dihapus: ${formatTrashDate(item.deleted_at)}</div>
                <div>Kedaluwarsa: ${formatTrashDate(item.expires_at)}</div>
            </div>
        </div>
        <div style="background: var(--background); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <h4 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.125rem; font-weight: 600;">
                ${escapeHtml(item.title)}
            </h4>
            ${itemContent ? `<div style="color: var(--primary-color); line-height: 1.6; white-space: pre-wrap;">${escapeHtml(itemContent)}</div>` : '<div style="color: var(--subtext); font-style: italic;">Tidak ada konten tambahan.</div>'}
        </div>
        ${details.progres !== undefined ? `
            <div style="margin-top: 1rem;">
                <div style="font-size: 0.875rem; font-weight: 500; color: var(--primary-color); margin-bottom: 0.5rem;">
                    Progress: ${details.progres}%
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, var(--info-color), #10B981); width: ${details.progres}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
        ` : ""}
    `;
    
    // Pastikan tombol pulihkan berfungsi
    restoreBtn.onclick = () => restoreFromPreview();
    
    modal.classList.add("active");
}

/**
 * Menutup modal pratinjau.
 */
function closeViewModal() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.remove("active");
  }
  currentPreviewItem = null;
}

/**
 * Menjalankan proses pemulihan dari modal pratinjau.
 */
async function restoreFromPreview() {
  if (!currentPreviewItem) return;
  
  const restoreBtn = document.getElementById("restoreFromPreviewBtn");
  restoreBtn.disabled = true;
  restoreBtn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> Memulihkan...';
  
  try {
    await restoreItem(currentPreviewItem.id);
    closeViewModal();
  } catch (error) {
    showTrashNotification("Gagal memulihkan dari pratinjau.", "error");
    restoreBtn.disabled = false;
    restoreBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.5 -0.5 16 16" ...>...</svg> Pulihkan`;
  }
}

/**
 * Memulihkan item sampah.
 * @param {string|number} trashItemId - ID item sampah.
 */
async function restoreItem(trashItemId) {
    const item = trashItems.find(i => i.id == trashItemId);
    if (!item) {
        showTrashNotification("Item untuk dipulihkan tidak ditemukan.", "error");
        return;
    }
    showLoading(true);
    try {
        const result = await SampahAPI.restore(trashItemId);
        if (result.success) {
            trashItems = trashItems.filter((i) => i.id != trashItemId);
            renderTrashItems();
            updateTrashStats();
            showTrashNotification(`${getTypeDisplayName(item.type)} "${item.title}" berhasil dipulihkan.`, "success");
        } else {
            throw new Error(result.message || "Operasi pemulihan gagal.");
        }
    } catch (error) {
        showTrashNotification(error.message, "error");
    } finally {
        showLoading(false);
        closeConfirmModal();
    }
}


/**
 * Menghapus item secara permanen dari sampah.
 * @param {string|number} trashItemId - ID item sampah.
 */
async function permanentlyDeleteItem(trashItemId) {
    const item = trashItems.find(i => i.id == trashItemId);
    if (!item) {
        showTrashNotification("Item untuk dihapus tidak ditemukan.", "error");
        return;
    }
    showLoading(true);
    try {
        const result = await SampahAPI.deletePermanent(trashItemId);
        if (result.success) {
            trashItems = trashItems.filter((i) => i.id != trashItemId);
            renderTrashItems();
            updateTrashStats();
            showTrashNotification(`${getTypeDisplayName(item.type)} "${item.title}" telah dihapus permanen.`, "warning");
        } else {
            throw new Error(result.message || "Gagal menghapus item.");
        }
    } catch (error) {
        showTrashNotification(error.message, "error");
    } finally {
        showLoading(false);
        closeConfirmModal();
    }
}

/**
 * Mengosongkan seluruh isi sampah.
 */
async function emptyTrash() {
  showLoading(true);
  try {
    const result = await SampahAPI.emptyTrash();
    if (result.success) {
      trashItems = [];
      renderTrashItems();
      updateTrashStats();
      showTrashNotification("Sampah telah berhasil dikosongkan.", "warning");
    } else {
        throw new Error(result.message || "Gagal mengosongkan sampah.");
    }
  } catch (error) {
    showTrashNotification(error.message, "error");
  } finally {
    showLoading(false);
    closeConfirmModal();
  }
}

// ===========================
// FUNGSI KONFIRMASI (Confirmation Functions)
// ===========================

function confirmRestore(itemId) {
    const item = trashItems.find((i) => i.id == itemId);
    if (!item) return;
    showConfirmModal(
        "Pulihkan Item",
        `Apakah Anda yakin ingin memulihkan ${getTypeDisplayName(item.type).toLowerCase()} "${item.title}"?`,
        "Pulihkan",
        () => restoreItem(itemId)
    );
}

function confirmPermanentDelete(itemId) {
    const item = trashItems.find((i) => i.id == itemId);
    if (!item) return;
    showConfirmModal(
        "Hapus Permanen",
        `Item ini akan dihapus selamanya dan tidak dapat dipulihkan. Lanjutkan?`,
        "Hapus Permanen",
        () => permanentlyDeleteItem(itemId)
    );
}

function confirmEmptyTrash() {
    if (trashItems.length === 0) {
        showTrashNotification("Sampah sudah kosong.", "info");
        return;
    }
    showConfirmModal(
        "Kosongkan Sampah",
        `Semua ${trashItems.length} item di sampah akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
        "Kosongkan Semua",
        () => emptyTrash()
    );
}


/**
 * Menampilkan modal konfirmasi.
 * @param {string} title - Judul modal.
 * @param {string} message - Pesan di dalam modal.
 * @param {string} actionText - Teks pada tombol konfirmasi.
 * @param {Function} action - Fungsi yang akan dijalankan saat dikonfirmasi.
 */
function showConfirmModal(title, message, actionText, action) {
  const modal = document.getElementById("confirmModal");
  const titleElement = document.getElementById("confirmModalTitle");
  const messageElement = document.getElementById("confirmModalMessage");
  const actionBtn = document.getElementById("confirmActionBtn");

  if (!modal || !titleElement || !messageElement || !actionBtn) return;

  titleElement.textContent = title;
  messageElement.textContent = message;
  actionBtn.textContent = actionText;

  // Hapus kelas warna sebelumnya dan tambahkan yang sesuai
  actionBtn.classList.remove('btn-danger', 'btn-warning', 'btn-primary');
  if (actionText.toLowerCase().includes('hapus') || actionText.toLowerCase().includes('kosongkan')) {
      actionBtn.classList.add('btn-danger');
  } else {
      actionBtn.classList.add('btn-primary');
  }

  confirmAction = action;
  modal.classList.add("active");
}

/**
 * Menutup modal konfirmasi.
 */
function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.remove("active");
  }
  confirmAction = null;
}

/**
 * Menjalankan aksi yang telah dikonfirmasi.
 */
function executeConfirmAction() {
  if (typeof confirmAction === "function") {
    confirmAction();
  }
  // Jangan tutup modal di sini, biarkan fungsi aksi yang menutupnya
}


// ===========================
// FUNGSI UTILITAS UNTUK SAMPAH
// ===========================

/**
 * Mengubah tipe data dari backend menjadi nama yang mudah dibaca.
 * @param {string} type - Tipe item ('catatan', 'tujuan', 'tugas').
 * @returns {string} Nama tipe yang ditampilkan.
 */
function getTypeDisplayName(type) {
  const names = {
    catatan: "Catatan",
    tujuan: "Tujuan",
    tugas: "Tugas",
    notes: "Catatan", // Fallback for old filter values
    goals: "Tujuan",
    tasks: "Tugas",
  };
  return names[type] || "Item";
}

/**
 * Memformat tanggal untuk ditampilkan di UI sampah.
 * @param {string} dateString - String tanggal dari API.
 * @returns {string} Tanggal yang sudah diformat.
 */
function formatTrashDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Menampilkan notifikasi sementara di pojok layar.
 * @param {string} message - Pesan notifikasi.
 * @param {string} type - Tipe notifikasi ('info', 'success', 'warning', 'error').
 */
function showTrashNotification(message, type = "info") {
  showNotification(message, type); // Menggunakan fungsi notifikasi global yang sudah ada
}


// ===========================
// CALENDAR/AGENDA FUNCTIONS
// ===========================

// Generate events data dari goals dan tugas
async function generateEventsData() {
  try {
    const goals = await TujuanAPI.getAll()
    const tugas = await TugasAPI.getAll()
    const generatedEvents = []

    // Convert goals to events
    goals.forEach((goal) => {
      // Start event
      generatedEvents.push({
        id: `goal-start-${goal.id}`,
        title: `Mulai: ${goal.title}`,
        description: goal.description,
        category: goal.category,
        date: goal.startDate,
        type: `goal`,
        originalData: goal,
      })

      // Target event
      generatedEvents.push({
        id: `goal-end-${goal.id}`,
        title: `Target: ${goal.title}`,
        description: `Target penyelesaian: ${goal.description}`,
        category: goal.category,
        date: goal.targetDate,
        type: `goal`,
        originalData: goal,
      })

      // Tasks within goal
      if (goal.tasks && goal.tasks.length > 0) {
        goal.tasks.forEach((task) => {
          generatedEvents.push({
            id: `task-${task.id}`,
            title: task.title,
            description: `Task untuk: ${goal.title}`,
            category: goal.category,
            date: task.deadline,
            type: `task`,
            priority: task.priority,
            originalData: { ...task, parentGoal: goal },
          })
        })
      }
    })

    // Convert tugas to events
    tugas.forEach((task) => {
      // Start event
      generatedEvents.push({
        id: `tugas-start-${task.id}`,
        title: `Mulai: ${task.title}`,
        description: task.description,
        category: task.category,
        date: task.startDate,
        type: "tugas",
        originalData: task,
      })

      // Deadline event
      generatedEvents.push({
        id: `tugas-end-${task.id}`,
        title: `Deadline: ${task.title}`,
        description: `Deadline: ${task.description}`,
        category: task.category,
        date: task.targetDate,
        type: "tugas",
        originalData: task,
      })
    })

    return generatedEvents
  } catch (error) {
    console.error("Error generating events data:", error)
    return []
  }
}

// Initialize calendar
async function initKalenderPage() {
  // Generate events from database data
  events = await generateEventsData()
  currentDate = new Date()
  currentView = "month"
  selectedDate = null
  currentWeekStart = getWeekStart(currentDate)

  // Render calendar
  renderCalendar()

  // Setup event listeners
  setupCalendarEventListeners()
}

function setupCalendarEventListeners() {
  // Month selector
  const monthSelect = document.getElementById("monthSelect")
  if (monthSelect) {
    monthSelect.addEventListener("change", function () {
      currentDate.setMonth(Number.parseInt(this.value))
      currentWeekStart = getWeekStart(currentDate)
      renderCalendar()
    })
  }

  // Year selector
  const yearSelect = document.getElementById("yearSelect")
  if (yearSelect) {
    yearSelect.addEventListener("change", function () {
      currentDate.setFullYear(Number.parseInt(this.value))
      currentWeekStart = getWeekStart(currentDate)
      renderCalendar()
    })
  }

  // Modal close
  const eventModal = document.getElementById("eventModal")
  if (eventModal) {
    eventModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeEventModal()
      }
    })
  }

  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      closeEventModal()
    }
  })
}

function renderCalendar() {
  updateCalendarTitle()
  updateSelectors()
  updateViewButtons()
  updateNavigationButtons()

  // Hide all views first
  document.querySelectorAll(".month-view, .week-view, .year-view").forEach((view) => {
    view.style.display = "none"
  })

  // Show current view
  switch (currentView) {
    case "month":
      document.getElementById("monthView").style.display = "block"
      renderMonthView()
      break
    case "week":
      document.getElementById("weekView").style.display = "block"
      renderWeekView()
      break
    case "year":
      document.getElementById("yearView").style.display = "grid"
      document.getElementById("yearView").style.gridTemplateColumns = "repeat(3, 1fr)"
      renderYearView()
      break
  }
}

function updateCalendarTitle() {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  let title = ""

  switch (currentView) {
    case "month":
      title = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      break
    case "week":
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      if (weekEnd.getMonth() !== currentWeekStart.getMonth()) {
        title = `${currentWeekStart.getDate()} ${months[currentWeekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${currentDate.getFullYear()}`
      } else {
        title = `${currentWeekStart.getDate()} - ${weekEnd.getDate()} ${months[currentWeekStart.getMonth()]} ${currentDate.getFullYear()}`
      }
      break
    case "year":
      title = currentDate.getFullYear().toString()
      break
  }

  const titleElement = document.getElementById("calendarTitle")
  if (titleElement) {
    titleElement.textContent = title
  }
}

function updateSelectors() {
  const yearSelect = document.getElementById("yearSelect")
  const monthSelect = document.getElementById("monthSelect")

  if (!yearSelect || !monthSelect) return

  // Update year selector
  yearSelect.innerHTML = ""
  const currentYear = currentDate.getFullYear()
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    const option = document.createElement("option")
    option.value = i
    option.textContent = i
    if (i === currentYear) option.selected = true
    yearSelect.appendChild(option)
  }

  // Update month selector
  monthSelect.value = currentDate.getMonth()
}

function updateViewButtons() {
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  const activeBtn = document.querySelector(`.view-btn[onclick="changeView('${currentView}')"]`)
  if (activeBtn) {
    activeBtn.classList.add("active")
  }
}

function updateNavigationButtons() {
  const monthYearNav = document.getElementById("monthYearNav")
  const weekNav = document.getElementById("weekNav")

  if (currentView === "week") {
    monthYearNav.style.display = "none"
    weekNav.style.display = "flex"
  } else {
    monthYearNav.style.display = "flex"
    weekNav.style.display = "none"
  }
}

function renderMonthView() {
  const monthView = document.getElementById("monthView")
  if (!monthView) return

  monthView.innerHTML = ""

  // Weekdays header
  const weekdaysDiv = document.createElement("div")
  weekdaysDiv.className = "weekdays"
  ;["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"].forEach((dayName) => {
    const dayDiv = document.createElement("div")
    dayDiv.className = "weekday"
    dayDiv.textContent = dayName
    weekdaysDiv.appendChild(dayDiv)
  })
  monthView.appendChild(weekdaysDiv)

  // Days grid
  const daysGridDiv = document.createElement("div")
  daysGridDiv.className = "days-grid"

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const today = new Date()

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate)
    cellDate.setDate(startDate.getDate() + i)

    const dayCell = document.createElement("div")
    dayCell.className = "day-cell"

    if (cellDate.getMonth() !== currentDate.getMonth()) {
      dayCell.classList.add("other-month")
    }

    if (cellDate.toDateString() === today.toDateString()) {
      dayCell.classList.add("today")
    }

    if (selectedDate && cellDate.toDateString() === selectedDate.toDateString()) {
      dayCell.classList.add("selected")
    }

    const dayEvents = getEventsForDate(cellDate)

    const dayNumber = document.createElement("div")
    dayNumber.className = "day-number"
    dayNumber.textContent = cellDate.getDate()
    dayCell.appendChild(dayNumber)

    const dayEventsDiv = document.createElement("div")
    dayEventsDiv.className = "day-events"

    const maxEvents = 3
    const displayEvents = dayEvents.slice(0, maxEvents)

    displayEvents.forEach((event) => {
      const eventDiv = document.createElement("div")
      eventDiv.className = `event-item ${event.category}`
      eventDiv.textContent = event.title
      eventDiv.title = event.title

      eventDiv.addEventListener("click", (e) => {
        e.stopPropagation()
        showEventDetails(event.id)
      })

      dayEventsDiv.appendChild(eventDiv)
    })

    if (dayEvents.length > maxEvents) {
      const moreDiv = document.createElement("div")
      moreDiv.style.cssText = `
                font-size: 10px;
                color: #64748b;
                text-align: center;
                padding: 2px;
                font-style: italic;
            `
      moreDiv.textContent = `+${dayEvents.length - maxEvents} lainnya`
      dayEventsDiv.appendChild(moreDiv)
    }

    dayCell.appendChild(dayEventsDiv)

    dayCell.addEventListener("click", (e) => {
      if (!e.target.classList.contains("event-item")) {
        selectDate(cellDate)
      }
    })

    daysGridDiv.appendChild(dayCell)
  }

  monthView.appendChild(daysGridDiv)
}

function renderWeekView() {
  const weekView = document.getElementById("weekView")
  if (!weekView) return

  weekView.innerHTML = ""

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const today = new Date()

  // Create week header
  const weekHeader = document.createElement("div")
  weekHeader.className = "week-header"

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentWeekStart)
    dayDate.setDate(currentWeekStart.getDate() + i)

    const dayHeader = document.createElement("div")
    dayHeader.className = "week-day-header"

    if (dayDate.toDateString() === today.toDateString()) {
      dayHeader.classList.add("today")
    }

    dayHeader.innerHTML = `${dayNames[dayDate.getDay()]} ${dayDate.getDate()}`
    weekHeader.appendChild(dayHeader)
  }

  weekView.appendChild(weekHeader)

  // Create week content container
  const weekContent = document.createElement("div")
  weekContent.className = "week-content"

  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(currentWeekStart)
    dayDate.setDate(currentWeekStart.getDate() + day)

    const dayColumn = document.createElement("div")
    dayColumn.className = "week-day-column"

    if (dayDate.toDateString() === today.toDateString()) {
      dayColumn.classList.add("today")
    }

    if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
      dayColumn.classList.add("selected")
    }

    const dayEvents = getEventsForDate(dayDate)

    dayEvents.forEach((event) => {
      const eventDiv = document.createElement("div")
      eventDiv.className = `week-event ${event.category}`

      let priorityText = ""
      if (event.priority) {
        priorityText = `[${event.priority}] `
      }

      let typePrefix = ""
      switch (event.type) {
        case "goal":
          typePrefix = event.title.includes("Target") ? "[Target] " : "[Mulai] "
          break
        case "task":
          typePrefix = "[Tugas] "
          break
        case "tugas":
          typePrefix = event.title.includes("Deadline") ? "[Deadline] " : "[Mulai] "
          break
      }

      eventDiv.textContent = `${typePrefix}${priorityText}${event.title}`
      eventDiv.title = event.description

      eventDiv.addEventListener("click", (e) => {
        e.stopPropagation()
        showEventDetails(event.id)
      })

      dayColumn.appendChild(eventDiv)
    })

    dayColumn.addEventListener("click", (e) => {
      if (!e.target.classList.contains("week-event")) {
        selectDate(dayDate)
      }
    })

    weekContent.appendChild(dayColumn)
  }

  weekView.appendChild(weekContent)
}

function renderYearView() {
  const yearView = document.getElementById("yearView")
  if (!yearView) return

  yearView.innerHTML = ""

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  for (let month = 0; month < 12; month++) {
    const miniMonth = document.createElement("div")
    miniMonth.className = "mini-month"

    const monthHeader = document.createElement("div")
    monthHeader.className = "mini-month-header"
    monthHeader.textContent = months[month]
    miniMonth.appendChild(monthHeader)

    const weekdays = document.createElement("div")
    weekdays.className = "mini-weekdays"
    ;["M", "S", "S", "R", "K", "J", "S"].forEach((day) => {
      const weekday = document.createElement("div")
      weekday.className = "mini-weekday"
      weekday.textContent = day
      weekdays.appendChild(weekday)
    })
    miniMonth.appendChild(weekdays)

    const daysContainer = document.createElement("div")
    daysContainer.className = "mini-days"

    const firstDay = new Date(currentDate.getFullYear(), month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const today = new Date()

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate)
      cellDate.setDate(startDate.getDate() + i)

      const dayElement = document.createElement("div")
      dayElement.className = "mini-day"
      dayElement.textContent = cellDate.getDate()

      if (cellDate.getMonth() !== month) {
        dayElement.classList.add("other-month")
      }

      if (cellDate.toDateString() === today.toDateString()) {
        dayElement.classList.add("today")
      }

      if (getEventsForDate(cellDate).length > 0) {
        dayElement.classList.add("has-events")
      }

      dayElement.addEventListener("click", () => {
        currentDate = new Date(cellDate)
        currentWeekStart = getWeekStart(currentDate)
        changeView("month")
        selectDate(cellDate)
      })

      daysContainer.appendChild(dayElement)
    }

    miniMonth.appendChild(daysContainer)
    yearView.appendChild(miniMonth)
  }
}

function getEventsForDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const dateStr = `${year}-${month}-${day}`

  return events.filter((event) => event.date === dateStr)
}

function getWeekStart(date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day
  return new Date(start.setDate(diff))
}

function selectDate(date) {
  selectedDate = new Date(date)
  renderCalendar()
}

function changeView(view) {
  currentView = view
  if (view === "week") {
    currentWeekStart = getWeekStart(currentDate)
  }
  renderCalendar()
}

function navigateMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction)
  currentWeekStart = getWeekStart(currentDate)
  renderCalendar()
}

function navigateWeek(direction) {
  currentWeekStart.setDate(currentWeekStart.getDate() + direction * 7)
  currentDate = new Date(currentWeekStart)
  renderCalendar()
}

function selectMonth() {
  const monthSelect = document.getElementById("monthSelect")
  if (monthSelect) {
    currentDate.setMonth(Number.parseInt(monthSelect.value))
    currentWeekStart = getWeekStart(currentDate)
    renderCalendar()
  }
}

function selectYear() {
  const yearSelect = document.getElementById("yearSelect")
  if (yearSelect) {
    currentDate.setFullYear(Number.parseInt(yearSelect.value))
    currentWeekStart = getWeekStart(currentDate)
    renderCalendar()
  }
}

function showEventDetails(eventId) {
  const event = events.find((e) => e.id === eventId)
  if (!event) return

  const modal = document.getElementById("eventModal")
  const detailsDiv = document.getElementById("eventDetails")
  if (!modal || !detailsDiv) return

  const categoryName = event.category || "Lainnya"

  let detailsHTML = `
        <h3>${event.title}</h3>
        <div class="event-category ${event.category}">${categoryName}</div>
        <p><strong>Tanggal:</strong> ${formatDateLong(event.date)}</p>
        <p><strong>Deskripsi:</strong> ${event.description}</p>
        <p><strong>Tipe:</strong> ${getEventTypeText(event.type)}</p>
    `

  if (event.priority) {
    detailsHTML += `<p><strong>Prioritas:</strong> ${event.priority}</p>`
  }

  if (event.originalData && event.originalData.progress !== undefined) {
    detailsHTML += `
            <p><strong>Progress:</strong></p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${event.originalData.progress}%;">
                    ${event.originalData.progress}%
                </div>
            </div>
        `
  }

  if (event.originalData && event.originalData.completed !== undefined) {
    detailsHTML += `<p><strong>Status:</strong> ${event.originalData.completed ? "✅ Selesai" : "⏳ Dalam Progress"}</p>`
  }

  if (event.originalData && event.originalData.tasks && event.originalData.tasks.length > 0) {
    detailsHTML += `<p><strong>Sub Tugas:</strong></p><ul style="margin: 8px 0; padding-left: 20px;">`
    event.originalData.tasks.forEach((task) => {
      detailsHTML += `<li style="margin: 4px 0;">${task.title} - ${task.completed ? "✅" : "⏳"} (${task.priority})</li>`
    })
    detailsHTML += `</ul>`
  }

  detailsDiv.innerHTML = detailsHTML
  modal.style.display = "block"

  const modalContent = modal.querySelector(".modal-content")
  if (modalContent) {
    modalContent.focus()
  }
}

function closeEventModal() {
  const modal = document.getElementById("eventModal")
  if (modal) {
    modal.style.display = "none"
  }
}

function formatDateLong(dateStr) {
  const date = new Date(dateStr)
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("id-ID", options)
}

function getEventTypeText(type) {
  switch (type) {
    case "goal":
      return "Tujuan"
    case "task":
      return "Task"
    case "tugas":
      return "Tugas"
    default:
      return "Event"
  }
}

// ===========================
// SETTINGS FUNCTIONS
// ===========================

const cssVariables = {
  light: {
    "--primary-color": "#191919",
    "--white": "#FFFFFF",
    "--sidebar-primary": "#2D4263",
    "--sidebar-primary-hover": "rgba(16,46,82,0.75)",
    "--background": "#EFF7FF",
    "--sidebar-background": "#D4E1F0",
    "--content-background": "#F9FAFB",
    "--subtext": "#4B5563",
    "--logout": "#FA7575",
    "--border-color": "#E2E8F0",
    "--shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    "--success-color": "#10B981",
    "--warning-color": "#F59E0B",
    "--danger-color": "#EF4444",
    "--info-color": "#3B82F6",
  },
  dark: {
    "--primary-color": "#F1F5F9",
    "--white": "#FFFFFF",
    "--sidebar-primary": "#1E3A8A",
    "--sidebar-primary-hover": "#3B82F6",
    "--background": "#0A0F1A",
    "--sidebar-background": "#111827",
    "--content-background": "#1A202C",
    "--subtext": "#cbd5e1",
    "--logout": "#EF4444",
    "--border-color": "#1F2937",
    "--shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.6)",
    "--shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.7)",
    "--success-color": "#10B981",
    "--warning-color": "#F59E0B",
    "--danger-color": "#EF4444",
    "--info-color": "#3B82F6",
  },
}

// Initialize settings when page loads
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    if (!currentPath.includes("login.html") && !currentPath.includes("register.html") && !currentPath.includes("LandingPage.html")) {
        if (!UserSession.isLoggedIn()) {
            window.location.href = "pages/login.html";
            return;
        }
        createSettingsOverlay();
        initSetting();
        
        const user = UserSession.getUser();
        if (user) {
            const userNameElement = document.querySelector(".user-name");
            const userEmailElement = document.querySelector(".user-email");
            const avatarElement = document.getElementById("userAvatar");
            const initials = getInitials(user.nama);
            if(userNameElement) userNameElement.textContent = user.nama;
            if(userEmailElement) userEmailElement.textContent = user.email;
            if(avatarElement) avatarElement.textContent = initials;
        }
    }
});


// Create settings overlay
function createSettingsOverlay(){
  if (document.getElementById("settingsOverlay")) return;
  const settingsHTML = `
    <div id="settingsOverlay" class="settings-overlay">
        <div class="settings-popup">
            <div class="settings-header">
                <h2 class="settings-title">
                    <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.06a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.06a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.06a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Pengaturan
                </h2>
                <button class="close-settings" onclick="closeSettings()">×</button>
            </div>
            <div class="settings-menu">
                <div class="settings-item" onclick="toggleThemeFromSettings()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                        <div class="settings-text">
                            <span class="settings-label">Tema</span>
                            <span class="settings-description">Ubah tampilan terang/gelap</span>
                        </div>
                    </div>
                    <div id="themeSwitch" class="theme-switch"><div class="theme-switch-handle"></div></div>
                </div>
                <div class="settings-item logout" onclick="confirmLogout()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16,17 21,12 16,7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <div class="settings-text">
                            <span class="settings-label">Keluar</span>
                            <span class="settings-description">Keluar dari akun Anda</span>
                        </div>
                    </div>
                </div>
                <div class="settings-item delete" onclick="confirmDeleteAccount()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        <div class="settings-text">
                            <span class="settings-label">Hapus Akun</span>
                            <span class="settings-description">Hapus akun secara permanen</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', settingsHTML);
}


// Initialize settings
function initSetting() {
  const isDarkMode = localStorage.getItem("theme") === "dark";
  if (isDarkMode) {
    enableDarkMode();
  } else {
    enableLightMode();
  }
  updateThemeSwitch(isDarkMode);
}

function updateThemeSwitch(isDark) {
  const themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    themeSwitch.classList.toggle("active", isDark);
  }
}

function enableDarkMode() {
  document.body.classList.add("dark");
  const root = document.documentElement;
  Object.entries(cssVariables.dark).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

function enableLightMode() {
  document.body.classList.remove("dark");
  const root = document.documentElement;
  Object.entries(cssVariables.light).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}


// Open settings
function openSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (overlay) {
    overlay.classList.add("active");
    overlay.classList.remove("closing");
    updateThemeSwitch(document.body.classList.contains("dark"));
    document.body.style.overflow = "hidden";
  }
}


// Close settings
function closeSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (overlay) {
    overlay.classList.add("closing");
    setTimeout(() => {
      overlay.classList.remove("active", "closing");
      document.body.style.overflow = "";
    }, 300);
  }
}

function toggleThemeFromSettings() {
  const isDarkMode = document.body.classList.contains("dark");
  if (isDarkMode) {
    enableLightMode();
    localStorage.setItem("theme", "light");
  } else {
    enableDarkMode();
    localStorage.setItem("theme", "dark");
  }
  updateThemeSwitch(!isDarkMode);
  showNotification(`Tema ${!isDarkMode ? "Gelap" : "Terang"} diaktifkan`, 'success');
}

function confirmLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
    performLogout();
  }
}

function performLogout() {
    showNotification("Berhasil keluar...", "success");
    UserSession.clearSession();
    setTimeout(() => {
        window.location.href = 'pages/LandingPage.html'; 
    }, 1500);
}

function confirmDeleteAccount() {
  if (confirm("PERINGATAN: Tindakan ini tidak dapat dibatalkan. Semua data Anda akan ditandai untuk dihapus. Apakah Anda yakin?")) {
    performDeleteAccount();
  }
}

async function performDeleteAccount() {
    showNotification("Menghapus akun Anda...", "info");
    try {
        const result = await AuthAPI.deleteAccount();
        if(result.success) {
            UserSession.clearSession();
            showNotification("Akun Anda telah berhasil dihapus.", "success");
            setTimeout(() => {
                window.location.href = 'pages/LandingPage.html';
            }, 2000);
        } else {
            throw new Error(result.message || "Gagal menghapus akun.");
        }
    } catch (error) {
        showNotification("Gagal menghapus akun: " + error.message, "error");
    }
}


// ===========================
// UTILITY FUNCTIONS
// ===========================

function getInitials(name) {
    if (!name) {
        return '?'; // Default jika nama tidak ada
    }

    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 0) {
        return '?';
    }

    let initials = words[0][0]; // Ambil huruf pertama dari kata pertama

    if (words.length > 1) {
        initials += words[1][0]; // Ambil huruf pertama dari kata kedua
    }

    return initials.toUpperCase();
}


// Format date
function formatDate(dateString) {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    return dateString
  }
}

// Truncate text
function truncateText(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `

  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function getNotificationColor(type) {
  const colors = {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  }
  return colors[type] || colors.info
}
