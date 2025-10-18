// Hook personalizado para acceder fácilmente a información específica del usuario
import { useUser } from './UserContext';

export const useUserInfo = () => {
    const { user, getUserInfo } = useUser();

    return {
        // Información básica del usuario
        userName: user?.name || user?.email?.split('@')[0] || 'Usuario',
        userEmail: user?.email || '',
        userCompany: user?.company || 'Sin empresa',
        userPhone: user?.phone || 'Sin teléfono',
        userRole: user?.role || 'usuario',
        
        // Métodos de conveniencia
        getFullName: () => user?.name || user?.email || 'Usuario Anónimo',
        getDisplayName: () => {
            if (user?.name) return user.name;
            if (user?.email) return user.email.split('@')[0];
            return 'Usuario';
        },
        
        // Verificaciones
        hasCompany: () => Boolean(user?.company),
        hasPhone: () => Boolean(user?.phone),
        isAdmin: () => user?.role === 'admin',
        
        // Acceso directo al usuario completo
        user,
        getUserInfo
    };
};

export default useUserInfo;