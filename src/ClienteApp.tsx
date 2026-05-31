import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClienteShell from './ui/shells/ClienteShell';
import SelectUser from './ui/cliente/SelectUser';
import Home from './ui/cliente/Home';
import AreaDetail from './ui/cliente/AreaDetail';
import ReserveSlot from './ui/cliente/ReserveSlot';
import MyReservations from './ui/cliente/MyReservations';
import MyQR from './ui/cliente/MyQR';

export default function ClienteApp() {
  return (
    <HashRouter>
      <ClienteShell>
        <Routes>
          <Route path="/" element={<SelectUser />} />
          <Route path="/home" element={<Home />} />
          <Route path="/area/:id" element={<AreaDetail />} />
          <Route path="/reserve/:areaId" element={<ReserveSlot />} />
          <Route path="/reservations" element={<MyReservations />} />
          <Route path="/qr" element={<MyQR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClienteShell>
    </HashRouter>
  );
}
