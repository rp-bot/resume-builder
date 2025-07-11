// src/components/ActionsPanel.tsx

import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import { ResumeData } from "../types/resume";
import { Save, FolderOpen, FileDown, Upload, FileType, Printer } from "lucide-react";

type ActionsPanelProps = {
  resumeData: ResumeData | null;
  onDataLoad: (data: ResumeData) => void;
};

export function ActionsPanel({ resumeData, onDataLoad }: ActionsPanelProps) {
  const handleSaveLatex = async () => {
    if (!resumeData || !resumeData.personalInfo) {
      alert("Personal info is required to save the LaTeX file.");
      return;
    }

    try {
      const { name, email, linkedin, github, website, summary } = resumeData.personalInfo;
      await invoke("save_populated_latex", {
        personalInfo: { name, email, linkedin, github, website, summary },
        education: resumeData.education || [],
      });
      alert("LaTeX file saved successfully!");
    } catch (error) {
      console.error("Failed to save LaTeX file:", error);
      alert(`Error saving LaTeX file: ${error}`);
    }
  };

  const handleGeneratePdf = async () => {
    if (!resumeData || !resumeData.personalInfo) {
      alert("Personal info is required to generate the PDF.");
      return;
    }

    try {
      const { name, email } = resumeData.personalInfo;
      await invoke("generate_pdf", {
        personalInfo: { name, email },
      });
      alert("PDF generated successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(`Error generating PDF: ${error}`);
    }
  };

  const handleSaveJson = async () => {
    if (!resumeData) {
      alert("No resume data to save.");
      return;
    }

    try {
      await invoke("save_resume_data", { data: JSON.stringify(resumeData, null, 2) });
      alert("Resume data saved successfully!");
    } catch (error) {
      console.error("Failed to save resume data:", error);
      alert(`Error saving resume data: ${error}`);
    }
  };

  const handleLoadJson = async () => {
    try {
      const jsonString = await invoke<string>("load_resume_data");
      const data = JSON.parse(jsonString || "{}");
      const loadedData: ResumeData = {
        personalInfo: data.personalInfo || { name: "", email: "", linkedin: "", github: "", website: "", summary: "" },
        // workExperience: data.workExperience || [],
        education: data.education || [],
        skills: data.skills || [],
      };
      onDataLoad(loadedData);
      alert("Resume data loaded successfully!");
    } catch (error) {
      console.error("Failed to load resume data:", error);
      alert(`Error loading resume data: ${error}`);
    }
  };

  const handleSaveJsonAs = async () => {
    if (!resumeData) {
      alert("No resume data to save.");
      return;
    }

    try {
      const filePath = await save({
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        defaultPath: "resume.json",
      });

      if (filePath) {
        await invoke("save_resume_to_file", {
          filePath,
          data: JSON.stringify(resumeData, null, 2),
        });
        alert("Resume data saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save resume data:", error);
      alert(`Error saving resume data: ${error}`);
    }
  };

  const handleLoadJsonFrom = async () => {
    try {
      const filePath = await open({
        filters: [
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        multiple: false,
      });

      if (filePath) {
        const jsonString = await invoke<string>("load_resume_from_file", { filePath });
        const data = JSON.parse(jsonString);
        const loadedData: ResumeData = {
          personalInfo: data.personalInfo || { name: "", email: "", linkedin: "", github: "", website: "", summary: "" },
          // workExperience: data.workExperience || [],
          education: data.education || [],
          skills: data.skills || [],
        };
        onDataLoad(loadedData);
        alert("Resume data loaded successfully!");
      }
    } catch (error) {
      console.error("Failed to load resume data:", error);
      alert(`Error loading resume data: ${error}`);
    }
  };

  return (
    <div className="actions-panel">
      <div className="actions-group">
        <button onClick={handleSaveLatex} className="btn btn-primary" title="Save LaTeX File">
          <FileType className="w-4 h-4" />
          Save LaTeX
        </button>
        <button onClick={handleGeneratePdf} className="btn btn-secondary" title="Generate PDF">
          <Printer className="w-4 h-4" />
          Generate PDF
        </button>
      </div>

      <div className="actions-group">
        <button onClick={handleSaveJson} className="btn btn-outline" title="Save Resume Data">
          <Save className="w-4 h-4" />
          Save
        </button>
        <button onClick={handleLoadJson} className="btn btn-outline" title="Load Resume Data">
          <FolderOpen className="w-4 h-4" />
          Load
        </button>
      </div>

      <div className="actions-group">
        <button onClick={handleSaveJsonAs} className="btn btn-outline" title="Save Resume Data As...">
          <FileDown className="w-4 h-4" />
          Save As...
        </button>
        <button onClick={handleLoadJsonFrom} className="btn btn-outline" title="Load Resume Data From...">
          <Upload className="w-4 h-4" />
          Load From...
        </button>
      </div>
    </div>
  );
}
