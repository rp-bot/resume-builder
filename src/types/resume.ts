// src/types/resume.ts

export interface PersonalInformation
{
  name: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

// export interface WorkExperience {
//   id: string; // Use for React's `key` prop
//   company: string;
//   role: string;
//   dates: string;
//   description: string;
// }

export interface Education
{
  id: string; // Use for React's `key` prop
  school: string;
  location: string;
  date: string;
  degree: string;
  coursework: string;
}

// export interface Skill {
//   id: string; // Use for React's `key` prop
//   name: string;
// }

export interface ResumeData
{
  personalInfo: PersonalInformation;
  // workExperience: WorkExperience[];
  education: Education[];
  // skills: Skill[];
}