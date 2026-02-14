import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged, 
    User,
    AuthError
} from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const clearError = () => setError(null);

    const signInWithGoogle = async () => {
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            console.error("Error signing in with Google", err);
            const authError = err as AuthError;
            
            if (authError.code === 'auth/unauthorized-domain') {
                let domain = window.location.hostname;
                // Fallback: se hostname è vuoto, prova host o origin
                if (!domain) domain = window.location.host;
                if (!domain) domain = window.location.origin;

                setError(`⚠️ Dominio Non Autorizzato: "${domain || 'Sconosciuto'}"\n\nDevi autorizzare questo dominio su Firebase:\n1. Vai su Firebase Console -> Authentication -> Settings -> Authorized Domains\n2. Aggiungi il dominio: ${domain || 'localhost'}\n3. Ricarica la pagina.`);
            } else if (authError.code === 'auth/popup-closed-by-user') {
                setError("Login annullato dall'utente.");
            } else if (authError.code === 'auth/popup-blocked') {
                setError("Popup bloccato. Per favore consenti i popup per questo sito nelle impostazioni del browser.");
            } else if (authError.code === 'auth/cancelled-popup-request') {
                // Ignora conflitti di popup multipli
            } else {
                setError(`Login Fallito: ${authError.message}`);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setError(null);
        } catch (err: any) {
            console.error("Error signing out", err);
            setError(err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, error, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};