import { createContext, useContext, useEffect, useState } from "react";
import { Computation } from "../api/computations/computation";
import Computations from "../api/computations/computations";
import { ComputationRun, ComputationRunStatus } from "../api/computations/computation_run";
import { useAuth } from "./AuthContext";

export interface ComputationState {
  computations: Computation[] | null;
  computationsTotal: number;
  computationsAdmin: Computation[] | null;
  computationsAdminTotal: number;
  computationRuns: ComputationRun[] | null;
  computationRunsTotal: number;
  loading: boolean;
}

const INITIAL_STATE: ComputationState = {
  computations: null,
  computationsTotal: 0,
  computationsAdmin: null,
  computationsAdminTotal: 0,
  computationRuns: null,
  computationRunsTotal: 0,
  loading: false
};

const ComputationContext = createContext({
  computationState: INITIAL_STATE,
  clearState: (): void => { },
  getComputations: (sAdmin: boolean = false, forceUpdate: boolean = false): Promise<[Computation[] | null, number]> => new Promise(() => null),
  getComputationRuns: (forceUpdate: boolean = false): Promise<[ComputationRun[] | null, number]> => new Promise(() => null),
  getComputation: (computationId: any, sAdmin: boolean = false, forceUpdate: boolean = false): Promise<Computation | null> => new Promise(() => null),
  getComputationScript: (computationId: any, forceUpdate: boolean = false): Promise<string | null> => new Promise(() => null),
  getComputationRun: (computationRunId: any, forceUpdate: boolean = false): Promise<ComputationRun | null>  => new Promise(() => null),
  createComputation: (formData: any): Promise<[string | null, Computation | null]> => new Promise(() => null),
  createComputationRun: (formData: any): Promise<[string | null, ComputationRun | null]> => new Promise(() => null),
  updateComputation: (omputationId: any, formData: any): Promise<string | null> => new Promise(() => null),
  deleteComputation: (id: number): Promise<string | null> => new Promise(() => null),
  deleteComputationRun: (id: number): Promise<string | null> => new Promise(() => null),
  filterComputationRunsLocally: (status: ComputationRunStatus): void => { },
  isLoading: (): boolean => true,
});

