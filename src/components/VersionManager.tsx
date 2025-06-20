import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ResumeData } from "../types";

interface VersionInfo {
  id: number;
  name: string;
  created_at: string;
}

interface VersionManagerProps {
  currentResumeData: ResumeData;
  onLoadVersion: (data: ResumeData) => void;
}

const VersionManager: React.FC<VersionManagerProps> = ({ currentResumeData, onLoadVersion }) => {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [newVersionName, setNewVersionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const fetchedVersions = await invoke<VersionInfo[]>("load_versions");
      setVersions(fetchedVersions);
    } catch (e) {
      setError(e as string);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleSave = async () => {
    if (!newVersionName.trim()) {
      setError("Version name cannot be empty.");
      return;
    }
    setError(null);
    try {
      await invoke("save_version", {
        name: newVersionName,
        data: JSON.stringify(currentResumeData),
      });
      setNewVersionName("");
      fetchVersions();
    } catch (e) {
      setError(e as string);
    }
  };

  const handleLoad = async (id: number) => {
    setError(null);
    try {
      const fullVersion = await invoke<{ data: string }>("load_version", { id });
      onLoadVersion(JSON.parse(fullVersion.data));
    } catch (e) {
      setError(e as string);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await invoke("delete_version", { id });
      fetchVersions();
    } catch (e) {
      setError(e as string);
    }
  };

  return (
    <div className="version-manager-section">
      <h2>Version History</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="version-save-form">
        <input type="text" value={newVersionName} onChange={(e) => setNewVersionName(e.target.value)} placeholder="New version name..." />
        <button onClick={handleSave}>Save Current Version</button>
      </div>
      <div className="versions-list">
        {isLoading ? (
          <p>Loading versions...</p>
        ) : (
          <ul>
            {versions.map((version) => (
              <li key={version.id}>
                <span>
                  {version.name} ({new Date(version.created_at).toLocaleString()})
                </span>
                <div className="version-actions">
                  <button onClick={() => handleLoad(version.id)}>Load</button>
                  <button onClick={() => handleDelete(version.id)} className="delete">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VersionManager;
