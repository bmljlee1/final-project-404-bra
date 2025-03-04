import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import QRCode from "react-qr-code";

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
        // 1: Get logged-in user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);
        if (!userData?.user) throw new Error("User not logged in.");

        const authUserId = userData.user.id;

        // 2: Get parent ID
        const { data: parentData, error: parentError } = await supabase
          .from("soc_final_parents")
          .select("id")
          .eq("auth_id", authUserId)
          .single();

        if (parentError) throw new Error("Parent not found.");

        const parentId = parentData.id;

        // 3: Fetch kids for the parent
        const { data: kidsData, error: kidsError } = await supabase
          .from("soc_final_kids")
          .select("id, name, currency")
          .eq("parent_id", parentId);

        if (kidsError) throw new Error("Error fetching children.");
        setKids(kidsData || []);

        // 4: Fetch pending reward redemptions
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
            error: any;
          };

        console.log("Fetched Redemptions Data:", redemptionsData);

        if (redemptionsError) throw new Error(redemptionsError.message);

        setPendingRedemptions(
          redemptionsData.map((r) => ({
            id: r.id,
            kid_id: r.kid_id,
            reward_name: r.soc_final_rewards?.name ?? "Unknown Reward",
            kid_name: r.soc_final_kids
              ? r.soc_final_kids.name
              : `Kid ${r.kid_id}`,
            redeemed_at: r.redeemed_at,
            approved: r.approved,
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

      setPendingRedemptions((prev) =>
        prev.filter((r) => r.id !== redemptionId)
      );
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Parent Dashboard</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* -------------------- Section: Kids List----------------------- */}
      {kids.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-2">Your Children</h2>
          <ul className="space-y-3">
            {kids.map((kid) => (
              <li key={kid.id} className="p-4 border rounded shadow">
                <h3 className="text-xl font-semibold">{kid.name}</h3>
                <p>
                  Current Coins:{" "}
                  <span className="font-bold">{kid.currency}</span>
                </p>

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  onClick={() => setQrCodeKidId(kid.id)}
                >
                  Give Access
                </button>

                {qrCodeKidId === kid.id && (
                  <div className="mt-4 flex flex-col items-center">
                    <p>Scan this QR code to access {kid.name}'s profile:</p>
                    <QRCode
                      value={`${window.location.origin}/kid/${kid.id}`}
                      size={150}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p>No children found.</p>
      )}

      {/* -------------------- Section: Pending Reward Redemptions--------------------- */}
      {pendingRedemptions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">
            Pending Reward Redemptions
          </h2>
          <ul className="space-y-3">
            {pendingRedemptions.map((redemption) => (
              <li
                key={redemption.id}
                className="p-4 border rounded shadow bg-yellow-100"
              >
                <p>
                  <strong>{redemption.reward_name}</strong> requested by{" "}
                  <strong>{redemption.kid_name}</strong>
                </p>
                <p>
                  Redeemed on:{" "}
                  {new Date(redemption.redeemed_at).toLocaleDateString()}
                </p>

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600 transition"
                  onClick={() => approveRedemption(redemption.id)}
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
