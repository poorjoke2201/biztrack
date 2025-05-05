import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import App from '../App';
import SignupPage from '../pages/SignupPage/SignupPage'; 
import LoginPage from '../pages/LoginPage/LoginPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import AddProductPage from '../pages/AddProductPage/AddProductPage';
import ViewInventoryPage from '../pages/ViewInventoryPage/ViewInventoryPage';
import EditProductPage from '../pages/EditProductPage/EditProductPage';
import GenerateInvoicePage from '../pages/GenerateInvoicePage/GenerateInvoicePage';
import ViewInvoicesPage from '../pages/ViewInvoicesPage/ViewInvoicesPage';
import AddEmployeePage from '../pages/AddEmployeePage/AddEmployeePage';
import ViewEmployeesPage from '../pages/ViewEmployeesPage/ViewEmployeesPage';
import EditEmployeePage from '../pages/EditEmployeePage/EditEmployeePage';
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route index element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="add-product" element={<PrivateRoute><AddProductPage /></PrivateRoute>} />
      <Route path="view-inventory" element={<PrivateRoute><ViewInventoryPage /></PrivateRoute>} />
      <Route path="edit-product/:id" element={<PrivateRoute><EditProductPage /></PrivateRoute>} />
      <Route path="generate-invoice" element={<PrivateRoute><GenerateInvoicePage /></PrivateRoute>} />
      <Route path="view-invoices" element={<PrivateRoute><ViewInvoicesPage /></PrivateRoute>} />
      <Route path="add-employee" element={<PrivateRoute><AddEmployeePage /></PrivateRoute>} />
      <Route path="view-employees" element={<PrivateRoute><ViewEmployeesPage /></PrivateRoute>} />
      <Route path="edit-employee/:id" element={<PrivateRoute><EditEmployeePage /></PrivateRoute>} />
      <Route path="analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
    </Route>
  )
);

export default router;