export const ComputationContextProvider = (props: any) => {
  const [state, setState] = useState(INITIAL_STATE);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      clearState();
    }
  }, [authState.isAuthenticated]);

  const clearState = (): void => {
    setState(INITIAL_STATE);
  };

  const isLoading = (): boolean => {
    return state.loading;
  };

  const getComputations = async (isAdmin: boolean = false, forceUpdate: boolean = false): Promise<[Computation[] | null, number]> => {
    if (isAdmin) {
      if (!forceUpdate && state.computationsAdmin && state.computationsAdmin.length > 0) {
        return [state.computationsAdmin, state.computationsAdminTotal];
      }
    }
    else {
      if (!forceUpdate && state.computations && state.computations.length > 0) {
        return [state.computations, state.computationsTotal];
      }
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, total] = await Computations.getComputations(isAdmin);
 
    if (isAdmin) {
      state.computationsAdmin = data;
      state.computationsAdminTotal = total;
      setState((prevState) => ({
        ...prevState,
        computationsAdmin: data,
        computationsAdminTotal: total,
        loading: false
      }));
    }
    else {
      state.computations = data;
      state.computationsTotal = total;
      setState((prevState) => ({
        ...prevState,
        computations: data,
        computationsTotal: total,
        loading: false
      }));
    }
    
    return [data, total];
  };

  const getComputationRuns = async (forceUpdate: boolean = false): Promise<[ComputationRun[] | null, number]> => {
    if (!forceUpdate && state.computationRuns && state.computationRuns.length > 0) {
      return [state.computationRuns, state.computationRunsTotal];
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, total] = await Computations.getComputationRuns();
 
    state.computationRuns = data;
    state.computationRunsTotal = total;
    setState((prevState) => ({
      ...prevState,
      computationRuns: data,
      computationRunsTotal: total,
      loading: false
    }));
    
    return [data, total];
  };

  const getComputation = async (computationId: any, isAdmin: boolean = false, forceUpdate: boolean = false): Promise<Computation | null> => {
    let computations = isAdmin ? state.computationsAdmin : state.computations;
    let total = 0;

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    if ((isAdmin && state.computationsAdmin == null) || (!isAdmin && state.computations == null)) {
      [computations, total] = await getComputations(isAdmin);
    }

    const computation = computations?.find((d) => d.id == computationId);
    if (computation != null && !forceUpdate) {
      setState((prevState) => ({
        ...prevState,
        loading: false
      }));
      return computation;
    }

    const data = await Computations.getComputation(computationId);
    computations = computations?.map((c) => c.id == data?.id ? data : c) as Computation[] | null;

    if (isAdmin) {
      setState((prevState) => ({
        ...prevState,
        computationsAdmin: computations,
        computationsAdminTotal: total,
        loading: false
      }));
    }
    else {
      setState((prevState) => ({
        ...prevState,
        computations: computations,
        computationsTotal: total,
        loading: false
      }));
    }

    return data;
  };

  const getComputationScript = async (computationId: any, forceUpdate: boolean = false): Promise<string | null> => {
    const computation = await getComputation(computationId, false, forceUpdate);
    if (computation != null && computation.script != null && !forceUpdate) {
      return computation.script;
    }

    const scriptText = await Computations.getComputationScript(computationId);
    let computations = state.computations;
    computations = computations?.map((c) => { if (c.id == computationId) { c.script = scriptText; } return c; }) as Computation[] | null;

    setState((prevState) => ({
      ...prevState,
      computations: computations
    }));

    return scriptText;
  }

  const getComputationRun = async (computationRunId: any, forceUpdate: boolean = false): Promise<ComputationRun | null> => {
    let computationRuns = state.computationRuns;

    const computationRun = computationRuns?.find((d) => d.id == computationRunId);
    if (computationRun != null && !forceUpdate) {
      return computationRun;
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const data = await Computations.getComputationRun(computationRunId);
    computationRuns = computationRuns?.map((c) => c.id == data?.id ? data : c) as ComputationRun[] | null;

    setState((prevState) => ({
      ...prevState,
      computationRuns: computationRuns,
      loading: false
    }));

    return data;
  };

  const createComputation = async (formData: any): Promise<[string | null, Computation | null]> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message, data] = await Computations.createComputation(formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      await getComputations(true, true);
      await getComputations(false, true);
      
      return [ null, data ];
    }

    return [ message, null ];
  };

  const createComputationRun = async (formData: any): Promise<[string | null, ComputationRun | null]> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message, data] = await Computations.createComputationRun(formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      await getComputationRuns(true);
      
      return [ null, data ];
    }

    return [ message, null ];
  };

  const updateComputation = async (computationId: any, formData: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Computations.updateComputation(computationId, formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      await getComputations(true, true);
      await getComputations(false, true);

      return null;
    }

    return message;
  };

  const deleteComputation = async (id: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Computations.deleteComputation(id);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    if (result) {
      await getComputations(true, true);
      await getComputations(false, true);
      return null;
    }
    return message;
  };

  const deleteComputationRun = async (id: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Computations.deleteComputationRun(id);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    if (result) {
      await getComputationRuns(true);
      return null;
    }
    return message;
  };

  const filterComputationRunsLocally = async (status: number): Promise<void> => {
    await getComputationRuns(true);
    if (status > -1) {
      setState((prevState) => ({
        ...prevState,
        computationRuns: prevState.computationRuns?.filter((cr) => cr.runStatus == status) ?? []
      }));
    }
  };

  return (
    <ComputationContext.Provider value={{
      computationState: state,
      clearState,
      getComputations,
      getComputationRuns,
      getComputation,
      getComputationScript,
      getComputationRun,
      createComputation,
      createComputationRun,
      updateComputation,
      deleteComputation,
      deleteComputationRun,
      filterComputationRunsLocally,
      isLoading
    }}>
      {props.children}
    </ComputationContext.Provider>
  );
};

export function useComputation() {
  return useContext(ComputationContext);
}
