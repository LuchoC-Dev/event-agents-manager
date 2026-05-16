import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { ProjectSelector } from "../components/ProjectSelector";

export function HomePage() {
  const { projects, fetchProjects, createProject } = useStore();
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  return (
    <ProjectSelector
      projects={projects}
      onSelect={(project) => navigate(`/${project.id}`)}
      onCreate={async (name, description) => {
        const project = await createProject(name, description);
        navigate(`/${project.id}`);
        return project;
      }}
    />
  );
}
