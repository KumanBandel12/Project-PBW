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
  const rencanaDropdownBtn = document.getElementById("rencanaDropdownBtn")

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
    .then((data) => {
      content.innerHTML = data
      setActiveMenu(page)
      window.location.hash = page
      if (page === "Beranda") initBerandaPage()
      else if (page === "Tujuan") initTujuanPage()
      else if (page === "Tugas") initTugasPage()
      else if (page === "Kalender") initKalenderPage()
      else if (page === "Catatan") initCatatanPage()
      else if (page === "Sampah") initSampahPage()
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

// Beranda

// Initialize dashboard when Beranda page loads
function initBerandaPage() {
  updateTodayDate()
  loadDashboardSummary()
  loadTodayActivities()
  updateProgressOverview()
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
function loadDashboardSummary() {
  // Load Notes Summary
  const notesSummary = getNotesData()
  updateNotesDisplay(notesSummary)

  // Load Goals Summary
  const goalsSummary = getGoalsData()
  updateGoalsDisplay(goalsSummary)

  // Load Tasks Summary
  const tasksSummary = getTasksData()
  updateTasksDisplay(tasksSummary)
}

// Get notes data for summary
function getNotesData() {
  let notes = []
  try {
    const saved = localStorage.getItem("notes")
    notes = saved ? JSON.parse(saved) : getDummyNotes()
  } catch (error) {
    notes = getDummyNotes()
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return {
    total: notes.length,
    pinned: notes.filter((note) => note.isPinned).length,
    recent: notes.filter((note) => new Date(note.createdAt) >= oneWeekAgo).length,
  }
}

// Get goals data for summary
function getGoalsData() {
  const goals = getDummyGoals()

  return {
    total: goals.length,
    completed: goals.filter((goal) => goal.completed).length,
    active: goals.filter((goal) => !goal.completed).length,
    averageProgress:
      goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) : 0,
  }
}

// Get tasks data for summary
function getTasksData() {
  const tasks = getDummyTugas()

  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length,
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
function loadTodayActivities() {
  loadTodayTasks()
  loadUpcomingGoals()
}

// Load tasks for today
function loadTodayTasks() {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  // Get tasks from goals and standalone tasks
  const goals = getDummyGoals()
  const tasks = getDummyTugas()

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
}

// Load goals with upcoming deadlines
function loadUpcomingGoals() {
  const goals = getDummyGoals()
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
function updateProgressOverview() {
  // Calculate productivity based on completed tasks
  const goals = getDummyGoals()
  const tasks = getDummyTugas()

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

// Utility function to escape HTML
function escapeHtml(text) {
  if (typeof text !== "string") return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
  } catch (error) {
    return ""
  }
}

// Add dashboard initialization to the main loadPage function
const originalLoadPage = window.loadPage
window.loadPage = (page) => {
  if (originalLoadPage) {
    originalLoadPage(page)
  }

  // Initialize dashboard if Beranda page is loaded
  if (page === "Beranda") {
    setTimeout(() => {
      initBerandaPage()
    }, 100)
  }
}

// Initialize dashboard on page load if we're already on Beranda
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#Beranda" || !window.location.hash) {
    setTimeout(() => {
      initBerandaPage()
    }, 500)
  }
})

function getDummyNotes() {
  return [
    { id: 1, title: "Grocery List", content: "Milk, eggs, bread, cheese", isPinned: true, createdAt: new Date() },
    {
      id: 2,
      title: "Ideas for Project",
      content: "Brainstorming session notes",
      isPinned: false,
      createdAt: new Date(),
    },
    {
      id: 3,
      title: "Book Recommendations",
      content: "The Great Gatsby, To Kill a Mockingbird",
      isPinned: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 8)),
    },
  ]
}

function getDummyGoals() {
  return [
    {
      id: 1,
      title: "Learn JavaScript",
      category: "Development",
      targetDate: "2024-08-15",
      progress: 50,
      completed: false,
      tasks: [
        { id: 1, title: "Complete JavaScript tutorial", deadline: "2024-08-01", completed: true, priority: "High" },
        { id: 2, title: "Build a simple web app", deadline: "2024-08-15", completed: false, priority: "Medium" },
      ],
    },
    {
      id: 2,
      title: "Read 10 Books",
      category: "Personal Development",
      targetDate: "2024-12-31",
      progress: 20,
      completed: false,
      tasks: [],
    },
    {
      id: 3,
      title: "Run a Marathon",
      category: "Fitness",
      targetDate: "2025-05-20",
      progress: 10,
      completed: false,
      tasks: [],
    },
  ]
}

function getDummyTugas() {
  return [
    { id: 1, title: "Submit Project Proposal", targetDate: "2024-07-30", completed: true, priority: "High" },
    { id: 2, title: "Prepare Presentation Slides", targetDate: "2024-08-05", completed: false, priority: "Medium" },
    { id: 3, title: "Review Code", targetDate: "2024-08-10", completed: false, priority: "Low" },
  ]
}


// =======================
// SECTION: TRASH MANAGEMENT
// =======================
let trashItems = []
let currentPreviewItem = null
let confirmAction = null

// Initialize trash page
function initSampahPage() {
  loadTrashItems()
  renderTrashItems()
  updateTrashStats()
  setupAutoCleanup()
}

// Load trash items from localStorage
function loadTrashItems() {
  try {
    const saved = localStorage.getItem("trashItems")
    trashItems = saved ? JSON.parse(saved) : []
    cleanupExpiredItems(false)
  } catch (error) {
    console.error("Error loading trash items:", error)
    trashItems = []
  }
}

// Save trash items to localStorage
function saveTrashItems() {
  try {
    localStorage.setItem("trashItems", JSON.stringify(trashItems))
  } catch (error) {
    console.error("Error saving trash items:", error)
  }
}

