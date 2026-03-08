import React, { useCallback, useMemo, useState } from "react";

const COURSES = ["B.Tech", "MBA", "BBA", "BCA", "Diploma", "BA", "B.Sc", "Other"];

// TODO: Replace this with your deployed Google Apps Script Web App URL.
// See detailed setup instructions at the bottom of this file.
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyrLPWt83K5wM7rAw9JJ9HqbrwXjEBY51IHyr6hBi0CppPBxJvVKW1-q3l5lWs6oLlOmw/exec";

const initialFormState = {
  fullName: "",
  email: "",
  mobile: "",
  course: "",
  college: ""
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateMobile(mobile) {
  // Allow only 10 digits, no country code. Adjust if you want to allow +91 etc.
  return /^[0-9]{10}$/.test(mobile.trim());
}

const AdmissionForm = ({ onSubmitted }) => {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastSubmittedAt, setLastSubmittedAt] = useState(0);

  const spamToken = useMemo(() => {
    // Very lightweight spam protection: simple token that must match.
    return "orbit-" + Math.random().toString(36).slice(2);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Mobile: restrict to digits and max 10 chars at input-level
    if (name === "mobile") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: numeric }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(form.email)) newErrors.email = "Please enter a valid email.";

    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!validateMobile(form.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number.";

    if (!form.course) newErrors.course = "Please select a course.";
    if (!form.college.trim()) newErrors.college = "Please enter or select a college.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const now = Date.now();
    if (now - lastSubmittedAt < 30000) {
      setErrorMessage("You recently submitted a request. Please wait a few seconds before trying again.");
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        course: form.course,
        college: form.college.trim(),
        spamToken
      };

      // mode: "no-cors" bypasses the CORS block that Google Apps Script triggers.
      // The response will be "opaque" (body unreadable), but Apps Script still
      // receives and processes the data. No network error = submission succeeded.
      await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(payload)
      });

      // Reaching here means the request went through — treat as success.
      setSuccessMessage("Thank you! Our counselor will contact you shortly.");
      setForm(initialFormState);
      setLastSubmittedAt(now);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Something went wrong while submitting your details. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="lead-form"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100"
    >
      <h2 className="text-xl font-semibold text-primary mb-1">Get Free Admission Guidance</h2>
      <p className="text-sm text-slate-600 mb-4">
        Share your details and our expert counselor will reach out within 24 hours.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="fullName">
            Full Name*
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
            Email Address*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="mobile">
            Mobile Number* (10 digits)
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            value={form.mobile}
            onChange={handleChange}
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter 10-digit mobile number"
          />
          {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="course">
            Course Interested In*
          </label>
          <select
            id="course"
            name="course"
            value={form.course}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a course</option>
            {COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          {errors.course && <p className="mt-1 text-xs text-red-600">{errors.course}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="college">
            College Interested In*
          </label>
          <input
            id="college"
            name="college"
            type="text"
            value={form.college}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter preferred college or city"
          />
          {errors.college && <p className="mt-1 text-xs text-red-600">{errors.college}</p>}
        </div>

        {/* Hidden spam field – bots that fill everything may trip this */}
        <input
          type="text"
          name="website"
          className="hidden"
          autoComplete="off"
          tabIndex={-1}
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? "Submitting..." : "Get Admission Guidance"}
        </button>

        {successMessage && (
          <p className="mt-2 text-sm font-medium text-emerald-600">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="mt-2 text-sm font-medium text-red-600">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

const SectionWrapper = ({ id, children, className = "" }) => (
  <section id={id} className={`py-16 md:py-20 ${className}`}>
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const App = () => {
  const scrollToForm = useCallback(() => {
    const el = document.getElementById("lead-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <span className="text-lg font-bold">AO</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-primary">
              AdmissionOrbit
            </span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#home" className="hover:text-primary">
              Home
            </a>
            <a href="#courses" className="hover:text-primary">
              Courses
            </a>
            <a href="#how-it-works" className="hover:text-primary">
              How It Works
            </a>
            <a href="#testimonials" className="hover:text-primary">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-primary">
              FAQ
            </a>
            <a href="#contact" className="hover:text-primary">
              Contact
            </a>
          </nav>
          <button
            onClick={scrollToForm}
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md shadow-accent/30 transition hover:bg-accent/90 md:inline-flex"
          >
            Get Free Guidance
          </button>
        </div>
      </header>

      {/* Hero */}
      <SectionWrapper id="home" className="pt-10 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/10">
              100% Free Admission Guidance Across India
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Your Future <span className="text-primary">Revolves Here.</span>
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Get expert admission guidance for top colleges and courses across India. From
              counseling to application support, AdmissionOrbit is with you at every step.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  ✓
                </span>
                Personalised counseling from experienced advisors
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  ✓
                </span>
                Guidance for engineering, management, IT, arts, science & more
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                  ✓
                </span>
                Zero charges for students – completely free support
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={scrollToForm}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Get Free Guidance
              </button>
              <button
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                See how it works
              </button>
            </div>
          </div>
          <div className="md:justify-self-end">
            <AdmissionForm onSubmitted={scrollToForm} />
          </div>
        </div>
      </SectionWrapper>

      {/* Why Choose AdmissionOrbit */}
      <SectionWrapper id="why-choose">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Why Choose <span className="text-primary">AdmissionOrbit</span>?
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            A trusted partner for thousands of students planning their higher education journey.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Verified Colleges",
              description: "Work only with vetted and recognised institutions across India.",
              icon: "🏛️"
            },
            {
              title: "Personalized Counseling",
              description: "One-on-one guidance based on your interests, score and budget.",
              icon: "👨‍🏫"
            },
            {
              title: "Fast Application Support",
              description: "End-to-end application assistance so you never miss a deadline.",
              icon: "⚡"
            },
            {
              title: "100% Free Guidance",
              description: "No hidden fees. Our counseling support is completely free for students.",
              icon: "✅"
            }
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-lg">
                <span>{item.icon}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Popular Courses */}
      <SectionWrapper id="courses" className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Popular Courses</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Explore top streams students commonly choose and get guidance tailored to each.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["B.Tech", "MBA", "BBA", "BCA", "Diploma", "Arts", "Science", "Other Programs"].map(
            (course) => (
              <button
                key={course}
                onClick={scrollToForm}
                className="group flex flex-col items-start rounded-2xl bg-slate-50 p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
              >
                <span className="mb-1 inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Popular
                </span>
                <span className="text-sm font-semibold text-slate-900">{course}</span>
                <span className="mt-1 text-xs text-slate-600">
                  Click to get counseling for {course.toLowerCase()} admissions.
                </span>
                <span className="mt-2 text-xs font-semibold text-primary group-hover:translate-x-0.5 flex items-center gap-1">
                  Talk to a counselor
                  <span>↗</span>
                </span>
              </button>
            )
          )}
        </div>
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper id="how-it-works">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How It Works</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            A simple and transparent process designed to make your admission journey stress-free.
          </p>
        </div>
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            {
              title: "Submit Your Details",
              description: "Fill the short form with your preferred course and college.",
              step: 1
            },
            {
              title: "Get Expert Counseling",
              description: "Our counselor connects with you to understand your profile and goals.",
              step: 2
            },
            {
              title: "Shortlist Colleges",
              description:
                "We share a curated list of best-fit colleges along with eligibility & fee details.",
              step: 3
            },
            {
              title: "Secure Your Admission",
              description:
                "Get guidance on applications, documentation and important admission timelines.",
              step: 4
            }
          ].map((item) => (
            <li
              key={item.step}
              className="relative flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </li>
          ))}
        </ol>
      </SectionWrapper>

      {/* Testimonials */}
      <SectionWrapper id="testimonials" className="bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Student Stories</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Students from across India trust AdmissionOrbit with their career decisions.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Akash Verma",
              course: "B.Tech (Computer Science)",
              quote:
                "AdmissionOrbit helped me understand my options after JEE. I secured admission in a great college that fits my budget.",
              location: "Pune"
            },
            {
              name: "Sneha Nair",
              course: "MBA (Marketing)",
              quote:
                "The counseling was very clear and practical. They guided me from shortlisting colleges to final admission.",
              location: "Bengaluru"
            },
            {
              name: "Rohan Shah",
              course: "BBA",
              quote:
                "I was confused about which stream to choose. The AdmissionOrbit team patiently answered all my questions.",
              location: "Ahmedabad"
            }
          ].map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col justify-between rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-100"
            >
              <blockquote className="text-sm text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-600">{t.course}</p>
                <p className="text-xs text-slate-500">{t.location}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <FAQSection />

      {/* Contact + Footer */}
      <Footer />
    </div>
  );
};

