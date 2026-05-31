import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClienteShell from './ui/shells/ClienteShell';
import SelectUser from './ui/cliente/SelectUser';
import Home from './ui/cliente/Home';

export default function ClienteApp() {
  return (
    <HashRouter>
      <ClienteShell>
        <Routes>
          <Route path="/" element={<SelectUser />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClienteShell>
    </HashRouter>
  );
}
