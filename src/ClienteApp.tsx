import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClienteShell from './ui/shells/ClienteShell';
import SelectUser from './ui/cliente/SelectUser';

export default function ClienteApp() {
  return (
    <HashRouter>
      <ClienteShell>
        <Routes>
          <Route path="/" element={<SelectUser />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClienteShell>
    </HashRouter>
  );
}
