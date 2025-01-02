import React from "react";
import ReactDOM from "react-dom/client";

import App from "./Components/App";
import { Auth0Provider } from "@auth0/auth0-react";

const domain = "dev-oim8plrvuraf5lzo.us.auth0.com";
const clientId = "Tdj6VBD31JMhFrX4TnGA4X7VtcAJJtTw";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin, // Redirect after login
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

/*Component tree

<App/>
  <Patient Record/>
  *Handle form creation and manages user input via controlled inputs via state management
  *Handle form submission to external API (ChatGPT)
  *handles API responses, storing JSON content with state management 
  *Handles error and loading statement management
  *Displays generated SOAP note in a modal



    <PatientSoapNoteModal/>
    *Main modal container for displaying Soap Note
    *Entrypoint for modal
    *Handles opening and closing of modal (modal management)
    *Passes patientInfo data to PatientSoapModalTabs component for parsing and rendering

      <PatientSoapNoteTabs/>
      *Parsing data, managing tab state, and rendering tabs and content
        <Tab/>
        *Rendering an individual tab and handling tab-switching
        <Tab/>
        <Tab/>
        <Tab/>
        <Tab/>
*/
