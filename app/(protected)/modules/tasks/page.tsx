import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
};

const TasksPage = () => {
  return (
    <div className="p-6">
      <p>Tasks Page</p>
    </div>
  );
};

export default TasksPage;
