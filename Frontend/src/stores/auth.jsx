import {
  createContext,
  useContext,
  createSignal,
  createEffect,
} from "solid-js";

const AuthContext = createContext();

function loadStoredUser() {
  const candidate = sessionStorage.getItem("candidateUser");
  const employer = sessionStorage.getItem("employerUser");
  const admin = sessionStorage.getItem("adminUser");
  if (candidate) return JSON.parse(candidate);
  if (employer) return JSON.parse(employer);
  if (admin) return JSON.parse(admin);
  return null;
}

export function AuthProvider(props) {
  const [user, setUser] = createSignal(loadStoredUser());
  const [toast, setToast] = createSignal(null);

  createEffect(() => {
    const u = user();
    if (u?.role === "candidate") {
      sessionStorage.setItem("candidateUser", JSON.stringify(u));
      sessionStorage.removeItem("employerUser");
      sessionStorage.removeItem("adminUser");
    } else if (u?.role === "employer") {
      sessionStorage.setItem("employerUser", JSON.stringify(u));
      sessionStorage.removeItem("candidateUser");
      sessionStorage.removeItem("adminUser");
    } else if (u?.role === "admin") {
      sessionStorage.setItem("adminUser", JSON.stringify(u));
      sessionStorage.removeItem("candidateUser");
      sessionStorage.removeItem("employerUser");
    } else if (!u) {
      sessionStorage.removeItem("candidateUser");
      sessionStorage.removeItem("employerUser");
      sessionStorage.removeItem("adminUser");
    }
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const login = (data) => {
    if (data.role === "admin") {
      setUser(data);
      sessionStorage.setItem("adminUser", JSON.stringify(data));
      sessionStorage.removeItem("candidateUser");
      sessionStorage.removeItem("employerUser");
      window.location.href = "/";
      return;
    }
    setUser(data);
    showToast(
      `¡Bienvenido, ${data.first_name}! 👋 Sesión iniciada correctamente.`,
    );
  };

  const logout = () => {
    setUser(null);
    showToast("Sesión cerrada");
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    toast,
    showToast,
    isLoggedIn: () => !!user(),
  };

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
