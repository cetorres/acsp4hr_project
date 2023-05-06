import { API_URL } from "../constants";
import { Request, RequestStatus } from './request';

const RESOURCE_NAME = 'requests';

export default class Requests {
  static getMyRequests = async (status?: RequestStatus | null): Promise<[Request[] | null, number]> => {
    const queryString = status != null ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}${queryString}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as Request[], result.total];
    }
    return [null, 0];
  }

  static getMyRequestByDatasetId = async (datasetId: string): Promise<Request | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}?datasetId=${datasetId}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result.data as Request;
    }
    return null;
  }

  static getRequestsToMe = async (status?: RequestStatus | null): Promise<[Request[] | null, number]> => {
    const queryString = status != null ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/tome${queryString}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as Request[], result.total];
    }
    return [null, 0];
  }

  static getRequestById = async (requestId: string): Promise<Request | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${requestId}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as Request;
    }
    return null;
  }

  static createRequest = async (requestData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(requestData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, null, result as Request];
    }
    return [false, result.message, null];
  }

  static approveRejectRequest = async (requestData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(requestData),
      method: 'PUT'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteRequest = async (id: number) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      method: 'DELETE'
    });

    if (response.ok) {
      return [true, null];
    }

    const result = await response.json();
    return [false, result.message];
  }
}