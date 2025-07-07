import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "./types/resume";
import { ActionsPanel } from "./components/ActionsPanel";

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    invoke<string>("load_resume_data")
      .then((jsonString) => {
        const data = JSON.parse(jsonString || "{}");
        setResumeData({
          personalInfo: data.personalInfo || { name: "", email: "", phone: "", website: "", summary: "" },
          workExperience: data.workExperience || [],
          education: data.education || [],
          skills: data.skills || [],
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

  if (!resumeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>Resume Builder</h1>
        <ActionsPanel resumeData={resumeData} />
      </header>

      <main>
        <div className="form-section">
          <h2>Personal Information</h2>
          <input type="text" name="name" placeholder="Name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} />
          <input type="email" name="email" placeholder="Email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} />
        </div>
      </main>
    </div>
  );
}

export default App;