// Add item to trash
function addToTrash(item, type) {
  const trashItem = {
    id: generateTrashId(),
    originalId: item.id,
    type: type,
    title: item.title,
    content: item.content || item.description || "",
    category: item.category || "Lainnya",
    originalData: { ...item },
    deletedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  trashItems.unshift(trashItem)
  saveTrashItems()
  showTrashNotification(`${getTypeDisplayName(type)} "${item.title}" dipindahkan ke sampah`, "info")
  return trashItem
}

// Restore item from trash
function restoreItem(trashItemId) {
  const trashItem = trashItems.find((item) => item.id === trashItemId)
  if (!trashItem) {
    showTrashNotification("Item tidak ditemukan di sampah", "error")
    return false
  }

  const success = restoreToOriginalLocation(trashItem)

  if (success) {
    trashItems = trashItems.filter((item) => item.id !== trashItemId)
    saveTrashItems()
    showTrashNotification(`${getTypeDisplayName(trashItem.type)} "${trashItem.title}" berhasil dipulihkan`, "success")
    renderTrashItems()
    updateTrashStats()
    return true
  }
  return false
}

// Restore item to original location
function restoreToOriginalLocation(trashItem) {
  try {
    switch (trashItem.type) {
      case "notes":
        return restoreNote(trashItem)
      case "goals":
        return restoreGoal(trashItem)
      case "tasks":
        return restoreTask(trashItem)
      default:
        return false
    }
  } catch (error) {
    console.error("Error restoring item:", error)
    showTrashNotification("Gagal memulihkan item", "error")
    return false
  }
}

// Restore note
function restoreNote(trashItem) {
  let notesList = []
  try {
    const saved = localStorage.getItem("notes")
    notesList = saved ? JSON.parse(saved) : []
  } catch (error) {
    notesList = []
  }

  const restoredNote = {
    ...trashItem.originalData,
    updatedAt: new Date().toISOString(),
  }

  notesList.unshift(restoredNote)
  localStorage.setItem("notes", JSON.stringify(notesList))
  return true
}

// Restore goal
function restoreGoal(trashItem) {
  let goals = []
  try {
    const saved = localStorage.getItem("goals")
    goals = saved ? JSON.parse(saved) : []
  } catch (error) {
    goals = []
  }

  const restoredGoal = {
    ...trashItem.originalData,
    updatedAt: new Date().toISOString(),
  }

  goals.unshift(restoredGoal)
  localStorage.setItem("goals", JSON.stringify(goals))
  return true
}

// Restore task
function restoreTask(trashItem) {
  let tugasList = []
  try {
    const saved = localStorage.getItem("tugasList")
    tugasList = saved ? JSON.parse(saved) : []
  } catch (error) {
    tugasList = []
  }

  const restoredTask = {
    ...trashItem.originalData,
    updatedAt: new Date().toISOString(),
  }

  tugasList.unshift(restoredTask)
  localStorage.setItem("tugasList", JSON.stringify(tugasList))
  return true
}

// Permanently delete item
function permanentlyDeleteItem(trashItemId) {
  const trashItem = trashItems.find((item) => item.id === trashItemId)
  if (!trashItem) return false

  trashItems = trashItems.filter((item) => item.id !== trashItemId)
  saveTrashItems()
  showTrashNotification(`${getTypeDisplayName(trashItem.type)} "${trashItem.title}" dihapus permanen`, "warning")
  renderTrashItems()
  updateTrashStats()
  return true
}

// Clean up expired items
function cleanupExpiredItems(showNotification = true) {
  const now = new Date()
  const expiredItems = trashItems.filter((item) => new Date(item.expiresAt) <= now)

  if (expiredItems.length > 0) {
    trashItems = trashItems.filter((item) => new Date(item.expiresAt) > now)
    saveTrashItems()

    if (showNotification) {
      showTrashNotification(`${expiredItems.length} item kedaluwarsa telah dihapus`, "info")
    }

    renderTrashItems()
    updateTrashStats()
  } else if (showNotification) {
    showTrashNotification("Tidak ada item kedaluwarsa", "info")
  }
}

// Empty trash completely
function emptyTrash() {
  const itemCount = trashItems.length
  trashItems = []
  saveTrashItems()
  showTrashNotification(`${itemCount} item telah dihapus dari sampah`, "warning")
  renderTrashItems()
  updateTrashStats()
}

// Render trash items
function renderTrashItems() {
  const container = document.getElementById("trashItems")
  const emptyState = document.getElementById("emptyTrashState")

  if (!container || !emptyState) return

  const filteredItems = getFilteredTrashItems()

  if (filteredItems.length === 0) {
    container.style.display = "none"
    emptyState.style.display = "block"
    return
  }

  container.style.display = "flex"
  emptyState.style.display = "none"
  container.innerHTML = filteredItems.map((item) => createTrashItemHTML(item)).join("")
}

// Get filtered trash items
function getFilteredTrashItems() {
  let filtered = [...trashItems]

  const typeFilter = document.getElementById("typeFilter")?.value
  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter((item) => item.type === typeFilter)
  }

  const searchTerm = document.getElementById("trashSearch")?.value.toLowerCase().trim()
  if (searchTerm) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm),
    )
  }

  filtered.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
  return filtered
}

