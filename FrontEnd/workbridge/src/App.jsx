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
import Help from "./components/Help.jsx";
import ServiceDetails from "./components/ServiceDetails.jsx";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";

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
        <Route path="/help" element={<Help />} />
        <Route path="/services/:serviceName" element={<ServiceDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
