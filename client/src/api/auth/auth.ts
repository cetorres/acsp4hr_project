import { API_URL } from "../constants";
import { User } from "../users/user";

const RESOURCE_NAME = 'auth';

export default class Auth {
  static registerUser = async (registerData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/register`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(registerData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static forgotPassword = async (forgotData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/forgot-password`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(forgotData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static recoverPassword = async (recoverData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/recover-password`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(recoverData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static loginUser = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/login`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({ email: email, password: password }),
      method: 'POST'
    });

    const result = await response.json();
    if (response.ok) {
      return [true, response.status, result.message];
    }
    return [false, response.status, result.message];
  }

  static logOutUser = async () => {
    await fetch(`${API_URL}/${RESOURCE_NAME}/logout`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      method: 'POST'
    });
  }

  static getMe = async () => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/me`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      const user = result as User;
      return user;
    }

    throw Error('Could not request user profile.');
  }

  static updateMe = async (meData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/me`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(meData),
      method: 'PUT'
    });

    const result = await response.json();
  
    if (response.ok) {
      Auth.getMe();
      return [true, result.message];
    }
    return [false, result.message];
  }

  static changePassword = async (changePasswordData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/change-password`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(changePasswordData),
      method: 'PUT'
    });

    if (response.ok) {
      return [true, null];
    }

    const result = await response.json();
    return [false, result?.message];
  }
}