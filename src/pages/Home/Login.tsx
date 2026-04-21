/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ShoppingCart, Mail, Lock, X } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Checkbox } from "../../components/ui/Checkbox";
import { Spinner } from "../../components/ui/Spinner";
import { useProvider } from "../../context/Provider";
import { toast } from "../../components/ui/Toast";
import { useMutation } from "@tanstack/react-query";

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (data: any) => void;
}

export function Login({ isOpen, onClose, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});
  const { login } = useProvider();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 3) {
      newErrors.password = "Password must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: e.target.value.trim() ? undefined : "Username is required",
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) {
      const value = e.target.value;
      let error: string | undefined;
      if (!value) {
        error = "Password is required";
      } else if (value.length < 3) {
        error = "Password must be at least 3 characters";
      }
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email" && !email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Username is required" }));
    }
    if (field === "password") {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
      } else if (password.length < 3) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 3 characters",
        }));
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: (data: any) => {
      if (data && data.status) {
        localStorage.setItem("token", data.token);
        console.log("Login successful", data);
        onLoginSuccess(data);
      } else {
        console.error("Login failed", data?.message);
        toast.error(data?.message || "Invalid email or password", {
          title: "Login Failed",
        });
      }
    },
    onError: (error: any) => {
      console.error("Login error", error);
      toast.error(error?.message || "An error occurred. Please try again.", {
        title: "Login Error",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (validateForm()) {
      mutation.mutate({ email, password });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      hideClose
      // autoClose
      comingFrom="center"
      hasBlur={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-(--primary) text-(--primary-foreground) rounded-2xl flex items-center justify-center shadow-lg transform">
              <ShoppingCart className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Welcome Back
          </h2>
          <p className="text-(--text-secondary) text-sm">
            Please enter your details to sign in
          </p>
        </div>
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9.5 w-9.5 rounded-full ml-auto hover:font-semibold active:scale-95 transition-transform"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="font-semibold text-sm text-(--text-primary)"
            >
              Email
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              leftIcon={<Mail size={18} className="text-(--text-muted)" />}
              value={email}
              onChange={handleUsernameChange}
              onBlur={() => handleBlur("email")}
              hasError={!!errors.email}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="font-semibold text-sm text-(--text-primary)"
            >
              Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={18} className="text-(--text-muted)" />}
              togglePosition="right"
              toggleVariant="icon"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              hasError={!!errors.password}
            />
          </div>

          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" size="sm" />
            <button
              type="button"
              className="text-sm text-(--primary) hover:underline font-medium transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" variant="pulse" color="white" />
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Powered by */}
        <div className="text-center pt-2">
          <p className="text-xs text-(--text-muted)">
            Powered by{" "}
            <span className="font-semibold text-(--text-primary)">
              QuickPOS
            </span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
