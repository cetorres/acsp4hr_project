import { API_URL } from "../constants";

const RESOURCE_NAME = 'dashboard';

const getTotals = async (): Promise<any | null> => {
  const response = await fetch(`${API_URL}/${RESOURCE_NAME}/totals`, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'GET'
  });
  
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export { getTotals };