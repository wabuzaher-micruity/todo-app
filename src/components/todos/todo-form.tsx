import { useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTodo, useTodos } from "@/hooks/use-todos";
import { Plus, AlertTriangle } from "lucide-react";

interface TodoFormProps {
  listId: string;
}

export function findSimilarTodos(
  title: string,
  todos: { title: string; completed: boolean }[]
): string[] {
  const query = title.toLowerCase().trim();
  if (query.length < 3) return [];

  return todos
    .filter((t) => !t.completed && t.title.toLowerCase().includes(query))
    .map((t) => t.title);
}

export function TodoForm({ listId }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTodo = useCreateTodo();
  const { data: todos } = useTodos(listId);

  const similarTitles = useMemo(
    () => findSimilarTodos(title, todos ?? []),
    [title, todos]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTodo.mutateAsync({ list_id: listId, title: title.trim() });
    setTitle("");
    inputRef.current?.focus();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Add a todo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="pl-9"
            disabled={createTodo.isPending}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={createTodo.isPending || !title.trim()}
          aria-label="Add todo"
          onClick={() => setTimeout(() => inputRef.current?.focus(), 0)}
        >
          <Plus className="size-4" />
        </Button>
      </form>
      {similarTitles.length > 0 && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span>
            Similar todo{similarTitles.length > 1 ? "s" : ""} already exist
            {similarTitles.length <= 3 ? ": " : "."}
            {similarTitles.length <= 3 &&
              similarTitles.map((t, i) => (
                <span key={t}>
                  {i > 0 && ", "}
                  <span className="font-medium">"{t}"</span>
                </span>
              ))}
          </span>
        </div>
      )}
    </div>
  );
}
