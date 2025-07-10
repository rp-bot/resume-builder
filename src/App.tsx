import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "./types/resume";
import { ActionsPanel } from "./components/ActionsPanel";
import { LivePreview } from "./components/LivePreview";
import "./App.css";

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    invoke<string>("load_resume_data")
      .then((jsonString) => {
        const data = JSON.parse(jsonString || "{}");
        setResumeData({
          personalInfo: data.personalInfo || { name: "", email: "", phone: "", website: "", summary: "" },
          // workExperience: data.workExperience || [],
          // education: data.education || [],
          // skills: data.skills || [],
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (resumeData) {
      const timer = setTimeout(() => {
        invoke("save_resume_data", { data: JSON.stringify(resumeData) }).catch(console.error);
      }, 1000); // Debounce save

      return () => clearTimeout(timer);
    }
  }, [resumeData]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [name]: value,
        },
      };
    });
  };

  const handleDataLoad = (data: ResumeData) => {
    setResumeData(data);
  };

  if (!resumeData) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Application Header with Toolbar */}
      <header className="app-header">
        <div className="app-toolbar">
          <div className="app-title">Resume Builder</div>
          <div className="flex-1" />
          <ActionsPanel resumeData={resumeData} onDataLoad={handleDataLoad} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        <div className="editor-layout">
          {/* Form Section */}
          <div className="form-container">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Personal Information</h2>
              </div>
              <div className="form-section-content">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={resumeData.personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={resumeData.personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={resumeData.personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website" className="form-label">
                    Website/Portfolio
                  </label>
                  <input
                    id="website"
                    type="url"
                    name="website"
                    placeholder="https://yourportfolio.com"
                    value={resumeData.personalInfo.website}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="summary" className="form-label">
                    Professional Summary
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    placeholder="Brief professional summary..."
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange(e as any)}
                    className="form-textarea"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <LivePreview resumeData={resumeData} />
        </div>
      </main>
    </div>
  );
}

export default App;
