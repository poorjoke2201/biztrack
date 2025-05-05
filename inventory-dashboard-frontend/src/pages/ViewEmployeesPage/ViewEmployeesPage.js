import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import styles from './ViewEmployeesPage.module.css';
// Import deleteEmployee service function
import { getAllEmployees, deleteEmployee } from '../../services/employeeService';
import Spinner from '../../components/Spinner/Spinner'; // Assuming you have these
import Alert from '../../components/Alert/Alert'; // Assuming you have these

const ViewEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Error for fetching
  const [actionError, setActionError] = useState(null); // Error for delete/edit actions
  const navigate = useNavigate(); // Initialize navigate hook

  // --- Fetch Employees ---
  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
      console.log("Attempting to fetch employees...");
      setLoading(true);
      setError(null);
      setActionError(null); // Clear action error on load/refresh
      try {
        const data = await getAllEmployees();
        console.log("Employees data received:", data);
        if (isMounted) {
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error("Received non-array data from getAllEmployees:", data);
                setError('Failed to load employees: Invalid data format received.');
                setEmployees([]);
            }
            setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
            console.error('Error fetching employees:', err);
            const message = err.response?.data?.message || err.message || 'Failed to load employees due to a network or server error.';
            setError(message);
            setLoading(false);
            setEmployees([]);
        }
      }
    };

    fetchEmployees();
    return () => { isMounted = false; } // Cleanup on unmount
  }, []); // Runs once on mount

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // --- Filter Logic (using corrected field names: name, _id) ---
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const filteredEmployees = employees.filter(employee => {
    if (!employee) return false;
    // Safe checks
    const nameMatch = employee.name && typeof employee.name === 'string' && employee.name.toLowerCase().includes(lowerCaseSearchTerm);
    const emailMatch = employee.email && typeof employee.email === 'string' && employee.email.toLowerCase().includes(lowerCaseSearchTerm);
    const roleMatch = employee.role && typeof employee.role === 'string' && employee.role.toLowerCase().includes(lowerCaseSearchTerm);
    const idMatch = employee._id && typeof employee._id === 'string' && employee._id.toLowerCase().includes(lowerCaseSearchTerm);
    // Add phone number search if applicable and data exists
    // const phoneMatch = employee.phoneNumber && typeof employee.phoneNumber === 'string' && employee.phoneNumber.includes(searchTerm);

    return nameMatch || emailMatch || roleMatch || idMatch /* || phoneMatch */;
  });

  // --- Edit Handler ---
  const handleEdit = (employeeId) => {
    console.log(`Navigating to edit page for employee: ${employeeId}`);
    // Ensure your route matches this pattern
    navigate(`/edit-employee/${employeeId}`);
  };

  // --- Delete Handler ---
  const handleDelete = async (employeeId, employeeName) => {
    // Confirmation dialog
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      setActionError(null); // Clear previous action errors
      try {
        console.log(`Attempting to delete employee: ${employeeId}`);
        // Call the service function
        const response = await deleteEmployee(employeeId);
        console.log('Delete response:', response);

        // Check if backend confirmed deletion
        if (response && response.message === 'User removed') {
           // Update UI by removing employee from local state
           setEmployees(currentEmployees => currentEmployees.filter(emp => emp._id !== employeeId));
           console.log(`Employee ${employeeId} removed from local state.`);
           // Optionally show a temporary success message
        } else {
           setActionError(response?.message || 'Failed to delete employee. Unexpected response.');
        }
      } catch (err) {
        console.error(`Error deleting employee ${employeeId}:`, err);
        const message = err.response?.data?.message || err.message || 'Could not delete employee.';
        setActionError(message); // Display error to user
      }
    }
  };

  // --- Define Columns (using corrected field names: name, _id) ---
  const employeeColumns = [
    // Use _id from backend, but maybe don't display it or display differently
    // { header: 'ID', key: '_id' },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    // Add phone number column if applicable
    // { header: 'Phone', key: 'phoneNumber' },
    { header: 'Role', key: 'role' },
    {
      header: 'Actions',
      key: 'actions',
      render: (employee) => (
        <div className={styles.actionButtonsContainer}>
          {/* Call handleEdit */}
          <button title="Edit Employee" className={styles.actionButton} onClick={() => handleEdit(employee._id)}>Edit</button>
          {/* Call handleDelete */}
          <button title="Delete Employee" className={styles.actionButtonDelete} onClick={() => handleDelete(employee._id, employee.name)}>Delete</button>
        </div>
      ),
    },
  ];

  // --- Render Logic ---
  if (loading) {
    return (
      //<MainLayout>
        <div className={styles.viewEmployeesPage}>
          <h2>View Employees</h2>
          <Spinner />
          <p>Loading employees...</p>
        </div>
      //</MainLayout>
    );
  }

  if (error) {
    return (
      //<MainLayout>
        <div className={styles.viewEmployeesPage}>
          <h2>View Employees</h2>
          <Alert type="error" message={error} />
        </div>
      //</MainLayout>
    );
  }

  return (
    //<MainLayout>
      <div className={styles.viewEmployeesPage}>
        <h2>View Employees</h2>
        {/* Show action error if exists */}
        {actionError && <Alert type="error" message={actionError} />}
        <SearchBar onSearch={handleSearch} placeholder="Search employees by name, email, role..." />
        <Table columns={employeeColumns} data={filteredEmployees} />
        {/* Empty state messages */}
         {filteredEmployees.length === 0 && searchTerm && (
           <p className={styles.noResults}>No employees found matching "{searchTerm}".</p>
        )}
         {employees.length > 0 && filteredEmployees.length === 0 && !searchTerm && (
           <p className={styles.noResults}>No employees match the current filter.</p>
        )}
         {employees.length === 0 && !error && (
             <p className={styles.noResults}>There are currently no employees registered.</p>
         )}
      </div>
    //</MainLayout>
  );
};

export default ViewEmployeesPage;