"use client";
import { useContext } from "react";
import { AuthContext } from "@/app/_contexts/AuthContext";

export const useAuth = () => {
  return useContext(AuthContext);
};