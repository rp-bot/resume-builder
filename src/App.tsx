import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData, Education, SkillCategory } from "./types/resume";
import { ActionsPanel, LivePreview, PersonalInfoForm, EducationForm, SkillsForm } from "./components";
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

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSkillsChange = (index: number, field: keyof SkillCategory, value: string) => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newSkills = [...prev.skills];
      newSkills[index] = {
        ...newSkills[index],
        [field]: value,
      };
      return {
        ...prev,
        skills: newSkills,
      };
    });
  };

  const addSkillCategory = () => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newSkillCategory: SkillCategory = {
        id: `skill-${Date.now()}`,
        name: "",
        skills: "",
      };
      return {
        ...prev,
        skills: [...prev.skills, newSkillCategory],
      };
    });
  };

  const removeSkillCategory = (index: number) => {
    setResumeData((prev) => {
      if (!prev) return null;
      const newSkills = prev.skills.filter((_, i) => i !== index);
      return {
        ...prev,
        skills: newSkills,
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
            <PersonalInfoForm personalInfo={resumeData.personalInfo} onChange={handlePersonalInfoChange} />

            <EducationForm
              education={resumeData.education}
              onEducationChange={handleEducationChange}
              onAddEducation={addEducation}
              onRemoveEducation={removeEducation}
            />

            <SkillsForm
              skills={resumeData.skills}
              onSkillsChange={handleSkillsChange}
              onAddSkillCategory={addSkillCategory}
              onRemoveSkillCategory={removeSkillCategory}
            />
          </div>

          {/* Preview Section */}
          <LivePreview resumeData={resumeData} />
        </div>
      </main>
    </div>
  );
}

export default App;
