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

export interface WorkExperience
{
  id: string; // Use for React's `key` prop
  company: string;
  role: string;
  location: string;
  dates: string;
  descriptionItems: string[]; // Array of description bullet points
}

export interface Education
{
  id: string; // Use for React's `key` prop
  school: string;
  location: string;
  date: string;
  degree: string;
  coursework: string;
}

export interface SkillCategory
{
  id: string; // Use for React's `key` prop
  name: string;
  skills: string;
}

export interface ResumeData
{
  personalInfo: PersonalInformation;
  workExperience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
}