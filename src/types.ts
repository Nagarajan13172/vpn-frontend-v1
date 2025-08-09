export interface Role {
  id: string;
  role: string;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface User {
  id?: string;
  username: string;
  role_id: string;
  role?: Role; // Optional, as it may not always be populated
  peer_count: number | string; // Allow string for API response
  created_at?: string;
  paused: boolean;
}