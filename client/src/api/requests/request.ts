import { Dataset } from "../datasets/dataset";
import { User } from "../users/user";

export interface Request {
  id: number;
  __dataset__: Dataset;
  __requester__: User;
  __owner__: User;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum RequestStatus {
  Pending = 0,
  Granted = 1,
  Denied = 2
}
