import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button, Box, Text, HStack, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [parentName, setParentName] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchParentName = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("soc_final_parents")
          .select("name")
          .eq("auth_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching parent name:", error);
          return;
        }

        setParentName(data?.name || "");
      } catch (error) {
        console.error("Error fetching parent name:", error);
      }
    };

    fetchParentName();
  }, [user]);

  const handleLogout = async () => {
    await logout(() => navigate("/"));
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <Box position="relative">
      <HStack
        p={8}
        backgroundColor={"#80CBC4"}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        width="100vw"
        height="100px"
        position="sticky"
        top="0"
        zIndex="1000"
      >
        {/*------------------------- Left: Navigation Links ----------------------*/}
        <Box display={{ base: "none", md: "flex" }} gap={2}>
          <Button
            backgroundColor={"purple"}
            onClick={() => navigate("/Dashboard")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
          >
            Dashboard
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => navigate("/Tasks")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
          >
            Tasks
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => navigate("/Rewards")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
          >
            Rewards
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => navigate("/Parent")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
          >
            Profile
          </Button>
        </Box>

        {/*---------------------- Mobile Hamburger Menu --------------------------*/}
        <Box display={{ base: "flex", md: "none" }} alignItems="center">
          <Button
            onClick={toggleMenu}
            variant="ghost"
            color="purple"
            aria-label="Toggle Menu"
            _hover={{
              color: "indigo",
              bg: "#B4EBE6",
            }}
          >
            {isMenuOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
          </Button>
        </Box>

        {/*------------------------- Right: Auth Controls ---------------------------*/}
        <Box display={{ base: "none", md: "flex" }} gap={2}>
          {!user ? (
            <>
              <Button
                backgroundColor={"purple"}
                onClick={() => navigate("/Login")}
                fontFamily="Inter, sans-serif"
                _hover={{ backgroundColor: "indigo" }}
                gap={2}
              >
                Login
              </Button>
              <Button
                backgroundColor={"purple"}
                onClick={() => navigate("/Sign Up")}
                fontFamily="Inter, sans-serif"
                _hover={{ backgroundColor: "indigo" }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Box display="flex" gap={5}>
              <Text mt={1.5}>Welcome, {parentName || "Guest"}</Text>
              <Button
                backgroundColor={"purple"}
                onClick={handleLogout}
                fontFamily="Inter, sans-serif"
                _hover={{ backgroundColor: "indigo" }}
                color="white"
              >
                Log Out
              </Button>
            </Box>
          )}
        </Box>
      </HStack>

      {/*-------------------------- Mobile Menu Dropdown -------------------------*/}
      {isMenuOpen && (
        <VStack
          display={{ base: "flex", md: "none" }}
          position="absolute"
          top="100px"
          left="0"
          right="0"
          backgroundColor={"#80CBC4"}
          zIndex="999"
          p={4}
          width="100vw"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
        >
          <Button
            backgroundColor={"purple"}
            onClick={() => handleNavigation("/Dashboard")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
            width="100%"
          >
            Dashboard
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => handleNavigation("/Tasks")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
            width="100%"
          >
            Tasks
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => handleNavigation("/Rewards")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
            width="100%"
          >
            Rewards
          </Button>
          <Button
            backgroundColor={"purple"}
            onClick={() => handleNavigation("/Parent")}
            fontFamily="Inter, sans-serif"
            _hover={{ backgroundColor: "indigo" }}
            color="white"
            width="100%"
          >
            Profile
          </Button>
          {user && (
            <Button
              backgroundColor={"purple"}
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              fontFamily="Inter, sans-serif"
              _hover={{ backgroundColor: "indigo" }}
              color="white"
              width="100%"
            >
              Log Out
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default NavBar;
