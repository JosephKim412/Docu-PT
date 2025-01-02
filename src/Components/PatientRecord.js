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

  const [isLoading, setIsLoading] = useState(false); //tracks form submission progress
  const [error, setError] = useState(""); //stores error messages
  const [response, setResponse] = useState(""); //stores ChatGPT response
  const [isModalOpen, setIsModalOpen] = useState(false); //tracks visibility of PatientSoapNote component which holds modal

  //Dynamically setting specific Form Data input elements based on user input
  function onFormDataChange(e) {
    // console.log(e); // onChange event object that contains details about target element
    // console.log(e.target); //DOM element that triggered the event --> allows access to its properties
    let { name, value } = e.target; // DOm elements represented as objects --> destructure object to extract props
    setPtFormData((prevFormData) => {
      return { ...prevFormData, [name]: value };
    }); //updates corresponding Form Data field
  }

  //Need to convert Date obj to string format YYYY-MM-DD for HTML date element
  //Date picker library returns a Date Object
  const handleDateChange = (date) => {
    setPtFormData((prevFormData) => ({
      ...prevFormData,
      DOS: date.toISOString().split("T")[0],
    }));
  };

  // Helper function to replace placeholders
  function populateTemplate(queryString, ptFormData) {
    return queryString.replace(/\${(.*?)}/g, (_, key) => {
      const value = key
        .split(".")
        .reduce((acc, curr) => acc?.[curr], ptFormData);
      return value !== undefined ? value : ""; // Replace undefined with an empty string
    });
  }

  //Handling Form Submission
  //1. Async function to make fetch request to ChatGPT API
  //2. Handle slow loading
  //3. Error handling
  function handlePtFormSubmit(e) {
    e.preventDefault();
    async function submitPtForm(e) {
      setIsLoading(true);
      setError(""); //reset error message for new form submission
      setResponse(""); //reset response for new form submission

      const rawQuery = `
You are a medical assistant helping to create a physical therapy SOAP note. Based on the patient information provided (${
        ptFormData.PtInfo
      }), generate a structured JSON object for easy parsing and integration into a form-based interface. Ensure the ICD-10 codes are relevant to the diagnosis and the patient's reported symptoms.

Please use the following structure:

{
  "Subjective": {
    "Date": "${ptFormData.DOS}",

    "Diagnosis ICD 10 Codes": "Please include 3 relevant ICD 10 Codes based on ${
      ptFormData.PtInfo
    }",

    "Treatment Diagnosis Codes": "${"Copy the Diagnosis ICD 10 Codes provided above"}",

    "Body Part": "Please include the appropriate body part based on ${
      ptFormData.PtInfo
    }"

   "Surgery Performed": 
      "checkboxes": [
        {
          "label": "Yes",
          "checked": ${
            ptFormData.PtInfo.toLowerCase().includes("surgery") ||
            ptFormData.PtInfo.toLowerCase().includes("operation")
              ? true
              : false
          }
        },
        {
          "label": "No",
          "checked": ${
            !ptFormData.PtInfo.toLowerCase().includes("surgery") &&
            !ptFormData.PtInfo.toLowerCase().includes("operation")
              ? true
              : false
          }
        }
      ],


    "Injury / Onset Date / Surgery Date": {
      "Date": "Please include the appropriate date based on ${
        ptFormData.PtInfo
      }",
      "checkboxes": [
        "Chronic",
        "Insidious",
        "New Injury",
        "No New Aggravation/Injury"
      ]
    },

   
      "Pain Scale": {
        "checkboxes": ["Mild", "Moderate", "Severe"]
      },
      "Location": "Include appropriate pain location based on ${
        ptFormData.PtInfo
      }",

      "Aggravating Factors": "Please include the appropriate Aggravating Factors based on ${
        ptFormData.PtInfo
      }",
      "Comments": "Please include the appropriate comments based on ${
        ptFormData.PtInfo
      }",
    

    "History Of Present Condition": "Include an input field summarizing the history and mechanism of injury derived from ${
      ptFormData.PtInfo
    }",

    "Prior Level Of Function": "Please include the appropriate comments based on ${
      ptFormData.PtInfo
    }",

  "Objective": {
    "ROM Measurements": {
      "checkboxes": ["Full", "Moderate Limitation", "Severe Limitation"]
    },
    "Strength MMT Measurements": {
      "checkboxes": ["Normal", "Weak", "Paralysis"]
    }
  },

  "Assessment": {
    "Short Term Goals": {
      "value": "Suggest up to 3 short term STAR goals relevant to ${
        ptFormData.PtInfo
      }"
    },
    "Long Term Goals": {
      "value": "Suggest up to 3 long term STAR goals relevant to ${
        ptFormData.PtInfo
      }"
    }
  },

  "Plan": {
    "Exercises": "Suggest up to 3 exercises relevant to ${ptFormData.PtInfo}",
    "FrequencyAndDuration": {
      "value": "3 Times a week for 12 Weeks"
    }
  },

  "Billing": {
    "CPT Codes": [
      {
        "Code": "Identify CPT codes relevant to ${
          ptFormData.PtInfo
        } and the treatment plan",
        "Units": "Include appropriate units billed for a 1-hour session"
      }
    ]
  }
}`;

      //Use helper function to process raw Query string with template literals
      const query = populateTemplate(rawQuery, ptFormData);

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
            max_tokens: 1000,
          }),
        });
        // console.log(result);

        //error handling for Client/server side errors
        if (result.ok === false) {
          throw new Error("Please re-submit the form with more information");
        }

        //jsonify the response object
        const data = await result.json();
        // console.log(data);

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

        // console.log(data.choices[0].message.content.split("\n\n")) or
        //parse responseContent by keywords for better readability

        // const contentBySection = {};
        // const lines = responseContent.split("\n");
        // let currentSection;
        // lines.forEach((line) => {
        //   if (line.toLowerCase().includes("Subjective")) {
        //     currentSection = "Subjective";
        //   } else if (line.toLowerCase().includes("Objective")) {
        //     currentSection = "Objective";
        //   } else if (line.toLowerCase().includes("Assessment")) {
        //     currentSection = "Assessment";
        //   } else if (line.toLowerCase().includes("Plan")) {
        //     currentSection = "Plan";
        //   } else {
        //     currentSection = "Additional Information";
        //   }

        //   if (contentBySection[currentSection]) {
        //     contentBySection[currentSection] += `${line}\n`;
        //     // console.log(contentBySection);
        //     // console.log(contentBySection[currentSection]);
        //   } else {
        //     contentBySection[currentSection] = `${line}\n`;
        //   }
        // });

        //code above not needed --> parsing is done in PatientSoapModalTab component converting the string to JSON object

        setIsModalOpen(true); //allow visibility of PatientSoapNote component after successful fetch
      } catch (err) {
        console.log(err);
        setError((prevErr) => err.message);
      } finally {
        setIsLoading(false); //reset Loading state after form submission
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
