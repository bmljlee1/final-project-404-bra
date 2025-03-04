import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Kid } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";

const KidProfile: React.FC = () => {
  const { id } = useParams();
  const [kid, setKid] = useState<Kid | null>(null);
  const [tasks, setTasks] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchKid = async () => {
      if (!id) return;

      const kidId = parseInt(id, 10);

      if (isNaN(kidId)) return;

      const { data, error } = await supabase
        .from("soc_final_kids")
        .select("*")
        .eq("id", kidId)
        .single();

      if (error) console.error("Supabase error:", error);
      else setKid(data);
    };

    const fetchTasks = async () => {
      if (!id) return;

      const kidId = parseInt(id, 10);

      const { data, error } = await supabase
        .from("soc_final_tasks")
        .select("name")
        .eq("assigned_to", kidId);

      if (error) console.error("Error fetching tasks:", error);
      else setTasks(data);
    };

    fetchKid();
    fetchTasks();
  }, [id]);

  if (!kid) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{kid.name}'s Profile</h1>
        <p>
          <strong>Coins:</strong> {kid.currency}
        </p>

        <h2 className="text-xl font-bold mt-4">Today's Tasks</h2>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>- {task.name}</li>
            ))}
          </ul>
        ) : (
          <p>No tasks for today.</p>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default KidProfile;
