import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const useAuthStore = create((set)=>({
    user: null,
    token: null,
    isLoading: false,

    register: async (firstName,lastName,email,password) => {
        set({ isLoading : true});

        try {
            const response= await fetch("https://locato-backend.onrender.com/api/users/signup", {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
             },

             body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
             }),
            })

            const data = await response.json();
            if(!response.ok) throw new Error(data.message || "Somthing went wrong");

            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({ token: data.token, user: data.user, isLoading: false });
               
            return{ success: true};
            
        } catch (error) {
            set({ isLoading: false});
            return { success: false, error: error.message};
        }
    },



    login: async (email, password) => {
  set({ isLoading: true });
  try {
    const response = await fetch(
      "https://locato-backend.onrender.com/api/users/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
    await AsyncStorage.setItem("token", data.token); 
    set({ 
      token: data.token, 
      user: data.user, 
      isLoading: false 
    });

    return { success: true };
  } catch (error) {
    set({ isLoading: false });
    return { success: false, error: error.message };
  }
},



    
}))