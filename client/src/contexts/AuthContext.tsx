import { createContext, useContext, useState } from "react";
import Auth from "../api/auth/auth";
import { User } from "../api/users/user";

export interface AuthState {
  isAuthenticated: boolean;
  user?: User | null;
}

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  user: null
};

const AuthContext = createContext({
  authState: INITIAL_STATE,
  authLoginSuccess: (user?: User | null) => {},
  authCheckUserLoggedIn: () => {},
  authLoadedMe: (user?: User | null) => {},
  authLogout: () => {}
});

export const AuthContextProvider = (props: any) => {
  const [state, setState] = useState(INITIAL_STATE);

  const authLoginSuccess = (user?: User | null) => {
    localStorage.setItem('isAuthenticated', 'true');
    setState((prevState) => ({
      ...prevState,
      isAuthenticated: true,
      user: user
    }));
  };

  const authCheckUserLoggedIn = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated && isAuthenticated == 'true') {
      setState((prevState) => ({
        ...prevState,
        isAuthenticated: true,
        user: null
      }));
    }
    else {
      setState(INITIAL_STATE);
    }
  };

  const authLoadedMe = (user?: User | null) => {
    setState((prevState) => ({
      ...prevState,
      user: user
    }));
  };

  const authLogout = async () => {
    await Auth.logOutUser();
    localStorage.removeItem('isAuthenticated');
    setState(INITIAL_STATE);
  };

  return (
    <AuthContext.Provider value={{
      authState: state,
      authLoginSuccess,
      authCheckUserLoggedIn,
      authLoadedMe,
      authLogout
    }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
