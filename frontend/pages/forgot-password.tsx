"use client";

import type React from "react";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import authService from "@/services/auth.service";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import Alert from "@/components/ui/alert";
import { LoaderCircle } from "lucide-react";

const formSchema = yup.object().shape({
  email: yup.string().email().required("Email is required").label("Email"),
});

export default function ForgotPassword() {
  const router = useRouter();

  const form = useForm({
    resolver: yupResolver(formSchema),
    values: {
      email: "",
    },
  });

  const searchParams = useSearchParams();

  const { setCurrentUser } = useAuth();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (values: any) => {
    setError("");
    try {
      setError("");
      await authService.forgotPassword({
        email: values.email,
      });
      setSuccess("Password reset link sent successfully, check your email");
    } catch (e) {
      setError(e?.response?.data?.message || "An error occured");
      const errors = e?.response?.data?.meta?.errors || {};
      Object.keys(errors)?.forEach((field: any) => {
        form.setError(field, {
          message: errors[field],
        });
      });
    }
  };

  return (
    <div>
      <div className="md:py-24 py-6 p-4 bg-[#F4F8F6]">
        <div className="w-full max-w-md mx-auto border rounded-md bg-white p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-xl font-semibold text-green-800">
              Forgot Password
            </h1>
            <p className="text-sm max-w-xs leading-7 mx-auto text-slate-500">
              Enter your email address and we will send you a link to reset your
              password.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            {error && !Object.keys(form.formState?.errors).length && (
              <Alert variant="danger">{error}</Alert>
            )}
            {success && (
              <div className="mb-4">
                <Alert variant="success">{success}</Alert>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.watch("email")}
                  onChange={(e) => form.setValue("email", e.target.value)}
                  error={form.formState?.errors["email"]?.message}
                  className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  className="border-green-200 data-[state=checked]:bg-green-800 data-[state=checked]:text-white"
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  I agree to the terms and conditions
                </Label>
              </div>
            </div>

            <Button
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(submit)}
              className="w-full bg-green-800 hover:bg-green-900"
            >
              {form.formState.isSubmitting && (
                <LoaderCircle className="-ms-1 me-2 animate-spin" size={16} />
              )}
              Send reset password link
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don&apos;t have an account?</span>{" "}
            <Link href="/register" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
