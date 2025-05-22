"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import Link from "next/link";
import Alert from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";

const formSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .label("Password"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .label("Confirm Password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm({
    resolver: yupResolver(formSchema),
    values: {
      password: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: any) => {
    setError("");
    setLoading(true);
    try {
      setError("");
      await authService.resetPassword({
        token,
        password: values.password,
      });
      setSuccess(
        "Password reset successfully! You can now login with your new password."
      );
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (e) {
      setError(e?.response?.data?.message || "An error occurred");
      const errors = e?.response?.data?.meta?.errors || {};
      Object.keys(errors)?.forEach((field: any) => {
        form.setError(field, {
          message: errors[field],
        });
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center py-62 bg-[#F4F8F6]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Invalid Password Reset Link
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            The password reset link is invalid or has expired. Please request a
            new password reset link.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/forgot-password")}
          >
            Request New Password Reset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:py-24 py-6 p-4 bg-[#F4F8F6]">
        <div className="w-full max-w-md mx-auto border rounded-md bg-white p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-xl font-semibold text-green-800">
              Reset Password
            </h1>
            <p className="text-sm max-w-xs leading-7 mx-auto text-slate-500">
              Enter your new password below to reset your account password.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            {error && !Object.keys(form.formState?.errors).length && (
              <div className="mb-4">
                <Alert variant="danger">{error}</Alert>
              </div>
            )}
            {success && (
              <div className="mb-4">
                <Alert variant="success">{success}</Alert>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={form.watch("password")}
                  onChange={(e) =>
                    form.setValue("password", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  error={form.formState?.errors["password"]?.message}
                  className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={form.watch("confirmPassword")}
                  onChange={(e) =>
                    form.setValue("confirmPassword", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  error={form.formState?.errors["confirmPassword"]?.message}
                  className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-800 hover:bg-green-900"
              disabled={loading}
            >
              {loading && (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              )}
              Reset Password
            </Button>

            <div className="text-center text-sm text-gray-500 mt-1">
              <p>
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-green-600 hover:text-green-700"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
