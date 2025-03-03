import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Kid } from "../types/database";

const Dashboard: React.FC = () => {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKids = async () => {
      const { data, error } = await supabase.from("soc_final_kids").select("*");

      console.log("Fetched Kids:", data, "Error:", error); // Debugging

      if (error) console.error("Supabase error:", error);
      else setKids(data || []);
      setLoading(false);
    };

    fetchKids();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>
      {loading ? <p>Loading...</p> : null}
      <div className="mt-4">
        {kids.length > 0 ? (
          kids.map((kid) => (
            <div key={kid.id} className="p-3 bg-gray-100 rounded-md mb-2">
              <p className="text-lg font-semibold">{kid.name}</p>
              <p>Coins: {kid.currency}</p>
            </div>
          ))
        ) : (
          <p>No kids found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
