import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Parent } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";

const ParentProfile: React.FC = () => {
  const [parent, setParent] = useState<Parent | null>(null);

  useEffect(() => {
    const fetchParent = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        console.error("User not authenticated", userError);
        return;
      }

      const userEmail = user.user.email;

      const { data, error } = await supabase
        .from("soc_final_parents")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle(); // ✅ Prevents 406 error if no row is found

      if (error) {
        console.error(error);
      } else {
        setParent(data);
      }
    };

    fetchParent();
  }, []);

  if (!parent) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Parent Profile</h1>
        <p>
          <strong>Name:</strong> {parent.name}
        </p>
        <p>
          <strong>Email:</strong> {parent.email}
        </p>
      </div>
    </ProtectedRoute>
  );
};

export default ParentProfile;
