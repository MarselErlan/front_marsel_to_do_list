const API_BASE_URL = "https://web-production-56fee.up.railway.app"

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  todos?: Todo[]
}

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface Todo {
  id: number
  title: string
  description?: string
  done: boolean
  start_date?: string // YYYY-MM-DD format
  start_time?: string // HH:MM:SS format
  end_date?: string // YYYY-MM-DD format
  end_time?: string // HH:MM:SS format
  due_date?: string // YYYY-MM-DD format
  owner_id?: number
  created_at?: string
}

export interface TodoCreate {
  title: string
  description?: string
  done?: boolean
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  due_date?: string
}

export interface TodoUpdate {
  title?: string
  description?: string
  done?: boolean
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  due_date?: string
}

// Add these new interfaces after the existing ones
export interface EmailVerificationRequest {
  email: string
}

export interface EmailVerificationResponse {
  message: string
  email: string
}

export interface RegisterWithVerification {
  email: string
  username: string
  password: string
  code: string // Changed from verification_code to code
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  verification_code: string
  new_password: string
}

export interface ForgotUsernameRequest {
  email: string
}

export interface ForgotUsernameResponse {
  username: string
  email: string
}

export interface VerifyResetCodeRequest {
  email: string
  verification_code: string
}

export interface VerifyResetCodeResponse {
  message: string
  username?: string
}

export interface UserCountResponse {
  total_users: number
}

