import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Avatar,
  AvatarGroup,
} from "@chakra-ui/react";
import { Kid, Reward } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

const KidProfile = () => {
  const { id } = useParams();
  const [kid, setKid] = useState<Kid | null>(null);
  const [tasks, setTasks] = useState<
    { id: number; name: string; reward_value: number; completed: boolean }[]
  >([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchKidData = async () => {
      if (!id) return;

      const kidId = parseInt(id, 10);
      if (isNaN(kidId)) return;

      console.log("checking kid ID:", kidId);

      const { data: kidData, error: kidError } = await supabase
        .from("soc_final_kids")
        .select("id, parent_id, name, currency")
        .eq("id", kidId)
        .single();

      if (kidError) {
        console.error("Error fetching kid:", kidError);
        return;
      }

      console.log("Kid Data Fetched:", kidData);

      setKid(kidData);

      const parentId = kidData.parent_id;

      const { data: rewardsData, error: rewardsError } = await supabase
        .from("soc_final_rewards")
        .select("*")
        .eq("parent_id", parentId);

      if (rewardsError) {
        console.error("Error fetching rewards:", rewardsError);
        return;
      }

      console.log("Rewards Fetched:", rewardsData);

      setRewards(rewardsData);

      console.log("Fetching tasks for kid ID:", kidId);

      const parsedKidId = Number(id); //For some reason needed to parse it again to avoid error? Recheck this.

      const { data: tasksData, error: tasksError } = await supabase
        .from("soc_final_tasks")
        .select("id, name, reward_value, completed")
        .eq("assigned_to", parsedKidId);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        return;
      }

      setTasks(
        tasksData.map((task) => ({
          ...task,
          completed: task.completed || false,
        }))
      );
      console.log("Fetched Tasks for Kid:", tasksData);
    };

    fetchKidData();
  }, [id]);
  const markTaskComplete = async (taskId: number) => {
    console.log("Marking task as complete:", taskId);
    try {
      const { data, error } = await supabase
        .from("soc_final_tasks")
        .update({ completed: true })
        .eq("id", taskId)
        .select();

      if (error) {
        console.error("Error marking task as complete:", error);
        return;
      }

      console.log("Updated Task Data from Supabase:", data);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!kid || kid.currency < reward.cost) return;

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("soc_final_kids")
        .update({ currency: kid.currency - reward.cost })
        .eq("id", kid.id);

      if (updateError) throw new Error("Error updating currency");

      const { error: redeemError } = await supabase
        .from("soc_final_redeemed_rewards")
        .insert([
          { kid_id: kid.id, reward_id: reward.id, parent_id: kid.parent_id },
        ]);

      if (redeemError) throw new Error("Error adding redeemed reward");

      setKid({ ...kid, currency: kid.currency - reward.cost });
      setRewards(rewards.filter((reward) => reward.id !== reward.id));

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  if (!kid) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={6}
        shadow="md"
        // bg="#80CBC4"
        minH="100%"
        width="100%"
        height="100vh"
        mx="auto"
        bg="rgba(128, 0, 128, 0.7)"
        color="purple"
        px={{ base: 4, md: 8 }}
      >
        {/*--------------------------------------- Confetti Component ---------------------------------*/}
        {showConfetti && <Confetti width={width} height={height} />}
        <Box
          display="flex"
          w="50%"
          justifyContent="center"
          alignItems="center"
          p={3}
          shadow="md"
          bg="white"
          opacity="1"
          borderRadius="xl"
        >
          <Stack p={6} align="center" w="full" bg="white">
            {/* -----------------------------------------Kid's Profile Header-------------------------------------------- */}
            <Heading
              as="h2"
              size="2xl"
              fontWeight="bold"
              bg="white"
              p={6}
              borderRadius="md"
              w="full"
              textAlign="center"
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              {kid.name}'s Profile
              <AvatarGroup
                p={4}
                color="purple"
                _hover={{
                  transform: "scale(1.05)",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <Avatar.Root>
                  <Avatar.Fallback name={`${kid.name}'s Avatar`} />

                  <Avatar.Image src="https://i.ytimg.com/vi/eXwZMAz9Vh8/maxresdefault.jpg" />
                </Avatar.Root>
              </AvatarGroup>
            </Heading>

            {/*-------------------------------------- Coins Info ------------------------------------*/}
            <Text
              textAlign="center"
              bg="white"
              fontSize="xl"
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <strong>Gems:</strong> {kid.currency} 💎
            </Text>

            {/* ------------------ Assigned Tasks -------------------- */}
            <Heading
              as="h3"
              size="md"
              fontWeight="bold"
              textAlign="center"
              mt={4}
              bg="white"
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              Assigned Tasks
            </Heading>
            {tasks.length > 0 ? (
              <Stack p={4} w="full" align="center">
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    p={3}
                    bg="white"
                    borderRadius="xl"
                    w="full"
                    textAlign="center"
                    shadow="md"
                    _hover={{
                      borderColor: "purple",
                      borderWidth: "1px",
                      transform: "scale(1.05)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <Text bg="white" p={3} mt={4}>
                      <strong>{task.name}</strong> - {task.reward_value} gems
                    </Text>
                    <Button
                      colorScheme="green"
                      onClick={() => markTaskComplete(task.id)}
                      mt={2}
                      bg="purple"
                      color="white"
                      shadow="md"
                      _hover={{ bg: "indigo" }}
                      _active={{ bg: "#80CBC4" }}
                      disabled={task.completed}
                    >
                      {task.completed
                        ? "Task Completed"
                        : "I Have Completed This Task"}
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text>No tasks assigned.</Text>
            )}

            {/* ------------------ Reward Redemption Section -------------------- */}
            <Heading
              as="h3"
              size="md"
              fontWeight="bold"
              textAlign="center"
              mt={4}
              bg="white"
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              Redeem Rewards
            </Heading>
            {rewards.length > 0 ? (
              <Stack p={4} w="full" align="center">
                {rewards.map((reward) => (
                  <Box
                    key={reward.id}
                    p={3}
                    bg="white"
                    borderRadius="xl"
                    w="full"
                    textAlign="center"
                    shadow="md"
                    _hover={{
                      borderColor: "purple",
                      borderWidth: "1px",
                      transform: "scale(1.05)",
                      transition: "transform 0.2s ease-in-out",
                    }}
                  >
                    <Text bg="white" p={3} mt={4}>
                      <strong>{reward.name}</strong> - {reward.cost} gems
                    </Text>
                    <Button
                      px={4}
                      py={2}
                      borderRadius="md"
                      bg={kid.currency >= reward.cost ? "purple" : "gray.300"}
                      color={kid.currency >= reward.cost ? "white" : "gray.500"}
                      _hover={{
                        bg: kid.currency >= reward.cost ? "indigo" : "gray.300",
                      }}
                      onClick={() => redeemReward(reward)}
                      disabled={kid.currency < reward.cost || loading}
                    >
                      {loading ? "Processing..." : "Redeem"}
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text>No rewards available</Text>
            )}
          </Stack>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default KidProfile;
