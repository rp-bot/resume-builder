import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "../types/resume";

interface LivePreviewProps {
  resumeData: ResumeData;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ resumeData }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cleanup blob URL when component unmounts or pdfUrl changes
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    // Check if PDF exists
    const checkPdf = async () => {
      try {
        const pdfBase64 = await invoke<string>("get_temp_pdf_data");

        // Convert base64 to blob URL
        const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        setPdfUrl(blobUrl);
        setError(null);
      } catch (err) {
        setError("PDF not found. Generate a resume to see the preview.");
      } finally {
        setLoading(false);
      }
    };

    checkPdf();
  }, [resumeData]); // Re-check when resume data changes

  const refreshPreview = async () => {
    if (!resumeData || !resumeData.personalInfo) {
      setError("Personal info is required to generate the preview.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { name, email, linkedin, github, website, summary } = resumeData.personalInfo;

      // First, generate the PDF
      await invoke<string>("refresh_temp_view", {
        personalInfo: { name, email, linkedin, github, website, summary },
        education: resumeData.education || [],
        skills: resumeData.skills || [],
      });

      // Then, get the PDF data as base64
      const pdfBase64 = await invoke<string>("get_temp_pdf_data");

      // Clean up old blob URL if it exists
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Convert base64 to blob URL
      const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      setPdfUrl(blobUrl);
      setLoading(false);
    } catch (error) {
      console.error("Failed to refresh preview:", error);
      setError(`Error generating preview: ${error}`);
      setLoading(false);
    }
  };

  return (
    <div className="preview-section">
      <div className="preview-header flex items-center justify-between">
        <h2 className="form-section-title">Live Preview</h2>
        <button onClick={refreshPreview} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
          Refresh
        </button>
      </div>
      <div className="preview-content">
        <div className="bg-white rounded-md border shadow-sm" style={{ height: "600px" }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-orange-500 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-orange-600 font-medium">{error}</p>
                <p className="text-gray-500 text-sm mt-1">Click "Refresh" to generate your resume.</p>
              </div>
            </div>
          )}

          {pdfUrl && !loading && !error && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              style={{ border: "none", borderRadius: "6px" }}
              title="Resume Preview"
              onLoad={() => setLoading(false)}
              onError={() => {
                setError("Failed to display PDF. Try refreshing the preview.");
                setLoading(false);
              }}
            />
          )}
        </div>

        {pdfUrl && !error && (
          <div className="mt-2 text-center">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm underline">
              Open PDF in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
