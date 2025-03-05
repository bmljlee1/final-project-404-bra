import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Task, Kid } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";

interface TaskWithKid extends Task {
  soc_final_kids: Kid;
}

const TaskView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithKid[]>([]);
  const [taskHistory, setTaskHistory] = useState<TaskWithKid[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [taskName, setTaskName] = useState("");
  const [rewardValue, setRewardValue] = useState(0);
  const [selectedKidId, setSelectedKidId] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParentId = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const authUserId = userData.user.id;

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", authUserId)
        .single();

      if (parentError || !parentData) return;

      setParentId(parentData.id);
    };

    fetchParentId();
  }, []);

  useEffect(() => {
    if (!parentId) return;

    const fetchTasks = async () => {
      if (!parentId) return;

      const { data, error } = await supabase
        .from("soc_final_tasks")
        .select("*, soc_final_kids(id, name, parent_id)")
        .eq("soc_final_kids.parent_id", parentId)
        .eq("created_by", parentId);

      if (error) console.error(error);
      else setTasks(data);
    };

    const fetchTaskHistory = async () => {
      const { data, error } = await supabase
        .from("soc_final_task_history")
        .select("*, soc_final_kids(id, name, parent_id)")
        .eq("soc_final_kids.parent_id", parentId);

      if (error) console.error(error);
      else setTaskHistory(data);
    };

    const fetchKids = async () => {
      const { data, error } = await supabase
        .from("soc_final_kids")
        .select("id, parent_id, name, currency")
        .eq("parent_id", parentId);

      if (error) return;

      setKids(data as Kid[]);
    };

    fetchTasks();
    fetchTaskHistory();
    fetchKids();
  }, [parentId]);

  const createTask = async () => {
    if (!taskName.trim() || !parentId) return;

    setLoading(true);

    try {
      let assignedKids = kids.map((kid) => kid.id);
      if (selectedKidId !== "all") assignedKids = [selectedKidId];

      for (const kidId of assignedKids) {
        const { error } = await supabase.from("soc_final_tasks").insert([
          {
            name: taskName,
            created_by: parentId,
            assigned_to: kidId,
            reward_value: rewardValue,
          },
        ]);

        if (error) throw new Error("Error creating task");
      }

      setTaskName("");
      setRewardValue(0);
      setSelectedKidId("all");
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Task View</h1>

        {/* -------------------------------Task Creation Form------------------------------------ */}
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h2 className="text-xl font-semibold">Create Task</h2>

          <input
            type="text"
            placeholder="Task Name"
            className="w-full p-2 border rounded mb-2"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Reward Value"
            className="w-full p-2 border rounded mb-2"
            value={rewardValue}
            min="0"
            onChange={(e) => setRewardValue(parseInt(e.target.value, 10))}
            required
          />

          <select
            className="w-full p-2 border rounded mb-2"
            value={selectedKidId}
            onChange={(e) =>
              setSelectedKidId(
                e.target.value === "all" ? "all" : parseInt(e.target.value, 10)
              )
            }
          >
            <option value="all">All Kids</option>
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.name}
              </option>
            ))}
          </select>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition"
            onClick={createTask}
            disabled={loading}
          >
            {loading ? "Creating Task..." : "Create Task"}
          </button>
        </div>

        {/*----------------------------- Task List ------------------------------------*/}
        {tasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Assigned Tasks</h2>
            {tasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-100 rounded-md mb-2">
                <p>
                  <strong>{task.name}</strong> (Assigned to:{" "}
                  {task.soc_final_kids?.name || "Unknown"})
                </p>
                <p>Reward: {task.reward_value} coins</p>
              </div>
            ))}
          </div>
        )}

        {/*---------------------------- Task History -------------------------------------*/}
        {taskHistory.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Task History</h2>
            {taskHistory.map((task) => (
              <div key={task.id} className="p-3 bg-gray-200 rounded-md mb-2">
                <p>
                  <strong>{task.name}</strong> (Completed by:{" "}
                  {task.soc_final_kids?.name || "Unknown"})
                </p>
                <p>Reward Earned: {task.reward_value} coins</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TaskView;
