import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Import Page Components ---
// ... (all your page imports - ensure they exist)
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AddProductPage from './pages/AddProductPage/AddProductPage';
import ViewInventoryPage from './pages/ViewInventoryPage/ViewInventoryPage';
import EditProductPage from './pages/EditProductPage/EditProductPage';
import DeleteProductPage from './pages/DeleteProductPage/DeleteProductPage'; // Make sure this exists
import GenerateInvoicePage from './pages/GenerateInvoicePage/GenerateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage/ViewInvoicesPage';
import ViewInvoiceDetailsPage from './pages/ViewInvoiceDetailsPage/ViewInvoiceDetailsPage';
import AddEmployeePage from './pages/AddEmployeePage/AddEmployeePage';
import ViewEmployeesPage from './pages/ViewEmployeesPage/ViewEmployeesPage'; // Make sure this exists
import EditEmployeePage from './pages/EditEmployeePage/EditEmployeePage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';


// --- Import Layout and Routing/Context ---
import MainLayout from './layouts/MainLayout/MainLayout';
import PrivateRoute from './router/PrivateRoute';
import { AuthProvider } from './context/AuthContext';


const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Navigate replace to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="add-product" element={<AddProductPage />} />
            {/* === Routes referenced in sidebar === */}
            <Route path="view-inventory" element={<ViewInventoryPage />} />
            <Route path="edit-product/:id" element={<EditProductPage />} />
            <Route path="delete-product" element={<DeleteProductPage />} />
            {/* ==================================== */}
            <Route path="generate-invoice" element={<GenerateInvoicePage />} />
            <Route path="view-invoices" element={<ViewInvoicesPage />} />
            <Route path="view-invoice/:invoiceId" element={<ViewInvoiceDetailsPage />} />
            <Route path="add-employee" element={<AddEmployeePage />} />
             {/* === Route referenced in sidebar === */}
            <Route path="view-employees" element={<ViewEmployeesPage />} />
            {/* =================================== */}
            <Route path="edit-employee/:id" element={<EditEmployeePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;