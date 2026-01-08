// Mock authentication for testing without Supabase
import { mockDB } from "./mock-db";

let mockUserId: string | null = null;

export const mockAuth = {
  getUser: async () => {
    if (mockUserId) {
      return {
        data: {
          user: {
            id: mockUserId,
            email: "test@example.com",
          },
        },
        error: null,
      };
    }

    // Create a mock user
    mockUserId = `mock-user-${Date.now()}`;
    
    // Store mock user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_user_id", mockUserId);
    }

    return {
      data: {
        user: {
          id: mockUserId,
          email: "test@example.com",
        },
      },
      error: null,
    };
  },

  signUp: async (email: string, password: string) => {
    mockUserId = `mock-user-${Date.now()}`;
    
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_user_id", mockUserId);
    }

    return {
      data: {
        user: {
          id: mockUserId,
          email,
        },
      },
      error: null,
    };
  },

  signIn: async (email: string, password: string) => {
    // Load existing mock user or create new one
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("mock_user_id");
      if (existing) {
        mockUserId = existing;
      } else {
        mockUserId = `mock-user-${Date.now()}`;
        localStorage.setItem("mock_user_id", mockUserId);
      }
    } else {
      mockUserId = `mock-user-${Date.now()}`;
    }

    return {
      data: {
        user: {
          id: mockUserId,
          email,
        },
      },
      error: null,
    };
  },

  getCurrentUserId: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mock_user_id");
    }
    return mockUserId;
  },

  clearMockUser: () => {
    mockUserId = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_user_id");
    }
  },
};

// Check if we're in mock mode
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
         process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true';
}

