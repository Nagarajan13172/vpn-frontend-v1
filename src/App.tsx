import { Route, Routes, useLocation } from 'react-router'
import './App.css'
import Dashboard from './pages/protected/Dashboard/Dashboard'
import SideMenuLayout from './pages/layout';
import Peer from './pages/protected/peer/Peer';
import Login from './auth/Login';
import AuthLayer from './auth/AuthLayer';
import PeerDetails from './pages/protected/peerDetails/PeerDetails';
import Users from './pages/protected/users/Users';
import UserPeerView from './pages/protected/users/UserPeerView';
import { AnimatePresence } from 'framer-motion';
import { PageWrapper } from './utils/PageWrapper';
import Settings from './pages/protected/settings/Settings';


function App() {
  const location = useLocation();


  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/auth/login" element={<PageWrapper keyName='login'><Login /></PageWrapper>} />

          <Route element={<AuthLayer />}>
            <Route element={<SideMenuLayout />}>
              <Route path="/" element={<PageWrapper keyName='dashboard'><Dashboard /></PageWrapper>} />
              <Route path="/peers" element={<PageWrapper keyName='peers'><Peer /></PageWrapper>} />
              <Route path="/peers/:id" element={<PageWrapper keyName='peers-id'><PeerDetails /></PageWrapper>} />
              <Route path="/users" element={<PageWrapper keyName='users'><Users /></PageWrapper>} />
              <Route path="/users/:id/:username" element={<PageWrapper keyName='users-id-username'><UserPeerView /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper keyName='settings'><Settings /></PageWrapper>} />
              <Route path="/help" element={<PageWrapper keyName='help'><div>Help Page</div></PageWrapper>} />
            </Route>
          </Route>
          <Route path="*" element={<PageWrapper keyName='not-found'><div>404 Not Found</div></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
