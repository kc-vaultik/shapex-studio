import { useState, useEffect } from 'react';
import { fetchIdeas, type Idea } from '../utils/api';

interface UseIdeasResult {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useIdeas = (limit: number = 5): UseIdeasResult => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIdeas(limit);
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return {
    ideas,
    loading,
    error,
    refetch: loadIdeas,
  };
};
