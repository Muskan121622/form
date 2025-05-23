import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Plus, Trash2 } from 'lucide-react';

type Project = {
  name: string;
  description: string;
};

type ProjectField = keyof Project;

type Page3Props = {
  formId: string;
  onBack: () => void;
};

const Page3: React.FC<Page3Props> = ({ formId, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([{ name: '', description: '' }]);

  const handleChange = (index: number, field: ProjectField, value: string) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value,
    };
    setProjects(updatedProjects);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '' }]);
  };

  const removeProject = (index: number) => {
    const updated = [...projects];
    updated.splice(index, 1);
    setProjects(updated);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('https://form-3-tlgr.onrender.com/api/form/page3', {
        userFormId: formId,
        projects,
      });
      alert('All data saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save projects');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">Project Details</h2>

      {projects.map((project, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-3 border">
          <input
            className="w-full p-2 border rounded-md"
            value={project.name}
            onChange={(e) => handleChange(idx, 'name', e.target.value)}
            placeholder="Project Name"
            required
          />
          <textarea
            className="w-full p-2 border rounded-md"
            value={project.description}
            onChange={(e) => handleChange(idx, 'description', e.target.value)}
            placeholder="Project Description"
            required
          />
          <div className="flex justify-end">
            <button
              onClick={() => removeProject(idx)}
              disabled={projects.length === 1}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <Trash2 size={16} /> Remove
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <span className="text-gray-500">Page <strong>3</strong> of 3</span>

        <div className="flex gap-2">
          <button
            onClick={addProject}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
          >
            <Plus size={18} /> Add Project
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            Submit All <CheckCircle size={18} />
          </button>
        </div>
      </div>

      <div className="text-center pt-2 text-gray-500">
        &lt; 1 | 2 | <span className="text-blue-600 font-semibold">3</span> &gt;
      </div>
    </div>
  );
};

export default Page3;
