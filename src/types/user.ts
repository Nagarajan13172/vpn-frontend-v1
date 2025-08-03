// src/types/user.ts

export interface CurrentUser {
  id: string;
  username: string;
  email?: string;
  role: string;
}


export interface Role {
    id: string;
    role: string;
}


export interface NewUser {
    username: string;
    password: string;
    role_id: string;
    peer_count?: number | string;
}

export interface User extends NewUser {
    id: string;
    role: { id: string; role: string };
    created_at: string;
}