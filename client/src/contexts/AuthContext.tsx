import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  position: string;
  department: string;
  manager?: string;
  phone?: string;
  address?: string;
  joinDate: string;
  status: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  personalLeaveBalance: number;
  emergencyLeaveBalance: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      console.log("User authenticated:", user);
    } else if (error) {
      setIsAuthenticated(false);
      console.log("User not authenticated:", error);
    }
  }, [user, error]);

  // Debug authentication state changes
  useEffect(() => {
    console.log("Authentication state changed:", isAuthenticated);
  }, [isAuthenticated]);

  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiRequest("POST", "/api/auth/login", credentials),
    onSuccess: (data) => {
      // Immediately set authenticated state
      setIsAuthenticated(true);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Gagal",
        description: error.message || "Email atau password salah",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem",
      });
    },
    onError: () => {
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      
      // Force refetch user data immediately after login
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
    } catch (error) {
      // Error is already handled in mutation
      throw error;
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextType = {
    user: user as User | null,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 