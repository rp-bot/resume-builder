import React, { useState } from "react";
import { Skill } from "../../types";

interface SkillsFormProps {
  skills: Skill[];
  onChange: (newSkills: Skill[]) => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ skills, onChange }) => {
  const [currentSkill, setCurrentSkill] = useState("");

  const addSkill = () => {
    if (currentSkill.trim() === "") return;
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: currentSkill.trim(),
    };
    onChange([...skills, newSkill]);
    setCurrentSkill("");
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter((skill) => skill.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="form-section">
      <h2>Skills</h2>
      <div className="skill-input-group">
        <input
          type="text"
          placeholder="Add a skill and press Enter"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="button" onClick={addSkill}>
          Add Skill
        </button>
      </div>
      <div className="skills-list">
        {skills.map((skill) => (
          <div key={skill.id} className="skill-tag">
            {skill.name}
            <button type="button" onClick={() => removeSkill(skill.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;
