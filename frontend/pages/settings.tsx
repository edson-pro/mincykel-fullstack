import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import React, { useRef, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth.context";
import getFileUrl from "@/lib/getFileUrl";

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
  // Define form schema
  const formSchema = z.object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    bio: z.string().optional(),
    profilePicture: z.any().optional(),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      firstName: user?.firstName || "Ntwali",
      lastName: user?.lastName || "Edson",
      bio:
        user?.bio ||
        `Hey folks, my name is ${user?.firstName} ${user?.lastName}, and I just joined Mincykel. I look forward to riding & renting nice bikes!`,
    },
  });

  const [uploading, setUploading] = useState(false);

  const { loaderUser } = useAuth();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        // Validate image
        if (!file.type.match("image.*")) {
          toast.error("Please upload only jpg, jpeg, or png files.");
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          toast.error("Maximum size is 20MB.");
          return;
        }

        setUploading(true);

        const { data } = await api.post("/sign", {
          fileName: file.name,
          fileType: file.type,
        });

        const response = await fetch(data.signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // Set form value
        await api.put("/auth/update-profile", {
          profileUrl: data.key,
        });

        setUploading(false);
        loaderUser();
      }
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await api.put("/auth/update-profile", values);

      toast.success("Profile updated successfully");
      loaderUser();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="border-b pb-8">
          <h2 className="text-base font-medium mb-4">Profile Picture</h2>
          <div className="flex items-start gap-8">
            <div>
              <Avatar className="w-24 h-24 ">
                <AvatarImage src={getFileUrl(user?.profileUrl)} alt="@shadcn" />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.charAt(0).toUpperCase() +
                    user?.lastName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            <div className="mt-3">
              <p className="text-sm leading-7 text-gray-600 mb-2">
                Please upload only formats as jpg, jpeg, png.
                <br />
                Maximum size is 20mb. Minimum dimension is 100px x 100px.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="px-4 mt-2 text-sm py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  ""
                )}
                Upload new picture
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b pb-8">
          <h2 className="text-base font-medium mb-4">General Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section>
          <h2 className="text-base font-medium mb-4">Profile Bio</h2>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    className="h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="flex justify-end gap-4">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
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
