import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Reward } from "../types/database";

const RewardView: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data, error } = await supabase
        .from("soc_final_rewards")
        .select("*");
      if (error) console.error(error);
      else setRewards(data);
    };
    fetchRewards();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Reward View</h1>
      {rewards.map((reward) => (
        <div key={reward.id} className="p-3 bg-gray-100 rounded-md mb-2">
          <p>
            <strong>{reward.name}</strong>
          </p>
          <p>Cost: {reward.cost} coins</p>
        </div>
      ))}
    </div>
  );
};

export default RewardView;
