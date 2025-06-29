// src/components/EducationItem.tsx
import { Education } from "../types/resume";

type EducationItemProps = {
  item: Education;
  onChange: (id: string, updatedItem: Education) => void;
  onRemove: (id: string) => void;
};

export function EducationItem({ item, onChange, onRemove }: EducationItemProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Tell the parent component about the change
    onChange(item.id, {
      ...item,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="item-card">
      <input
        type="text"
        name="institution"
        placeholder="Institution Name"
        value={item.institution}
        onChange={handleChange}
      />
      <input
        type="text"
        name="degree"
        placeholder="Degree or Certificate"
        value={item.degree}
        onChange={handleChange}
      />
      <input
        type="text"
        name="dates"
        placeholder="Dates (e.g., 2020 - 2024)"
        value={item.dates}
        onChange={handleChange}
      />
      <textarea
        name="details"
        placeholder="Details (e.g., relevant coursework, honors)"
        value={item.details}
        onChange={handleChange}
      />
      <button onClick={() => onRemove(item.id)} className="remove-button">
        Remove
      </button>
    </div>
  );
}