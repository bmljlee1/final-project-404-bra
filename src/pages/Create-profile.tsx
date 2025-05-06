import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Box, Heading, Input, Button, Text } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [parent2Name, setParent2Name] = useState("");
  const [kids, setKids] = useState([{ name: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validatePassword = () => {
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError(null);

    if (!validatePassword()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw new Error(error.message);

      const authUserId = data?.user?.id;
      if (!authUserId)
        throw new Error("User creation failed. Please try again.");

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .insert([
          {
            name: parentName,
            name2: parent2Name || null,
            email,
            auth_id: authUserId,
          },
        ])
        .select("id")
        .single();

      console.log("Parent Insert Data:", parentData);
      console.log("Parent Insert Error:", parentError);

      if (parentError || !parentData)
        throw new Error("Error creating parent account.");

      const parentId = parentData.id;

      const kidInserts = kids
        .filter((kid) => kid.name.trim() !== "")
        .map((kid) => ({
          parent_id: parentId,
          name: kid.name,
        }));

      if (kidInserts.length > 0) {
        const { error: kidError } = await supabase
          .from("soc_final_kids")
          .insert(kidInserts);
        if (kidError) {
          console.error("Error inserting kids:", kidError);
          throw new Error("Error inserting kids.");
        }
      }

      setLoading(false);
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100vh"
      px={4}
      bg="#80CBC4"
    >
      <Button
        position="absolute"
        top="2.5%"
        left="2.5%"
        backgroundColor="#80cbc4"
        onClick={() => navigate("/")}
        _hover={{
          scale: "1.5",
          transform: "scale(1.01)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <FaArrowLeft />
      </Button>
      <Box
        p={12}
        borderWidth="1px"
        shadow="lg"
        borderRadius="xl"
        maxW="md"
        w="full"
        bg="white"
      >
        <Heading
          fontSize="1.875rem"
          fontWeight="bold"
          textAlign="center"
          mb={6}
        >
          Create Your Profile
        </Heading>

        {error && (
          <Text color="red.500" fontSize="sm" mb={4}>
            {error}
          </Text>
        )}

        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          mb={3}
          shadow="md"
          bg="white"
          _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
          required
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={3}
          shadow="md"
          bg="white"
          _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
          required
        />
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          mb={3}
          shadow="md"
          bg="white"
          _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
          required
        />

        <Heading fontSize="lg" fontWeight="bold" mb={2}>
          Parent Information
        </Heading>
        <Input
          placeholder="Parent 1 Name"
          type="text"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          mb={3}
          shadow="md"
          bg="white"
          _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
          required
        />
        <Input
          placeholder="Parent 2 Name (Optional)"
          type="text"
          value={parent2Name}
          onChange={(e) => setParent2Name(e.target.value)}
          mb={3}
          shadow="md"
          bg="white"
          _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
        />

        <Heading fontSize="lg" fontWeight="bold" mb={2}>
          Children Information
        </Heading>
        {kids.map((kid, index) => (
          <Input
            key={index}
            placeholder="Child's Name"
            type="text"
            value={kid.name}
            onChange={(e) =>
              setKids(
                kids.map((child, i) =>
                  i === index ? { ...child, name: e.target.value } : child
                )
              )
            }
            mb={3}
            shadow="md"
            bg="white"
            _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
            required
          />
        ))}

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          color="black"
          shadow="md"
          disabled={loading}
          bg="white"
          justifyContent="center"
          alignItems="center"
          _hover={{ bg: "#B4EBE6" }}
          mt={2}
        >
          + Add Another Child
        </Button>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          color="black"
          shadow="md"
          disabled={loading}
          bg="white"
          justifyContent="center"
          alignItems="center"
          _hover={{ bg: "#B4EBE6" }}
          mt={2}
          onClick={handleSignUp}
        >
          {loading ? "Creating Profile..." : "Sign Up & Create Profile"}
        </Button>
        <Text fontFamily={"poppins"} textAlign={"center"} marginTop="10px">
          Already have an account?{" "}
          <p onClick={() => navigate("/login")}>
            <Text
              as="span"
              cursor="pointer"
              textDecoration="underline"
              color="blue.500"
            >
              Sign In
            </Text>
          </p>
        </Text>
      </Box>
    </Box>
  );
}
