import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Kid, Task } from "../types/database";

const KidDashboard: React.FC = () => {
  const { kidId } = useParams();
  const [kid, setKid] = useState<Kid | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchKidData = async () => {
      const { data: kidData, error: kidError } = await supabase
        .from("soc_final_kids")
        .select("*")
        .eq("id", kidId)
        .single();

      if (kidError) console.error(kidError);
      else setKid(kidData);
    };

    const fetchTasks = async () => {
      const { data: taskData, error: taskError } = await supabase
        .from("soc_final_tasks")
        .select("*")
        .eq("assigned_to", kidId);

      if (taskError) console.error(taskError);
      else setTasks(taskData);
    };

    fetchKidData();
    fetchTasks();
  }, [kidId]);

  if (!kid) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{kid.name}'s Dashboard</h1>
      <p>
        <strong>Coins:</strong> {kid.currency}
      </p>

      <h2 className="text-xl mt-4">Assigned Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="p-3 bg-gray-100 rounded-md mb-2">
            <p>
              <strong>{task.name}</strong>
            </p>
            <p>Reward: {task.reward_value} coins</p>
          </div>
        ))
      )}
    </div>
  );
};

export default KidDashboard;
