import { useState } from "react";
import { signIn } from "../utils/auth";
import { Field, Input, Box, Button, Heading, Text } from "@chakra-ui/react";
import { FaArrowLeft } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);
    setLoading(false);

    console.log(data);

    if (error) {
      setError(error.message);
    } else {
      await refreshUser();
      navigate("/dashboard");
    }
  };

  return (
    <>
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
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Login
          </Heading>

          {error && (
            <Box color="red.500" fontSize="sm" mb={4}>
              {error}
            </Box>
          )}

          <form onSubmit={handleSignIn} className="w-full">
            <Field.Root>
              <Field.Label>
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="Email"
                variant="subtle"
                type="email"
                shadow="md"
                bg="white"
                value={email}
                _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                placeholder="Password"
                variant="subtle"
                type="password"
                shadow="md"
                value={password}
                bg="white"
                _hover={{ borderColor: "#B4EBE6", borderWidth: "1px" }}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Field.HelperText />
              <Field.ErrorText />
            </Field.Root>
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
              {" "}
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Text fontFamily={"poppins"} textAlign={"center"} marginTop="10px">
              Don't have an account?{" "}
              <p onClick={() => navigate("/create-profile")}>
                <Text
                  as="span"
                  cursor="pointer"
                  textDecoration="underline"
                  color="blue.500"
                >
                  Sign Up
                </Text>
              </p>
            </Text>
          </form>
        </Box>
      </Box>
    </>
  );
}
