import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData, Education } from "./types/resume";
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
          personalInfo: data.personalInfo || { name: "", email: "", linkedin: "", github: "", website: "", summary: "" },
          // workExperience: data.workExperience || [],
          education: data.education || [],
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

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value,
      };
      return {
        ...prev,
        education: newEducation,
      };
    });
  };

  const addEducation = () => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newEducation: Education = {
        id: `edu-${Date.now()}`,
        school: "",
        location: "",
        date: "",
        degree: "",
        coursework: "",
      };
      return {
        ...prev,
        education: [...prev.education, newEducation],
      };
    });
  };

  const removeEducation = (index: number) => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newEducation = prev.education.filter((_, i) => i !== index);
      return {
        ...prev,
        education: newEducation,
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
                  <label htmlFor="linkedin" className="form-label">
                    LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={resumeData.personalInfo.linkedin}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="github" className="form-label">
                    GitHub
                  </label>
                  <input
                    id="github"
                    type="url"
                    name="github"
                    placeholder="https://github.com/yourusername"
                    value={resumeData.personalInfo.github}
                    onChange={handlePersonalInfoChange}
                    className="form-input"
                  />
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

            {/* Education Section */}
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Education</h2>
                <button type="button" onClick={addEducation} className="btn btn-primary btn-sm">
                  Add Education
                </button>
              </div>
              <div className="form-section-content">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="form-group-container">
                    <div className="form-group-header">
                      <h3 className="form-group-title">Education {index + 1}</h3>
                      <button type="button" onClick={() => removeEducation(index)} className="btn btn-danger btn-sm">
                        Remove
                      </button>
                    </div>
                    <div className="form-group-grid">
                      <div className="form-group">
                        <label htmlFor={`school-${index}`} className="form-label">
                          School/Institution
                        </label>
                        <input
                          id={`school-${index}`}
                          type="text"
                          placeholder="University/College name"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`location-${index}`} className="form-label">
                          Location
                        </label>
                        <input
                          id={`location-${index}`}
                          type="text"
                          placeholder="City, State"
                          value={edu.location}
                          onChange={(e) => handleEducationChange(index, "location", e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`date-${index}`} className="form-label">
                          Date
                        </label>
                        <input
                          id={`date-${index}`}
                          type="text"
                          placeholder="Aug 2020 - May 2024"
                          value={edu.date}
                          onChange={(e) => handleEducationChange(index, "date", e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`degree-${index}`} className="form-label">
                          Degree
                        </label>
                        <input
                          id={`degree-${index}`}
                          type="text"
                          placeholder="Bachelor of Science in Computer Science"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group form-group-full">
                        <label htmlFor={`coursework-${index}`} className="form-label">
                          Relevant Coursework
                        </label>
                        <textarea
                          id={`coursework-${index}`}
                          placeholder="List relevant courses, separated by commas"
                          value={edu.coursework}
                          onChange={(e) => handleEducationChange(index, "coursework", e.target.value)}
                          className="form-textarea"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {resumeData.education.length === 0 && (
                  <div className="empty-state">
                    <p className="text-muted-foreground">No education entries yet. Click "Add Education" to get started.</p>
                  </div>
                )}
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
