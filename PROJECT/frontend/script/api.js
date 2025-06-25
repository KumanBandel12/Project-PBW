// API Configuration
const API_BASE_URL = "http://localhost/backend/api";

// User session management
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

// API Helper functions
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

    console.log(`Making API request to: ${url}`, config) // Debug log

    try {
      const response = await fetch(url, config)

      // Log response details for debugging
      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, response.headers)

      // Get response text first to check what we're receiving
      const responseText = await response.text()
      console.log(`Response text:`, responseText.substring(0, 200) + "...") // Log first 200 chars

      // Check if response is HTML (error page)
      if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
        console.error("Received HTML instead of JSON. Possible causes:")
        console.error("1. API endpoint not found (404)")
        console.error("2. Server error (500)")
        console.error("3. Incorrect API_BASE_URL")
        console.error("4. PHP files not accessible")

        throw new Error(`Server returned HTML instead of JSON. Check if API endpoint exists: ${url}`)
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        console.error("Response text:", responseText)
        throw new Error(`Invalid JSON response from server: ${parseError.message}`)
      }

      // Check HTTP status
      if (!response.ok) {
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`
        console.error("API Error Response:", data)
        throw new Error(errorMessage)
      }

      console.log("API Success Response:", data) // Debug log
      return data
    } catch (error) {
      console.error("API Error Details:", {
        url,
        config,
        error: error.message,
        stack: error.stack,
      })

      // Provide more specific error messages
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Cannot connect to API server. Check if server is running and API_BASE_URL is correct: ${API_BASE_URL}`,
        )
      }

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
    try {
      return await API.post("auth.php", {
        action: "login",
        email: email,
        password: password,
      })
    } catch (error) {
      console.error("Login API Error:", error)
      throw new Error(`Login failed: ${error.message}`)
    }
  }

  static async register(nama, email, password) {
    try {
      return await API.post("auth.php", {
        action: "register",
        nama: nama,
        email: email,
        password: password,
      })
    } catch (error) {
      console.error("Register API Error:", error)
      throw new Error(`Registration failed: ${error.message}`)
    }
  }

  static async deleteAccount() {
    try {
      const userId = UserSession.getUserId();
      if (!userId) {
        throw new Error("User not logged in");
      }
      return await API.post("auth.php", {
        action: "delete_account",
        user_id: userId,
      });
    } catch (error) {
      console.error("Delete Account API Error:", error);
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }
}

// Tujuan API
class TujuanAPI {
  static async getAll() {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.get("tujuan.php", { user_id: userId })
    } catch (error) {
      console.error("Get Tujuan API Error:", error)
      throw new Error(`Failed to load goals: ${error.message}`)
    }
  }

  static async create(tujuanData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.post("tujuan.php", { ...tujuanData, user_id: userId })
    } catch (error) {
      console.error("Create Tujuan API Error:", error)
      throw new Error(`Failed to create goal: ${error.message}`)
    }
  }

  static async update(tujuanData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.put("tujuan.php", { ...tujuanData, user_id: userId })
    } catch (error) {
      console.error("Update Tujuan API Error:", error)
      throw new Error(`Failed to update goal: ${error.message}`)
    }
  }

  static async delete(tujuanId) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.delete("tujuan.php", { id: tujuanId, user_id: userId })
    } catch (error) {
      console.error("Delete Tujuan API Error:", error)
      throw new Error(`Failed to delete goal: ${error.message}`)
    }
  }
}

// Tugas API
class TugasAPI {
  static async getAll() {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.get("tugas.php", { user_id: userId })
    } catch (error) {
      console.error("Get Tugas API Error:", error)
      throw new Error(`Failed to load tasks: ${error.message}`)
    }
  }

  static async create(tugasData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.post("tugas.php", { ...tugasData, user_id: userId })
    } catch (error) {
      console.error("Create Tugas API Error:", error)
      throw new Error(`Failed to create task: ${error.message}`)
    }
  }

  static async update(tugasData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.put("tugas.php", { ...tugasData, user_id: userId })
    } catch (error) {
      console.error("Update Tugas API Error:", error)
      throw new Error(`Failed to update task: ${error.message}`)
    }
  }

  static async delete(tugasId) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.delete("tugas.php", { id: tugasId, user_id: userId })
    } catch (error) {
      console.error("Delete Tugas API Error:", error)
      throw new Error(`Failed to delete task: ${error.message}`)
    }
  }
}

// Catatan API
class CatatanAPI {
  static async getAll() {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.get("catatan.php", { user_id: userId })
    } catch (error) {
      console.error("Get Catatan API Error:", error)
      throw new Error(`Failed to load notes: ${error.message}`)
    }
  }

  static async create(catatanData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.post("catatan.php", { ...catatanData, user_id: userId })
    } catch (error) {
      console.error("Create Catatan API Error:", error)
      throw new Error(`Failed to create note: ${error.message}`)
    }
  }

  static async update(catatanData) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.put("catatan.php", { ...catatanData, user_id: userId })
    } catch (error) {
      console.error("Update Catatan API Error:", error)
      throw new Error(`Failed to update note: ${error.message}`)
    }
  }

  static async delete(catatanId) {
    try {
      const userId = UserSession.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }
      return await API.delete("catatan.php", { id: catatanId, user_id: userId })
    } catch (error) {
      console.error("Delete Catatan API Error:", error)
      throw new Error(`Failed to delete note: ${error.message}`)
    }
  }
}

// Test API connection
async function testAPIConnection() {
  console.log("Testing API connection...")
  console.log("API Base URL:", API_BASE_URL)

  try {
    // Test a simple endpoint
    const response = await fetch(`${API_BASE_URL}/auth.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "test",
      }),
    })

    const text = await response.text()
    console.log("API Test Response:", text.substring(0, 200))

    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      console.error("❌ API returning HTML - Check server configuration")
      console.error("Possible issues:")
      console.error("1. PHP files not in correct location")
      console.error("2. Web server not running")
      console.error("3. Incorrect API_BASE_URL")
      console.error("4. PHP not configured properly")
    } else {
      console.log("✅ API responding (may have validation errors, but server is working)")
    }
  } catch (error) {
    console.error("❌ API Connection Test Failed:", error.message)
  }
}

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  // Test API connection first
  testAPIConnection()

  // Skip auth check for login and register pages
  const currentPage = window.location.pathname
  if (
    currentPage.includes("login.html") ||
    currentPage.includes("register.html") ||
    currentPage.includes("LandingPage.html") ||
    currentPage.includes("landingPage.html")
  ) {
    return
  }

  // Check if user is logged in
  if (!UserSession.isLoggedIn()) {
    console.log("User not logged in, redirecting to login page")
    // Redirect to login page
    window.location.href = "pages/login.html"
    return
  }

  // Update user info in dashboard
  const user = UserSession.getUser()
  if (user) {
    console.log("User logged in:", user.nama)
    // Update user name in sidebar
    const userNameElement = document.querySelector(".user-name")
    const userEmailElement = document.querySelector(".user-email")

    if (userNameElement) userNameElement.textContent = user.nama
    if (userEmailElement) userEmailElement.textContent = user.email
  }
})
