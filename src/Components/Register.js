import { useState, useEffect, useRef } from "react";
import styles from "../CSS_stylesheets/register.module.css";

//1. Using State to manage form data
export default function Register({ toggleForm }) {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
  });

  //on submit console.log values of each field and reset all input fields

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e.target);
    console.log("Form Submitted:", formData);
    setFormData({
      FirstName: "",
      LastName: "",
      Email: "",
      Password: "",
    });
  }

  //onChange set form data values dynamically

  function onChange(e) {
    let { name, value } = e.target;
    console.log(name, value);
    setFormData((prevData) => {
      return { ...prevData, [name]: value };
    });
  }
  return (
    <div className={styles.registerContainer}>
      <h1 className={styles.registerHeading}>Create Your Account</h1>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <label className={styles.registerLabel} htmlFor="firstName">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          className={styles.registerInput}
          placeholder="First Name"
          name="FirstName"
          value={formData.FirstName}
          onChange={onChange}
        />

        <label className={styles.registerLabel} htmlFor="lastName">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          className={styles.registerInput}
          placeholder="Last Name"
          name="LastName"
          value={formData.LastName}
          onChange={onChange}
        />

        <label className={styles.registerLabel} htmlFor="emailAddy">
          Email
        </label>
        <input
          type="email"
          id="emailAddy"
          className={styles.registerInput}
          placeholder="email@abc.com"
          name="Email"
          value={formData.Email}
          onChange={onChange}
        />

        <label className={styles.registerLabel} htmlFor="pass">
          Password
        </label>
        <input
          type="password"
          id="pass"
          className={styles.registerInput}
          placeholder="Create Password"
          name="Password"
          value={formData.Password}
          onChange={onChange}
        />

        <label className={styles.registerLabel} htmlFor="confirmPass">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPass"
          className={styles.registerInput}
          placeholder="Confirm Password"
          name="ConfirmPass"
        />

        <button className={styles.registerButton} type="submit">
          Create Account
        </button>
        <button
          className={`${styles.registerButton} ${styles.secondaryButton}`}
          onClick={() => toggleForm("login")}
        >
          Already have an Account? Login
        </button>
      </form>
    </div>
  );
}

// //2. Using useRef to manage Form data

// export default function Register() {
//   const formDataRef = useRef(null);

//   function handleSubmit(e) {
//     e.preventDefault();
//     console.log(formDataRef);
//     const formInfo = new FormData(formDataRef.current);
//     for (let [prop, value] of formInfo) {
//       console.log(prop, value);
//     }
//   }

//   return (
//     <>
//       <form ref={formDataRef} onSubmit={(e) => handleSubmit(e)}>
//         <label htmlFor="firstName"></label>
//         <input
//           type="text"
//           id="firstName"
//           placeholder="First Name"
//           name="FirstName"
//         />
//         <label htmlFor="lastName"></label>
//         <input
//           type="text"
//           id="lastName"
//           placeholder="Last Name"
//           name="LastName"
//         />
//         <label htmlFor="emailAddy"></label>
//         <input
//           type="email"
//           id="emailAddy"
//           placeholder="email@abc.com"
//           name="Email"
//         />
//         <label htmlFor="pass"></label>
//         <input
//           type="password"
//           id="pass"
//           placeholder="Create Password"
//           name="Password"
//         />
//         <label htmlFor="confirmPass"></label>
//         <input
//           type="password"
//           id="confirmPass"
//           placeholder="Confirm Password"
//           name="ConfirmPass"
//         />
//         <button type="submit">Create Account</button>
//       </form>
//     </>
//   );
// }
