const API_BASE = "http://localhost:5000/api";

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("profinance_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface AuthResponse {
  token?: string;
  user?: any;
  error?: string;
}

interface StateResponse {
  user?: any;
  settings?: any;
  todos?: any[];
  recurringTemplates?: any[];
  income?: any[];
  expenses?: any[];
  savings?: any[];
  events?: any[];
  error?: string;
}

interface AnalyticsResponse {
  monthlyTrend?: any[];
  expenseByCategory?: any[];
  incomeByCategory?: any[];
  savingsProgress?: any[];
  error?: string;
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem("profinance_token", data.token);
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem("profinance_token", data.token);
    return data;
  },

  logout(): void {
    localStorage.removeItem("profinance_token");
  },

  async getState(): Promise<StateResponse> {
    const res = await fetch(`${API_BASE}/state`, { headers: getHeaders() });
    if (res.status === 401 || res.status === 403) {
      this.logout();
      throw new Error("Session invalid");
    }
    return res.json();
  },

  async getAnalyticsReport(): Promise<AnalyticsResponse> {
    const res = await fetch(`${API_BASE}/reports/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Todo endpoints
  async createTodo(todo: any) {
    const res = await fetch(`${API_BASE}/todos`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    return res.json();
  },

  async deleteTodo(id: string) {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Income endpoints
  async createIncome(income: any) {
    const res = await fetch(`${API_BASE}/income`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(income),
    });
    return res.json();
  },

  async deleteIncome(id: string) {
    const res = await fetch(`${API_BASE}/income/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Expense endpoints
  async createExpense(expense: any) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(expense),
    });
    return res.json();
  },

  async deleteExpense(id: string) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Savings endpoints
  async createSavings(savings: any) {
    const res = await fetch(`${API_BASE}/savings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(savings),
    });
    return res.json();
  },

  async deleteSavings(id: string) {
    const res = await fetch(`${API_BASE}/savings/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Recurring template endpoints
  async createTemplate(template: any) {
    const res = await fetch(`${API_BASE}/templates`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(template),
    });
    return res.json();
  },

  async deleteTemplate(id: string) {
    const res = await fetch(`${API_BASE}/templates/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Event endpoints
  async createEvent(event: any) {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(event),
    });
    return res.json();
  },

  async deleteEvent(id: string) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return res.json();
  },

  // Timer endpoints
  async startTimer(todoId: string) {
    const res = await fetch(`${API_BASE}/todos/${todoId}/start-timer`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async stopTimer(todoId: string) {
    const res = await fetch(`${API_BASE}/todos/${todoId}/stop-timer`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  },

  async pauseTimer(todoId: string) {
    const res = await fetch(`${API_BASE}/todos/${todoId}/pause-timer`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return res.json();
  },

  // Settings endpoint
  async updateSettings(settings: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
