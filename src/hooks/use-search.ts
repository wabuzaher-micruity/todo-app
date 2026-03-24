import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import type { TodoSearchResult } from "@/types";

export function useSearch(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["search", query],
    queryFn: async (): Promise<TodoSearchResult[]> => {
      if (!query.trim()) return [];

      // Join terms with & for AND matching via Supabase .textSearch()
      const tsQuery = query.trim().split(/\s+/).join(" & ");
      const { data, error } = await supabase
        .from("todos")
        .select("*, todo_lists!inner(name)")
        .textSearch("fts", tsQuery)
        .limit(20);
      if (error) throw error;
      return data as TodoSearchResult[];
    },
    enabled: !!user && query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
