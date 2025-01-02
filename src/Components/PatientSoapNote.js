import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "../CSS_stylesheets/ptmodal.module.css";

//Main modal container for displaying Soap Note
//Entrypoint for modal
//Handles opening and closing of modal (modal management)
//Passes patientInfo data to PatientSoapModalTabs component for parsing and rendering

export default function PatientSoapNoteModal({ patientInfo, setIsModalOpen }) {
  const keyOrder = ["Subjective", "Objective", "Assessment", "Plan", "Billing"];
  function handleCloseModal() {
    setIsModalOpen(false);
  }

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h1>SOAP Note</h1>
          <button
            className={styles.closeButton}
            onClick={() => handleCloseModal()}
          >
            Close X
          </button>
        </div>
        <div className={styles.modalBody}>
          <PatientSoapModalTabs patientInfo={patientInfo} keyOrder={keyOrder} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// PatientSoapModalTabs component will be responsible for
// 1. parsing the raw string data into structured JSON and preparing it as the variable parsedPatientInfo
// 2. Manages state for:
// activeTab (determines which tab content will be displayed)
//formData (tracks state of checkboxes in the UI)
// 3. Iterates over parsedPatientInfo to dynamically render a Tab component to represent the section's tab
// 4. Determining which tab is active and renders all content for the active tab
function PatientSoapModalTabs({ patientInfo, keyOrder }) {
  const [activeTab, setActiveTab] = useState("Subjective");
  const [formData, setFormData] = useState({}); // State to track checkbox states

  // Define the key order for each section
  const sectionKeyOrders = {
    Subjective: [
      "Date",
      "Diagnosis ICD 10 Codes",
      "Treatment Diagnosis Codes",
      "Body Part",
      "Surgery Performed",
      "Injury / Onset Date / Surgery Date",
      "Pain Scale",
      "Location",
      "Aggravating Factors",
      "Comments",
      "History Of Present Condition",
      "Prior Level Of Function",
    ],
    Objective: ["ROM Measurements", "Strength MMT Measurements"],
    Assessment: ["Short Term Goals", "Long Term Goals"],
    Plan: ["Exercises", "FrequencyAndDuration"],
    Billing: ["CPT Codes"],
  };

  //Helper function that
  //1. Sanitizes and parses raw patientInfo string data into structured JSON object
  //2. Parsing Error handling and displaying alert
  function parsePatientInfo(info) {
    if (!info) return {};

    // Remove any non-JSON text (e.g., comments or trailing descriptions)
    const sanitizedInfo = info.replace(/```json|```/g, "").trim();
    try {
      // Identify the JSON portion
      const jsonStart = sanitizedInfo.indexOf("{");
      const jsonEnd = sanitizedInfo.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Invalid JSON format: No JSON object found.");
      }

      // Extract and parse the JSON portion
      const jsonString = sanitizedInfo.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(
        "Failed to parse JSON:",
        error.message,
        "\nInput:",
        sanitizedInfo
      );
      alert(
        "An error occurred while processing the patient info. Please ensure the input is in valid JSON format."
      );
      return {};
    }
  }
  // Invoke parsing function
  const parsedPatientInfo = parsePatientInfo(patientInfo);
  console.log("Parsed Patient Info:", parsedPatientInfo);
  //Handle parsing errors
  if (!parsedPatientInfo || typeof parsedPatientInfo !== "object") {
    return (
      <div className={styles.errorMessage}>
        Unable to display patient information. Please check the format of the
        input.
      </div>
    );
  }

  console.log(parsedPatientInfo);

  return (
    <div className={styles.tabContainer}>
      {keyOrder.map((sectionHeading) => {
        const sectionContent = parsedPatientInfo[sectionHeading];
        const sectionKeyOrder = sectionKeyOrders[sectionHeading] || [];

        if (!sectionContent) return null; // Skip missing sections

        return (
          <div key={sectionHeading}>
            {/* Render the Tab component */}
            <Tab
              setActiveTab={setActiveTab}
              sectionHeading={sectionHeading}
              activeTab={activeTab}
            />

            {activeTab === sectionHeading && (
              <div>
                {sectionKeyOrder.map((key) => {
                  const content = sectionContent[key];
                  if (!content) return null; // Skip missing fields

                  return (
                    <div key={`${sectionHeading}-${key}`}>
                      <h3 className={styles.sectionHeading}>{key}</h3>
                      {Array.isArray(content?.checkboxes)
                        ? renderAllCheckboxes(
                            content,
                            key,
                            formData,
                            setFormData
                          )
                        : renderContent(content)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Dynamically generates checkbox inputs on checkbox fields within data
//Associates each checkbox with its state in formData
const renderAllCheckboxes = (
  sectionContentData,
  sectionHeadingName,
  formData,
  setFormData
) => {
  if (!sectionContentData || typeof sectionContentData !== "object")
    return null;

  return Object.entries(sectionContentData).map(([field, content]) => {
    if (Array.isArray(content?.checkboxes)) {
      return (
        <div key={`${sectionHeadingName}-${field}`}>
          <h3 className="sectionHeading">{field}</h3>
          {content.checkboxes.map((checkbox, index) => {
            const checkboxLabel =
              typeof checkbox === "object" && checkbox.label
                ? checkbox.label
                : checkbox;
            const checkboxChecked =
              typeof checkbox === "object" && "checked" in checkbox
                ? checkbox.checked
                : formData[sectionHeadingName]?.[field]?.[checkboxLabel] ||
                  false;

            return (
              <div key={`${sectionHeadingName}-${field}-${index}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkboxChecked}
                    onChange={() =>
                      handleCheckboxChange(
                        sectionHeadingName,
                        field,
                        checkboxLabel,
                        setFormData
                      )
                    }
                  />
                  {checkboxLabel}
                </label>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  });
};

// handleCheckboxChange function Updates formData state when a checkbox is toggled
// maintains nested structure in formData to map checkboxes to respective sections
const handleCheckboxChange = (section, field, value, setFormData) => {
  setFormData((prevData) => ({
    ...prevData,
    [section]: {
      ...prevData[section],
      [field]: {
        ...prevData[section]?.[field],
        [value]: !prevData[section]?.[field]?.[value],
      },
    },
  }));
};

// Function renderContent is a helper function to convert structured Data from parsedPatientInfo function into visual UI components (for section content)
// The parsed data object needs to be rendered based on data type
// Skips rendering fields that are dsignated for checkboxes to avoid duplication
// Focuses on data presentation

function renderContent(content) {
  if (typeof content === "string" || typeof content === "number") {
    return <span className="propertyKeyValue">{content}</span>;
  } else if (Array.isArray(content)) {
    return (
      <ul>
        {content.map((item, index) => (
          <li key={index} className="propertyKeyValue">
            {renderContent(item)}
          </li>
        ))}
      </ul>
    );
  } else if (typeof content === "object" && content !== null) {
    return (
      <ul>
        {Object.entries(content).map(([key, value]) => (
          <li key={key}>
            {/* Apply section heading styling */}
            <h3 className="sectionHeading">{key}</h3>
            <span>{renderContent(value)}</span>
          </li>
        ))}
      </ul>
    );
  } else {
    return null;
  }
}

//Presentational reusable component
//Handles tab switching by updating activeTab state in parent PatientSoapModalTabs
function Tab({ sectionHeading, setActiveTab, activeTab }) {
  return (
    <div>
      <button
        onClick={() => setActiveTab(sectionHeading)}
        className={`${styles.tabButton} ${
          activeTab === sectionHeading ? styles.active : ""
        }`}
      >
        {sectionHeading}
      </button>
    </div>
  );
}
