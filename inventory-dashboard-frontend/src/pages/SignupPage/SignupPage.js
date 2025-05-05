/*import React from 'react';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import SignupForm from './SignupForm';
import styles from './SignupPage.module.css';

const SignupPage = () => {
  return (
    <AuthLayout>
      <div className={styles.signupPage}>
        <h2>Create an Account</h2>
        <SignupForm />
      </div>
    </AuthLayout>
  );
};

export default SignupPage;*/

import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from './SignupForm'; // Your existing signup form component
import styles from './SignupPage.module.css'; // CSS for the page layout/card

// import logo from '../../assets/images/logo.png';

const SignupPage = () => {
  return (
    <div className={styles.pageContainer}> {/* Full page container */}
      <div className={styles.formCard}> {/* Centered card */}

        {/* Branding Section */}
        <div className={styles.branding}>
           {/* {logo && <img src={logo} alt="BizTrack Logo" className={styles.logo} />} */}
           <h1 className={styles.appName}>BizTrack</h1>
           <p className={styles.tagline}>Create Your Account</p> {/* Different tagline */}
        </div>

        {/* Signup Form Component */}
        <SignupForm />

        {/* Link back to Login */}
        <p className={styles.switchForm}>
           Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default SignupPage;