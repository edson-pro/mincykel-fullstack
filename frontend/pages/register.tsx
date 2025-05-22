"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/auth.context";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/auth.service";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const formSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Phone number is required")
    .label("Email"),
  firstName: yup.string().required().label("First name"),
  lastName: yup.string().required().label("Last name"),
  password: yup.string().required("Password is required").label("Passcord"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .label("Confirm Password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

export default function Register() {
  const form = useForm({
    resolver: yupResolver(formSchema),
    values: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    login();
  };

  const { setCurrentUser } = useAuth();

  const router = useRouter();
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");
  const defaultEmail = searchParams.get("defaultEmail");
  const referralCode = searchParams.get("referralCode");

  useEffect(() => {
    if (defaultEmail) {
      form.setValue("email", defaultEmail);
    }
  }, [defaultEmail]);

  const submit = async (values: any) => {
    setError("");
    try {
      setError("");
      const res = await authService.signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        referralCode,
      });
      setCurrentUser(res);
      router.push(redirect || "/");
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

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response: any = await authService.googleLogin({
          token: tokenResponse.access_token,
          referralCode,
          platform: "web",
        });

        setGoogleLoading(false);

        setCurrentUser(response);

        router.push(redirect || "/");

        toast.success("Login with google successful");
      } catch (error) {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      toast.error("Login with google failed");
      console.log(error);
    },
    flow: "implicit",
  });

  return (
    <div className="md:py-16 px-3 py-6 bg-[#F4F8F6]">
      <div className="w-full max-w-lg mx-auto border rounded-md bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-green-800">
            <span> Create account</span>
          </h1>
          <p className="text-sm max-w-xs leading-7 mx-auto text-slate-500">
            We happy to see you again, to see you ensure you should log in
            first.
          </p>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <Button
            variant="outline"
            className="flex items-center space-x-2 bg-[#1A1D21] hover:bg-[#1A1D21] rounded-full border px-4"
            onClick={() => handleGoogleLogin()}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <>
                <LoaderCircle
                  className="ml-0 mr-2 text-white animate-spin"
                  size={16}
                />
              </>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-[#CCDB3A]">Continue With Google</span>
          </Button>
        </div>
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-[#8396a753]"></div>
          <span className="flex-shrink text-sm mx-4 text-[#8396A7]">
            OR Continue with email
          </span>
          <div className="flex-grow border-t border-[#8396a756]"></div>
        </div>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone">First name</Label>
              <Input
                placeholder="Enter first name"
                value={form.watch("firstName")}
                onChange={(e) =>
                  form.setValue("firstName", e.target.value, {
                    shouldValidate: true,
                  })
                }
                error={form.formState?.errors["firstName"]?.message}
                className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                name="firstName"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Last name</Label>
              <Input
                placeholder="Enter your last name"
                value={form.watch("lastName")}
                onChange={(e) =>
                  form.setValue("lastName", e.target.value, {
                    shouldValidate: true,
                  })
                }
                error={form.formState?.errors["lastName"]?.message}
                className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                name="lastName"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div>
              <Input
                id="email"
                value={form.watch("email")}
                onChange={(e) =>
                  form.setValue("email", e.target.value, {
                    shouldValidate: true,
                  })
                }
                error={form.formState?.errors["email"]?.message}
                className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              onChange={(e) =>
                form.setValue("password", e.target.value, {
                  shouldValidate: true,
                })
              }
              error={form.formState?.errors["password"]?.message}
              value={form.watch("password")}
              className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Re-Type Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Comfirm password"
              onChange={(e) =>
                form.setValue("confirmPassword", e.target.value, {
                  shouldValidate: true,
                })
              }
              error={form.formState?.errors["confirmPassword"]?.message}
              value={form.watch("confirmPassword")}
              className="shadow-none bg-[#e7ede682] mt-2 focus-visible:ring-green-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-green-200 data-[state=checked]:bg-green-800 data-[state=checked]:text-white"
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                I agree with{" "}
                <Link className="text-primary hover:underline" href="/terms">
                  Terms and Conditions
                </Link>
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
            Create your account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Already have an account?</span>{" "}
          <Link
            href={`/login?redirect=${redirect || ""}`}
            className="text-green-600 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
