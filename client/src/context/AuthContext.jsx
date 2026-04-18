import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    const { getToken } = useClerkAuth();
    const { signOut } = useClerk();

    const value = {
        user: isSignedIn ? user : null,
        loading: !isLoaded,
        getToken,
        signOut: () => signOut()
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
