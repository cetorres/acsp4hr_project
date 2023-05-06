export interface User {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}