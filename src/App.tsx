// src/App.tsx (initial structure)
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ResumeData } from './types/resume';

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Load data from the backend when the component mounts
  useEffect(() => {
    invoke<string>('load_resume_data')
      .then(jsonString => {
        // Parse the data from the backend, providing a default structure if it's empty
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
      <h1>Resume Builder</h1>
      {/* We will add our form components here */}
    </div>
  );
}

export default App;