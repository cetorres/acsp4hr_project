import { createContext, useContext, useState } from "react";

const INITIAL_STATE = {
  darkMode: false,
};

export const DarkModeContext = createContext({
  darkModeState: INITIAL_STATE,
  setLight: () => {},
  setDark: () => {},
  toggleDarkMode: () => {},
  loadDarkMode: () => {}
});

export const DarkModeContextProvider = (props: any) => {
  const [state, setState] = useState(INITIAL_STATE);

  const setLight = () => {
    localStorage.setItem('theme', 'light');
    setState({ darkMode: false });
  };

  const setDark = () => {
    localStorage.setItem('theme', 'dark');
    setState({ darkMode: true });
  };

  const toggleDarkMode = () => {
    const newValue = !state.darkMode;
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    setState({ darkMode: newValue });
  };

  const loadDarkMode = () => {
    const theme = localStorage.getItem('theme');
    setState({
      darkMode: theme === 'dark' ? true : false,
    });
  };

  return (
    <DarkModeContext.Provider value={{
      darkModeState: state,
      setLight,
      setDark,
      toggleDarkMode,
      loadDarkMode
    }}>
      {props.children}
    </DarkModeContext.Provider>
  );
};

export function useDarkMode() {
  return useContext(DarkModeContext);
}
