import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "../CSS_stylesheets/ptmodal.module.css";

export default function PatientSoapNoteModal({ patientInfo, setIsModalOpen }) {
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
          <PatientSoapModalTabs patientInfo={patientInfo} />
        </div>
      </div>
    </div>,
    document.body
  );
}

// PatientSoapModalTabs component will be responsible for parsing the raw string data and preparing it as the variable parsedPatientInfo
function PatientSoapModalTabs({ patientInfo }) {
  const [activeTab, setActiveTab] = useState("Subjective");
  const [formData, setFormData] = useState({}); // State to track checkbox states

  function parsePatientInfo(info) {
    if (!info) return {};

    // Sanitize potential Markdown-style formatting
    const sanitizedInfo = info.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(sanitizedInfo);
    } catch (error) {
      console.error(
        "Failed to parse JSON:",
        error.message,
        "\nSanitized Input:",
        sanitizedInfo
      );
      alert(
        "An error occurred while processing the patient info. Please ensure the input is in valid JSON format."
      );
      return {};
    }
  }

  // Updates formData state when a checkbox is toggled
  const handleCheckboxChange = (section, field, value) => {
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

  // Dynamically generates checkbox inputs
  const renderAllCheckboxes = (data, sectionName) => {
    if (!data || typeof data !== "object") return null;

    return Object.entries(data).map(([field, content]) => {
      if (content?.checkboxes && Array.isArray(content.checkboxes)) {
        // Render checkboxes for fields with a "checkboxes" array
        return (
          <div key={`${sectionName}-${field}`}>
            <h3>{field}</h3>
            {content.checkboxes.map((checkbox, index) => (
              <div key={`${sectionName}-${field}-${index}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={
                      formData[sectionName]?.[field]?.[checkbox] || false
                    }
                    onChange={() =>
                      handleCheckboxChange(sectionName, field, checkbox)
                    }
                  />
                  {checkbox}
                </label>
              </div>
            ))}
          </div>
        );
      }

      return null; // Skip non-checkbox fields
    });
  };

  // Parse patient info and handle errors
  const result = parsePatientInfo(patientInfo);
  if (!result || typeof result !== "object") {
    return (
      <div className={styles.errorMessage}>
        Unable to display patient information. Please check the format of the
        input.
      </div>
    );
  }

  // Use parsed patient info if no error
  const parsedPatientInfo = result;

  return (
    <>
      <div className={styles.tabContainer}>
        {Object.keys(parsedPatientInfo).map((sectionHeading) => {
          const sectionContent = parsedPatientInfo[sectionHeading];
          return (
            <div key={sectionHeading}>
              <Tab
                setActiveTab={setActiveTab}
                sectionHeading={sectionHeading}
                parsedPatientInfo={parsedPatientInfo}
                activeTab={activeTab}
              />
              {activeTab === sectionHeading && (
                <div>
                  {/* Render checkboxes */}
                  {renderAllCheckboxes(sectionContent, sectionHeading)}

                  {/* Render non-checkbox content */}
                  {renderContent(sectionContent)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// Function renderContent is a helper function to convert structured Data from parsedPatientInfo function into visual UI components (for section content)
// The parsed data object needs to be rendered based on data type(especially for nested objects)
// Focuses on data presentation
// This function will be used in the Tab component
function renderContent(content) {
  if (typeof content === "string" || typeof content === "number") {
    return <span>{content}</span>; // Wrap strings and numbers in a span for safe rendering
  } else if (Array.isArray(content)) {
    return (
      <ul>
        {content.map((item, index) => (
          <li key={index}>{renderContent(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof content === "object" && content !== null) {
    return (
      <ul>
        {Object.entries(content)
          .filter(([_, value]) => !value?.checkboxes) // Skip checkbox fields
          .map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {renderContent(value)}
            </li>
          ))}
      </ul>
    );
  } else {
    return null; // Handle null, undefined, or unsupported types
  }
}

function Tab({ parsedPatientInfo, sectionHeading, setActiveTab, activeTab }) {
  const sectionContent = parsedPatientInfo[sectionHeading];

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
      <div className={styles.tabContent}>
        {activeTab === sectionHeading ? renderContent(sectionContent) : null}
      </div>
    </div>
  );
}
