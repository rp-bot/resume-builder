import React from "react";
import { WorkExperience } from "../../types";

interface WorkExperienceFormProps {
  workExperience: WorkExperience[];
  onChange: (newWorkExperience: WorkExperience[]) => void;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({ workExperience, onChange }) => {
  const handleExperienceChange = (index: number, field: keyof Omit<WorkExperience, "id">, value: string) => {
    const updatedExperience = [...workExperience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    onChange(updatedExperience);
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      company: "",
      role: "",
      dates: "",
      description: "",
    };
    onChange([...workExperience, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(workExperience.filter((exp) => exp.id !== id));
  };

  return (
    <div className="form-section">
      <h2>Work Experience</h2>
      {workExperience.map((exp, index) => (
        <div key={exp.id} className="form-subsection">
          <input type="text" name="role" placeholder="Role / Title" value={exp.role} onChange={(e) => handleExperienceChange(index, "role", e.target.value)} />
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={exp.company}
            onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
          />
          <input
            type="text"
            name="dates"
            placeholder="Dates (e.g., Jan 2020 - Present)"
            value={exp.dates}
            onChange={(e) => handleExperienceChange(index, "dates", e.target.value)}
          />
          <textarea
            name="description"
            placeholder="Key responsibilities and achievements"
            value={exp.description}
            onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
          />
          <button type="button" onClick={() => removeExperience(exp.id)}>
            Remove Experience
          </button>
        </div>
      ))}
      <button type="button" onClick={addExperience}>
        Add Experience
      </button>
    </div>
  );
};

export default WorkExperienceForm;
