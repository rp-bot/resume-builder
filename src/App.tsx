// src/App.tsx (updated)

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ResumeData } from './types/resume';
import { EducationSection } from './components/EducationSection';
import { ActionsPanel } from './components/ActionsPanel'; // Import the new component

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    // ... same as before
    invoke<string>('load_resume_data')
      .then(jsonString => {
        const data = JSON.parse(jsonString || '{}');
        setResumeData({
          personalInfo: data.personalInfo || { name: '', email: '', phone: '', website: '', summary: '' },
          workExperience: data.workExperience || [],
          education: data.education || [],
          skills: data.skills || [],
        });
      })
      .catch(console.error);
  }, []);

  if (!resumeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <header>
        <h1>Resume Builder</h1>
        {/* --- Integration Point for Actions --- */}
        <ActionsPanel resumeData={resumeData} />
      </header>
      
      <main>
        {/* Your form sections go here */}
        <EducationSection
          education={resumeData.education}
          setResumeData={setResumeData}
        />
        {/* ...other sections... */}
      </main>
    </div>
  );
}

export default App;