// Create trash item HTML
function createTrashItemHTML(item) {
  const deletedDate = formatTrashDate(item.deletedAt)
  const expiryDate = formatTrashDate(item.expiresAt)
  const daysLeft = Math.ceil((new Date(item.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))

  let expiryClass = ""
  let expiryText = `${daysLeft} hari lagi`

  if (daysLeft <= 3) {
    expiryClass = "expiry-danger"
    expiryText = daysLeft <= 0 ? "Kedaluwarsa" : `${daysLeft} hari lagi`
  } else if (daysLeft <= 7) {
    expiryClass = "expiry-warning"
  }

  const truncatedContent = truncateText(item.content, 150)

  return `
        <div class="trash-item ${item.type}" data-id="${item.id}">
            <div class="trash-item-header">
                <div class="trash-item-info">
                    <div class="trash-item-title">
                        <span class="trash-item-type ${item.type}">${getTypeDisplayName(item.type)}</span>
                        ${escapeHtml(item.title)}
                    </div>
                    <div class="trash-item-meta">
                        <div>Kategori: ${escapeHtml(item.category)}</div>
                        <div>Dihapus: ${deletedDate}</div>
                        <div>Kedaluwarsa: ${expiryDate}</div>
                    </div>
                </div>
            </div>
            
            ${
              item.content
                ? `
                <div class="trash-item-content">
                    ${escapeHtml(truncatedContent)}
                </div>
            `
                : ""
            }
            
            <div class="trash-item-footer">
                <div class="expiry-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span class="${expiryClass}">${expiryText}</span>
                </div>
                
                <div class="trash-item-actions">
                    <button class="action-btn-small preview-btn" onclick="previewTrashItem('${item.id}')" title="Lihat detail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Lihat
                    </button>
                    <button class="action-btn-small restore-btn" onclick="confirmRestore('${item.id}')" title="Pulihkan item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.5 -0.5 16 16" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" id="Refresh-Alt--Streamline-Mynaui" height="16" width="16">
                            <path d="M2.1875 5c0.8699999999999999 -1.986875 3.0143750000000002 -3.125 5.32625 -3.125 2.9243750000000004 0 5.328125 2.22 5.61125 5.0625" stroke-width="1"></path>
                            <path d="M4.694375 5.25h-2.48125a0.3375 0.3375 0 0 1 -0.3375 -0.3375V2.4375M12.8125 10c-0.8699999999999999 1.986875 -3.01375 3.125 -5.32625 3.125C4.561875000000001 13.125 2.158125 10.905000000000001 1.875 8.0625" stroke-width="1"></path>
                            <path d="M10.305625000000001 9.75h2.48125a0.3375 0.3375 0 0 1 0.338125 0.3375v2.475" stroke-width="1"></path>
                        </svg>
                        Pulihkan
                    </button>
                    <button class="action-btn-small delete-permanent-btn" onclick="confirmPermanentDelete('${item.id}')" title="Hapus permanen">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `
}

// Update trash statistics
function updateTrashStats() {
  const notesCount = trashItems.filter((item) => item.type === "notes").length
  const goalsCount = trashItems.filter((item) => item.type === "goals").length
  const tasksCount = trashItems.filter((item) => item.type === "tasks").length

  const notesElement = document.getElementById("deletedNotesCount")
  const goalsElement = document.getElementById("deletedGoalsCount")
  const tasksElement = document.getElementById("deletedTasksCount")

  if (notesElement) notesElement.textContent = notesCount
  if (goalsElement) goalsElement.textContent = goalsCount
  if (tasksElement) tasksElement.textContent = tasksCount

  const cleanupBtn = document.getElementById("cleanupBtn")
  const emptyTrashBtn = document.getElementById("emptyTrashBtn")

  const hasItems = trashItems.length > 0
  const hasExpiredItems = trashItems.some((item) => new Date(item.expiresAt) <= new Date())

  if (cleanupBtn) {
    cleanupBtn.disabled = !hasExpiredItems
    cleanupBtn.style.opacity = hasExpiredItems ? "1" : "0.5"
  }

  if (emptyTrashBtn) {
    emptyTrashBtn.disabled = !hasItems
    emptyTrashBtn.style.opacity = hasItems ? "1" : "0.5"
  }
}

// Filter trash items
function filterTrashItems() {
  renderTrashItems()
}

// Preview trash item
function previewTrashItem(itemId) {
  const item = trashItems.find((i) => i.id === itemId)
  if (!item) return

  currentPreviewItem = item

  const modal = document.getElementById("previewModal")
  const title = document.getElementById("previewModalTitle")
  const content = document.getElementById("previewModalContent")

  if (!modal || !title || !content) return

  title.textContent = `Preview ${getTypeDisplayName(item.type)}: ${item.title}`

  content.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <span class="trash-item-type ${item.type}">${getTypeDisplayName(item.type)}</span>
                <span style="background: rgba(107, 114, 128, 0.1); color: #6B7280; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                    ${escapeHtml(item.category)}
                </span>
            </div>
            <div style="font-size: 0.875rem; color: var(--subtext); margin-bottom: 1rem;">
                <div>Dihapus: ${formatTrashDate(item.deletedAt)}</div>
                <div>Kedaluwarsa: ${formatTrashDate(item.expiresAt)}</div>
            </div>
        </div>
        
        <div style="background: var(--content-background); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
            <h4 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.125rem; font-weight: 600;">
                ${escapeHtml(item.title)}
            </h4>
            ${
              item.content
                ? `
                <div style="color: var(--primary-color); line-height: 1.6; white-space: pre-wrap;">
                    ${escapeHtml(item.content)}
                </div>
            `
                : '<div style="color: var(--subtext); font-style: italic;">Tidak ada konten</div>'
            }
        </div>
        
        ${
          item.originalData.progress !== undefined
            ? `
            <div style="margin-top: 1rem;">
                <div style="font-size: 0.875rem; font-weight: 500; color: var(--primary-color); margin-bottom: 0.5rem;">
                    Progress: ${item.originalData.progress}%
                </div>
                <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, var(--info-color), #10B981); width: ${item.originalData.progress}%; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `
            : ""
        }
    `

  modal.classList.add("active")

  // Setup tombol modal actions
  setupPreviewModalButtons()
}

// Fungsi baru untuk setup tombol modal
function setupPreviewModalButtons() {
  const restoreBtn = document.getElementById("restoreFromPreviewBtn")
  const closeBtn = document.querySelector("#previewModal .btn-secondary")

  if (restoreBtn) {
    // Remove existing event listeners
    restoreBtn.replaceWith(restoreBtn.cloneNode(true))
    const newRestoreBtn = document.getElementById("restoreFromPreviewBtn")

    newRestoreBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      restoreFromPreview()
    })
  }

  if (closeBtn) {
    closeBtn.replaceWith(closeBtn.cloneNode(true))
    const newCloseBtn = document.querySelector("#previewModal .btn-secondary")

    newCloseBtn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      closeViewModal()
    })
  }
}

// Close preview modal
function closeViewModal() {
  const modal = document.getElementById("previewModal")
  if (modal) {
    modal.classList.remove("active")
  }
  currentPreviewItem = null
}

// Enhanced restore from preview with better feedback
function restoreFromPreview() {
  if (!currentPreviewItem) {
    showTrashNotification("Item tidak ditemukan", "error")
    return
  }

  const itemTitle = currentPreviewItem.title
  const itemType = getTypeDisplayName(currentPreviewItem.type)

  // Show loading state
  const restoreBtn = document.getElementById("restoreFromPreviewBtn")
  if (restoreBtn) {
    restoreBtn.disabled = true
    restoreBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Memulihkan...
    `
  }

  // Simulate processing delay for better UX
  setTimeout(() => {
    const success = restoreItem(currentPreviewItem.id)

    if (success) {
      showTrashNotification(`${itemType} "${itemTitle}" berhasil dipulihkan`, "success")
      closeViewModal()
    } else {
      showTrashNotification(`Gagal memulihkan ${itemType.toLowerCase()}`, "error")

      // Reset button state
      if (restoreBtn) {
        restoreBtn.disabled = false
        restoreBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16l-5-5 5-5"/>
          </svg>
          Pulihkan
        `
      }
    }
  }, 800)
}

// Confirmation functions
function confirmRestore(itemId) {
  const item = trashItems.find((i) => i.id === itemId)
  if (!item) return

  showConfirmModal(
    "Pulihkan Item",
    `Apakah Anda yakin ingin memulihkan ${getTypeDisplayName(item.type).toLowerCase()} "${item.title}"?`,
    "Pulihkan",
    () => restoreItem(itemId),
  )
}

function confirmPermanentDelete(itemId) {
  const item = trashItems.find((i) => i.id === itemId)
  if (!item) return

  showConfirmModal(
    "Hapus Permanen",
    `Apakah Anda yakin ingin menghapus permanen ${getTypeDisplayName(item.type).toLowerCase()} "${item.title}"? Tindakan ini tidak dapat dibatalkan.`,
    "Hapus Permanen",
    () => permanentlyDeleteItem(itemId),
  )
}

function confirmEmptyTrash() {
  if (trashItems.length === 0) {
    showTrashNotification("Sampah sudah kosong", "info")
    return
  }

  showConfirmModal(
    "Kosongkan Sampah",
    `Apakah Anda yakin ingin menghapus semua ${trashItems.length} item dari sampah? Tindakan ini tidak dapat dibatalkan.`,
    "Kosongkan Sampah",
    emptyTrash,
  )
}

// Show confirmation modal
function showConfirmModal(title, message, actionText, action) {
  const modal = document.getElementById("confirmModal")
  const titleElement = document.getElementById("confirmModalTitle")
  const messageElement = document.getElementById("confirmModalMessage")
  const actionBtn = document.getElementById("confirmActionBtn")

  if (!modal || !titleElement || !messageElement || !actionBtn) return

  titleElement.textContent = title
  messageElement.textContent = message
  actionBtn.textContent = actionText

  confirmAction = action
  modal.classList.add("active")
}

// Close confirmation modal
function closeConfirmModal() {
  const modal = document.getElementById("confirmModal")
  if (modal) {
    modal.classList.remove("active")
  }
  confirmAction = null
}

// Execute confirmation action
function executeConfirmAction() {
  if (confirmAction) {
    confirmAction()
  }
  closeConfirmModal()
}

// Setup automatic cleanup
function setupAutoCleanup() {
  setInterval(
    () => {
      cleanupExpiredItems(false)
    },
    60 * 60 * 1000,
  )

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      cleanupExpiredItems(false)
    }
  })
}

// Utility functions for trash
function generateTrashId() {
  return "trash_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

function getTypeDisplayName(type) {
  const names = {
    notes: "Catatan",
    goals: "Tujuan",
    tasks: "Tugas",
  }
  return names[type] || type
}

function formatTrashDate(dateString) {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return ""
  }
}

function showTrashNotification(message, type = "info") {
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

// =======================
// SECTION: TUJUAN DAN TUGAS (UPDATED WITH TRASH)
// =======================
let goals = []
let tugasList = []
let editingIndex = -1
let currentPage = ""

function getDummyGoals() {
  return [
    {
      id: 1,
      title: "Belajar Bahasa Inggris",
      description: "Meningkatkan kemampuan bahasa Inggris untuk keperluan karir",
      category: "Pendidikan",
      startDate: "2025-01-01",
      targetDate: "2025-12-31",
      progress: 35,
      completed: false,
      tasks: [
        {
          id: 1,
          title: "Belajar 10 kosakata baru",
          deadline: "2025-02-01",
          priority: "High",
          completed: false,
        },
        {
          id: 2,
          title: "Latihan berbicara dengan teman",
          deadline: "2025-03-01",
          priority: "Medium",
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Menabung untuk Liburan",
      description: "Mengumpulkan dana sebesar 10 juta untuk liburan keluarga",
      category: "Keuangan",
      startDate: "2025-01-01",
      targetDate: "2025-07-31",
      progress: 60,
      completed: false,
      tasks: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Olahraga Rutin",
      description: "Berolahraga minimal 3x seminggu untuk menjaga kesehatan",
      category: "Kesehatan",
      startDate: "2025-01-01",
      targetDate: "2025-12-31",
      progress: 100,
      completed: true,
      tasks: [],
      createdAt: new Date().toISOString(),
    },
  ]
}

function getDummyTugas() {
  return [
    {
      id: 1,
      title: "Tugas Desain UI",
      description: "Membuat website untuk proyek akhir",
      category: "Proyek",
      startDate: "2025-06-01",
      targetDate: "2025-06-15",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Tugas Aplikasi",
      description: "Membuat Aplikasi untuk proyek akhir",
      category: "Praktikum",
      startDate: "2025-06-01",
      targetDate: "2025-07-20",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Laporan Penelitian",
      description: "Menyelesaikan laporan penelitian semester",
      category: "Teori",
      startDate: "2025-01-15",
      targetDate: "2025-02-28",
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ]
}

function initGoals() {
  goals = getDummyGoals()
  goals.forEach((goal) => {
    if (!goal.tasks || !Array.isArray(goal.tasks)) {
      goal.tasks = []
    }
  })
}
function initTugas() {
  tugasList = getDummyTugas()
}
function saveGoals() {}
function saveTugas() {}

function formatDate(dateString) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

// Enhanced delete functions with trash integration
function deleteGoal(index) {
  if (confirm("Apakah Anda yakin ingin menghapus tujuan ini? Item akan dipindahkan ke sampah.")) {
    const goal = goals[index]
    addToTrash(goal, "goals")
    goals.splice(index, 1)
    saveGoals()
    renderGoals()
  }
}

function deleteTugas(index) {
  if (confirm("Apakah Anda yakin ingin menghapus tugas ini? Item akan dipindahkan ke sampah.")) {
    const tugas = tugasList[index]
    addToTrash(tugas, "tasks")
    tugasList.splice(index, 1)
    saveTugas()
    renderTugas()
  }
}

// ------------------ RENDER TUJUAN (fitur lengkap) ------------------
function renderGoals() {
  const goalsGrid = document.getElementById("goalsGrid")
  const emptyState = document.getElementById("emptyState")
  if (!goalsGrid || !emptyState) return

  if (goals.length === 0) {
    goalsGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }
  goalsGrid.style.display = "grid"
  emptyState.style.display = "none"

  goalsGrid.innerHTML = goals
    .map((goal, index) => {
      const totalTasks = Array.isArray(goal.tasks) ? goal.tasks.length : 0
      const completedTasks = goal.tasks.filter((task) => task.completed).length
      const progress = totalTasks == 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

      return `
        <div class="goal-card ${goal.completed ? "completed" : ""}">
            <div class="goal-header">
                <div>
                    <h3 class="goal-title">${goal.title}</h3>
                    <span class="goal-category">${goal.category || ""}</span>
                    <button class="add-task-btn" onclick="openTaskModal(${index})">+ Add Task</button>
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
            <div class="goal-tasks" id="taskList-${index}">
                <h4 style="color: var(--primary-color);">Tasks:</h4>
                <ul>
                    ${goal.tasks
                      .map(
                        (task) => `
                        <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
                            <span class="task-title">${task.title}</span>
                            <span class="task-priority">${task.priority}</span>
                            <span class="task-deadline">${task.deadline}</span>
                            <button class="task-complete-btn" onclick="toggleTaskCompletion(${index}, ${task.id})">
                                ${task.completed ? "Undo" : "Complete"}
                            </button>
                            <button class="task-delete-btn" onclick="deleteTask(${index}, ${task.id})">Delete</button>
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
                    <button class="action-btn complete-btn" onclick="toggleComplete(${index}, goals, renderGoals)">Selesai</button>
                `
                    : `
                    <button class="action-btn" style="background: var(--subtext);" onclick="toggleComplete(${index}, goals, renderGoals)">Batal</button>
                `
                }
                <button class="action-btn edit-btn" onclick="editGoal(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteGoal(${index})">Hapus</button>
            </div>
        </div>
        `
    })
    .join("")
}

// ------------------ RENDER TUGAS (fitur minimal, sesuai permintaan) ------------------
function renderTugas() {
  const tugasGrid = document.getElementById("goalsGrid")
  const emptyState = document.getElementById("emptyState")
  if (!tugasGrid || !emptyState) return

  if (tugasList.length === 0) {
    tugasGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }
  tugasGrid.style.display = "grid"
  emptyState.style.display = "none"

  tugasGrid.innerHTML = tugasList
    .map(
      (tugas, index) => `
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
                    <button class="action-btn complete-btn" onclick="toggleCompleteTugas(${index})">Selesai</button>
                `
                    : `
                    <button class="action-btn" style="background: var(--subtext);" onclick="toggleCompleteTugas(${index})">Batal</button>
                `
                }
                <button class="action-btn edit-btn" onclick="editTugas(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteTugas(${index})">Hapus</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// ----------- Halaman Tujuan -----------
function initTujuanPage() {
  currentPage = "Tujuan"
  initGoals()
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
}

// ----------- Halaman Tugas -----------
function initTugasPage() {
  currentPage = "Tugas"
  initTugas()
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
}

// ------------- Form Tujuan ---------------
function handleGoalFormSubmit(e) {
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
    tasks: editingIndex >= 0 ? goals[editingIndex].tasks : [],
    createdAt: editingIndex >= 0 ? goals[editingIndex].createdAt : new Date().toISOString(),
    id: editingIndex >= 0 ? goals[editingIndex].id : Date.now(),
  }
  if (editingIndex >= 0) {
    goals[editingIndex] = goalData
  } else {
    goals.push(goalData)
  }
  saveGoals()
  renderGoals()
  closeModal()
  editingIndex = -1
}
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
function closeModal() {
  const modal = document.getElementById("goalModal")
  const form = document.getElementById("goalForm")
  if (modal) modal.classList.remove("active")
  if (form) form.reset()
  editingIndex = -1
}
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

function toggleComplete(index, dataList, renderFunction) {
  dataList[index].completed = !dataList[index].completed
  renderFunction()
}

// ------------ Task kecil Tujuan ------------
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
function addTask(goalIndex, event) {
  event.preventDefault()

  const taskTitle = document.getElementById("taskTitle").value.trim()
  const taskPriority = document.getElementById("taskPriority").value
  const taskDeadline = document.getElementById("taskDeadline").value

  if (!taskTitle) {
    alert("Judul task harus diisi!")
    return
  }
  const newTask = {
    id: Date.now(),
    title: taskTitle,
    priority: taskPriority,
    deadline: taskDeadline,
    completed: false,
  }
  if (!goals[goalIndex].tasks) {
    goals[goalIndex].tasks = []
  }
  goals[goalIndex].tasks.push(newTask)

  goals[goalIndex].tasks.sort((a, b) => {
    const priorityOrder = { High: 3, Medium: 2, Low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  saveGoals()
  renderGoals()
  closeTaskModal()
}
function toggleTaskCompletion(goalIndex, taskId) {
  const task = goals[goalIndex].tasks.find((t) => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    saveGoals()
    renderGoals()
  }
}
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
function deleteTask(goalIndex, taskId) {
  if (confirm("Apakah Anda yakin ingin menghapus task ini?")) {
    const taskIndex = goals[goalIndex].tasks.findIndex((task) => task.id === taskId)
    if (taskIndex >= 0) {
      goals[goalIndex].tasks.splice(taskIndex, 1)
      saveGoals()
      renderGoals()
    }
  }
}

// ------------- Form Tugas ---------------
function handleTugasFormSubmit(e) {
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
    createdAt: editingIndex >= 0 ? tugasList[editingIndex].createdAt : new Date().toISOString(),
    id: editingIndex >= 0 ? tugasList[editingIndex].id : Date.now(),
  }
  if (editingIndex >= 0) {
    tugasList[editingIndex] = tugasData
  } else {
    tugasList.push(tugasData)
  }
  saveTugas()
  renderTugas()
  closeModal()
  editingIndex = -1
}
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

function toggleCompleteTugas(index) {
  tugasList[index].completed = !tugasList[index].completed
  renderTugas()
}

// Validasi tanggal
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

// Tambahkan fungsi search untuk Tugas dan Tujuan
function setupSearchFunctionality() {
  // Search untuk Tugas
  const searchTugas = document.getElementById('searchTugas');
  if (searchTugas) {
    searchTugas.addEventListener('input', () => {
      renderTugas();
    });
  }

  // Search untuk Tujuan
  const searchTujuan = document.getElementById('searchTujuan');
  if (searchTujuan) {
    searchTujuan.addEventListener('input', () => {
      renderGoals();
    });
  }
}

// Fungsi untuk filter Tugas berdasarkan search
function getFilteredTugas() {
  if (!tugasList) return [];

  let filtered = [...tugasList];

  // Filter berdasarkan search term
  const searchTerm = document.getElementById('searchTugas')?.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(tugas => 
      tugas.title.toLowerCase().includes(searchTerm) ||
      tugas.description.toLowerCase().includes(searchTerm) ||
      tugas.category.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

// Fungsi untuk filter Tujuan berdasarkan search
function getFilteredGoals() {
  if (!goals) return [];

  let filtered = [...goals];

  // Filter berdasarkan search term
  const searchTerm = document.getElementById('searchTujuan')?.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter(goal => 
      goal.title.toLowerCase().includes(searchTerm) ||
      goal.description.toLowerCase().includes(searchTerm) ||
      goal.category.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

// Update fungsi renderTugas untuk menggunakan filtered data
function renderTugas() {
  const tugasGrid = document.getElementById("goalsGrid")
  const emptyState = document.getElementById("emptyState")
  if (!tugasGrid || !emptyState) return

  const filteredTugas = getFilteredTugas();

  if (filteredTugas.length === 0) {
    tugasGrid.style.display = "none"
    emptyState.style.display = "block"
    return
  }
  tugasGrid.style.display = "grid"
  emptyState.style.display = "none"

  tugasGrid.innerHTML = filteredTugas
    .map((tugas, index) => {
      // Cari index asli dari tugasList
      const originalIndex = tugasList.findIndex(t => t.id === tugas.id);
      
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


// Update fungsi initTujuanPage untuk setup search
function initTujuanPage() {
  currentPage = "Tujuan"
  initGoals()
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
  
  // Setup search functionality
  setupSearchFunctionality()
}

// Update fungsi initTugasPage untuk setup search
function initTugasPage() {
  currentPage = "Tugas"
  initTugas()
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
  
  // Setup search functionality
  setupSearchFunctionality()
}

// =======================
// SECTION: AGENDA
// =======================

// generate events data dari goals dan tugas
function generateEventsData() {
  const goals = getDummyGoals()
  const tugas = getDummyTugas()
  const generatedEvents = []

  // convert goals to events
  goals.forEach((goal) => {
    // mulai
    generatedEvents.push({
      id: `goal-start-${goal.id}`,
      title: `Mulai: ${goal.title}`,
      description: goal.description,
      category: goal.category,
      date: goal.startDate,
      type: `goal`,
      originalData: goal,
    })

    //target
    generatedEvents.push({
      id: `goal-end-${goal.id}`,
      title: `Target: ${goal.title}`,
      description: `Target penyelesaian: ${goal.description}`,
      category: goal.category,
      date: goal.targetDate,
      type: `goal`,
      originalData: goal,
    })

    // task dalam goal
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
    // mulai
    generatedEvents.push({
      id: `tugas-start-${task.id}`,
      title: `Mulai: ${task.title}`,
      description: task.description,
      category: task.category,
      date: task.startDate,
      type: "tugas",
      originalData: task,
    })

    // deadline
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
}

// variabel global kalender
let currentDate = new Date()
let currentView = "month"
let selectedDate = null
let events = []
let currentWeekStart = null

// Inisialisasi kalender
function initKalenderPage() {
  // generate events dari data dummy
  events = generateEventsData()
  currentDate = new Date()
  currentView = "month"
  selectedDate = null
  currentWeekStart = getWeekStart(currentDate)

  // render kalender
  renderCalendar()

  // setup event listener
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

  // year selector
  const yearSelect = document.getElementById("yearSelect")
  if (yearSelect) {
    yearSelect.addEventListener("change", function () {
      currentDate.setFullYear(Number.parseInt(this.value))
      currentWeekStart = getWeekStart(currentDate)
      renderCalendar()
    })
  }

  // modal close
  const eventModal = document.getElementById("eventModal")
  if (eventModal) {
    eventModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeEventModal()
      }
    })
  }

  // escape key to close
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

  // current view
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

  // days grid
  const daysGridDiv = document.createElement("div")
  daysGridDiv.className = "days-grid"

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
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

  // Buat header mingguan
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

  // Buat container untuk konten mingguan
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
    const lastDay = new Date(currentDate.getFullYear(), month + 1, 0)
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

// =======================
// SECTION: CATATAN (NOTES) WITH TRASH INTEGRATION
// =======================

let notesList = []
let editingNoteIndex = -1
let notesView = "grid"

// Initialize notes page
function initCatatanPage() {
  console.log("Initializing Catatan Page...")
  loadNotes()
  renderNotes()
  setupNotesEventListeners()
  loadUserPreferences()
}

// Setup event listeners for notes
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

// Load notes from localStorage
function loadNotes() {
  try {
    const saved = localStorage.getItem("notes")
    notesList = saved ? JSON.parse(saved) : getDummyNotes()
  } catch (error) {
    console.error("Error loading notes:", error)
    notesList = getDummyNotes()
  }
}

// Save notes to localStorage
function saveNotes() {
  try {
    localStorage.setItem("notes", JSON.stringify(notesList))
  } catch (error) {
    console.error("Error saving notes:", error)
  }
}

// Get dummy notes for initial data
function getDummyNotes() {
  return [
    {
      id: "note_1",
      title: "Ide Proyek Baru",
      content:
        "Membuat aplikasi manajemen tugas yang sederhana dan mudah digunakan. Fitur utama:\n- Dashboard yang clean\n- Manajemen catatan\n- Kalender terintegrasi",
      category: "Ide",
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "note_2",
      title: "Meeting Notes",
      content:
        "Hasil meeting dengan tim:\n- Deadline proyek: 15 Februari\n- Pembagian tugas sudah selesai\n- Review mingguan setiap Jumat",
      category: "Kerja",
      isPinned: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "note_3",
      title: "Daftar Belanja",
      content: "Kebutuhan minggu ini:\n- Beras 5kg\n- Minyak goreng\n- Sayuran segar\n- Buah-buahan\n- Susu",
      category: "Personal",
      isPinned: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]
}

// Enhanced delete note function with trash integration
function deleteNote(index) {
  if (!notesList || index < 0 || index >= notesList.length) return

  const note = notesList[index]
  if (confirm(`Apakah Anda yakin ingin menghapus catatan "${note.title}"? Item akan dipindahkan ke sampah.`)) {
    // Add to trash
    addToTrash(note, "notes")

    // Remove from original list
    notesList.splice(index, 1)
    saveNotes()
    renderNotes()
  }
}

// Render notes to the grid
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

// Get filtered notes based on search
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

// Open note modal for adding/editing
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

// Handle form submission
function handleNoteFormSubmit(e) {
  e.preventDefault()

  // Validate form
  if (!validateNoteForm()) {
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  if (submitBtn) {
    submitBtn.classList.add("loading")
    submitBtn.disabled = true
  }

  // Simulate processing delay
  setTimeout(() => {
    const titleInput = document.getElementById("noteTitle")
    const contentInput = document.getElementById("noteContent")
    const categoryInput = document.getElementById("noteCategory")
    const isPinnedInput = document.getElementById("noteIsPinned")

    const title = titleInput?.value.trim() || ""
    const content = contentInput?.value.trim() || ""
    const category = categoryInput?.value || "Lainnya"
    const isPinned = isPinnedInput?.checked || false

    const now = new Date().toISOString()

    const noteData = {
      title,
      content,
      category,
      isPinned,
      updatedAt: now,
    }

    if (!notesList) notesList = []

    if (editingNoteIndex >= 0) {
      // Update existing note
      notesList[editingNoteIndex] = {
        ...notesList[editingNoteIndex],
        ...noteData,
      }
    } else {
      // Add new note
      noteData.id = generateNoteId()
      noteData.createdAt = now
      notesList.unshift(noteData)
    }

    saveNotes()
    renderNotes()
    closeNoteModal()

    if (submitBtn) {
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false
    }
  }, 500)
}

// Edit note function
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

// Utility functions
function escapeHtml(text) {
  if (typeof text !== "string") return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function truncateText(text, maxLength) {
  if (!text || typeof text !== "string") return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

function generateNoteId() {
  return "note_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
}

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

// Change notes view (grid/list)
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

// Enhanced form validation
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

function showFieldSuccess(input) {
  if (input) {
    input.classList.add("success")
    input.classList.remove("error")
  }
}

function clearFieldError(input, errorElement) {
  if (input) {
    input.classList.remove("error", "success")
  }
  if (errorElement) {
    errorElement.innerHTML = ""
  }
}

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

// =======================
// SECTION: SETTING
// =======================

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
  initSetting()
  createSettingsOverlay();
})

// settings overlay
function createSettingsOverlay(){
  if (document.getElementById("settingsOverlay")) return

  const settingsHTML = `
  <!-- Settings Popup Overlay -->
    <div id="settingsOverlay" class="settings-overlay">
        <div class="settings-popup">
            <div class="settings-header">
                <h2 class="settings-title">
                    <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.06a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.06a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.06a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Pengaturan
                </h2>
                <button class="close-settings" onclick="closeSettings()">×</button>
            </div>

            <div class="settings-menu">
                <!-- Theme Toggle -->
                <div class="settings-item" onclick="toggleThemeFromSettings()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"/>
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <div class="settings-text">
                            <span class="settings-label">Tema</span>
                            <span class="settings-description">Ubah tampilan terang/gelap</span>
                        </div>
                    </div>
                    <div id="themeSwitch" class="theme-switch">
                        <div class="theme-switch-handle"></div>
                    </div>
                </div>

                <!-- Logout -->
                <div class="settings-item logout" onclick="confirmLogout()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <div class="settings-text">
                            <span class="settings-label">Keluar</span>
                            <span class="settings-description">Keluar dari akun Anda</span>
                        </div>
                    </div>
                </div>

                <!-- Delete Account -->
                <div class="settings-item delete" onclick="confirmDeleteAccount()">
                    <div class="settings-item-content">
                        <svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <div class="settings-text">
                            <span class="settings-label">Hapus Akun</span>
                            <span class="settings-description">Hapus akun secara permanen</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `
  document.body.insertAdjacentHTML('beforeend', settingsHTML)
}

// Initialize settings
function initSetting() {
  // Check if dark mode is enabled
  const isDarkMode = document.body.classList.contains("dark") || localStorage.getItem("theme") === "dark"

  // Apply theme
  if (isDarkMode) {
    enableDarkMode()
  } else {
    enableLightMode()
  }

  updateThemeSwitch(isDarkMode)
}

// Update theme switch visual state - FIXED
function updateThemeSwitch(isDark) {
  const themeSwitch = document.getElementById("themeSwitch")
  if (themeSwitch) {
    if (isDark) {
      themeSwitch.classList.add("active")
    } else {
      themeSwitch.classList.remove("active")
    }
  }
}

// Enable dark mode - FIXED
function enableDarkMode() {
  document.body.classList.add("dark")

  // Apply dark mode CSS variables
  const root = document.documentElement
  Object.entries(cssVariables.dark).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

// Enable light mode - FIXED
function enableLightMode() {
  document.body.classList.remove("dark")

  // Apply light mode CSS variables
  const root = document.documentElement
  Object.entries(cssVariables.light).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
}

// Open settings popup
function openSettings() {
  const overlay = document.getElementById("settingsOverlay")
  if (overlay) {
    overlay.classList.add("active")

    // Update theme switch state
    const isDarkMode = document.body.classList.contains("dark")
    updateThemeSwitch(isDarkMode)

    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Focus trap
    trapFocus(overlay)
  }
}

// Enhanced close settings with smooth animation
function closeSettings() {
  const overlay = document.getElementById("settingsOverlay")
  if (overlay) {
    // Add closing class for exit animation
    overlay.classList.add("closing")

    // Remove active class after a short delay
    setTimeout(() => {
      overlay.classList.remove("active", "closing")
      document.body.style.overflow = ""
    }, 300)
  }
}

// Enhanced theme toggle with micro-interactions - FIXED
function toggleThemeFromSettings() {
  const themeSwitch = document.getElementById("themeSwitch")
  const isDarkMode = document.body.classList.contains("dark")

  // Add loading state to switch
  if (themeSwitch) {
    themeSwitch.style.pointerEvents = "none"
    themeSwitch.style.transform = "scale(0.95)"
  }

  // Smooth transition delay
  setTimeout(() => {
    if (isDarkMode) {
      enableLightMode()
      updateThemeSwitch(false)
    } else {
      enableDarkMode()
      updateThemeSwitch(true)
    }

    // Save theme preference
    localStorage.setItem("theme", isDarkMode ? "light" : "dark")

    // Restore switch interaction
    if (themeSwitch) {
      themeSwitch.style.pointerEvents = "auto"
      themeSwitch.style.transform = "scale(1)"
    }

    // Show enhanced feedback
    showEnhancedThemeChangeNotification(!isDarkMode)
  }, 150)
}

// Confirm logout - ADDED
function confirmLogout() {
  const confirmDialog = createConfirmDialog(
    "Konfirmasi Keluar",
    "Apakah Anda yakin ingin keluar dari akun?\n\nAnda akan diarahkan ke halaman login.",
    "Keluar",
    "Batal",
    performLogout,
    false,
  )

  document.body.appendChild(confirmDialog)
}

// Perform logout - ADDED
function performLogout() {
  // Show loading state
  showLoadingNotification("Sedang keluar dari akun...")

  // Simulate logout process
  setTimeout(() => {
    // Clear user data (simulate)
    localStorage.removeItem("userToken")
    localStorage.removeItem("userData")
    localStorage.removeItem("userSession")

    // Show success message
    showSuccessNotification("Berhasil keluar dari akun")

    // Close settings
    closeSettings()

    // Redirect to login page (simulate)
    setTimeout(() => {
      // In real app, you would redirect to login page
      // window.location.href = 'login.html';
      alert("Anda telah keluar dari akun. Dalam aplikasi nyata, Anda akan diarahkan ke halaman login.")
    }, 1500)
  }, 2000)
}

// Confirm delete account - ADDED
function confirmDeleteAccount() {
  const confirmDialog = createConfirmDialog(
    "Hapus Akun Permanen",
    "⚠️ PERINGATAN PENTING ⚠️\n\nTindakan ini TIDAK DAPAT DIBATALKAN!\n\nSemua data Anda akan dihapus secara permanen:\n• Profil dan informasi pribadi\n• Semua catatan dan tujuan\n• Riwayat aktivitas\n• Pengaturan aplikasi\n\nApakah Anda benar-benar yakin ingin menghapus akun?",
    "Ya, Hapus Akun",
    "Batal",
    performDeleteAccount,
    true, // isDangerous
  )

  document.body.appendChild(confirmDialog)
}

// Perform delete account - ADDED
function performDeleteAccount() {
  // Show loading state
  showLoadingNotification("Menghapus akun dan semua data...")

  // Simulate delete process
  setTimeout(() => {
    // Clear all data (simulate)
    localStorage.clear()
    sessionStorage.clear()

    // Clear cookies (simulate)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    // Show success message
    showSuccessNotification("Akun berhasil dihapus")

    // Close settings
    closeSettings()

    // Redirect to homepage (simulate)
    setTimeout(() => {
      // In real app, you would redirect to homepage or registration
      // window.location.href = 'index.html';
      alert("Akun telah dihapus permanen. Dalam aplikasi nyata, Anda akan diarahkan ke halaman utama.")
    }, 1500)
  }, 3000)
}

// Enhanced theme change notification with better animations
function showEnhancedThemeChangeNotification(isDark) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isDark ? "linear-gradient(135deg, #1F2937, #374151)" : "linear-gradient(135deg, #FFFFFF, #F8FAFC)"};
        color: ${isDark ? "#F1F5F9" : "#191919"};
        padding: 1.25rem 1.75rem;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border: 1px solid ${isDark ? "#374151" : "#E2E8F0"};
        z-index: 3000;
        font-weight: 600;
        transform: translateX(100%) scale(0.8);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
    `

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${isDark ? "linear-gradient(135deg, #3B82F6, #1E40AF)" : "linear-gradient(135deg, #F59E0B, #D97706)"};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both;
            ">
                ${isDark ? "🌙" : "☀️"}
            </div>
            <div>
                <div style="font-size: 0.95rem; margin-bottom: 2px;">Tema ${isDark ? "Gelap" : "Terang"}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">Berhasil diaktifkan</div>
            </div>
        </div>
    `

  // Enhanced animation styles
  if (!document.getElementById("enhancedNotificationStyles")) {
    const style = document.createElement("style")
    style.id = "enhancedNotificationStyles"
    style.textContent = `
            @keyframes bounceIn {
                0% {
                    transform: scale(0.3) rotate(-180deg);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.1) rotate(-90deg);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                0% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateX(120%) scale(0.8);
                    opacity: 0;
                }
            }
            
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  // Trigger entrance animation
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0) scale(1)"
    notification.style.opacity = "1"
  })

  // Enhanced exit animation
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1) forwards"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 400)
  }, 3500)
}

