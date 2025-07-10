import React, { useState, useEffect } from "react";
import { ResumeData } from "../types/resume";

interface LivePreviewProps {
  resumeData: ResumeData;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ resumeData }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if PDF exists
    const checkPdf = async () => {
      try {
        const response = await fetch("/src/assets/temp.pdf");
        if (response.ok) {
          setPdfUrl("/src/assets/temp.pdf");
          setError(null);
        } else {
          setError("PDF not found. Generate a resume to see the preview.");
        }
      } catch (err) {
        setError("Failed to load PDF. The resume PDF will appear here once generated.");
      } finally {
        setLoading(false);
      }
    };

    checkPdf();
  }, [resumeData]); // Re-check when resume data changes

  const refreshPreview = () => {
    setLoading(true);
    setError(null);
    // Add timestamp to force reload
    setPdfUrl(`/src/assets/temp.pdf?t=${Date.now()}`);
    setLoading(false);
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
                <p className="text-gray-500 text-sm mt-1">Click "Generate PDF" to create your resume.</p>
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
