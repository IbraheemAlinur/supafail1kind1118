import React, { useState } from 'react';
import { Star, Plus, X, ChevronUp, ChevronDown, Edit2 } from 'lucide-react';
import { Skill } from '../../types';

interface SkillsSectionProps {
  skills: Skill[];
  onUpdateSkills: (skills: Skill[]) => void;
  isEditing: boolean;
}

export default function SkillsSection({ skills, onUpdateSkills, isEditing }: SkillsSectionProps) {
  const [skillInput, setSkillInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Skill['level']>('intermediate');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim()) {
      const newSkill: Skill = {
        name: skillInput.trim(),
        isTopSkill: skills.filter(s => s.isTopSkill).length < 5,
        level: selectedLevel,
        endorsements: 0
      };
      onUpdateSkills([...skills, newSkill]);
      setSkillInput('');
      setShowAddForm(false);
    }
  };

  const toggleTopSkill = (skillName: string) => {
    const currentTopSkills = skills.filter(s => s.isTopSkill);
    const skill = skills.find(s => s.name === skillName);
    
    if (skill) {
      if (skill.isTopSkill) {
        // Remove from top skills
        onUpdateSkills(skills.map(s => 
          s.name === skillName ? { ...s, isTopSkill: false } : s
        ));
      } else if (currentTopSkills.length < 5) {
        // Add to top skills if less than 5
        onUpdateSkills(skills.map(s => 
          s.name === skillName ? { ...s, isTopSkill: true } : s
        ));
      }
    }
  };

  const removeSkill = (skillName: string) => {
    onUpdateSkills(skills.filter(s => s.name !== skillName));
  };

  const moveSkill = (skillName: string, direction: 'up' | 'down') => {
    const index = skills.findIndex(s => s.name === skillName);
    if (index === -1) return;

    const newSkills = [...skills];
    if (direction === 'up' && index > 0) {
      [newSkills[index - 1], newSkills[index]] = [newSkills[index], newSkills[index - 1]];
    } else if (direction === 'down' && index < skills.length - 1) {
      [newSkills[index], newSkills[index + 1]] = [newSkills[index + 1], newSkills[index]];
    }
    onUpdateSkills(newSkills);
  };

  const topSkills = skills.filter(s => s.isTopSkill);
  const otherSkills = skills.filter(s => !s.isTopSkill);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Top Skills</h3>
          {isEditing && (
            <span className="text-sm text-gray-500">
              {5 - topSkills.length} spots remaining
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSkills.map((skill) => (
            <div
              key={skill.name}
              className="relative bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{skill.level}</p>
                </div>
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              {skill.endorsements !== undefined && (
                <p className="mt-2 text-sm text-gray-600">
                  {skill.endorsements} endorsements
                </p>
              )}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/5 transition-opacity rounded-lg">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleTopSkill(skill.name)}
                      className="p-1 bg-white rounded-full shadow hover:shadow-md"
                      title="Remove from top skills"
                    >
                      <Star className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => removeSkill(skill.name)}
                      className="p-1 bg-white rounded-full shadow hover:shadow-md"
                      title="Remove skill"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isEditing && topSkills.length < 5 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center h-full min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Add top skill</span>
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Other Skills</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {otherSkills.map((skill) => (
            <div
              key={skill.name}
              className="group relative bg-gray-50 rounded-md px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{skill.name}</span>
                {isEditing && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleTopSkill(skill.name)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Add to top skills"
                    >
                      <Star className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => removeSkill(skill.name)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Remove skill"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-3 py-2 hover:border-gray-400 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">Add skill</span>
            </button>
          )}
        </div>
      </div>

      {showAddForm && isEditing && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Skill</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700">
                  Skill Name
                </label>
                <input
                  type="text"
                  id="skill-name"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter skill name"
                  required
                />
              </div>
              <div>
                <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700">
                  Proficiency Level
                </label>
                <select
                  id="skill-level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as Skill['level'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}