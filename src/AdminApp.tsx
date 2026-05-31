import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from './ui/shells/AdminShell';
import SelectOperator from './ui/admin/SelectOperator';
import Dashboard from './ui/admin/Dashboard';
import Scanner from './ui/admin/Scanner';
import Areas from './ui/admin/Areas';
import Reservations from './ui/admin/Reservations';
import Users from './ui/admin/Users';

export default function AdminApp() {
  return (
    <HashRouter>
      <AdminShell>
        <Routes>
          <Route path="/" element={<SelectOperator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminShell>
    </HashRouter>
  );
}
