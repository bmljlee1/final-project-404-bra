import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Task, Kid } from "../types/database";

interface TaskWithKid extends Task {
  soc_final_kids: Kid;
}

const TaskView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithKid[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("soc_final_tasks")
        .select("*, soc_final_kids(name)");

      if (error) {
        console.error(error);
      } else {
        setTasks(data);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Task View</h1>
      {tasks.map((task) => (
        <div key={task.id} className="p-3 bg-gray-100 rounded-md mb-2">
          <p>
            <strong>{task.name}</strong> (Assigned to:{" "}
            {task.soc_final_kids.name})
          </p>
          <p>Reward: {task.reward_value} coins</p>
        </div>
      ))}
    </div>
  );
};

export default TaskView;
