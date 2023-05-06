import { API_URL } from "../constants";
import { Dataset, Favorite } from "./dataset";

const RESOURCE_NAME = 'datasets';

export default class Datasets {
  static getDatasets = async (): Promise<[Dataset[] | null, number]> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as Dataset[], result.total];
    }
    return [null, 0];
  }

  static browseDatasets = async (searchText?: string | null): Promise<[Dataset[] | null, number]> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/browse${searchText ? `?s=${searchText}` : ''}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as Dataset[], result.total];
    }
    return [null, 0];
  }

  static browseDataset = async (id: any): Promise<Dataset | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/browse/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as Dataset;
    }
    return null;
  }

  static getMyDataset = async (id: any): Promise<Dataset | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/my/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as Dataset;
    }
    return null;
  }

  static getMyDatasetData = async (id: any): Promise<any | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/my/data/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result;
    }
    return null;
  }

  static getDataset = async (id: any): Promise<Dataset | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as Dataset;
    }
    return null;
  }

  static createDataset = async (datasetData: any) => {
    const formData = new FormData();
    for (const key in datasetData) {
      if (key == 'datasetFile') {
        formData.append(key, datasetData[key], datasetData.documentName);
      }
      else if (key == 'variables') {
        formData.append(key, JSON.stringify(datasetData[key]));
      }
      else {
        formData.append(key, datasetData[key]);
      }
    }

    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      body: formData,
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static getDatasetInfo = async (datasetData: any) => {
    const formData = new FormData();
    for (const key in datasetData) {
      if (key == 'datasetFile') {
        formData.append(key, datasetData[key], datasetData.documentName);
      }
      else {
        formData.append(key, datasetData[key]);
      }
    }

    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/info`, {
      body: formData,
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result];
    }
    return [false, result.message];
  }

  static updateDataset = async (id: number, datasetData: any) => {
    // Clean up data
    delete datasetData.rows;
    delete datasetData.documentName;
    delete datasetData.datasetFile;
    datasetData.id = id;
    if (datasetData.keywords == '') datasetData.keywords = null

    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      body: JSON.stringify(datasetData),
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteDataset = async (id: number) => {
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

  static updateDatasetAdmin = async (id: number, datasetData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}/admin`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(datasetData),
      method: 'PUT'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteDatasetAdmin = async (id: number) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}/admin`, {
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

  static getFavorites = async (): Promise<Favorite[] | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/favorites`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result.data as Favorite[];
    }
    return null;
  }

  static isFavorite = async (datasetId: any): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/favorites/${datasetId}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      return await response.json();
    }
    return false;
  }

  static addFavorite = async (datasetId: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/favorites/${datasetId}`, {
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteFavorite = async (datasetId: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/favorites/${datasetId}`, {
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