// Database helper that automatically uses mock mode if Supabase is not available
import { supabase } from "@/integrations/supabase/client";
import { mockDB, isMockMode as isMockDBMode } from "./mock-db";
import { mockAuth, isMockMode as isMockAuthMode } from "./mock-auth";

export const db = {
  async getUser() {
    if (isMockAuthMode()) {
      return mockAuth.getUser();
    }
    return supabase.auth.getUser();
  },

  async insert(table: string, data: any) {
    if (isMockDBMode()) {
      return mockDB.insert(table, data);
    }
    return (supabase as any).from(table).insert(data);
  },

  async upsert(table: string, data: any) {
    if (isMockDBMode()) {
      return mockDB.upsert(table, data);
    }
    return (supabase as any).from(table).upsert(data);
  },

  async select(table: string, filter?: { field: string; value: any }) {
    if (isMockDBMode()) {
      const result = await mockDB.select(table, filter);
      return result;
    }
    
    let query = (supabase as any).from(table).select("*");
    if (filter) {
      query = query.eq(filter.field, filter.value);
    }
    const result = await query;
    return result;
  },
};

export function isMockMode(): boolean {
  return isMockDBMode() || isMockAuthMode();
}

