// src/pages/EditEmployeePage/EditEmployeePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditEmployeeForm from './EditEmployeeForm';
import styles from './EditEmployeePage.module.css';
import { getEmployeeById } from '../../services/employeeService'; // Ensure this service is correct
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';

const EditEmployeePage = () => {
  // *** FIX: Use 'employeeId' to match the route parameter name ***
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchEmployee = async () => {
      // *** FIX: Check and use 'employeeId' ***
      if (!employeeId) {
          setError("No employee ID specified in URL.");
          setLoading(false);
          return;
      }
      console.log(`EditEmployeePage: Fetching employee with ID: ${employeeId}`);
      setLoading(true);
      setError(null);
      try {
        // *** FIX: Use 'employeeId' in the service call ***
        const data = await getEmployeeById(employeeId);
        if (isMounted) {
            if (data) {
                setEmployee(data);
            } else {
                setError(`Employee with ID ${employeeId} not found.`);
            }
        }
      } catch (err) {
        if (isMounted) {
            setError(err.response?.data?.message || 'Failed to load employee details.');
            console.error('Error fetching employee:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployee();
    return () => { isMounted = false; };
  // *** FIX: Add 'employeeId' to dependency array (though navigate is less critical here) ***
  }, [employeeId]); // Removed navigate as it's not directly used in effect's logic for re-fetching

  if (loading) {
    return (
      <div className={styles.editEmployeePage}>
        <h2>Edit Employee</h2>
        <Spinner message="Loading employee details..." />
      </div>
    );
  }

  if (error || !employee) { // If error OR employee is null after loading
    return (
      <div className={styles.editEmployeePage}>
        <h2>Edit Employee</h2>
        <Alert type="error" message={error || `Employee with ID ${employeeId} not found.`} />
        <Button onClick={() => navigate('/view-employees')} variant="secondary" style={{ marginTop: '1rem' }}>
            Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.editEmployeePage}>
      <h2>Edit Employee</h2>
      {/* Pass the fetched employee data to the form */}
      <EditEmployeeForm initialEmployee={employee} />
    </div>
  );
};

export default EditEmployeePage;