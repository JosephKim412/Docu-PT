import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import styles from "../CSS_stylesheets/ptrecord.module.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import PatientSoapNoteModal from "./PatientSoapNote";

const API_URL =
  process.env.REACT_APP_API_URL || "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.REACT_APP_API_KEY;

export default function PatientRecord() {
  //Setting state for controlled form input elements
  const [ptFormData, setPtFormData] = useState({
    DOS: "",
    PtInfo: "",
    OtherInfo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  //Dynamically setting Form Data based on user input
  function onFormDataChange(e) {
    let { name, value } = e.target;
    setPtFormData((prevFormData) => {
      return { ...prevFormData, [name]: value };
    });
  }

  //Need to convert Date obj to string for HTML
  const handleDateChange = (date) => {
    setPtFormData((prevFormData) => ({
      ...prevFormData,
      DOS: date.toISOString().split("T")[0],
    }));
  };

  //Handling Form Submission
  //1. Async function to make fetch request to ChatGPT API
  //2. Handle slow loading
  //3. Error handling
  function handlePtFormSubmit(e) {
    e.preventDefault();
    async function submitPtForm(e) {
      setIsLoading(true);
      setError("");
      setResponse("");

      const query = `${ptFormData.PtInfo}. Other relevant information includes ${ptFormData.OtherInfo}. Please create a physical therapy SOAP note with prior and current functional limitations that are related to self-care, mobility, changing and maintaining body position, community participation, short term and long term goals, suggested exercises, suggested CPT codes, suggested ICD diagnosis codes`;

      try {
        const result = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful medical assistant.",
              },
              { role: "user", content: query },
            ],
            max_tokens: 500,
          }),
        });
        console.log(result);

        if (result.ok === false) {
          throw new Error("Please re-submit the form with more information");
        }

        //jsonify the response object
        const data = await result.json();
        console.log(data);

        //Pull ChatGPT content out of json
        const responseContent =
          data.choices[0]?.message?.content ||
          "No response from server. Please edit your information";
        console.log(data.choices); //array with an object
        console.log(data.choices[0]); //points specficially to that object in the choices array
        console.log(data.choices[0].message); //points specifically to the "messages" property (in that obj) that references another object
        console.log(data.choices[0].message.content); //points specifically to the content property inside the obj above (the one that message was referencing)
        //this holds the actual output from ChatGPT

        //Update response state
        setResponse((prevResp) => responseContent);
        // console.log(data.choices[0].message.content.split("\n\n"));
        //parse responseContent by keywords

        const contentBySection = {};
        const lines = responseContent.split("\n");
        let currentSection;
        lines.forEach((line) => {
          if (line.toLowerCase().includes("Subjective")) {
            let currentSection = "Subjective";
          } else if (line.toLowerCase().includes("Objective")) {
            let currentSection = "Objective";
          } else if (line.toLowerCase().includes("Assessment")) {
            let currentSection = "Assessment";
          } else if (line.toLowerCase().includes("Plan")) {
            let currentSection = "Plan";
          } else {
            let currentSection = "Additional Information";
          }

          if (contentBySection[currentSection]) {
            contentBySection[currentSection] += `${line}\n`;
            console.log(contentBySection);
            console.log(contentBySection[currentSection]);
          } else {
            contentBySection[currentSection] = "";
          }
        });

        setIsModalOpen(true);
      } catch (err) {
        console.log(err);
        setError((prevErr) => err.message);
      } finally {
        setIsLoading(false);
      }
    }
    submitPtForm();
  }

  return (
    <div className={styles.patientRecordContainer}>
      <form onSubmit={(e) => handlePtFormSubmit(e)}>
        <div className={styles.fieldContainer}>
          <label className={styles.labelPt} htmlFor="DOS">
            Date of Service
          </label>
          <DatePicker
            className={`${styles.inputPt} ${styles.dateInput}`}
            selected={ptFormData.DOS ? new Date(ptFormData.DOS) : null}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            placeholderText="Select a date"
            required
          />
        </div>

        <div className={styles.fieldContainer}>
          <label className={styles.labelPt} htmlFor="PtInfo">
            Patient Information
          </label>
          <input
            className={styles.inputPt}
            type="text"
            name="PtInfo"
            placeholder="Age, gender, description of pain, med hx, etc"
            value={ptFormData.PtInfo}
            onChange={(e) => onFormDataChange(e)}
          />
        </div>

        <div className={styles.fieldContainer}>
          <label className={styles.labelPt} htmlFor="OtherInfo">
            Other Info
          </label>
          <input
            className={styles.inputPt}
            type="text"
            name="OtherInfo"
            placeholder="Red flags, etc"
            value={ptFormData.OtherInfo}
            onChange={(e) => onFormDataChange(e)}
          />
        </div>

        <button className={styles.buttonPT} type="submit" disabled={isLoading}>
          {isLoading ? "Submitting...." : "Submit"}
        </button>
      </form>
      {error && (
        <p className={`${styles.error} ${styles.errorMessage}`}>{error}</p>
      )}

      {isModalOpen && (
        <PatientSoapNoteModal
          patientInfo={response}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
}
