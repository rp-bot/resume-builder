import React, { useEffect, useRef } from 'react';
import { ResumeData } from '../types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LivePreviewProps {
  resumeData: ResumeData;
}

const generateLatexString = (data: ResumeData): string => {
  const { personalInfo, workExperience, education, skills } = data;

  const personalSection = `
\\documentclass{article}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{enumitem}
\\begin{document}
\\begin{center}
  {\\Huge ${personalInfo.name || 'Your Name'}} \\\\
  \\vspace{1mm}
  ${personalInfo.email || 'your.email@example.com'} | ${personalInfo.phone || '123-456-7890'} | ${personalInfo.website || 'your.website.com'}
\\end{center}
\\section*{Summary}
${personalInfo.summary || 'A brief professional summary...'}
`;

  const experienceSection = workExperience.length > 0 ? `
\\section*{Work Experience}
\\begin{itemize}[leftmargin=*]
  ${workExperience.map(exp => `
    \\item \\textbf{${exp.role || 'Role'}} at \\textbf{${exp.company || 'Company'}} \\hfill ${exp.dates || 'Date Range'}
    \\begin{itemize}
        \\item ${exp.description.replace(/\n/g, '\\\\ \\item ')}
    \\end{itemize}
  `).join('')}
\\end{itemize}
` : '';

  const educationSection = education.length > 0 ? `
\\section*{Education}
\\begin{itemize}[leftmargin=*]
  ${education.map(edu => `
    \\item \\textbf{${edu.degree || 'Degree'}} at \\textbf{${edu.institution || 'Institution'}} \\hfill ${edu.dates || 'Date Range'}
    \\begin{itemize}
        \\item ${edu.details.replace(/\n/g, '\\\\ \\item ')}
    \\end{itemize}
  `).join('')}
\\end{itemize}
` : '';

  const skillsSection = skills.length > 0 ? `
\\section*{Skills}
${skills.map(skill => `\\texttt{${skill.name}}`).join(', ')}
` : '';

  const closing = `
\\end{document}
`;

  return personalSection + experienceSection + educationSection + skillsSection + closing;
};

const LivePreview: React.FC<LivePreviewProps> = ({ resumeData }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      try {
        const latexString = generateLatexString(resumeData);
        katex.render(latexString, previewRef.current, {
          throwOnError: false,
          displayMode: true,
          macros: {
            "\\item": "\\item ", // handle items properly
          }
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
        if (previewRef.current) {
          previewRef.current.innerText = 'Error rendering LaTeX preview.';
        }
      }
    }
  }, [resumeData]);

  return (
    <div className="live-preview-section">
      <h2>Live Preview</h2>
      <div ref={previewRef} className="preview-content"></div>
    </div>
  );
};

export default LivePreview; 