import { User } from "../users/user";

export interface Dataset {
  id: number;
  __user__: User;
  name: string;
  description: string;
  documentName: string;
  documentSize: number;
  filename: string;
  rows: number;
  isActive: boolean;
  requiresPermission: boolean;
  keywords?: string | null;
  variables?: Variable[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Variable {
  id: number;
  name: string;
  description: string;
  type: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: number;
  user: User;
  dataset: Dataset;
  createdAt: Date;
  updatedAt: Date;
}