const faqs = [
  {
    question: "Is AdmissionOrbit counseling really free?",
    answer:
      "Yes. Our admission guidance and counseling support are 100% free for students. There are no hidden charges."
  },
  {
    question: "Which courses and colleges do you help with?",
    answer:
      "We support guidance for engineering, management, IT, commerce, arts, science and diploma programs across a wide network of verified colleges in India."
  },
  {
    question: "How soon will I get a call after submitting the form?",
    answer:
      "Our counselors typically reach out within 24 business hours. During peak admission season, it may take slightly longer."
  },
  {
    question: "Will you help with documentation and application forms?",
    answer:
      "Yes. We help you understand required documents, timelines, application forms and other admission formalities."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <SectionWrapper id="faq">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Have more questions? Submit the form and our counselors will be happy to help you.
          </p>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.question} className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900">{faq.question}</span>
                    <span className="ml-3 text-lg text-slate-500">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div id="contact" className="rounded-2xl bg-primary text-slate-50 p-6 shadow-lg">
          <h3 className="text-xl font-semibold">Need quick help?</h3>
          <p className="mt-2 text-sm text-slate-100/90">
            Share your questions related to courses, colleges or fees and we will connect you with
            an expert counselor.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <span className="font-semibold">Email:</span> support@admissionorbit.com
            </li>
            <li>
              <span className="font-semibold">Phone:</span> +91-90000-00000
            </li>
          </ul>
          <button
            onClick={() =>
              document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-5 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md shadow-accent/30 transition hover:bg-accent/90"
          >
            Get Free Admission Call
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">AdmissionOrbit</p>
            <p className="mt-1 text-xs text-slate-600">
              Your trusted partner for admission guidance to top colleges across India.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <a href="#privacy" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-primary">
              Terms &amp; Conditions
            </a>
            <div className="flex items-center gap-3 text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wide">Follow</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[13px]">
                  in
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[13px]">
                  f
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[13px]">
                  X
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-[11px] text-slate-500">
          © {new Date().getFullYear()} AdmissionOrbit. All rights reserved.
        </p>
      </div>

      {/*
        ========================= GOOGLE SHEETS + APPS SCRIPT SETUP =========================

        1) CREATE THE GOOGLE SHEET
        -------------------------------------------------------------------------------------
        - Go to https://sheets.google.com and create a new Google Sheet.
        - Rename it to "AdmissionOrbit Leads" (or any name you like).
        - In row 1, create the following column headers exactly in this order:
            A: Timestamp
            B: Full Name
            C: Email
            D: Mobile
            E: Course Interested
            F: College Interested
            G: Spam Token (optional, for simple spam checking)

        2) OPEN APPS SCRIPT FROM THE SHEET
        -------------------------------------------------------------------------------------
        - In the Google Sheet menu, click: Extensions → Apps Script.
        - This opens the Apps Script editor in a new tab.
        - Delete any default code in Code.gs and paste the script below.

        3) PASTE THIS GOOGLE APPS SCRIPT BACKEND CODE
        -------------------------------------------------------------------------------------

        function doPost(e) {
          try {
            // The frontend sends application/x-www-form-urlencoded (URLSearchParams).
            // Read fields from e.parameter — NOT JSON.parse(e.postData.contents).
            // This keeps the browser request "simple" (no CORS preflight).

            var params = e.parameter;

            // Basic spam / token check
            if (!params || !params.spamToken) {
              return ContentService
                .createTextOutput(JSON.stringify({ status: "error", message: "Invalid request" }))
                .setMimeType(ContentService.MimeType.JSON);
            }

            var fullName = (params.fullName || "").trim();
            var email    = (params.email    || "").trim();
            var mobile   = (params.mobile   || "").trim();
            var course   = (params.course   || "").trim();
            var college  = (params.college  || "").trim();

            if (!fullName || !email || !mobile || !course || !college) {
              return ContentService
                .createTextOutput(JSON.stringify({ status: "error", message: "Missing fields" }))
                .setMimeType(ContentService.MimeType.JSON);
            }

            var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
            sheet.appendRow([
              new Date(),
              fullName,
              email,
              mobile,
              course,
              college,
              params.spamToken
            ]);

            return ContentService
              .createTextOutput(JSON.stringify({ status: "success" }))
              .setMimeType(ContentService.MimeType.JSON);
          } catch (error) {
            return ContentService
              .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }

        function doOptions(e) {
          return ContentService.createTextOutput("")
            .setMimeType(ContentService.MimeType.TEXT);
        }

        4) DEPLOY AS A WEB APP
        -------------------------------------------------------------------------------------
        - In the Apps Script editor, click: Deploy → New deployment.
        - Choose "Web app".
        - Set "Execute as" to: Me
        - Set "Who has access" to: Anyone with the link (or "Anyone" if your account requires it).
        - Click "Deploy" and authorise the script if prompted.
        - After deployment, you will get a Web App URL (something like):
              https://script.google.com/macros/s/XXXXXXX/exec

        5) CONNECT THE FRONTEND TO THE WEB APP
        -------------------------------------------------------------------------------------
        - Copy the Web App URL.
        - In this React project, open src/App.jsx.
        - Find the constant: GOOGLE_APPS_SCRIPT_WEB_APP_URL.
        - Replace the placeholder string with your actual Web App URL, e.g.:

              const GOOGLE_APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/XXXXXXX/exec";

        - Save and redeploy your React app (e.g., to Vercel or Netlify).

        6) TEST THE INTEGRATION
        -------------------------------------------------------------------------------------
        - Open your deployed AdmissionOrbit website.
        - Fill in the form with test details and submit.
        - Check your Google Sheet – a new row should appear with:
            Timestamp, Full Name, Email, Mobile, Course Interested, College Interested, Spam Token

        7) DEPLOYMENT NOTES (VERCEL / NETLIFY)
        -------------------------------------------------------------------------------------
        - Build command:  npm run build
        - Output directory: dist
        - Ensure "GOOGLE_APPS_SCRIPT_WEB_APP_URL" in the frontend points to your live Apps Script URL.

      */}
    </footer>
  );
};

export default App;

