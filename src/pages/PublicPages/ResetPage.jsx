import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import authSchema from "@/src/validations/authSchema";
import { useNavigate, useParams } from "react-router";
import authToApi from "../../api/publicApi";

function ResetPage() {
  const { token } = useParams(); // Get the token from the URL
  const navi = useNavigate();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(authSchema.resetPassword),
    shouldFocusError: true,
  });
  const resetPassword = async (data) => {
    const res = await authToApi.resetPassword(token, data);
    return res;
  };
  const onSubmit = async (data) => {
    try {
      const res = await resetPassword(data);
      reset(); // Reset form after successful submission
      toast.success(res.data.message);
      navi("/login"); // Redirect to login page after successful reset
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      toast.error(errMsg);
    }
  };

  return (
    <div className="w-100 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password and confirm it below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ResetPage;
