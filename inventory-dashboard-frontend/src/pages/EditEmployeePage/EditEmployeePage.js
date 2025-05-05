import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import EditEmployeeForm from './EditEmployeeForm';
import styles from './EditEmployeePage.module.css';
import { getEmployeeById } from '../../services/employeeService'; // Assuming you have this service

const EditEmployeePage = () => {
  const { id } = useParams(); // Get the employee ID from the route params
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getEmployeeById(id);
        setEmployee(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load employee details.');
        setLoading(false);
        console.error('Error fetching employee:', err);
        // Optionally redirect to view employees page if employee not found
        // navigate('/view-employees');
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      //<MainLayout>
        <div className={styles.editEmployeePage}>
          <h2>Edit Employee</h2>
          <p>Loading employee details...</p>
        </div>
      //</MainLayout>
    );
  }

  if (error) {
    return (
      //<MainLayout>
        <div className={styles.editEmployeePage}>
          <h2>Edit Employee</h2>
          <p className={styles.error}>{error}</p>
          <button onClick={() => navigate('/view-employees')}>Back to Employees</button>
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.editEmployeePage}>
        <h2>Edit Employee</h2>
        {employee && <EditEmployeeForm initialEmployee={employee} />}
      </div>
    //</MainLayout>
  );
};

export default EditEmployeePage;