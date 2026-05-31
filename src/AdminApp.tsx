import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from './ui/shells/AdminShell';
import SelectOperator from './ui/admin/SelectOperator';

export default function AdminApp() {
  return (
    <HashRouter>
      <AdminShell>
        <Routes>
          <Route path="/" element={<SelectOperator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminShell>
    </HashRouter>
  );
}
