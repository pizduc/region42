import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isSpecialUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSpecialUser, setIsSpecialUser] = useState(false);

  useEffect(() => {
    const userAddress = localStorage.getItem("userAddress");
    const specialUser = localStorage.getItem("isSpecialUser") === "true";
    
    setIsAuthenticated(!!userAddress);
    setIsSpecialUser(specialUser);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isSpecialUser }}>
      {children}
    </AuthContext.Provider>
  );
};