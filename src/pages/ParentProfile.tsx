// Import React hooks and Supabase client
// Define a ParentProfile component to display parent information
// Fetch parent data from "SOC_final_parents" based on logged-in user
// Store parent information in a state variable using useState
// Render the parent's name and email
// Export the ParentProfile component as defaul

import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Parent } from "../types/database";

const ParentProfile: React.FC = () => {
  const [parent, setParent] = useState<Parent | null>(null);

  useEffect(() => {
    const fetchParent = async () => {
      const userEmail = "john@example.com";

      const { data, error } = await supabase
        .from("soc_final_parents")
        .select("*")
        .eq("email", userEmail)
        .single();

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
    <div className="p-6">
      <h1 className="text-2xl font-bold">Parent Profile</h1>
      <p>
        <strong>Name:</strong> {parent.name}
      </p>
      <p>
        <strong>Email:</strong> {parent.email}
      </p>
    </div>
  );
};

export default ParentProfile;
