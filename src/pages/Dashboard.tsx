import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import QRCode from "react-qr-code";
import { Box, Button, Text, Heading, VStack, Spinner } from "@chakra-ui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PostgrestError } from "@supabase/supabase-js";

interface Kid {
  id: number;
  name: string;
  currency: number;
}

interface RedeemedReward {
  id: number;
  kid_id: number;
  kid_name: string;
  reward_name: string;
  redeemed_at: string;
  approved: boolean;
}

export default function Dashboard() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<
    RedeemedReward[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeKidId, setQrCodeKidId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw new Error(userError.message);
        if (!userData?.user) throw new Error("User not logged in.");

        const authUserId = userData.user.id;

        const { data: parentData, error: parentError } = await supabase
          .from("soc_final_parents")
          .select("id")
          .eq("auth_id", authUserId)
          .single();

        if (parentError) throw new Error("Parent not found.");
        const parentId = parentData.id;

        const { data: kidsData, error: kidsError } = await supabase
          .from("soc_final_kids")
          .select("id, name, currency")
          .eq("parent_id", parentId);

        if (kidsError) throw new Error("Error fetching children.");
        setKids(kidsData || []);

        type RedemptionWithReward = {
          id: number;
          kid_id: number;
          redeemed_at: string;
          approved: boolean;
          soc_final_rewards: { id: number; name: string } | null;
          soc_final_kids: { id: number; name: string } | null;
        };

        const { data: redemptionsData, error: redemptionsError } =
          (await supabase
            .from("soc_final_redeemed_rewards")
            .select(
              "id, redeemed_at, approved, kid_id, soc_final_rewards(id, name), soc_final_kids!inner(id, name)"
            )
            .eq("parent_id", parentId)
            .eq("approved", false)) as unknown as {
            data: RedemptionWithReward[];
            error: PostgrestError;
          };

        if (redemptionsError) throw new Error(redemptionsError.message);

        setPendingRedemptions(
          redemptionsData.map((redemption) => ({
            id: redemption.id,
            kid_id: redemption.kid_id,
            reward_name: redemption.soc_final_rewards?.name ?? "Unknown Reward",
            kid_name: redemption.soc_final_kids
              ? redemption.soc_final_kids.name
              : `Kid ${redemption.kid_id}`,
            redeemed_at: redemption.redeemed_at,
            approved: redemption.approved,
          }))
        );
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const approveRedemption = async (redemptionId: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("soc_final_redeemed_rewards")
        .update({ approved: true })
        .eq("id", redemptionId);

      if (error) throw new Error("Error approving redemption");

      const updatedRedemptions = pendingRedemptions.filter(
        (redemption) => redemption.id !== redemptionId
      );

      setPendingRedemptions(updatedRedemptions);
      toast.success("The reward redemption has been approved.");
    } catch (err) {
      console.error("Error:", err);
      toast.error("There was an error approving the redemption.");
    }
    setLoading(false);
  };

  return (
    <Box
      p={6}
      display={"flex"}
      justifyContent={"center"}
      alignContent={"center"}
      flexDirection={"column"}
    >
      <Heading
        mb={4}
        fontSize="1.875rem"
        fontWeight="bold"
        alignSelf={"center"}
      >
        Parent Dashboard
      </Heading>

      {loading && <Spinner size="lg" />}
      {error && <Text color="red.500">{error}</Text>}

      {/* -------------------- Section: Kids List ----------------------- */}
      {kids.length > 0 ? (
        <VStack gap={4} align="stretch" mt={4}>
          <Heading
            as="h2"
            size="lg"
            mb={2}
            fontWeight="bold"
            alignSelf={"center"}
          >
            Your Children
          </Heading>
          {kids.map((kid) => (
            <Box
              key={kid.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor="#80CBC4"
              boxShadow="lg"
              bg="#B2DFDB"
              _hover={{ boxShadow: "xl" }}
              width="50%"
              alignSelf={"center"}
              display={"flex"}
              flexDirection={"column"}
            >
              <Heading
                as="h3"
                size="md"
                mb={2}
                fontWeight="bold"
                alignSelf={"center"}
              >
                {kid.name}
              </Heading>
              <Text alignSelf={"center"}>
                Current Gems: <strong>{kid.currency}</strong>
              </Text>

              <Button
                colorScheme="teal"
                onClick={() => {
                  setQrCodeKidId((prev) => (prev === kid.id ? null : kid.id));
                }}
                mt={3}
                bg="white"
                color="black"
                shadow="md"
                _hover={{ bg: "#80CBC4", color: "black" }}
                _active={{ bg: "#80CBC4" }}
                alignSelf={"center"}
              >
                Give Access
              </Button>

              {qrCodeKidId === kid.id && (
                <Box
                  mt={4}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                >
                  <Text>Scan this QR code to access {kid.name}'s profile:</Text>
                  <br />
                  <QRCode
                    value={`${window.location.origin}/kid/${kid.id}`}
                    size={150}
                  />
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      ) : (
        !loading && <Text>No children found.</Text>
      )}

      {/* -------------------- Section: Pending Reward Redemptions --------------------- */}
      {pendingRedemptions.length > 0 && (
        <VStack gap={4} align="stretch" mt={6}>
          <Heading as="h2" size="lg" mb={2} fontWeight="bold">
            Pending Reward Redemptions
          </Heading>
          {pendingRedemptions.map((redemption) => (
            <Box
              key={redemption.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              borderColor="#80CBC4"
              boxShadow="lg"
              bg="#B2EBF2"
              _hover={{ boxShadow: "xl" }}
            >
              <Text fontWeight="bold">
                <strong>{redemption.reward_name}</strong> requested by{" "}
                <strong>{redemption.kid_name}</strong>
              </Text>
              <Text>
                Redeemed on:{" "}
                {new Date(redemption.redeemed_at).toLocaleDateString()}
              </Text>

              <Button
                colorScheme="teal"
                onClick={() => approveRedemption(redemption.id)}
                mt={3}
                bg="white"
                color="black"
                shadow="md"
                _hover={{ bg: "#80CBC4", color: "black" }}
                _active={{ bg: "#80CBC4" }}
              >
                Approve
              </Button>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
