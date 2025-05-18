import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";

export const withAuth = (
  WrappedComponent: React.ComponentType,
  allowedRoles: UserRole[] = []
) => {
  const AuthWrapper: React.FC = (props) => {
    const router = useRouter();
    const { user, isLoading, checkAuth } = useAuthStore();

    useEffect(() => {
      const checkAuthentication = async () => {
        await checkAuth();
      };

      checkAuthentication();
    }, [checkAuth]);

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          // Перенаправление на страницу входа, если пользователь не авторизован
          router.replace("/login");
        } else if (
          allowedRoles.length > 0 &&
          !allowedRoles.includes(user.role)
        ) {
          // Перенаправление в зависимости от роли, если текущая страница не доступна
          switch (user.role) {
            case UserRole.ADMIN:
              router.replace("/admin");
              break;
            case UserRole.CURATOR:
              router.replace("/curator");
              break;
            case UserRole.TEACHER:
              router.replace("/teacher");
              break;
            case UserRole.STUDENT:
              router.replace("/student");
              break;
            default:
              router.replace("/login");
          }
        }
      }
    }, [user, isLoading, router, allowedRoles]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      );
    }

    // Если пользователь авторизован и имеет нужную роль, показываем компонент
    if (
      user &&
      (allowedRoles.length === 0 || allowedRoles.includes(user.role))
    ) {
      return <WrappedComponent {...props} />;
    }

    // По умолчанию возвращаем null (будет выполнен редирект в useEffect)
    return null;
  };

  return AuthWrapper;
};
