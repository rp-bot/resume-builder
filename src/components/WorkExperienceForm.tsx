import React from "react";
import { WorkExperience } from "../types/resume";

interface WorkExperienceFormProps {
  workExperience: WorkExperience[];
  onWorkExperienceChange: (index: number, field: keyof WorkExperience, value: string | string[]) => void;
  onAddWorkExperience: () => void;
  onRemoveWorkExperience: (index: number) => void;
  onAddDescriptionItem: (workIndex: number) => void;
  onRemoveDescriptionItem: (workIndex: number, itemIndex: number) => void;
  onDescriptionItemChange: (workIndex: number, itemIndex: number, value: string) => void;
}

export const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  workExperience,
  onWorkExperienceChange,
  onAddWorkExperience,
  onRemoveWorkExperience,
  onAddDescriptionItem,
  onRemoveDescriptionItem,
  onDescriptionItemChange,
}) => {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title">Professional Experience</h2>
        <button type="button" onClick={onAddWorkExperience} className="btn btn-primary btn-sm">
          Add Experience
        </button>
      </div>
      <div className="form-section-content">
        {workExperience.map((exp, index) => (
          <div key={exp.id} className="form-group-container">
            <div className="form-group-header">
              <h3 className="form-group-title">Experience {index + 1}</h3>
              <button type="button" onClick={() => onRemoveWorkExperience(index)} className="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor={`company-${index}`} className="form-label">
                  Company
                </label>
                <input
                  id={`company-${index}`}
                  type="text"
                  placeholder="Company name"
                  value={exp.company}
                  onChange={(e) => onWorkExperienceChange(index, "company", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`role-${index}`} className="form-label">
                  Role/Position
                </label>
                <input
                  id={`role-${index}`}
                  type="text"
                  placeholder="Job title"
                  value={exp.role}
                  onChange={(e) => onWorkExperienceChange(index, "role", e.target.value)}
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
                  value={exp.location}
                  onChange={(e) => onWorkExperienceChange(index, "location", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`dates-${index}`} className="form-label">
                  Dates
                </label>
                <input
                  id={`dates-${index}`}
                  type="text"
                  placeholder="Jan 2023 - Present"
                  value={exp.dates}
                  onChange={(e) => onWorkExperienceChange(index, "dates", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group form-group-full">
                <div className="description-items-header">
                  <label className="form-label">Description Items</label>
                  <button type="button" onClick={() => onAddDescriptionItem(index)} className="btn btn-secondary btn-sm">
                    Add Item
                  </button>
                </div>
                {exp.descriptionItems && exp.descriptionItems.length > 0 ? (
                  exp.descriptionItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="description-item-container">
                      <div className="description-item-input-group">
                        <textarea
                          placeholder="Describe your responsibilities and achievements"
                          value={item}
                          onChange={(e) => onDescriptionItemChange(index, itemIndex, e.target.value)}
                          className="form-textarea"
                          rows={2}
                        />
                        <button type="button" onClick={() => onRemoveDescriptionItem(index, itemIndex)} className="btn btn-danger btn-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p className="text-muted-foreground">No description items yet. Click "Add Item" to get started.</p>
                  </div>
                )}
                <p className="form-help-text">
                  Tip: Use <strong>**bold**</strong> around key achievements or technologies (e.g., **Increased performance by 20%**)
                </p>
              </div>
            </div>
          </div>
        ))}
        {workExperience.length === 0 && (
          <div className="empty-state">
            <p className="text-muted-foreground">No work experience entries yet. Click "Add Experience" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
