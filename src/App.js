// FONTS
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css';

// COMPONENTS
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// MATERIAL UI
import CssBaseline from '@mui/material/CssBaseline';

// MY COMPONENTS
import NavBar from './components/layout/Navbar';
import ContainerPages from "./components/layout/ContainerPages";

// PAGES
// import Dashboard from './components/pages/Dashboard';
import OKRsManager from './components/pages/OKRsManager';
import MyOKRs from './components/pages/MyOKRs';

import UserAuthProvider from './components/user/UserAuth';

function App() {
  return (
    <CssBaseline>
      <UserAuthProvider>
        <Router>
          <NavBar />
          <ContainerPages>
            <Routes>
              <Route path="/" element={<Navigate to="/manager" replace={true} />} />
              {/* <Route path="/manager" element={<Dashboard />} /> */}
              <Route path="/manager" element={<OKRsManager />} />
              <Route path="/myokrs" element={<MyOKRs />} />
            </Routes>
          </ContainerPages>
        </Router>
      </UserAuthProvider>
    </CssBaseline>
  );
}

export default App;
