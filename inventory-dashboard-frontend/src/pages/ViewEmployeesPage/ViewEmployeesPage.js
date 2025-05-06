// src/pages/ViewEmployeesPage/ViewEmployeesPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Import Components
import SearchBar from '../../components/SearchBar/SearchBar'; // Assuming path is correct
import Table from '../../components/Table/Table';             // Assuming path is correct
import Spinner from '../../components/Spinner/Spinner';       // Assuming path is correct
import Alert from '../../components/Alert/Alert';           // Assuming path is correct
import Button from '../../components/Button/Button';         // *** IMPORT Button component ***
// Import Services
import { getAllEmployees, deleteEmployee } from '../../services/employeeService'; // Assuming path is correct
// Import Styles
import styles from './ViewEmployeesPage.module.css';
// Import Helpers (optional, if you have them)
// import { capitalize } from '../../utils/helpers';

const ViewEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(''); // For success messages
  const navigate = useNavigate();

  // --- Fetch Employees ---
  const fetchData = useCallback(async () => {
    console.log("Attempting to fetch employees...");
    setLoading(true);
    setError(null);
    setActionError(null);
    setActionSuccess(''); // Clear success on refresh
    try {
      const data = await getAllEmployees();
      console.log("Employees data received:", data);
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("Received non-array data from getAllEmployees:", data);
        setError('Failed to load employees: Invalid data format received.');
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load employees.';
      setError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as it's a one-time fetch on mount or manual refresh

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run once on mount

  // --- Search Handler ---
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // --- Filter Logic ---
  const filteredEmployees = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm.trim()) { // If search term is empty or whitespace, return all
        return employees;
    }
    return employees.filter(employee => {
      if (!employee) return false;
      return (
        (employee.name && employee.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.email && employee.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.role && employee.role.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee._id && employee._id.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.phoneNumber && employee.phoneNumber.includes(searchTerm)) // Direct match for phone if searching numbers
      );
    });
  }, [employees, searchTerm]);

  // --- Edit Handler (memoized) ---
  const handleEdit = useCallback((employeeId) => {
    console.log(`Navigating to edit page for employee: ${employeeId}`);
    navigate(`/edit-employee/${employeeId}`); // Ensure this route is defined in App.js
  }, [navigate]);

  // --- Delete Handler (memoized) ---
  const handleDelete = useCallback(async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
      setActionError(null);
      setActionSuccess('');
      try {
        console.log(`Attempting to delete employee: ${employeeId}`);
        const response = await deleteEmployee(employeeId); // Call service function
        console.log('Delete response:', response);

        if (response && response.message && response.message.toLowerCase().includes('removed')) {
           setActionSuccess(response.message); // Use message from backend
           // Refresh the employee list
           fetchData(); // Or filter out locally: setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
        } else {
           setActionError(response?.message || 'Failed to delete employee.');
        }
      } catch (err) {
        console.error(`Error deleting employee ${employeeId}:`, err);
        const message = err.response?.data?.message || err.message || 'Could not delete employee.';
        setActionError(message);
      }
    }
  }, [fetchData]); // Dependency on fetchData to refresh the list

  // --- Define Table Columns (memoized) ---
  const employeeColumns = useMemo(() => [
    { header: 'Name', key: 'name',
      // Optional: Render name with a link or special styling if needed
      // render: (employee) => <Link to={`/employee-details/${employee._id}`}>{employee.name}</Link>
    },
    { header: 'Email', key: 'email' },
    { header: 'Phone Number', key: 'phoneNumber', format: (phone) => phone || 'N/A'}, // Display phone if available
    { header: 'Role', key: 'role',
      format: (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A' // Capitalize role
    },
    {
      header: 'Status', key: 'isActive', // Assuming an isActive field from backend
      render: (employee) => (
          <span className={employee.isActive === false ? styles.inactiveStatus : styles.activeStatus}>
              {employee.isActive === false ? 'Inactive' : 'Active'}
          </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (employee) => (
        <div className={styles.actionButtonsContainer}>
          {/* Use the imported Button component with variants and sizes */}
          <Button
            size="small"
            onClick={() => handleEdit(employee._id)}
            title={`Edit ${employee.name}`}
          >
            Edit
          </Button>
          {/* Example: Prevent deleting self or super admin if you have such logic */}
          {/* {auth.user._id !== employee._id && employee.role !== 'superadmin' && ( */}
          <Button
            size="small"
            variant="danger" // Use 'danger' variant for delete button
            onClick={() => handleDelete(employee._id, employee.name)}
            title={`Delete ${employee.name}`}
          >
            Delete
          </Button>
          {/* )} */}
        </div>
      ),
    },
  ], [handleEdit, handleDelete]); // Dependencies for memoization

  // --- Render Logic ---
  if (loading) {
    return (
      <div className={styles.viewEmployeesPage}>
        <h2>View Employees</h2>
        <Spinner message="Loading employees..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.viewEmployeesPage}>
        <h2>View Employees</h2>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className={styles.viewEmployeesPage}>
      <h2>View Employees</h2>
      {/* Action messages */}
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

      <div className={styles.searchContainer}> {/* Use the class from your CSS Module */}
        <SearchBar onSearch={handleSearch} placeholder="Search by name, email, role, ID..." />
      </div>

      <Table columns={employeeColumns} data={filteredEmployees} />

      {/* Empty state messages */}
      {!loading && filteredEmployees.length === 0 && searchTerm && (
        <p className={styles.noResults}>No employees found matching "{searchTerm}".</p>
      )}
      {!loading && employees.length > 0 && filteredEmployees.length === 0 && !searchTerm && (
        <p className={styles.noResults}>No employees match the current filter (if any applied).</p>
      )}
      {!loading && employees.length === 0 && !error && (
          <p className={styles.noResults}>There are currently no employees registered. <Button size="small" onClick={() => navigate('/add-employee')}>Add Employee</Button></p>
      )}
    </div>
  );
};

export default ViewEmployeesPage;