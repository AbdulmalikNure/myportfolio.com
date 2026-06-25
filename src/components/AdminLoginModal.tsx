import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, LogIn } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal = ({ isOpen, onClose }: AdminLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store access token
        localStorage.setItem("access_token", data.data.accessToken);
        
        toast({
          title: "Login Successful!",
          description: "Redirecting to admin dashboard...",
        });

        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = "http://localhost:5174";
        }, 1000);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="admin-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Login"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md card-glass rounded-3xl shadow-2xl border border-border/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-border/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center glow">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Admin Login
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Secret access portal
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/60 hover:bg-secondary
                               flex items-center justify-center text-muted-foreground hover:text-foreground
                               transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="admin-email"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/60
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               text-foreground placeholder:text-muted-foreground
                               transition-all duration-200 outline-none"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/60
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               text-foreground placeholder:text-muted-foreground
                               transition-all duration-200 outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2
                             bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90
                             text-white font-semibold py-3 px-6 rounded-xl
                             transition-all duration-200 hover:scale-[1.02] glow
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="px-8 pb-6">
                <p className="text-center text-xs text-muted-foreground">
                  🔒 Secure admin access only
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
