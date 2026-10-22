import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";

import Home from "./components/Home.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import ForPros from "./components/ForPros.jsx";
import Services from "./components/Services.jsx";
import Cities from "./components/Cities.jsx";
import FindWorker from "./components/FindWorker.jsx";
import PostJob from "./components/PostJob.jsx";
import MyJobs from "./components/MyJobs.jsx";
import AdminJobs from "./components/AdminJobs.jsx";
import Help from "./components/Help.jsx";
import ServiceDetails from "./components/ServiceDetails.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-pros" element={<ForPros />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/workers" element={<FindWorker />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/my-jobs" element={<MyJobs />} />
        <Route path="/my-jobs/:id" element={<MyJobs />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/help" element={<Help />} />
        <Route path="/services/:serviceName" element={<ServiceDetails />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;