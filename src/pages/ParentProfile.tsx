import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Parent, Kid } from "../types/database";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Box, Heading, Text, Image, Stack, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ParentProfile = () => {
  const [parent, setParent] = useState<Parent | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParentAndKids = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.user) {
        console.error("User not authenticated", userError);
        return;
      }

      const userEmail = user.user.email;

      const { data: parentData, error: parentError } = await supabase
        .from("soc_final_parents")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();

      if (parentError) {
        console.error(parentError);
        return;
      }

      setParent(parentData);

      if (parentData) {
        const { data: kidsData, error: kidsError } = await supabase
          .from("soc_final_kids")
          .select("*")
          .eq("parent_id", parentData.id);

        if (kidsError) {
          console.error(kidsError);
        } else {
          setKids(kidsData || []);
        }
      }
    };

    fetchParentAndKids();
  }, []);

  const handleKidClick = (kidId: number) => {
    navigate(`/kid/${kidId}`);
  };

  if (!parent) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <Box
        w="100vw"
        h="100vh"
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        justifyContent="flex-start"
        alignItems="flex-start"
        p={6}
      >
        <Box
          w={{ base: "90%", md: "65%" }}
          mt={6}
          ml={{ base: 0, md: 6 }}
          p={6}
          borderRadius="md"
          bg="white"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", md: "column" }}
            alignItems="center"
            gap={6}
            bg="transparent"
            color="black"
          >
            <Stack align="center" bg="transparent">
              <Heading
                as="h2"
                size="lg"
                mb={4}
                textAlign="center"
                p={3}
                borderRadius="md"
                w={{ base: "90%", md: "100%" }}
                borderWidth="2px"
                borderColor="#80CBC4"
              >
                Account Details
              </Heading>

              <Image
                src="https://treemily.com/wp-content/uploads/2024/07/Despicable-Me-Felonius-Gru-1024x552.jpg"
                boxSize={{ base: "15vh", md: "10vh" }}
                borderRadius="full"
                fit="cover"
                alt="Picture of Gru"
                bg="transparent"
              />
            </Stack>
            <Box textAlign={{ base: "center", md: "left" }} bg="transparent">
              <Text fontSize={{ base: "md", md: "lg" }} bg="transparent">
                <Text as="span" fontWeight="bold" bg="transparent">
                  Name:
                </Text>{" "}
                {parent.name}
              </Text>
              <Text fontSize={{ base: "md", md: "lg" }} bg="transparent">
                <Text as="span" fontWeight="bold" bg="transparent">
                  Email:
                </Text>{" "}
                {parent.email}
              </Text>
            </Box>
          </Box>

          <Box
            mt={6}
            bg="transparent"
            w="50%"
            flexDirection={{ base: "column", md: "column" }}
          >
            <Heading
              as="h2"
              size="lg"
              mb={4}
              textAlign="center"
              p={3}
              borderRadius="md"
              borderWidth="2px"
              borderColor="#80CBC4"
              color="black"
            >
              My Children
            </Heading>
            {kids.map((kid) => (
              <Box
                key={kid.id}
                bg="white"
                color="black"
                p={3}
                borderRadius="md"
                border="1px solid #80CBC4"
                mb={2}
                cursor="pointer"
                onClick={() => handleKidClick(kid.id)}
                _hover={{
                  bg: "#B4EBE6",
                  color: "white",
                }}
                shadow="md"
              >
                <Text fontWeight="bold" bg="inherit" color="inherit">
                  {kid.name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          w={{ base: "90%", md: "30%" }}
          h="90vh"
          mt={6}
          ml={{ base: 0, md: 6 }}
          bg="#80CBC4"
          p={6}
          borderRadius="md"
          display="flex"
          flexDirection="column"
        >
          <Heading
            as="h2"
            size="lg"
            mb={4}
            textAlign="center"
            p={3}
            borderRadius="md"
            borderWidth="2px"
            borderColor="#80CBC4"
          >
            Actions
          </Heading>
          <Stack align="center" bg="#80CBC4">
            <Button
              colorScheme="teal"
              variant="solid"
              w="full"
              _hover={{
                bg: "#B4EBE6",
                color: "white",
              }}
              border="1px solid #80CBC4"
              shadow="md"
            >
              Edit Profile
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              w="full"
              _hover={{
                bg: "#B4EBE6",
                color: "white",
              }}
              border="1px solid #80CBC4"
              shadow="md"
            >
              View Reports
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              w="full"
              _hover={{
                bg: "#B4EBE6",
                color: "white",
              }}
              border="1px solid #80CBC4"
              shadow="md"
            >
              Settings
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              w="full"
              _hover={{
                bg: "#B4EBE6",
                color: "white",
              }}
              border="1px solid #80CBC4"
              shadow="md"
            >
              View Reports
            </Button>
            <Button
              colorScheme="teal"
              variant="solid"
              w="full"
              _hover={{
                bg: "#B4EBE6",
                color: "white",
              }}
              border="1px solid #80CBC4"
              shadow="md"
            >
              Child Settings
            </Button>
          </Stack>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default ParentProfile;
