import React, { useState } from "react";
import "./FindWorker.css";

const workers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    service: "Plumber",
    location: "Jhansi",
    rating: 4.9,
    reviews: 128,
    experience: "8 Years",
    jobs: 240,
    price: "₹350/hr",
    verified: true,
    available: true,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Amit Sharma",
    service: "Electrician",
    location: "Jhansi",
    rating: 4.8,
    reviews: 96,
    experience: "6 Years",
    jobs: 185,
    price: "₹300/hr",
    verified: true,
    available: true,
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Vikas Singh",
    service: "Painter",
    location: "Jhansi",
    rating: 4.7,
    reviews: 74,
    experience: "7 Years",
    jobs: 160,
    price: "₹400/hr",
    verified: true,
    available: false,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Suresh Yadav",
    service: "Carpenter",
    location: "Jhansi",
    rating: 4.9,
    reviews: 112,
    experience: "10 Years",
    jobs: 310,
    price: "₹450/hr",
    verified: true,
    available: true,
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 5,
    name: "Rohit Verma",
    service: "AC Service",
    location: "Jhansi",
    rating: 4.6,
    reviews: 61,
    experience: "5 Years",
    jobs: 130,
    price: "₹350/hr",
    verified: true,
    available: true,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 6,
    name: "Manoj Patel",
    service: "Cleaner",
    location: "Jhansi",
    rating: 4.8,
    reviews: 89,
    experience: "5 Years",
    jobs: 205,
    price: "₹250/hr",
    verified: true,
    available: true,
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80"
  }
];

function FindWorker() {
  const [search, setSearch] = useState("");
  const [service, setService] = useState("All Services");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("Recommended");

  const filteredWorkers = workers
    .filter((worker) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        worker.name.toLowerCase().includes(searchText) ||
        worker.service.toLowerCase().includes(searchText);

      const matchesService =
        service === "All Services" ||
        worker.service === service;

      const matchesLocation =
        location === "" ||
        worker.location.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesService && matchesLocation;
    })
    .sort((a, b) => {
      if (sort === "Rating") {
        return b.rating - a.rating;
      }

      if (sort === "Experience") {
        return parseInt(b.experience) - parseInt(a.experience);
      }

      return b.rating - a.rating;
    });

  return (
    <main className="find-worker-page">

        {/* ================= HERO ================= */}

        <section className="find-worker-hero">

          <div className="find-worker-overlay"></div>

          <div className="find-worker-hero-content">

            <span className="find-worker-badge">
              👷 TRUSTED PROFESSIONALS
            </span>

            <h1>
              Find the right
              <br />
              <span>worker for your job.</span>
            </h1>

            <p>
              Discover trusted professionals near you,
              compare their profiles and hire with confidence.
            </p>

            {/* SEARCH */}

            <div className="worker-search-box">

              <div className="worker-search-field">

                <span>🔍</span>

                <input
                  type="text"
                  placeholder="Search plumber, electrician..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              <div className="worker-search-field location-field">

                <span>📍</span>

                <input
                  type="text"
                  placeholder="Your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

              </div>

              <button className="worker-search-button">
                Find Workers
              </button>

            </div>

          </div>
        </section>


        {/* ================= SERVICES ================= */}

        <section className="worker-services">

          <div className="worker-container">

            <div className="section-top">

              <div>
                <span className="small-heading">
                  BROWSE PROFESSIONALS
                </span>

                <h2>
                  What service do you need?
                </h2>
              </div>

              <button
                className="clear-button"
                onClick={() => {
                  setSearch("");
                  setLocation("");
                  setService("All Services");
                }}
              >
                Clear filters
              </button>

            </div>


            <div className="service-filter-list">

              {[
                ["All Services", "✨"],
                ["Plumber", "🔧"],
                ["Electrician", "⚡"],
                ["Painter", "🎨"],
                ["Carpenter", "🔨"],
                ["AC Service", "❄️"],
                ["Cleaner", "🧹"]
              ].map(([name, icon]) => (

                <button
                  key={name}
                  className={`service-filter ${
                    service === name ? "active" : ""
                  }`}
                  onClick={() => setService(name)}
                >
                  <span>{icon}</span>
                  {name}
                </button>

              ))}

            </div>

          </div>

        </section>


        {/* ================= WORKERS ================= */}

        <section className="workers-section">

          <div className="worker-container">

            <div className="workers-header">

              <div>

                <span className="small-heading">
                  AVAILABLE PROFESSIONALS
                </span>

                <h2>
                  {filteredWorkers.length} professionals found
                </h2>

              </div>

              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Recommended</option>
                <option>Rating</option>
                <option>Experience</option>
              </select>

            </div>


            <div className="workers-grid">

              {filteredWorkers.map((worker) => (

                <div className="worker-card" key={worker.id}>

                  {/* IMAGE */}

                  <div className="worker-image">

                    <img
                      src={worker.image}
                      alt={worker.name}
                    />

                    {worker.verified && (
                      <span className="verified-badge">
                        ✓ Verified
                      </span>
                    )}

                    <button className="heart-button">
                      ♡
                    </button>

                  </div>


                  {/* CONTENT */}

                  <div className="worker-card-content">

                    <div className="worker-name-row">

                      <div>

                        <h3>{worker.name}</h3>

                        <span className="worker-service">
                          {worker.service}
                        </span>

                      </div>

                      {worker.available && (
                        <span className="available-dot">
                          Available
                        </span>
                      )}

                    </div>


                    <div className="worker-rating">

                      <span>★</span>

                      <strong>{worker.rating}</strong>

                      <small>
                        ({worker.reviews} reviews)
                      </small>

                    </div>


                    <div className="worker-details">

                      <span>
                        📍 {worker.location}
                      </span>

                      <span>
                        💼 {worker.experience}
                      </span>

                      <span>
                        ✓ {worker.jobs} jobs
                      </span>

                    </div>


                    <div className="worker-card-bottom">

                      <div className="worker-price">
                        <small>Starting from</small>
                        <strong>{worker.price}</strong>
                      </div>

                      <button className="view-profile-button">
                        View Profile
                        <span>→</span>
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>


            {/* NO RESULT */}

            {filteredWorkers.length === 0 && (

              <div className="no-workers">

                <div>🔍</div>

                <h3>
                  No professionals found
                </h3>

                <p>
                  Try changing your service or location.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setLocation("");
                    setService("All Services");
                  }}
                >
                  Reset Search
                </button>

              </div>

            )}

          </div>

        </section>


        {/* ================= TRUST SECTION ================= */}

        <section className="worker-trust">

          <div className="worker-container">

            <div className="trust-heading">

              <span className="small-heading">
                WHY WORKBRIDGE
              </span>

              <h2>
                Hire with confidence.
              </h2>

              <p>
                We make it easier to find reliable professionals
                for your home and everyday work.
              </p>

            </div>


            <div className="trust-grid">

              <div className="worker-trust-card">

                <div>✓</div>

                <h3>
                  Verified Professionals
                </h3>

                <p>
                  Find trusted workers with verified
                  profiles and useful experience details.
                </p>

              </div>


              <div className="worker-trust-card">

                <div>★</div>

                <h3>
                  Real Ratings
                </h3>

                <p>
                  Compare ratings and customer reviews
                  before choosing a professional.
                </p>

              </div>


              <div className="worker-trust-card">

                <div>🔒</div>

                <h3>
                  Safe & Simple
                </h3>

                <p>
                  Browse professionals, compare options
                  and contact the right person easily.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
  );
}

export default FindWorker;