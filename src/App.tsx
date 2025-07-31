import { Route, Routes, useLocation } from 'react-router'
import './App.css'
import Dashboard from './pages/protected/Dashboard/Dashboard'
import SideMenuLayout from './pages/layout';

function App() {
  const location = useLocation();
 

  return (
    <>
    <Routes location={location} key={location.pathname}>
      <Route element={<SideMenuLayout />}>
        {/* Define your routes here */}
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
