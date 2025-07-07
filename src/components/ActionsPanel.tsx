// src/components/ActionsPanel.tsx

import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "../types/resume";

type ActionsPanelProps = {
  resumeData: ResumeData | null;
};

export function ActionsPanel({ resumeData }: ActionsPanelProps) {
  const handleSaveLatex = async () => {
    if (!resumeData || !resumeData.personalInfo) {
      alert("Personal info is required to save the LaTeX file.");
      return;
    }

    try {
      const { name, email } = resumeData.personalInfo;
      await invoke("save_populated_latex", {
        personalInfo: { name, email },
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

  return (
    <div className="actions-panel">
      <button onClick={handleSaveLatex} className="action-button">
        Save as LaTeX
      </button>
      <button onClick={handleGeneratePdf} className="action-button">
        Save as PDF
      </button>
    </div>
  );
}
