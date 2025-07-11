import React from "react";
import { Education } from "../types/resume";

interface EducationFormProps {
  education: Education[];
  onEducationChange: (index: number, field: keyof Education, value: string) => void;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({ education, onEducationChange, onAddEducation, onRemoveEducation }) => {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title">Education</h2>
        <button type="button" onClick={onAddEducation} className="btn btn-primary btn-sm">
          Add Education
        </button>
      </div>
      <div className="form-section-content">
        {education.map((edu, index) => (
          <div key={edu.id} className="form-group-container">
            <div className="form-group-header">
              <h3 className="form-group-title">Education {index + 1}</h3>
              <button type="button" onClick={() => onRemoveEducation(index)} className="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor={`school-${index}`} className="form-label">
                  School/Institution
                </label>
                <input
                  id={`school-${index}`}
                  type="text"
                  placeholder="University/College name"
                  value={edu.school}
                  onChange={(e) => onEducationChange(index, "school", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`location-${index}`} className="form-label">
                  Location
                </label>
                <input
                  id={`location-${index}`}
                  type="text"
                  placeholder="City, State"
                  value={edu.location}
                  onChange={(e) => onEducationChange(index, "location", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`date-${index}`} className="form-label">
                  Date
                </label>
                <input
                  id={`date-${index}`}
                  type="text"
                  placeholder="Aug 2020 - May 2024"
                  value={edu.date}
                  onChange={(e) => onEducationChange(index, "date", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`degree-${index}`} className="form-label">
                  Degree
                </label>
                <input
                  id={`degree-${index}`}
                  type="text"
                  placeholder="Bachelor of Science in Computer Science"
                  value={edu.degree}
                  onChange={(e) => onEducationChange(index, "degree", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor={`coursework-${index}`} className="form-label">
                  Relevant Coursework
                </label>
                <textarea
                  id={`coursework-${index}`}
                  placeholder="List relevant courses, separated by commas"
                  value={edu.coursework}
                  onChange={(e) => onEducationChange(index, "coursework", e.target.value)}
                  className="form-textarea"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
        {education.length === 0 && (
          <div className="empty-state">
            <p className="text-muted-foreground">No education entries yet. Click "Add Education" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
