import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Kid } from "../types/database";

const KidProfile: React.FC = () => {
  const { id } = useParams(); // Extract kidId from the URL
  const [kid, setKid] = useState<Kid | null>(null);

  console.log("Extracted kidId from URL:", id);

  useEffect(() => {
    const fetchKid = async () => {
      if (!id) {
        console.error("kidId is missing from useParams()");
        return;
      }

      const { data, error } = await supabase
        .from("soc_final_kids")
        .select("*")
        .eq("id", id)
        .single();

      console.log("Fetched Kid Data:", data, "Error:", error);

      if (error) console.error("Supabase error:", error);
      else setKid(data);
    };

    fetchKid();
  }, [id]);

  if (!kid) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{kid.name}'s Profile</h1>
      <p>
        <strong>Coins:</strong> {kid.currency}
      </p>
    </div>
  );
};

export default KidProfile;
