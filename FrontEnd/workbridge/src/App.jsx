// import Header from "./components/header";
// import Footer from "./components/footer";

// function App() {
//   return (
//     <>
//       <Header />

//       <main>
//         {/* Home Page Content */}
//       </main>

//       <Footer />
//     </>
//   );import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import ServiceDetails from "./components/ServiceDetails";

// function App() {
//   return (
//     <BrowserRouter>

//       <Routes>

//         <Route
//           path="/"
//           element={<Home />}
//         />

//         <Route
//           path="/services/:serviceName"
//           element={<ServiceDetails />}
//         />

//       </Routes>

//     </BrowserRouter>
//   );
// }


// }

// export default App;


import { Routes, Route } from "react-router-dom";

import Header from "./components/header";
import Footer from "./components/footer";
import ServiceDetails from "./components/ServiceDetails";
import PostJob from "./components/PostJob";
import FindWorker from "./components/FindWorker.jsx";

function App() {
  return (
    <Routes>

      {/* ================= HOME PAGE ================= */}

      <Route
        path="/"
        element={
          <>
            <Header />

            <main>
              {/* Tumhara Home Page Content */}
            </main>

            <Footer />
          </>
        }
      />


      {/* ================= SERVICE DETAILS ================= */}

      <Route
        path="/services/:serviceName"
        element={<ServiceDetails />}
      />


      {/* ================= POST YOUR JOB ================= */}

      <Route
        path="/post-job"
        element={<PostJob />}
      />

{/*==================  find-worker==================== */}
   <Route
  path="/workers"
  element={<FindWorker />}
/>

    </Routes>
  );
}

export default App;