// Mock database implementation for testing without Supabase
// Stores data in localStorage

interface MockData {
  profiles: any[];
  identity_documents: any[];
  licenses_credentials: any[];
  bonds_insurance: any[];
  e_signatures: any[];
  preference_rankings: any[];
  buyer_preferences: any[];
  buyer_basic_info: any[];
  demography_maintenance_plans: any[];
  onboarding_steps: any[];
  payment_preferences: any[];
}

const STORAGE_KEY = "mock_database";

function getMockDB(): MockData {
  if (typeof window === "undefined") {
    return {
      profiles: [],
      identity_documents: [],
      licenses_credentials: [],
      bonds_insurance: [],
      e_signatures: [],
      preference_rankings: [],
      buyer_preferences: [],
      buyer_basic_info: [],
      demography_maintenance_plans: [],
      onboarding_steps: [],
      payment_preferences: [],
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    profiles: [],
    identity_documents: [],
    licenses_credentials: [],
    bonds_insurance: [],
    e_signatures: [],
    preference_rankings: [],
    buyer_preferences: [],
    buyer_basic_info: [],
    demography_maintenance_plans: [],
    onboarding_steps: [],
    payment_preferences: [],
  };
}

function saveMockDB(data: MockData) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export const mockDB = {
  async insert(table: string, data: any): Promise<{ error: Error | null }> {
    const db = getMockDB();
    const tableData = (db as any)[table] || [];
    
    const newRecord = {
      ...data,
      id: data.id || `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
    };

    tableData.push(newRecord);
    (db as any)[table] = tableData;
    saveMockDB(db);

    console.log(`[MOCK DB] Inserted into ${table}:`, newRecord);
    return { error: null };
  },

  async upsert(table: string, data: any): Promise<{ error: Error | null }> {
    const db = getMockDB();
    const tableData = (db as any)[table] || [];
    
    const existingIndex = tableData.findIndex((item: any) => {
      if (data.id) return item.id === data.id;
      if (data.user_id) return item.user_id === data.user_id;
      return false;
    });

    const record = {
      ...data,
      id: data.id || existingIndex >= 0 ? tableData[existingIndex].id : `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      updated_at: new Date().toISOString(),
      created_at: existingIndex >= 0 ? tableData[existingIndex].created_at : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      tableData[existingIndex] = record;
    } else {
      tableData.push(record);
    }

    (db as any)[table] = tableData;
    saveMockDB(db);

    console.log(`[MOCK DB] Upserted into ${table}:`, record);
    return { error: null };
  },

  async select(table: string, filter?: { field: string; value: any }): Promise<{ data: any[] | null; error: Error | null }> {
    const db = getMockDB();
    let tableData = (db as any)[table] || [];

    if (filter) {
      tableData = tableData.filter((item: any) => item[filter.field] === filter.value);
    }

    console.log(`[MOCK DB] Selected from ${table}:`, tableData);
    return { data: tableData, error: null };
  },

  clearAll() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("mock_storage_documents");
      console.log("[MOCK DB] All data cleared");
    }
  },
};

// Check if we're in mock mode
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
         process.env.NEXT_PUBLIC_USE_MOCK_DB === 'true';
}

