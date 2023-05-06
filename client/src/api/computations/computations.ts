import { API_URL } from "../constants";
import { Computation } from "./computation";
import { ComputationRun } from "./computation_run";
import { ComputationSuggestion } from "./computation_suggestion";

const RESOURCE_NAME = 'computations';

export default class Computations {
  static getComputations = async (isAdmin = false): Promise<[Computation[] | null, number]> => {
    const param = isAdmin ? '/admin' : '';
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}${param}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as Computation[], result.total];
    }
    return [null, 0];
  }

  static getComputationRuns = async (): Promise<[ComputationRun[] | null, number]> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as ComputationRun[], result.total];
    }
    return [null, 0];
  }

  static getComputation = async (id: any): Promise<Computation | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/get/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as Computation;
    }
    return null;
  }

  static getComputationScript = async (id: any): Promise<string | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/script/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.text();
      return result;
    }
    return null;
  }

  static getComputationRun = async (id: any): Promise<ComputationRun | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs/${id}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return result as ComputationRun;
    }
    return null;
  }

  static getComputationRunResultImage = async (id: any): Promise<HTMLImageElement | HTMLObjectElement | null> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs/${id}/result-image`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.blob();
      if (result.type == 'image/png') {
        const image = new Image();
        image.src = URL.createObjectURL(result);
        return image;
      } else if (result.type == 'application/pdf') {
        const object = document.createElement("object");
        object.data = URL.createObjectURL(result);
        return object;
      }
    }
    return null;
  }

  static createComputation = async (computationData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(computationData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static createComputationRun = async (computationRunData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(computationRunData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static updateComputation = async (id: number, computationData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/${id}`, {
      body: JSON.stringify(computationData),
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

  static updateComputationRun = async (id: number, computationRunData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs/${id}`, {
      body: JSON.stringify(computationRunData),
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

  static deleteComputation = async (id: number) => {
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

  static deleteComputationRun = async (id: number) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/runs/${id}`, {
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

  // Computation Suggestions

  static getComputationSuggestions = async (): Promise<[ComputationSuggestion[] | null, number]> => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/admin/suggestions`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      method: 'GET'
    });
  
    if (response.ok) {
      const result = await response.json();
      return [result.data as ComputationSuggestion[], result.total];
    }
    return [null, 0];
  }

  static createComputationSuggestion = async (computationSuggestionData: any) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/suggestions`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(computationSuggestionData),
      method: 'POST'
    });

    const result = await response.json();
  
    if (response.ok) {
      return [true, result.message];
    }
    return [false, result.message];
  }

  static deleteComputationSuggestion = async (id: number) => {
    const response = await fetch(`${API_URL}/${RESOURCE_NAME}/admin/suggestions/${id}`, {
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