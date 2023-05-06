import { API_URL } from "../constants";
import { User } from "./user";

const RESOURCE_NAME = 'users';

export default class Users {
  static getUsers = async (): Promise<User[] | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result.data as User[];
    }
    return null;
  }

  static getUser = async (id: number): Promise<User | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as User;
    }
    return null;
  }

  static createUser = async (userData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(userData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static updateUser = async (id: number, userData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(userData),
      method: 'PUT'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteUser = async (id: number) => {
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