import { createContext, useContext, useEffect, useState } from "react";
import { RequestStatus } from "../api/requests/request";
import Requests from "../api/requests/requests";
import { useAuth } from "./AuthContext";
import { useRequest } from "./RequestContext";

export interface NotificationState {
  notifications: number;
}

const INITIAL_STATE: NotificationState = {
  notifications: 0
};

const NotificationContext = createContext({
  clearState: () => { },
  getNotifications: (): number => 0,
  addNotification: () => { },
  decreaseNotification: () => { },
  setNotifications: (total: number) => { },
  clearNotifications: () => { },
  checkForNotifications: (forceUpdate?: boolean) => { }
});

export const NotificationContextProvider = (props: any) => {
  const [state, setState] = useState(INITIAL_STATE);
  const { requestState } = useRequest();

  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      clearState();
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      checkForNotifications(true);
    }
  }, [JSON.stringify(requestState.requestsToMe), authState.isAuthenticated]);

  const clearState = () => {
    setState(INITIAL_STATE);
  };

  const getNotifications = () => {
    return state.notifications;
  };

  const addNotification = () => {
    setState((prevState) => ({
      notifications: prevState.notifications + 1
    }));
  };

  const decreaseNotification = () => {
    setState((prevState) => ({
      notifications: prevState.notifications - 1
    }));
  };

  const setNotifications = (total: number) => {
    setState({
      notifications: total
    });
  };

  const clearNotifications = () => {
    setState({
      notifications: 0
    });
  };

  const checkForNotifications = async (forceUpdate = false) => {
    // Get total pending requests
    const [_, total] = await Requests.getRequestsToMe(RequestStatus.Pending);
    setState({
      notifications: total
    });
  };

  return (
    <NotificationContext.Provider value={{
      clearState,
      getNotifications,
      addNotification,
      decreaseNotification,
      setNotifications,
      clearNotifications,
      checkForNotifications
    }}>
      {props.children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  return useContext(NotificationContext);
}
