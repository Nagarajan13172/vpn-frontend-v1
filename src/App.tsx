import { Route, Routes, useLocation } from 'react-router'
import './App.css'
import Dashboard from './pages/protected/Dashboard/Dashboard'
import SideMenuLayout from './pages/layout';
import Peer from './pages/protected/peer/Peer';
import Login from './auth/Login';
import AuthLayer from './auth/AuthLayer';

function App() {
  const location = useLocation();


  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/auth/login" element={<Login />} />

        <Route element={<AuthLayer />}>
          <Route element={<SideMenuLayout />}>
            {/* Define your routes here */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/peer" element={<Peer />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
