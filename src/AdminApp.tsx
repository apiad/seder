import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from './ui/shells/AdminShell';
import SelectOperator from './ui/admin/SelectOperator';
import Dashboard from './ui/admin/Dashboard';
import Scanner from './ui/admin/Scanner';

export default function AdminApp() {
  return (
    <HashRouter>
      <AdminShell>
        <Routes>
          <Route path="/" element={<SelectOperator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminShell>
    </HashRouter>
  );
}
