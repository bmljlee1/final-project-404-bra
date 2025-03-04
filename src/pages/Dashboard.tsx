import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import QRCode from "react-qr-code"; // ✅ Import react-qr-code

interface Kid {
  id: number;
  name: string;
  currency: number;
}

export default function Dashboard() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeKidId, setQrCodeKidId] = useState<number | null>(null); // ✅ Store the selected kid for QR generation

  useEffect(() => {
    const fetchKids = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Step 1: Get logged-in user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) throw new Error(userError.message);
        if (!userData?.user) throw new Error("User not logged in.");

        const authUserId = userData.user.id;

        // ✅ Step 2: Get parent ID
        const { data: parentData, error: parentError } = await supabase
          .from("soc_final_parents")
          .select("id")
          .eq("auth_id", authUserId)
          .single();

        if (parentError) throw new Error("Parent not found.");

        const parentId = parentData.id;

        // ✅ Step 3: Fetch kids for the parent
        const { data: kidsData, error: kidsError } = await supabase
          .from("soc_final_kids")
          .select("id, name, currency")
          .eq("parent_id", parentId);

        if (kidsError) throw new Error("Error fetching children.");

        setKids(kidsData || []);
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

    fetchKids();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Parent Dashboard</h1>

      {loading && <p>Loading children...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {kids.length === 0 && !loading && <p>No children found.</p>}

      {kids.length > 0 && (
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

                {/* ✅ "Give Access" Button to Generate QR Code */}
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  onClick={() => setQrCodeKidId(kid.id)}
                >
                  Give Access
                </button>

                {/* ✅ QR Code Section (Only Show When a Kid is Selected) */}
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
      )}
    </div>
  );
}