// Mock data for demo mode with time fields
const MOCK_TODOS: Todo[] = [
  {
    id: 1,
    title: "Team Meeting",
    description: "Weekly standup with the development team",
    done: false,
    start_date: new Date().toISOString().split("T")[0], // Today
    start_time: "14:00", // 2:00 PM
    end_date: new Date().toISOString().split("T")[0], // Today
    end_time: "15:00", // 3:00 PM
    due_date: new Date().toISOString().split("T")[0], // Today
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Complete Project Proposal",
    description: "Finish the Q1 project proposal document",
    done: false,
    start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
    start_time: "09:00", // 9:00 AM
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
    end_time: "17:00", // 5:00 PM
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days from now
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    title: "Review Code Changes",
    description: "Review pull requests from the team",
    done: true,
    start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Yesterday
    start_time: "10:00", // 10:00 AM
    end_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Yesterday
    end_time: "11:00", // 11:00 AM
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Yesterday
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    title: "Client Call",
    description: "Discuss project requirements with client",
    done: false,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Next week
    start_time: "15:30", // 3:30 PM
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Next week
    end_time: "16:30", // 4:30 PM
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
]

let mockTodoCounter = 5
let mockTodos = [...MOCK_TODOS]

// Demo mode flag
let isDemoMode = false

// Helper function to simulate network delay
const simulateDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to handle API requests with better error handling
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`🌐 Making API request to: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // Get auth token and add to headers
    const token = todoApi.getAuthToken()
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    }

    // Only add Content-Type for JSON requests
    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json"
    }

    // Add auth header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log(`📡 API Response: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      let errorText = ""
      try {
        const errorData = await response.json()
        errorText = errorData.detail || errorData.message || JSON.stringify(errorData)
      } catch {
        errorText = await response.text()
      }
      console.error(`❌ API Error: ${response.status} - ${errorText}`)
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
    }

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log(`✅ API Response data:`, data)
      return data
    }
    return null as T
  } catch (error) {
    console.error(`❌ API Request failed:`, error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout: Server took too long to respond`)
      }
      if (error.message.includes("fetch") || error.message.includes("NetworkError") || error.message.includes("CORS")) {
        throw new Error(
          `CORS Error: Backend is working but CORS headers are missing. Make sure your backend allows requests from ${window.location.origin}`,
        )
      }
    }
    throw error
  }
}

export const todoApi = {
  // Check if we're in demo mode
  isDemoMode(): boolean {
    return isDemoMode
  },

  // Enable demo mode
  enableDemoMode(): void {
    isDemoMode = true
    console.log("🎭 Demo mode enabled")
  },

  // Disable demo mode
  disableDemoMode(): void {
    isDemoMode = false
    console.log("🌐 Demo mode disabled - using real API")
  },

  // GET /todos/ - Read all todos
  async getTodos(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning mock todos")
      await simulateDelay(300)
      return [...mockTodos]
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/`)
  },

  // GET /todos/today - Get today's tasks
  async getTodosToday(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning today's todos")
      await simulateDelay(300)
      const today = new Date().toISOString().split("T")[0]
      return mockTodos.filter((todo) => todo.due_date === today || todo.start_date === today)
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/today`)
  },

  // GET /todos/week - Get this week's tasks
  async getTodosWeek(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning this week's todos")
      await simulateDelay(300)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6))

      return mockTodos.filter((todo) => {
        const todoDate = new Date(todo.due_date || todo.start_time || todo.created_at || "")
        return todoDate >= weekStart && todoDate <= weekEnd
      })
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/week`)
  },

  // GET /todos/month - Get this month's tasks
  async getTodosMonth(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning this month's todos")
      await simulateDelay(300)
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      return mockTodos.filter((todo) => {
        const todoDate = new Date(todo.due_date || todo.start_time || todo.created_at || "")
        return todoDate >= monthStart && todoDate <= monthEnd
      })
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/month`)
  },

  // GET /todos/year - Get this year's tasks
  async getTodosYear(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning this year's todos")
      await simulateDelay(300)
      const currentYear = new Date().getFullYear()

      return mockTodos.filter((todo) => {
        const todoDate = new Date(todo.due_date || todo.start_time || todo.created_at || "")
        return todoDate.getFullYear() === currentYear
      })
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/year`)
  },

  // GET /todos/overdue - Get overdue tasks
  async getTodosOverdue(): Promise<Todo[]> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning overdue todos")
      await simulateDelay(300)
      const now = new Date()
      const today = now.toISOString().split("T")[0]

      return mockTodos.filter((todo) => !todo.done && todo.due_date && todo.due_date < today)
    }
    return apiRequest<Todo[]>(`${API_BASE_URL}/todos/overdue`)
  },

  // GET /todos/{todo_id} - Read single todo
  async getTodo(id: number): Promise<Todo> {
    if (isDemoMode) {
      console.log(`🎭 Demo mode: Getting todo ${id}`)
      await simulateDelay(200)
      const todo = mockTodos.find((t) => t.id === id)
      if (!todo) throw new Error("Todo not found")
      return todo
    }
    return apiRequest<Todo>(`${API_BASE_URL}/todos/${id}`)
  },

  // POST /todos/ - Create todo
  async createTodo(todo: TodoCreate): Promise<Todo> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Creating todo", todo)
      await simulateDelay(400)
      const newTodo: Todo = {
        id: mockTodoCounter++,
        title: todo.title,
        description: todo.description,
        done: todo.done || false,
        start_date: todo.start_date,
        start_time: todo.start_time,
        end_date: todo.end_date,
        end_time: todo.end_time,
        due_date: todo.due_date,
        created_at: new Date().toISOString(),
      }
      mockTodos.unshift(newTodo)
      return newTodo
    }
    return apiRequest<Todo>(`${API_BASE_URL}/todos/`, {
      method: "POST",
      body: JSON.stringify(todo),
    })
  },

  // PUT /todos/{todo_id} - Update todo
  async updateTodo(id: number, updates: TodoUpdate): Promise<Todo> {
    console.log(`🔄 API: Updating todo ${id} with:`, updates)

    if (isDemoMode) {
      console.log("🎭 Demo mode: Updating todo", id, updates)
      await simulateDelay(300)
      const todoIndex = mockTodos.findIndex((t) => t.id === id)
      if (todoIndex === -1) {
        console.error(`❌ Demo mode: Todo ${id} not found`)
        throw new Error("Todo not found")
      }

      mockTodos[todoIndex] = { ...mockTodos[todoIndex], ...updates }
      console.log(`✅ Demo mode: Todo ${id} updated:`, mockTodos[todoIndex])
      return mockTodos[todoIndex]
    }

    const result = await apiRequest<Todo>(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return result
  },

  // DELETE /todos/{todo_id} - Delete todo
  async deleteTodo(id: number): Promise<void> {
    if (isDemoMode) {
      console.log(`🎭 Demo mode: Deleting todo ${id}`)
      await simulateDelay(300)
      mockTodos = mockTodos.filter((t) => t.id !== id)
      return
    }
    return apiRequest<void>(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    })
  },

  // Enhanced health check with better debugging
  async healthCheck(): Promise<boolean> {
    try {
      console.log(`🏥 Health check: Testing backend at ${API_BASE_URL}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      console.log(`🔍 Testing health endpoint: ${API_BASE_URL}/health`)

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`📡 Health endpoint response: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Health check successful:`, data)

        // Don't change demo mode here - let authentication handle it
        return true
      } else {
        console.log("⚠️ Health endpoint responded but with error status")
        return false
      }
    } catch (error) {
      console.log("🎭 Backend connection failed")
      console.log("Error details:", error instanceof Error ? error.message : "Unknown error")
      return false
    }
  },

  // Get API base URL
  getApiUrl(): string {
    return API_BASE_URL
  },

  // Reset demo data
  resetDemoData(): void {
    mockTodos = [...MOCK_TODOS]
    mockTodoCounter = 5
    console.log("🔄 Demo data reset")
  },

  // Authentication methods - FORCE REAL API CALLS FOR TESTING
  async register(userData: UserCreate): Promise<User> {
    console.log("🔐 Attempting REAL user registration:", userData.username)

    try {
      // Force real API call to test CORS
      const result = await apiRequest<User>(`${API_BASE_URL}/users/`, {
        method: "POST",
        body: JSON.stringify(userData),
      })

      console.log("✅ REAL registration successful:", result)
      isDemoMode = false // Switch off demo mode on success
      return result
    } catch (error) {
      console.log("❌ REAL registration failed, falling back to demo:", error)

      // Fall back to demo mode
      console.log("🎭 Demo mode: Simulating user registration")
      await simulateDelay(500)
      return {
        id: 1,
        username: userData.username,
        email: userData.email,
        is_active: true,
        todos: [],
      }
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthToken> {
    console.log("🔐 Attempting REAL user login:", credentials.username)

    try {
      // Force real API call to test CORS
      const formData = new FormData()
      formData.append("username", credentials.username)
      formData.append("password", credentials.password)

      const result = await apiRequest<AuthToken>(`${API_BASE_URL}/token`, {
        method: "POST",
        body: formData,
      })

      console.log("✅ REAL login successful:", result)
      isDemoMode = false // Switch off demo mode on success
      return result
    } catch (error) {
      console.log("❌ REAL login failed, falling back to demo:", error)

      // Fall back to demo mode
      console.log("🎭 Demo mode: Simulating login")
      await simulateDelay(500)
      return {
        access_token: "demo_token_12345",
        token_type: "bearer",
      }
    }
  },

  // Token management
  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  },

  getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token")
    }
    return null
  },

  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  },

  // Token validation - IMPROVED
  async validateToken(): Promise<boolean> {
    const token = this.getAuthToken()
    if (!token) {
      console.log("🔐 No token to validate")
      return false
    }

    // If we're in demo mode, don't validate against real API
    if (isDemoMode) {
      console.log("🎭 Demo mode - token validation skipped")
      return true
    }

    try {
      console.log("🔐 Validating token with backend...")

      // Try to access a protected endpoint to validate token
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Shorter timeout

      const response = await fetch(`${API_BASE_URL}/todos/`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`🔐 Token validation response: ${response.status}`)

      if (response.status === 401 || response.status === 403) {
        console.log("❌ Token invalid or expired")
        return false
      }

      if (response.ok) {
        console.log("✅ Token valid")
        return true
      }

      // For other errors (500, network issues), assume token is still valid
      // This prevents logout on temporary network issues
      console.log("⚠️ Token validation inconclusive, assuming valid")
      return true
    } catch (error) {
      console.log("⚠️ Token validation failed due to network error:", error)

      if (error instanceof Error && error.name === "AbortError") {
        console.log("⏰ Token validation timed out - assuming valid")
      } else {
        console.log("🌐 Network error during validation - assuming valid")
      }

      // Don't logout on network errors - assume token is still valid
      return true
    }
  },

  // Email verification for registration
  async requestEmailVerification(email: string): Promise<EmailVerificationResponse> {
    console.log(`📧 Requesting email verification for: ${email}`)

    if (isDemoMode) {
      console.log("🎭 Demo mode: Email verification request")
      await simulateDelay(800)
      return {
        message: `Demo: Verification code would be sent to ${email}`,
        email: email,
      }
    }

    try {
      const result = await apiRequest<EmailVerificationResponse>(`${API_BASE_URL}/auth/request-verification`, {
        method: "POST",
        body: JSON.stringify({ email }),
      })

      console.log("✅ Email verification request successful:", result)
      return result
    } catch (error) {
      console.error("❌ Email verification request failed:", error)

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          throw new Error("Too many verification requests. Please wait before trying again.")
        } else if (error.message.includes("400")) {
          throw new Error("Invalid email address format.")
        } else if (error.message.includes("CORS")) {
          throw new Error("Backend connection issue. Using demo mode for now.")
        }
      }

      throw error
    }
  },

  // Register with email verification
  async registerWithVerification(userData: RegisterWithVerification): Promise<User> {
    console.log("🔐 Attempting REAL user registration with verification:", userData.username)

    try {
      const result = await apiRequest<User>(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          username: userData.username,
          password: userData.password,
          code: userData.code, // Use 'code' instead of 'verification_code'
        }),
      })

      console.log("✅ REAL registration with verification successful:", result)
      isDemoMode = false
      return result
    } catch (error) {
      console.log("❌ REAL registration failed, falling back to demo:", error)

      // Fall back to demo mode
      console.log("🎭 Demo mode: Simulating user registration with verification")
      await simulateDelay(500)
      return {
        id: 1,
        username: userData.username,
        email: userData.email,
        is_active: true,
        todos: [],
      }
    }
  },

  // Get total user count
  async getUserCount(): Promise<UserCountResponse> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Returning mock user count")
      await simulateDelay(200)
      return { total_users: Math.floor(Math.random() * 1000) + 500 } // Random number between 500-1500
    }
    return apiRequest<UserCountResponse>(`${API_BASE_URL}/users/count`)
  },

  // Forgot password
  async forgotPassword(email: string): Promise<EmailVerificationResponse> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Forgot password request")
      await simulateDelay(800)
      return {
        message: "Password reset code sent to your email",
        email: email,
      }
    }
    return apiRequest<EmailVerificationResponse>(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<{ message: string }> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Password reset")
      await simulateDelay(500)
      return { message: "Password reset successfully" }
    }
    return apiRequest<{ message: string }>(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify(resetData),
    })
  },

  // Forgot username - using Railway backend
  async forgotUsername(email: string): Promise<ForgotUsernameResponse> {
    console.log(`📧 Requesting username lookup for: ${email}`)

    if (isDemoMode) {
      console.log("🎭 Demo mode: Forgot username request")
      await simulateDelay(500)
      return {
        username: "demo_user_" + Math.floor(Math.random() * 1000),
        email: email,
      }
    }

    try {
      console.log(`🔍 Trying forgot username endpoint: ${API_BASE_URL}/users/forgot-username`)
      return await apiRequest<ForgotUsernameResponse>(`${API_BASE_URL}/users/forgot-username`, {
        method: "POST",
        body: JSON.stringify({ email }),
      })
    } catch (error) {
      console.log(`❌ Forgot username API failed:`, error)

      // If API fails, enable demo mode and return demo data
      console.log("🎭 API failed, falling back to demo mode")
      isDemoMode = true
      await simulateDelay(500)
      return {
        username: "demo_user_" + Math.floor(Math.random() * 1000),
        email: email,
      }
    }
  },

  // Verify reset code
  async verifyResetCode(email: string, verificationCode: string): Promise<VerifyResetCodeResponse> {
    if (isDemoMode) {
      console.log("🎭 Demo mode: Verify reset code")
      await simulateDelay(300)
      return {
        message: "Code verified successfully",
        username: "demo_user",
      }
    }
    return apiRequest<VerifyResetCodeResponse>(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: "POST",
      body: JSON.stringify({ email, verification_code: verificationCode }),
    })
  },
}
