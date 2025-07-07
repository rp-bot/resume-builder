// src/components/ActionsPanel.tsx

import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "../types/resume";

type ActionsPanelProps = {
  resumeData: ResumeData | null;
};

export function ActionsPanel({ resumeData }: ActionsPanelProps) {
  const handleGenerateLatex = async () => {
    if (!resumeData) {
      alert("No resume data available to generate LaTeX.");
      return;
    }

    try {
      // Call the Rust command to save the LaTeX file
      await invoke("save_latex_file", {
        resumeDataJson: JSON.stringify(resumeData),
      });
      alert("LaTeX file saved successfully!");
    } catch (error) {
      console.error("Failed to generate or save LaTeX:", error);
      alert(`Error generating LaTeX: ${error}`);
    }
  };

  const handleGeneratePdf = async () => {
    if (!resumeData) {
      alert("No resume data available to generate PDF.");
      return;
    }

    try {
      await invoke("generate_pdf", {
        resumeDataJson: JSON.stringify(resumeData),
      });
      alert("PDF generated and save dialog opened!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(`Error generating PDF: ${error}`);
    }
  };

  return (
    <div className="actions-panel">
      <button onClick={handleGenerateLatex} className="action-button">
        Save as LaTeX
      </button>
      <button onClick={handleGeneratePdf} className="action-button">
        Save as PDF
      </button>
    </div>
  );
}
