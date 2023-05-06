import { User } from "../users/user";

export interface ComputationSuggestion {
  id: number;
  __user__?: User;
  suggestion?: string | null;
  createdAt: Date;
  updatedAt: Date;
}