import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthContextProvider } from "./contexts/AuthContext";
import { ComputationContextProvider } from "./contexts/ComputationContext";
import { DarkModeContextProvider } from "./contexts/DarkModeContext";
import { DatasetContextProvider } from "./contexts/DatasetContext";
import { NotificationContextProvider } from "./contexts/NotificationContext";
import { RequestContextProvider } from "./contexts/RequestContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <DarkModeContextProvider>
          <DatasetContextProvider>
            <RequestContextProvider>
              <ComputationContextProvider>
                <NotificationContextProvider>
                  <App />
                </NotificationContextProvider>
              </ComputationContextProvider>
            </RequestContextProvider>
          </DatasetContextProvider>  
        </DarkModeContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
