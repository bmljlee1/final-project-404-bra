import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Reward } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";

const RewardView: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedCost, setEditedCost] = useState(1);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const authUserId = userData.user.id;

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", authUserId)
        .single();

      if (parentError) return;

      const parentId = parentData.id;

      const { data, error } = await supabase
        .from("soc_final_rewards")
        .select("*")
        .eq("parent_id", parentId);

      if (error) console.error(error);
      else setRewards(data);
    };

    fetchRewards();
  }, []);

  const createReward = async () => {
    if (!rewardName.trim() || rewardCost <= 0) return;

    setLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user)
        throw new Error("User not authenticated");

      const authUserId = userData.user.id;

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", authUserId)
        .single();

      if (parentError) throw new Error("Parent not found");

      const parentId = parentData.id;

      const { error } = await supabase
        .from("soc_final_rewards")
        .insert([{ name: rewardName, cost: rewardCost, parent_id: parentId }]);

      if (error) throw new Error("Error creating reward");

      setRewardName("");
      setRewardCost(1);

      const { data: updatedRewards, error: fetchError } = await supabase
        .from("soc_final_rewards")
        .select("*")
        .eq("parent_id", parentId);

      if (fetchError) throw new Error("Error fetching rewards");
      setRewards(updatedRewards);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const editReward = async () => {
    if (!editingReward || !editedName.trim() || editedCost <= 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("soc_final_rewards")
        .update({ name: editedName, cost: editedCost })
        .eq("id", editingReward.id);

      if (error) throw new Error("Error updating reward");

      setEditingReward(null);
      setEditedName("");
      setEditedCost(1);

      const { data: updatedRewards, error: fetchError } = await supabase
        .from("soc_final_rewards")
        .select("*")
        .eq("parent_id", editingReward.parent_id);

      if (fetchError) throw new Error("Error fetching rewards");
      setRewards(updatedRewards);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const deleteReward = async (rewardId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("soc_final_rewards")
        .delete()
        .eq("id", rewardId);

      if (error) throw new Error("Error deleting reward");

      setRewards((prev) => prev.filter((reward) => reward.id !== rewardId));
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Reward View</h1>

        {/* ------------------------ Reward Creation Form ---------------------*/}
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h2 className="text-xl font-semibold">Create Reward</h2>

          <input
            type="text"
            placeholder="Reward Name"
            className="w-full p-2 border rounded mb-2"
            value={rewardName}
            onChange={(e) => setRewardName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Cost in Coins"
            className="w-full p-2 border rounded mb-2"
            value={rewardCost}
            min="1"
            onChange={(e) => setRewardCost(parseInt(e.target.value, 10))}
            required
          />

          <button
            className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition"
            onClick={createReward}
            disabled={loading}
          >
            {loading ? "Adding..." : "Create Reward"}
          </button>
        </div>

        {/* --------------------- Edit Reward Form -----------------------------------*/}
        {editingReward && (
          <div className="bg-gray-200 p-4 rounded-md mb-4">
            <h2 className="text-xl font-semibold">Edit Reward</h2>

            <input
              type="text"
              placeholder="Reward Name"
              className="w-full p-2 border rounded mb-2"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Cost in Coins"
              className="w-full p-2 border rounded mb-2"
              value={editedCost}
              min="1"
              onChange={(e) => setEditedCost(parseInt(e.target.value, 10))}
              required
            />

            <button
              className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition"
              onClick={editReward}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Reward"}
            </button>

            <button
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2 hover:bg-gray-600 transition"
              onClick={() => setEditingReward(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* --------------------- Reward List ---------------------------------*/}
        {rewards.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold">Available Rewards</h2>
            {rewards.map((reward) => (
              <div key={reward.id} className="p-3 bg-gray-100 rounded-md mb-2">
                <p>
                  <strong>{reward.name}</strong>
                </p>
                <p>Cost: {reward.cost} coins</p>

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
                  onClick={() => {
                    setEditingReward(reward);
                    setEditedName(reward.name);
                    setEditedCost(reward.cost);
                  }}
                >
                  Edit
                </button>

                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={() => deleteReward(reward.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No rewards available.</p>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default RewardView;
