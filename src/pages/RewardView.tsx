import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Reward } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  Box,
  Input,
  Heading,
  Button,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";

const RewardView = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [editedName, setEditedName] = useState("");

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
    const numericRewardCost = rewardCost === "" ? 0 : Number(rewardCost);

    if (!rewardName.trim() || numericRewardCost <= 0) return;

    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw new Error("User not found");

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("id")
        .eq("auth_id", userData.user.id)
        .single();

      if (parentError) throw new Error("Parent not found");
      const parentId = parentData.id;

      const { error: insertError } = await supabase
        .from("soc_final_rewards")
        .insert([
          { name: rewardName, cost: numericRewardCost, parent_id: parentId },
        ]);

      if (insertError) throw insertError;

      const { data: updatedRewards, error: fetchError } = await supabase
        .from("soc_final_rewards")
        .select("*")
        .eq("parent_id", parentId);

      if (fetchError) throw new Error("Error fetching rewards");
      setRewards(updatedRewards);

      setRewardName("");
      setRewardCost("");
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <Box p={4} rounded="md" mb={4} shadow="lg">
        <Heading
          mt={2}
          justifyContent="center"
          color="black"
          p={4}
          borderRadius="xl"
          fontSize="1.875rem"
          fontWeight="bold"
          textAlign="center"
          mb={8}
          maxW="md"
          mx="auto"
        >
          Rewards
        </Heading>

        <VStack gap={4} align="stretch">
          {/* ------------------------ Reward Creation Form ---------------------*/}
          <Box
            bg="#80cbc4"
            p={4}
            rounded="md"
            mb={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="100vw"
          >
            <Text fontSize="xl" fontWeight="semibold" mb={4} textAlign="center">
              Create Reward
            </Text>
            <Input
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="Reward Name"
              bg="white"
              mb={4}
              width="75%"
              p={3}
              variant="outline"
            />

            <Input
              type="number"
              value={rewardCost}
              onChange={(e) => setRewardCost(e.target.value)}
              placeholder="Enter Reward Value..."
              mb={4}
              p={3}
              bg="white"
              width="75%"
              justifyContent="center"
              variant="outline"
            />

            <Button
              onClick={createReward}
              bg="#800080"
              color="white"
              width="auto"
              _hover={{ bg: "indigo" }}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" color="white" /> : "Create Reward"}
            </Button>
          </Box>

          {/* --------------------- Edit Reward Form -----------------------------------*/}
          {editingReward && (
            <Box bg="gray.100" p={4} rounded="md" mb={4}>
              <Text fontSize="xl" fontWeight="semibold" mb={4}>
                Edit Reward
              </Text>

              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Reward Name"
                mb={4}
                variant="outline"
              />

              <Input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(e.target.value)}
                placeholder="0"
                mb={4}
                variant="outline"
              />

              <Button
                onClick={() => setEditingReward(null)}
                variant="outline"
                colorScheme="gray"
                width="full"
                mt={2}
              >
                Cancel
              </Button>
            </Box>
          )}

          {/* --------------------- Reward List ---------------------------------*/}
          {rewards.length > 0 ? (
            <Box>
              <Heading
                size="md"
                mb={4}
                mt={2}
                bg="#800080"
                color="white"
                p={4}
                borderRadius="xl"
                shadow="md"
                fontSize="1.875rem"
                fontWeight="bold"
                textAlign="center"
                width="full"
                maxW="md"
              >
                Available Rewards
              </Heading>
              {rewards.map((reward) => (
                <Box
                  key={reward.id}
                  bg="gray.100"
                  p={4}
                  rounded="md"
                  mb={4}
                  shadow="sm"
                >
                  <p>
                    <strong>{reward.name}</strong>
                  </p>
                  <p>Cost: {reward.cost} gems</p>
                </Box>
              ))}
            </Box>
          ) : (
            <Text textAlign="center">No rewards available.</Text>
          )}
        </VStack>
      </Box>
    </ProtectedRoute>
  );
};

export default RewardView;
