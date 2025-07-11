import React from "react";
import { PersonalInformation } from "../types/resume";

interface PersonalInfoFormProps {
  personalInfo: PersonalInformation;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ personalInfo, onChange }) => {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title">Personal Information</h2>
      </div>
      <div className="form-section-content">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input id="name" type="text" name="name" placeholder="Enter your full name" value={personalInfo.name} onChange={onChange} className="form-input" />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={personalInfo.email}
            onChange={onChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkedin" className="form-label">
            LinkedIn
          </label>
          <input
            id="linkedin"
            type="url"
            name="linkedin"
            placeholder="https://linkedin.com/in/yourprofile"
            value={personalInfo.linkedin}
            onChange={onChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="github" className="form-label">
            GitHub
          </label>
          <input
            id="github"
            type="url"
            name="github"
            placeholder="https://github.com/yourusername"
            value={personalInfo.github}
            onChange={onChange}
            className="form-input"
          />
          <label htmlFor="website" className="form-label">
            Website/Portfolio
          </label>
          <input
            id="website"
            type="url"
            name="website"
            placeholder="https://yourportfolio.com"
            value={personalInfo.website}
            onChange={onChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="summary" className="form-label">
            Professional Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            placeholder="Brief professional summary..."
            value={personalInfo.summary}
            onChange={onChange}
            className="form-textarea"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
