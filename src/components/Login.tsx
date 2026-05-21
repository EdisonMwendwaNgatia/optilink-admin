import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-hot-toast";
import { Shield, Mail, Lock } from "lucide-react";
import type { FirebaseError } from "firebase/app";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
    } catch (err: unknown) {
      const error = err as FirebaseError;

      let errorText = "Login failed. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          errorText = "Invalid email format";
          break;
        case "auth/user-disabled":
          errorText = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorText = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorText = "Incorrect password";
          break;
        case "auth/too-many-requests":
          errorText = "Too many failed attempts. Try again later";
          break;
        case "auth/network-request-failed":
          errorText = "Network error. Check your connection";
          break;
      }

      setErrorMessage(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <Shield className="w-10 h-10 text-blue-400 mx-auto mb-2" />
          <h1 className="text-2xl text-white font-bold">Admin Login</h1>
        </div>

        {errorMessage && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                className="w-full pl-10 py-2 bg-slate-800 text-white rounded-lg"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              <input
                className="w-full pl-10 py-2 bg-slate-800 text-white rounded-lg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}