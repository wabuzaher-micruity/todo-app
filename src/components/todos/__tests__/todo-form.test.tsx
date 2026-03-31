import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TodoForm, findSimilarTodos } from "../todo-form";

const mockMutateAsync = vi.fn();
const mockTodos = [
  { id: "1", title: "Buy milk", completed: false },
  { id: "2", title: "Buy eggs", completed: false },
  { id: "3", title: "Done task", completed: true },
];

vi.mock("@/hooks/use-todos", () => ({
  useCreateTodo: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  useTodos: () => ({ data: mockTodos }),
}));

describe("TodoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({});
  });

  it("renders input with placeholder", () => {
    render(<TodoForm listId="list-1" />);
    expect(screen.getByPlaceholderText("Add a todo...")).toBeInTheDocument();
  });

  it("creates todo on Enter", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk{Enter}");

    expect(mockMutateAsync).toHaveBeenCalledWith({
      list_id: "list-1",
      title: "Buy milk",
    });
  });

  it("clears input after creating", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk{Enter}");

    expect(input).toHaveValue("");
  });

  it("does not create with empty title", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "   {Enter}");

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("creates todo when add button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk");
    await user.click(screen.getByRole("button", { name: "Add todo" }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      list_id: "list-1",
      title: "Buy milk",
    });
  });

  it("disables add button when input is empty", () => {
    render(<TodoForm listId="list-1" />);
    expect(screen.getByRole("button", { name: "Add todo" })).toBeDisabled();
  });

  it("shows warning when similar todo exists", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Buy milk");

    expect(screen.getByText(/similar todo/i)).toBeInTheDocument();
    expect(screen.getByText(/"Buy milk"/)).toBeInTheDocument();
  });

  it("does not show warning for short input", async () => {
    const user = userEvent.setup();
    render(<TodoForm listId="list-1" />);

    const input = screen.getByPlaceholderText("Add a todo...");
    await user.type(input, "Bu");

    expect(screen.queryByText(/similar todo/i)).not.toBeInTheDocument();
  });
});

describe("findSimilarTodos", () => {
  const todos = [
    { title: "Buy milk", completed: false },
    { title: "Buy eggs", completed: false },
    { title: "Sell car", completed: false },
    { title: "Buy bread", completed: true },
  ];

  it("finds partial case-insensitive matches", () => {
    expect(findSimilarTodos("buy", todos)).toEqual(["Buy milk", "Buy eggs"]);
  });

  it("ignores completed todos", () => {
    expect(findSimilarTodos("bread", todos)).toEqual([]);
  });

  it("returns empty for short queries", () => {
    expect(findSimilarTodos("bu", todos)).toEqual([]);
  });

  it("returns empty for no matches", () => {
    expect(findSimilarTodos("xyz", todos)).toEqual([]);
  });

  it("matches substring anywhere in title", () => {
    expect(findSimilarTodos("milk", todos)).toEqual(["Buy milk"]);
  });

  it("limits results to at most 5", () => {
    const manyTodos = Array.from({ length: 20 }, (_, i) => ({
      title: `Task ${i}`,
      completed: false,
    }));
    const result = findSimilarTodos("Task", manyTodos);
    expect(result).toHaveLength(5);
  });
});
