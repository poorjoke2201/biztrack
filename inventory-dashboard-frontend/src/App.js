// src/App.js
import React from 'react';
// Using BrowserRouter + Routes structure
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Keep these

// --- Import Page Components ---
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AddProductPage from './pages/AddProductPage/AddProductPage';
import ViewInventoryPage from './pages/ViewInventoryPage/ViewInventoryPage';
import EditProductPage from './pages/EditProductPage/EditProductPage';
import DeleteProductPage from './pages/DeleteProductPage/DeleteProductPage';
import GenerateInvoicePage from './pages/GenerateInvoicePage/GenerateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage/ViewInvoicesPage';
import ViewInvoiceDetailsPage from './pages/ViewInvoiceDetailsPage/ViewInvoiceDetailsPage';
import AddEmployeePage from './pages/AddEmployeePage/AddEmployeePage';
import ViewEmployeesPage from './pages/ViewEmployeesPage/ViewEmployeesPage';
import EditEmployeePage from './pages/EditEmployeePage/EditEmployeePage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
// TODO: Import NotFoundPage
// import NotFoundPage from './pages/NotFoundPage/NotFoundPage';


// --- Import Layout and Routing/Context ---
import MainLayout from './layouts/MainLayout/MainLayout';
import PrivateRoute from './router/PrivateRoute';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  return (
    // *** BrowserRouter MUST wrap AuthProvider ***
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider is now INSIDE BrowserRouter */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Private Routes */}
          <Route
             path="/"
             element={
               <PrivateRoute> {/* Base authentication check */}
                 <MainLayout /> {/* Render layout */}
               </PrivateRoute>
            }
           >
            {/* Nested routes render inside MainLayout's <Outlet /> */}
            <Route index element={<Navigate replace to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="view-inventory" element={<ViewInventoryPage />} />
            <Route path="generate-invoice" element={<GenerateInvoicePage />} />
            <Route path="view-invoices" element={<ViewInvoicesPage />} />
            <Route path="invoices/:invoiceId" element={<ViewInvoiceDetailsPage />} />

            {/* Admin Only Routes */}
            <Route path="analytics" element={<PrivateRoute requiredRole="admin"><AnalyticsPage /></PrivateRoute>} />
            <Route path="add-product" element={<PrivateRoute requiredRole="admin"><AddProductPage /></PrivateRoute>} />
            <Route path="edit-product/:productId" element={<PrivateRoute requiredRole="admin"><EditProductPage /></PrivateRoute>} />
            <Route path="delete-product" element={<PrivateRoute requiredRole="admin"><DeleteProductPage /></PrivateRoute>} />
            <Route path="add-employee" element={<PrivateRoute requiredRole="admin"><AddEmployeePage /></PrivateRoute>} />
            <Route path="view-employees" element={<PrivateRoute requiredRole="admin"><ViewEmployeesPage /></PrivateRoute>} />
            <Route path="edit-employee/:employeeId" element={<PrivateRoute requiredRole="admin"><EditEmployeePage /></PrivateRoute>} />
            {/* End Admin Only Routes */}

          </Route> {/* End Protected Routes */}

          {/* Fallback / 404 */}
           <Route path="*" element={<Navigate replace to="/login" />} /> {/* Or NotFoundPage */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

        </Routes> 
      </AuthProvider> 
    </BrowserRouter>   
  );
};

export default App;