// Enhanced confirm dialog with better animations
function createConfirmDialog(title, message, confirmText, cancelText, onConfirm, isDangerous = false) {
  const overlay = document.createElement("div")
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(0px);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `

  const dialog = document.createElement("div")
  dialog.style.cssText = `
        background: var(--content-background);
        border-radius: 20px;
        padding: 2.5rem;
        width: 90%;
        max-width: 480px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid var(--border-color);
        transform: scale(0.7) translateY(50px);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `

  dialog.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="
                color: var(--primary-color); 
                font-size: 1.4rem; 
                font-weight: 700; 
                margin-bottom: 1.25rem; 
                display: flex; 
                align-items: center; 
                gap: 0.75rem;
                opacity: 0;
                transform: translateY(20px);
                animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
            ">
                <div style="
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: ${isDangerous ? "linear-gradient(135deg, #FEE2E2, #FECACA)" : "linear-gradient(135deg, #DBEAFE, #BFDBFE)"};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s both;
                ">
                    ${
                      isDangerous
                        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
                        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>'
                    }
                </div>
                ${title}
            </h3>
            <p style="
                color: var(--subtext); 
                line-height: 1.7; 
                white-space: pre-line;
                font-size: 1rem;
                opacity: 0;
                transform: translateY(20px);
                animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
            ">${message}</p>
        </div>
        <div style="
            display: flex; 
            gap: 1rem; 
            justify-content: flex-end;
            opacity: 0;
            transform: translateY(20px);
            animation: slideInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards;
        ">
            <button id="cancelBtn" style="
                background: var(--border-color);
                color: var(--primary-color);
                border: none;
                padding: 0.875rem 1.75rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            ">
                ${cancelText}
            </button>
            <button id="confirmBtn" style="
                background: ${isDangerous ? "linear-gradient(135deg, var(--danger-color), #DC2626)" : "linear-gradient(135deg, var(--info-color), #2563EB)"};
                color: white;
                border: none;
                padding: 0.875rem 1.75rem;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 0 4px 15px ${isDangerous ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"};
                position: relative;
                overflow: hidden;
            ">
                ${confirmText}
            </button>
        </div>
    `

  overlay.appendChild(dialog)

  // Enhanced button interactions
  const cancelBtn = dialog.querySelector("#cancelBtn")
  const confirmBtn = dialog.querySelector("#confirmBtn")

  // Add ripple effect to buttons
  const addRippleEffect = (button) => {
    button.addEventListener("click", (e) => {
      const ripple = document.createElement("span")
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `

      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    })
  }

  addRippleEffect(cancelBtn)
  addRippleEffect(confirmBtn)

  // Enhanced hover effects
  cancelBtn.addEventListener("mouseenter", () => {
    cancelBtn.style.transform = "translateY(-2px) scale(1.02)"
    cancelBtn.style.background = "var(--subtext)"
    cancelBtn.style.color = "white"
  })

  cancelBtn.addEventListener("mouseleave", () => {
    cancelBtn.style.transform = "translateY(0) scale(1)"
    cancelBtn.style.background = "var(--border-color)"
    cancelBtn.style.color = "var(--primary-color)"
  })

  confirmBtn.addEventListener("mouseenter", () => {
    confirmBtn.style.transform = "translateY(-2px) scale(1.02)"
    confirmBtn.style.boxShadow = `0 8px 25px ${isDangerous ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.4)"}`
  })

  confirmBtn.addEventListener("mouseleave", () => {
    confirmBtn.style.transform = "translateY(0) scale(1)"
    confirmBtn.style.boxShadow = `0 4px 15px ${isDangerous ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)"}`
  })

  // Event listeners
  cancelBtn.addEventListener("click", () => closeDialog(overlay))
  confirmBtn.addEventListener("click", () => {
    onConfirm()
    closeDialog(overlay)
  })

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDialog(overlay)
  })

  // Enhanced entrance animation
  requestAnimationFrame(() => {
    overlay.style.background = "rgba(0, 0, 0, 0.6)"
    overlay.style.backdropFilter = "blur(8px)"
    dialog.style.transform = "scale(1) translateY(0)"
    dialog.style.opacity = "1"
  })

  return overlay
}

