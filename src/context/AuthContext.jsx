import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebaseConfig";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile({
              uid: user.uid,
              ...snapshot.val(),
            });
          } else {
            setUserProfile({
              uid: user.uid,
              role: "employee",
              nama: user.email,
            });
          }
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);
  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin: userProfile?.role === "admin",
    isSecurity: userProfile?.role === "security",
    isEmployee: userProfile?.role === "employee",
    isWarehouse: userProfile?.role === "warehouse",
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-steel-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gate-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-steel-400 font-body text-sm tracking-widest uppercase">
            Memuat SmartGate...
          </p>
        </div>
      </div>
    );
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  return useContext(AuthContext);
}
