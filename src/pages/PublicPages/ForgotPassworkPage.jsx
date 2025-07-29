import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import authSchema from "../../validations/authSchema";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import authToApi from "../../api/adminApi";

function ForgotPasswordPage({ resetForm, onClose }) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(authSchema.forgotPassword),
    shouldFocusError: true,
  });

  const forgotPassword = async (data) => {
    const res = await authToApi.forgotPassword(data);
    return res;
  };

  useEffect(() => {
    reset(); // reset form เมื่อเปิดใหม่
  }, [resetForm]);

  const onForgot = async (data) => {
    try {
      const res = await forgotPassword(data);
      reset();
      toast.success(res.data.message);
      onClose(); // Close the modal after successful submission
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      toast.error(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onForgot)}>
      <fieldset className="space-y-5" disabled={isSubmitting}>
        {/* Email Field */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-white text-black placeholder-gray-400"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 animate-spin">🔄</span>Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </fieldset>
    </form>
  );
}

export default ForgotPasswordPage;
