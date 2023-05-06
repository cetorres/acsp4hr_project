import { Dataset } from "../datasets/dataset";
import { Request } from "../requests/request";
import { User } from "../users/user";
import { Computation } from "./computation";

export enum ComputationRunStatus {
  Pending = 0,
  Running = 1,
  Success = 2,
  Error = 3
}
export interface ComputationRun {
  id: number;
  __request__?: Request;
  __dataset__?: Dataset;
  __runner__?: User;
  __computation__: Computation;
  resultText?: string | null;
  resultImage?: string | null;
  runStatus: ComputationRunStatus;
  variables?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
