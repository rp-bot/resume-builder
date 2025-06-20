export interface PersonalInformation
{
    name: string;
    email: string;
    phone: string;
    website: string;
    summary: string;
}

export interface WorkExperience
{
    id: string;
    company: string;
    role: string;
    dates: string;
    description: string;
}

export interface Education
{
    id: string;
    institution: string;
    degree: string;
    dates: string;
    details: string;
}

export interface Skill
{
    id: string;
    name: string;
}

export interface ResumeData
{
    personalInfo: PersonalInformation;
    workExperience: WorkExperience[];
    education: Education[];
    skills: Skill[];
} 