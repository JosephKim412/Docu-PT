import React from "react";
import ReactDOM from "react-dom/client";
import { useState, useEffect, useRef } from "react";
import PatientRecord from "./PatientRecord";
import Login from "./Login";
import Register from "./Register";

export default function App() {
  const [curForm, setCurForm] = useState("login");

  function toggleForm(form) {
    setCurForm((prevForm) => form);
  }
  return (
    <main>
      {/* {curForm === "login" ? (
        <Login toggleForm={toggleForm} />
      ) : (
        <Register toggleForm={toggleForm} />
      )} */}

      <PatientRecord />
    </main>
  );
}
