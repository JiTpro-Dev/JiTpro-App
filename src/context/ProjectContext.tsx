import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../supabase/client';

export interface ProjectInfo {
  id: string;
  name: string;
  status: string;
  project_number: string | null;
  description: string | null;
}

interface ProjectContextType {
  projectId: string | null;
  project: ProjectInfo | null;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const match = location.pathname.match(/\/app\/project\/([^/]+)/);
  const projectId = match?.[1] ?? null;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }

    // Skip refetch if we already have this project loaded
    if (project?.id === projectId) return;

    async function fetchProject() {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, project_number, description')
        .eq('id', projectId)
        .single();

      setProject(data ?? null);
      setLoading(false);
    }

    fetchProject();
  }, [projectId, project?.id]);

  return (
    <ProjectContext.Provider value={{ projectId, project, loading }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
