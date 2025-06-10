import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import React from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Account Settings</h1>

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6 min-h-[50vh]">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "account_security" && <AccountSection />}
          {activeTab === "address_book" && <AddressSettings />}
        </div>
      </div>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import AddressSettings from "@/components/AddressSettings";

// Define the form schema
const formSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: "Current password must be at least 6 characters.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function AccountSection() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await api.put("/auth/change-password", values);
      toast.success("Password changed successfully");
      form.reset();
    } catch (error) {
      const errors = error?.response?.data?.meta?.errors || {};
      toast.error(error.message);
      Object.keys(errors)?.forEach((field: any) => {
        form.setError(field, {
          message: errors[field],
        });
      });
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-base text-[#124A01] font-medium mb-5">
        Change Password
      </h2>
      <div className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password Field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      error={fieldState.error?.message}
                      type="password"
                      placeholder="Enter current password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* New Password Field */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      error={fieldState.error?.message}
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      error={fieldState.error?.message}
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-medium mt-2 bg-green-800 hover:bg-green-900 text-white py-2 rounded-md"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                ""
              )}
              Change Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-8">
      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">Profile Picture</h2>
        <div className="flex items-start gap-8">
          <div>
            <div className="w-32 h-32 bg-pink-500 rounded-full flex items-center justify-center text-white text-4xl">
              N
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm leading-7 text-gray-600 mb-2">
              Please upload only formats as jpg, jpeg, png.
              <br />
              Maximum size is 20mb. Minimum dimension is 100px x 100px.
            </p>
            <button className="px-4 mt-2 text-sm py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Upload new picture
            </button>
          </div>
        </div>
      </section>

      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">General Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue="Ntwali"
              className="w-full py-2 px-3 text-sm border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue="Edson"
              className="w-full py-2 px-3 text-sm border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button>Update Profile</Button>
        </div>
      </section>

      <section>
        <h2 className="text-base font-medium mb-4">Profile Bio</h2>
        <textarea
          className="w-full text-sm p-3 border rounded-lg h-32"
          placeholder="Tell us about yourself..."
          defaultValue="Hey folks, my name is Ntwali, and I just joined ListNRide. I look forward to riding & renting nice bikes!"
        />
        <div className="mt-3">
          <Button>Update Bio</Button>
        </div>
      </section>
    </div>
  );
}

function SettingsTabs({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: "profile", label: "Profile Information" },
    { id: "account_security", label: "Account security" },
    { id: "address_book", label: "Address Book" },
  ];

  return (
    <div className="border-b">
      <nav className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-3 ${
              activeTab === tab.id
                ? "border-b-[3px] border-primary text-primary font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function AddressBookSection() {
  return <div>AddressBookSection</div>;
}
