import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (error) {
                console.error("Error parsing user data:", error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    return { user, loading };
};
