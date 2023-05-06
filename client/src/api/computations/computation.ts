export interface Computation {
  id: number;
  name: string;
  description: string;
  scriptCommand: string;
  returnType: ComputationReturnType;
  numberOfVariables: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  script?: string | null;
}

export enum ComputationReturnType {
  Text = 1,
  Graph = 2,
  TextAndGraph = 3
}
