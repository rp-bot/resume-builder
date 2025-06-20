import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "./types";
import PersonalInfoForm from "./components/forms/PersonalInfoForm";
import WorkExperienceForm from "./components/forms/WorkExperienceForm";
import EducationForm from "./components/forms/EducationForm";
import SkillsForm from "./components/forms/SkillsForm";
import LivePreview from "./components/LivePreview";
import { savePdfToFile } from "./utils/fileSaver";
import VersionManager from "./components/VersionManager";
import "./App.css";

function App() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      website: "",
      summary: "",
    },
    workExperience: [],
    education: [],
    skills: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const pdfBytes = await invoke<number[]>("generate_pdf", {
        resumeDataJson: JSON.stringify(resumeData),
      });
      savePdfToFile(new Uint8Array(pdfBytes), `${resumeData.personalInfo.name.replace(/\s/g, "_")}_Resume.pdf`);
    } catch (e) {
      setError(e as string);
      console.error("Failed to generate PDF:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Resume Builder</h1>
        <p>Craft your professional resume with ease.</p>
        <div className="actions">
          <button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Download PDF"}
          </button>
          {error && <p className="error-message">Error: {error}</p>}
        </div>
      </header>
      <div className="editor-layout">
        <div className="resume-form">
          <VersionManager currentResumeData={resumeData} onLoadVersion={setResumeData} />
          <PersonalInfoForm personalInfo={resumeData.personalInfo} onChange={(newInfo) => setResumeData({ ...resumeData, personalInfo: newInfo })} />
          <WorkExperienceForm
            workExperience={resumeData.workExperience}
            onChange={(newExperience) => setResumeData({ ...resumeData, workExperience: newExperience })}
          />
          <EducationForm education={resumeData.education} onChange={(newEducation) => setResumeData({ ...resumeData, education: newEducation })} />
          <SkillsForm skills={resumeData.skills} onChange={(newSkills) => setResumeData({ ...resumeData, skills: newSkills })} />
        </div>
        <LivePreview resumeData={resumeData} />
      </div>
    </main>
  );
}

export default App;
