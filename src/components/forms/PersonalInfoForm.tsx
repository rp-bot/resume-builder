import React from "react";
import { PersonalInformation } from "../../types";

interface PersonalInfoFormProps {
  personalInfo: PersonalInformation;
  onChange: (newInfo: PersonalInformation) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ personalInfo, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({
      ...personalInfo,
      [name]: value,
    });
  };

  return (
    <div className="form-section">
      <h2>Personal Information</h2>
      <input type="text" name="name" placeholder="Full Name" value={personalInfo.name} onChange={handleChange} />
      <input type="email" name="email" placeholder="Email Address" value={personalInfo.email} onChange={handleChange} />
      <input type="tel" name="phone" placeholder="Phone Number" value={personalInfo.phone} onChange={handleChange} />
      <input type="url" name="website" placeholder="Website/Portfolio/GitHub" value={personalInfo.website} onChange={handleChange} />
      <textarea name="summary" placeholder="Professional Summary" value={personalInfo.summary} onChange={handleChange} />
    </div>
  );
};

export default PersonalInfoForm;
