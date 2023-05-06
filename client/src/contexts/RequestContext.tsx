import { createContext, useContext, useEffect, useState } from "react";
import { Request, RequestStatus } from "../api/requests/request";
import { useAuth } from "./AuthContext";
import Requests from "../api/requests/requests";

export interface RequestState {
  myRequests: Request[] | null;
  myRequestsFilter: number;
  myRequestsTotal: number;
  requestsToMe: Request[] | null;
  requestsToMeFilter: number;
  requestsToMeTotal: number;
  pendingRequestsToMe: Request[] | null;
  loading: boolean;
}

const INITIAL_STATE: RequestState = {
  myRequests: null,
  myRequestsFilter: -1,
  myRequestsTotal: 0,
  requestsToMe: null,
  requestsToMeFilter: -1,
  requestsToMeTotal: 0,
  pendingRequestsToMe: null,
  loading: false
};

const RequestContext = createContext({
  requestState: INITIAL_STATE,
  clearState: (): void => { },
  getMyRequests: (status?: RequestStatus | null, forceUpdate: boolean = false): Promise<[Request[] | null, number]> => new Promise(() => null),
  getRequestsToMe: (status?: RequestStatus | null, forceUpdate: boolean = false): Promise<[Request[] | null, number]> => new Promise(() => null),
  getPendingRequestsToMe: (forceUpdate: boolean = false): Promise<Request[] | null> => new Promise(() => null),
  getRequestToMe: (requestId: any, forceUpdate: boolean = false): Promise<Request | null>  => new Promise(() => null),
  createRequest: (formData: any): Promise<[string | null, Request | null]> => new Promise(() => null),
  approveRejectRequest: (formData: any): Promise<string | null> => new Promise(() => null),
  isDatasetRequested: (datasetId: number): Promise<Request | null> => new Promise(() => null),
  deleteRequest: (id: number): Promise<string | null> => new Promise(() => null),
  setMyRequestsFilter: (status: number): void => { },
  setRequestsToMeFilter: (status: number): void => { },
  isLoading: (): boolean => true,
});

export const RequestContextProvider = (props: any) => {
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

  const getMyRequests = async (status?: RequestStatus | null, forceUpdate: boolean = false): Promise<[Request[] | null, number]> => {
    if (!forceUpdate && state.myRequests && state.myRequests.length > 0) {
      return [state.myRequests, state.myRequestsTotal];
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, total] = await Requests.getMyRequests(status);
    
    setState((prevState) => ({
      ...prevState,
      myRequests: data,
      myRequestsFilter: status == null ? -1 : status,
      myRequestsTotal: total,
      loading: false
    }));
    
    return [data, total];
  };

  const isDatasetRequested = async (datasetId: number): Promise<Request | null> => {
    let requested = null;

    if (state.myRequests == null || state.myRequests?.length == 0) {
      const [myrequests, _] = await getMyRequests(null, true);
      requested = myrequests?.find((f) => f?.__dataset__?.id == datasetId);
      return requested?.id ? requested : null;
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    requested = state.myRequests?.find((f) => f.__dataset__?.id == datasetId);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    return requested?.id ? requested : null;
  };

  const getRequestsToMe = async (status?: RequestStatus | null, forceUpdate: boolean = false): Promise<[Request[] | null, number]> => {
    if (!forceUpdate && state.requestsToMe && state.requestsToMe.length > 0) {
      return [state.requestsToMe, state.requestsToMeTotal];
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, total] = await Requests.getRequestsToMe(status);
    const [dataPending, _] = await Requests.getRequestsToMe(RequestStatus.Pending);
    
    setState((prevState) => ({
      ...prevState,
      requestsToMe: data,
      requestsToMeFilter: status == null ? -1 : status,
      requestsToMeTotal: total,
      pendingRequestsToMe: dataPending,
      loading: false
    }));
    
    return [data, total];
  };

  const getPendingRequestsToMe = async (forceUpdate: boolean = false): Promise<Request[] | null> => {
    if (!forceUpdate && state.pendingRequestsToMe && state.pendingRequestsToMe.length > 0) {
      return state.pendingRequestsToMe;
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, _] = await Requests.getRequestsToMe(RequestStatus.Pending);
    
    setState((prevState) => ({
      ...prevState,
      pendingRequestsToMe: data,
      loading: false
    }));
    
    return data;
  };

  const getRequestToMe = async (requestId: any, forceUpdate: boolean = false): Promise<Request | null> => {
    let requestsToMe = state.requestsToMe;
    let total = 0;

    if (state.requestsToMe == null) {
      [requestsToMe, total] = await getRequestsToMe();
    }

    const request = requestsToMe?.find((d) => d.id == requestId);
    if (request != null && !forceUpdate) {
      return request;
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const data = await Requests.getRequestById(requestId);
    requestsToMe = requestsToMe?.map((r) => r.id == data?.id ? data : r) as Request[] | null;

    setState((prevState) => ({
      ...prevState,
      requestsToMe: requestsToMe,
      loading: false
    }));

    return data;
  };

  const createRequest = async (formData: any): Promise<[string | null, Request | null]> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message, data] = await Requests.createRequest(formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      getMyRequests(null, true);
      return [ null, data ];
    }

    return [ message, null ];
  };

  const approveRejectRequest = async (formData: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Requests.approveRejectRequest(formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      getRequestsToMe(null, true);
      return null;
    }

    return message;
  };

  const deleteRequest = async (id: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Requests.deleteRequest(id);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    if (result) {
      getMyRequests(null, true);
      return null;
    }
    return message;
  };

  const setMyRequestsFilter = (status: number): void => {
    setState((prevState) => ({
      ...prevState,
      myRequestsFilter: status
    }));
  }

  const setRequestsToMeFilter = (status: number): void => {
    setState((prevState) => ({
      ...prevState,
      requestsToMeFilter: status
    }));
  }

  return (
    <RequestContext.Provider value={{
      requestState: state,
      clearState,
      getMyRequests,
      getRequestsToMe,
      getPendingRequestsToMe,
      getRequestToMe,
      createRequest,
      approveRejectRequest,
      isDatasetRequested,
      deleteRequest,
      setMyRequestsFilter,
      setRequestsToMeFilter,
      isLoading
    }}>
      {props.children}
    </RequestContext.Provider>
  );
};

export function useRequest() {
  return useContext(RequestContext);
}
