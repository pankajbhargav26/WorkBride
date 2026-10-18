import React, { useState } from "react";
import Header from "./header";
import Footer from "./footer";
import "./PostJob.css";

function PostJob() {
  const [formData, setFormData] = useState({
    service: "",
    title: "",
    description: "",
    location: "",
    date: "",
    urgency: "Flexible",
    name: "",
    phone: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Job Posted:", formData);

    alert("Your job has been posted successfully!");

    setFormData({
      service: "",
      title: "",
      description: "",
      location: "",
      date: "",
      urgency: "Flexible",
      name: "",
      phone: ""
    });
  };

  return (
    <>
      <Header />

      <main className="post-job-page">

        {/* ================= HERO ================= */}

        <section className="post-job-hero">
          <div className="post-job-hero-content">

            <span className="post-job-badge">
              🔨 Need a Professional?
            </span>

            <h1>Post Your Job</h1>

            <p>
              Tell us what you need and connect with trusted
              professionals near you.
            </p>

          </div>
        </section>


        {/* ================= MAIN ================= */}

        <section className="post-job-section">

          <div className="post-job-container">

            {/* ================= FORM ================= */}

            <div className="post-job-form-wrapper">

              <form
                className="post-job-form"
                onSubmit={handleSubmit}
              >

                {/* ================= SERVICE ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      01
                    </span>

                    <div>
                      <h2>
                        What service do you need?
                      </h2>

                      <p>
                        Choose the type of professional
                        you are looking for.
                      </p>
                    </div>

                  </div>


                  <div className="form-group">

                    <label>
                      Service <span>*</span>
                    </label>

                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select a service
                      </option>

                      <option value="plumbing">
                        🔧 Plumbing
                      </option>

                      <option value="electrical">
                        ⚡ Electrical
                      </option>

                      <option value="cleaning">
                        🧹 Cleaning
                      </option>

                      <option value="ac-service">
                        ❄️ AC & Appliances
                      </option>

                      <option value="painting">
                        🎨 Painting
                      </option>

                      <option value="carpentry">
                        🔨 Carpentry
                      </option>

                      <option value="shifting">
                        🚚 Packers & Movers
                      </option>

                      <option value="gardening">
                        🌿 Gardening
                      </option>

                      <option value="other">
                        Other
                      </option>

                    </select>

                  </div>

                </div>


                {/* ================= JOB DETAILS ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      02
                    </span>

                    <div>

                      <h2>
                        Tell us about the job
                      </h2>

                      <p>
                        Give professionals enough information
                        to understand your requirement.
                      </p>

                    </div>

                  </div>


                  {/* JOB TITLE */}

                  <div className="form-group">

                    <label>
                      Job Title <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Fix leaking bathroom tap"
                      required
                    />

                  </div>


                  {/* DESCRIPTION */}

                  <div className="form-group">

                    <label>
                      Description <span>*</span>
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe what needs to be done..."
                      rows="5"
                      required
                    />

                    <small>
                      Include useful details such as the problem,
                      size, quantity or special requirements.
                    </small>

                  </div>

                </div>


                {/* ================= LOCATION ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      03
                    </span>

                    <div>

                      <h2>
                        Where is the work needed?
                      </h2>

                      <p>
                        Professionals near this location can
                        respond to your job.
                      </p>

                    </div>

                  </div>


                  <div className="form-group">

                    <label>
                      Location <span>*</span>
                    </label>

                    <div className="input-with-icon">

                      <span>
                        📍
                      </span>

                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your city or locality"
                        required
                      />

                    </div>

                  </div>

                </div>


                {/* ================= DATE & URGENCY ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      04
                    </span>

                    <div>

                      <h2>
                        When do you need the service?
                      </h2>

                      <p>
                        Tell professionals when you would
                        like the work to be done.
                      </p>

                    </div>

                  </div>


                  {/* DATE */}

                  <div className="form-row">

                    <div className="form-group">

                      <label>
                        Preferred Date
                      </label>

                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                      />

                    </div>

                  </div>


                  {/* URGENCY */}

                  <div className="form-group">

                    <label>
                      How urgent is this?
                    </label>

                    <div className="urgency-options">

                      {[
                        "Urgent",
                        "Within a week",
                        "Flexible"
                      ].map((option) => (

                        <label
                          className={`urgency-option ${
                            formData.urgency === option
                              ? "selected"
                              : ""
                          }`}
                          key={option}
                        >

                          <input
                            type="radio"
                            name="urgency"
                            value={option}
                            checked={
                              formData.urgency === option
                            }
                            onChange={handleChange}
                          />

                          <span>
                            {option}
                          </span>

                        </label>

                      ))}

                    </div>

                  </div>

                </div>


                {/* ================= PHOTOS ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      05
                    </span>

                    <div>

                      <h2>
                        Add photos
                      </h2>

                      <p>
                        Photos can help professionals
                        understand the job better.
                      </p>

                    </div>

                  </div>


                  <label className="upload-box">

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                    />

                    <div className="upload-icon">
                      📷
                    </div>

                    <strong>
                      Upload job photos
                    </strong>

                    <span>
                      Click to browse or drag and drop
                    </span>

                    <small>
                      JPG, PNG up to 5MB
                    </small>

                  </label>

                </div>


                {/* ================= CONTACT ================= */}

                <div className="form-section">

                  <div className="form-section-heading">

                    <span className="form-number">
                      06
                    </span>

                    <div>

                      <h2>
                        Your contact details
                      </h2>

                      <p>
                        Professionals can contact you
                        about your job.
                      </p>

                    </div>

                  </div>


                  <div className="form-row">

                    {/* NAME */}

                    <div className="form-group">

                      <label>
                        Your Name <span>*</span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />

                    </div>


                    {/* PHONE */}

                    <div className="form-group">

                      <label>
                        Phone Number <span>*</span>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                      />

                    </div>

                  </div>

                </div>


                {/* ================= SUBMIT ================= */}

                <div className="post-job-submit">

                  <div>

                    <strong>
                      Ready to find a professional?
                    </strong>

                    <p>
                      Your job will be visible to relevant
                      professionals near you.
                    </p>

                  </div>


                  <button
                    type="submit"
                    className="post-job-button"
                  >

                    Post My Job

                    <span>
                      →
                    </span>

                  </button>

                </div>

              </form>

            </div>


            {/* ================= SIDEBAR ================= */}

            <aside className="post-job-sidebar">

              {/* HOW IT WORKS */}

              <div className="help-card">

                <div className="help-icon">
                  💡
                </div>

                <h3>
                  How it works
                </h3>


                {/* STEP 1 */}

                <div className="help-step">

                  <span>
                    1
                  </span>

                  <div>

                    <strong>
                      Post your job
                    </strong>

                    <p>
                      Tell us what service you need.
                    </p>

                  </div>

                </div>


                {/* STEP 2 */}

                <div className="help-step">

                  <span>
                    2
                  </span>

                  <div>

                    <strong>
                      Get responses
                    </strong>

                    <p>
                      Local professionals can respond.
                    </p>

                  </div>

                </div>


                {/* STEP 3 */}

                <div className="help-step">

                  <span>
                    3
                  </span>

                  <div>

                    <strong>
                      Choose a professional
                    </strong>

                    <p>
                      Compare profiles, ratings and prices.
                    </p>

                  </div>

                </div>


                {/* STEP 4 */}

                <div className="help-step">

                  <span>
                    4
                  </span>

                  <div>

                    <strong>
                      Get the job done
                    </strong>

                    <p>
                      Hire the professional that's right for you.
                    </p>

                  </div>

                </div>

              </div>


              {/* TRUST BOX 1 */}

              <div className="trust-box">

                <div>
                  ✓
                </div>

                <section>

                  <strong>
                    Verified Professionals
                  </strong>

                  <p>
                    Connect with trusted local workers.
                  </p>

                </section>

              </div>


              {/* TRUST BOX 2 */}

              <div className="trust-box">

                <div>
                  🔒
                </div>

                <section>

                  <strong>
                    Your Privacy Matters
                  </strong>

                  <p>
                    Your information is kept secure.
                  </p>

                </section>

              </div>

            </aside>

          </div>

        </section>

      </main>


      <Footer />

    </>
  );
}

export default PostJob;