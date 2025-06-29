// src/components/EducationSection.tsx
import { ResumeData, Education } from "../types/resume";
import { EducationItem } from "./EducationItem";

type EducationSectionProps = {
  education: Education[];
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData | null>>;
};

export function EducationSection({ education, setResumeData }: EducationSectionProps) {

  // Logic to ADD a new item
  const handleAddItem = () => {
    const newItem: Education = {
      id: crypto.randomUUID(), // Generate a unique ID for the new item
      institution: "",
      degree: "",
      dates: "",
      details: "",
    };
    setResumeData(prevData => prevData ? ({
      ...prevData,
      education: [...prevData.education, newItem],
    }) : null);
  };

  // Logic to REMOVE an item
  const handleRemoveItem = (idToRemove: string) => {
    setResumeData(prevData => prevData ? ({
      ...prevData,
      education: prevData.education.filter(item => item.id !== idToRemove),
    }) : null);
  };

  // Logic to UPDATE an item
  const handleChangeItem = (idToUpdate: string, updatedItem: Education) => {
    setResumeData(prevData => prevData ? ({
      ...prevData,
      education: prevData.education.map(item =>
        item.id === idToUpdate ? updatedItem : item
      ),
    }) : null);
  };

  return (
    <section>
      <h2>Education</h2>
      {education.map(edu => (
        <EducationItem
          key={edu.id}
          item={edu}
          onChange={handleChangeItem}
          onRemove={handleRemoveItem}
        />
      ))}
      <button onClick={handleAddItem} className="add-button">
        + Add Education
      </button>
    </section>
  );
}