// Enhanced close dialog function
function closeDialog(overlay) {
  const dialog = overlay.querySelector("div")
  dialog.style.transform = "scale(0.8) translateY(30px)"
  dialog.style.opacity = "0"
  overlay.style.background = "rgba(0, 0, 0, 0)"
  overlay.style.backdropFilter = "blur(0px)"

  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
  }, 300)
}

// Enhanced notification functions
function showLoadingNotification(message) {
  const notification = createNotification(message, "loading")
  document.body.appendChild(notification)
  return notification
}

function showSuccessNotification(message) {
  const notification = createNotification(message, "success")
  document.body.appendChild(notification)
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 4000)
}

function createNotification(message, type) {
  const notification = document.createElement("div")
  const isLoading = type === "loading"

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isLoading ? "linear-gradient(135deg, #3B82F6, #1E40AF)" : "linear-gradient(135deg, #10B981, #059669)"};
        color: white;
        padding: 1.25rem 1.75rem;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 600;
        transform: translateX(100%) scale(0.8);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        max-width: 400px;
    `

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                ${isLoading ? "animation: spin 1s linear infinite;" : ""}
            ">
                ${
                  isLoading
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>'
                }
            </div>
            <div style="font-size: 0.95rem;">${message}</div>
        </div>
    `

  // Trigger entrance animation
  requestAnimationFrame(() => {
    notification.style.transform = "translateX(0) scale(1)"
    notification.style.opacity = "1"
  })

  return notification
}

// Focus trap for accessibility
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  element.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  })

  firstElement.focus()
}
