import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import authSchema from "../../validations/authSchema";
import { toast } from "react-toastify";
import useUserStore from "../../stores/useUserStore";
import { useState, useEffect } from "react";
import ForgotPasswordPage from "./ForgotPassworkPage";

function LoginPage() {
  const [resetForm, setResetForm] = useState(false);
  const login = useUserStore((state) => state.login);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(authSchema.loginSchema),
    shouldFocusError: true,
  });

  const onLogin = async (data) => {
    try {
      const res = await login(data);
      reset();
      toast.success(res.data.message);
    } catch (error) {
      const errMsg = error?.response?.data?.error || error.message;
      toast.error(errMsg);
    }
  };

  const hdlClose = () => {
    setResetForm(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setResetForm(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <Card className="w-full max-w-md backdrop-blur-md bg-white/20 border border-white/30">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        {/* ✅ FORM ครอบทั้ง CardContent + Footer */}
        <form onSubmit={handleSubmit(onLogin)} disabled={isSubmitting}>
          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="bg-white text-black placeholder-gray-400"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="hover:underline hover:text-blue-500 hover:cursor-pointer text-sm text-gray-500"
                    onClick={() => setResetForm(true)}
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="bg-white text-black placeholder-gray-400"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full hover:cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <Link to="/" className="w-full">
              <Button variant="outline" className="w-full hover:cursor-pointer">
                Go to HomePage
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>

      {/* ✅ MODAL Forgot Password */}
      {resetForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
              onClick={hdlClose}
            >
              ✕
            </button>

            <ForgotPasswordPage resetForm={resetForm} onClose={hdlClose} />
          </div>
        </div>
      )}
    </>
  );
}

export default LoginPage;
