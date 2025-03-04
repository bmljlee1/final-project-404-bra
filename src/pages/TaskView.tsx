import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Task, Kid } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";

interface TaskWithKid extends Task {
  soc_final_kids: Kid;
}

const TaskView: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithKid[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [taskName, setTaskName] = useState("");
  const [rewardValue, setRewardValue] = useState(1);
  const [selectedKidId, setSelectedKidId] = useState<number | "all">("all"); // Default to "all"
  const [loading, setLoading] = useState(false);

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

    const fetchKids = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const authUserId = userData.user.id;

      // ✅ Step 1: Get Parent ID
      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", authUserId)
        .single();

      if (parentError) return;

      const parentId = parentData.id;

      // ✅ Step 2: Get All Kids Belonging to This Parent
      const { data: kidsData, error: kidsError } = await supabase
        .from("soc_final_kids")
        .select("id, parent_id, name, currency") // ✅ Include all required fields
        .eq("parent_id", parentId);

      if (kidsError) return;

      setKids(kidsData || []);
    };

    fetchTasks();
    fetchKids();
  }, []);

  const createTask = async () => {
    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user)
        throw new Error("User not authenticated");

      const authUserId = userData.user.id;

      // ✅ Step 3: Get Parent ID
      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", authUserId)
        .single();

      if (parentError) throw new Error("Parent not found");

      const parentId = parentData.id;

      let assignedKids = kids.map((kid) => kid.id); // Default to all kids
      if (selectedKidId !== "all") assignedKids = [selectedKidId]; // If a specific kid is selected

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
      setRewardValue(1);
      setSelectedKidId("all");
    } catch (err: unknown) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Task View</h1>

        {/* ✅ Task Creation Form */}
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
            min="1"
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

        {/* ✅ Task List */}
        {tasks.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold">Assigned Tasks</h2>
            {tasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-100 rounded-md mb-2">
                <p>
                  <strong>{task.name}</strong> (Assigned to:{" "}
                  {task.soc_final_kids ? task.soc_final_kids.name : "Unknown"})
                </p>
                <p>Reward: {task.reward_value} coins</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tasks assigned yet.</p>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default TaskView;
