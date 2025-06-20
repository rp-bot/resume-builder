import React from "react";
import { Education } from "../../types";

interface EducationFormProps {
  education: Education[];
  onChange: (newEducation: Education[]) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ education, onChange }) => {
  const handleEducationChange = (index: number, field: keyof Omit<Education, "id">, value: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    onChange(updatedEducation);
  };

  const addEducation = () => {
    const newEducationItem: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      dates: "",
      details: "",
    };
    onChange([...education, newEducationItem]);
  };

  const removeEducation = (id: string) => {
    onChange(education.filter((edu) => edu.id !== id));
  };

  return (
    <div className="form-section">
      <h2>Education</h2>
      {education.map((edu, index) => (
        <div key={edu.id} className="form-subsection">
          <input
            type="text"
            name="institution"
            placeholder="Institution / University"
            value={edu.institution}
            onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
          />
          <input
            type="text"
            name="degree"
            placeholder="Degree / Certificate"
            value={edu.degree}
            onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
          />
          <input
            type="text"
            name="dates"
            placeholder="Dates (e.g., Aug 2016 - May 2020)"
            value={edu.dates}
            onChange={(e) => handleEducationChange(index, "dates", e.target.value)}
          />
          <textarea
            name="details"
            placeholder="Details (e.g., GPA, Honors, relevant coursework)"
            value={edu.details}
            onChange={(e) => handleEducationChange(index, "details", e.target.value)}
          />
          <button type="button" onClick={() => removeEducation(edu.id)}>
            Remove Education
          </button>
        </div>
      ))}
      <button type="button" onClick={addEducation}>
        Add Education
      </button>
    </div>
  );
};

export default EducationForm;
