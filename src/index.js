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
