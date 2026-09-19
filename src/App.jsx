import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './Components/Layout';
import Home from './Pages/Home';
import Careers from './Pages/Careers';
import Team from './Pages/Team';
import Wall from './Pages/Wall';
import Collaborate from './Pages/Collaborate';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Admin from './Pages/Admin';
import { ContentProvider } from './Context/ContentContext';
import { AuthProvider } from './Context/AuthContext';
import { initGA, trackPageView } from './lib/analytics';

// Fires a Google Analytics page_view on every route change. GA's own
// automatic page_view only fires once when the tracking script first loads,
// which is wrong for a single-page app — without this, Analytics would only
// ever record one page view no matter how many pages someone visits.
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
};

const App = () => {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <AuthProvider>
      <ContentProvider>
        <Router>
          <AnalyticsTracker />
          <Routes>
            {/* Admin has its own shell (sidebar/header), so it lives outside <Layout> */}
            <Route path="/admin" element={<Admin />} />

            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/wall" element={<Wall />} />
                    <Route path="/collaborate" element={<Collaborate />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </ContentProvider>
    </AuthProvider>
  );
};

export default App;
