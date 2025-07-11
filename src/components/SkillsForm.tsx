import React from "react";
import { SkillCategory } from "../types/resume";

interface SkillsFormProps {
  skills: SkillCategory[];
  onSkillsChange: (index: number, field: keyof SkillCategory, value: string) => void;
  onAddSkillCategory: () => void;
  onRemoveSkillCategory: (index: number) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onSkillsChange, onAddSkillCategory, onRemoveSkillCategory }) => {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <h2 className="form-section-title">Technical Skills</h2>
        <button type="button" onClick={onAddSkillCategory} className="btn btn-primary btn-sm">
          Add Category
        </button>
      </div>
      <div className="form-section-content">
        {skills.map((skillCategory, index) => (
          <div key={skillCategory.id} className="form-group-container">
            <div className="form-group-header">
              <h3 className="form-group-title">Category {index + 1}</h3>
              <button type="button" onClick={() => onRemoveSkillCategory(index)} className="btn btn-danger btn-sm">
                Remove
              </button>
            </div>
            <div className="form-group-grid">
              <div className="form-group">
                <label htmlFor={`category-name-${index}`} className="form-label">
                  Category Name
                </label>
                <input
                  id={`category-name-${index}`}
                  type="text"
                  placeholder="e.g., Programming Languages"
                  value={skillCategory.name}
                  onChange={(e) => onSkillsChange(index, "name", e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor={`skills-${index}`} className="form-label">
                  Skills
                </label>
                <textarea
                  id={`skills-${index}`}
                  placeholder="List skills separated by commas (e.g., Python, JavaScript, TypeScript)"
                  value={skillCategory.skills}
                  onChange={(e) => onSkillsChange(index, "skills", e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
                <p className="form-help-text">
                  Tip: Use <strong>**bold**</strong> around skills you want to emphasize (e.g., **Python**, JavaScript, **TypeScript**)
                </p>
              </div>
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="empty-state">
            <p className="text-muted-foreground">No skill categories yet. Click "Add Category" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
