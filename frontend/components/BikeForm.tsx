import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Loader2,
  Pencil,
  PlusCircleIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import categories from "@/data/categories";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQuery } from "react-query";
import { useRouter } from "next/router";

// Define types and schemas
type FormStep = "category" | "details" | "pictures" | "location" | "pricing";

const STEPS: FormStep[] = [
  "category",
  "details",
  "pictures",
  "location",
  "pricing",
];

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Subcategory is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  accessories: z.array(z.string()),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters")
    .max(1500),
  addressId: z.number().min(1, "Address is required"),
  images: z.array(z.any()).min(2, "At least two images are required"),
  dailyRate: z.string().min(1, "Daily price must be at least $1"),
  dailyDiscount: z.string().min(0).max(100),
  weeklyDiscount: z.string().min(0).max(100),
  requireDeposit: z.boolean(),
  size: z.string().min(1, "Size is required"),
});

const categorySchema = formSchema.pick({
  category: true,
  subCategory: true,
  accessories: true,
});

const detailsSchema = formSchema.pick({
  brand: true,
  model: true,
  description: true,
  size: true,
});

const locationSchema = formSchema.pick({
  addressId: true,
});

const picturesSchema = formSchema.pick({
  images: true,
});

type FormValues = z.infer<typeof formSchema>;

export default function BikeForm({ bike }: { bike?: any }) {
  const [currentStep, setCurrentStep] = useState<FormStep>("category");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema: any = {
    category: categorySchema,
    details: detailsSchema,
    location: locationSchema,
    pricing: formSchema,
    pictures: picturesSchema,
  }[currentStep];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: bike
      ? {
          category: bike?.category,
          subCategory: bike?.subCategory,
          accessories: bike?.accessories || [],
          brand: bike?.brand,
          model: bike?.model,
          description: bike?.description,
          addressId: bike?.address?.id,
          images: bike?.images,
          dailyRate: bike?.dailyRate,
          dailyDiscount: bike?.dailyDiscount || "0",
          weeklyDiscount: bike?.weeklyDiscount || "0",
          requireDeposit: bike?.requireDeposit,
          size: bike?.size,
        }
      : {
          category: "",
          subCategory: "",
          accessories: [],
          brand: "",
          model: "",
          description: "",
          addressId: undefined,
          images: [],
          dailyRate: "0",
          dailyDiscount: "0",
          weeklyDiscount: "0",
          requireDeposit: false,
          size: "",
        },
    mode: "onChange",
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToNextStep = async () => {
    // Validate current step before proceeding
    const isStepValid = await form.trigger();
    if (isStepValid) {
      setCurrentStep((prev) => STEPS[STEPS.indexOf(prev) + 1]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const router = useRouter();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      // Upload images first
      const uploadedImages = data?.images?.map((image) => {
        return {
          path: image.s3Key || image?.path,
          isMain: image.isMain,
        };
      });

      const formData = {
        ...data,
        images: uploadedImages,
      };

      let bikeData;

      if (bike?.id) {
        bikeData = await api.put(`/bikes/${bike?.id}`, formData);
      } else {
        bikeData = await api.post("/bikes", formData);
      }

      toast.success("Listing submitted successfully!");

      router.push(`/bikes/${bikeData?.data?.data?.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl min-h-[70vh] mt-4 mx-auto px-4 py-5">
      <div className="max-w-4xl">
        <div className="py-3">
          <h4 className="font-semibold text-xl">List my bike or accessory</h4>
        </div>

        <div className="mb-8 mt-4">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div>
                  <div
                    className={`
                      !w-10 !h-10 rounded-full flex items-center justify-center
                      ${
                        index < currentStepIndex
                          ? "bg-green-500 text-white"
                          : index === currentStepIndex
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : index === currentStepIndex ? (
                      <Pencil className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-[60px] h-1 mx-2 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div
                key={step}
                className="text-sm text-left capitalize text-gray-600 mt-1"
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Form Steps */}
            {currentStep === "category" && (
              <CategoryStep form={form} onNext={goToNextStep} />
            )}
            {currentStep === "details" && (
              <DetailsStep
                form={form}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            )}
            {currentStep === "pictures" && (
              <PicturesStep
                form={form}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            )}
            {currentStep === "location" && (
              <LocationStep
                form={form}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            )}
            {currentStep === "pricing" && (
              <PricingStep
                form={form}
                onBack={goToPreviousStep}
                isSubmitting={isSubmitting}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import AddressForm from "./AddressForm";
import getFileUrl from "@/lib/getFileUrl";
import accessories from "@/data/accessories";

function CategoryStep({ form, onNext }: { form: any; onNext: () => void }) {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-2">What type of bike is it?</h2>
        <p className="text-gray-600 text-sm mb-6">
          First, select the category of your bike. Then select the bottom
          subcategory.
        </p>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Choose the category of your bike</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      error={fieldState.error?.message}
                      className="mt-1.5"
                    >
                      <SelectValue placeholder="Select the bike category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subCategory"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Choose the subcategory of your bike</FormLabel>
                <Select
                  disabled={!form.watch("category")}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      error={fieldState.error?.message}
                      className="mt-1.5"
                    >
                      <SelectValue placeholder="Select the bike subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories
                      .find(
                        (category) => category.value === form.watch("category")
                      )
                      ?.children?.map((subcategory) => (
                        <SelectItem
                          key={subcategory.value}
                          value={subcategory.value}
                        >
                          {subcategory.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full max-w-2xl mx-auto mt-3">
            <h2 className="text-sm font-medium mb-4 text-gray-900">
              What free accessories do you provide with the bike?
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {accessories.map((accessory) => {
                const IconComponent = accessory.icon;
                const isSelected = form
                  .watch("accessories")
                  .find((accessoryName) => accessoryName === accessory.name);

                return (
                  <div
                    key={accessory.name}
                    className={`flex items-center border gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      isSelected ? "bg-primary text-white" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      const newValues = isSelected
                        ? form
                            .watch("accessories")
                            .filter(
                              (accessoryName) =>
                                accessoryName !== accessory.name
                            )
                        : [...form.watch("accessories"), accessory.name];

                      form.setValue("accessories", newValues);
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-white bg-white/20"
                          : "border-gray-300"
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${
                          isSelected ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {accessory.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            onNext();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function DetailsStep({
  form,
  onNext,
  onBack,
}: {
  form: any;
  onNext: () => void;
  onBack: () => void;
}) {
  const description = form.watch("description");

  const sizes = [
    { value: "150-160 cm | XS - 48 cm", label: "150-160 cm | XS - 48 cm" },
    { value: "160-165 cm | S - 50 cm", label: "160-165 cm | S - 50 cm" },
    { value: "165-170 cm | M - 52 cm", label: "165-170 cm | M - 52 cm" },
    { value: "170-175 cm | M - 54 cm", label: "170-175 cm | M - 54 cm" },
  ];

  return (
    <div className="max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-4">
          What is the brand, model, and size of your bike?
        </h2>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Brand"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 grid-cols-2">
            <FormField
              control={form.control}
              name="model"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Model *</FormLabel>
                  <FormControl>
                    <Input
                      error={fieldState.error?.message}
                      placeholder="Model"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select the bike size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (min. 100 characters) *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="h-32"
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("description");
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {description.length}/1500 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex mt-6 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => {
            onNext();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function LocationStep({
  form,
  onNext,
  onBack,
}: {
  form: any;
  onNext: () => void;
  onBack: () => void;
}) {
  const {
    data: addresses,
    status,
    refetch,
  } = useQuery({
    queryKey: ["address"],
    queryFn: () => api.get("/address").then((res) => res.data),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-4">
          Where can the bike be picked up?
        </h2>
        <p className="text-gray-600 leading-7 text-sm mb-6">
          Where is your bike located? Don&apos;t worry, the exact location of
          your bike will ONLY be forwarded when you have confirmed a rental
          request.
        </p>
        {status === "loading" && (
          <div className="flex justify-center items-center py-16 border rounded-md">
            <Loader2 className="animate-spin text-primary size-6" />
          </div>
        )}

        {!showForm && (
          <>
            {status === "success" && addresses?.length === 0 && (
              <div className="p-4- pb-0">
                <div className="py-6 text-center border rounded-md border-dashed">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-gray-100 p-3">
                      <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="mb-1 text-sm font-medium">No address added</h3>
                  <p className="mb-4 text-[15px] text-gray-500">
                    You don't have any address added yet.
                  </p>

                  <Button
                    onClick={() => setShowForm(true)}
                    size="sm"
                    className="bg-green-800 hover:bg-green-700"
                  >
                    Add Address
                  </Button>
                </div>
              </div>
            )}

            {status === "success" && (
              <RadioGroup
                value={form.watch("addressId")}
                onValueChange={(value) => form.setValue("addressId", value)}
                className="space-y-0"
              >
                {addresses?.map((address: any) => (
                  <div
                    key={`${address.id}-${address.value}`}
                    className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        className="after:absolute after:inset-0"
                        value={address.id}
                        id={address.id}
                      />
                      <label
                        className="text-sm font-medium"
                        htmlFor={address.id}
                      >
                        {address.street}, {address.city}
                      </label>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForm(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="!mt-3"
                >
                  <PlusCircleIcon className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </RadioGroup>
            )}
          </>
        )}
      </div>

      {showForm && (
        <AddressForm
          onComplete={() => {
            setShowForm(false);
            setEditingAddress(null);
            refetch();
          }}
          editingAddress={editingAddress}
          handleCancel={handleCancel}
        />
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!form.watch("addressId")}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface ImageData {
  file: File;
  previewUrl: string;
  isMain: boolean;
  uploadStatus: "pending" | "uploading" | "success" | "error";
  s3Key?: string;
}

async function getSignedUrl(
  file: File
): Promise<{ signedUrl: string; key: string }> {
  const response = await api.post("/sign", {
    fileName: file.name,
    fileType: file.type,
  });

  return response.data;
}

async function uploadToS3(file: File, signedUrl: string): Promise<void> {
  const response = await fetch(signedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
}

function PicturesStep({
  form,
  onNext,
  onBack,
}: {
  form: any;
  onNext: () => void;
  onBack: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const images: any[] = form.watch("images") || [];

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      await handleFiles(Array.from(files));
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files) {
      await handleFiles(Array.from(files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error(
        "Some files were not accepted. Only JPG/PNG under 5MB are allowed."
      );
    }

    // Create new image objects with pending status
    const newImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: false,
      uploadStatus: "pending" as const,
    }));

    // Add to form immediately
    const currentImages = form.getValues("images") || [];
    const updatedImages = [...currentImages, ...newImages];
    form.setValue("images", updatedImages, {
      shouldValidate: true,
    });

    // Start uploading each new image immediately
    for (const [index, image] of newImages.entries()) {
      const imageIndex = currentImages.length + index;
      uploadImage(imageIndex, image);
    }
  };

  const uploadImage = async (index: number, imageData?: ImageData) => {
    try {
      // Get current images state
      const currentImages = form.getValues("images");
      const image = imageData || currentImages[index];

      if (
        !image ||
        image.uploadStatus === "uploading" ||
        image.uploadStatus === "success"
      ) {
        return;
      }

      // Update status to uploading
      const updatedImages = [...currentImages];
      updatedImages[index] = {
        ...updatedImages[index],
        uploadStatus: "uploading",
      };
      form.setValue("images", updatedImages);

      // Get signed URL
      const { signedUrl, key } = await getSignedUrl(image.file);

      // Upload to S3
      await uploadToS3(image.file, signedUrl);

      // Update status and store S3 key
      const successImages = form.getValues("images");
      successImages[index] = {
        ...successImages[index],
        uploadStatus: "success",
        s3Key: key,
      };
      form.setValue("images", successImages);

      toast.success(`${image.file.name} uploaded successfully`);
    } catch (error) {
      console.error("Upload failed:", error);

      // Update status to error
      const errorImages = form.getValues("images");
      errorImages[index] = {
        ...errorImages[index],
        uploadStatus: "error",
      };
      form.setValue("images", errorImages);

      toast.error(`Failed to upload ${imageData?.file.name || "image"}`);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    URL.revokeObjectURL(imageToRemove.previewUrl);

    const newImages = images.filter((_, i) => i !== index);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const retryUpload = (index: number) => {
    uploadImage(index);
  };

  const handleNext = () => {
    const hasUploadingImages = images.some(
      (img) => img.uploadStatus === "uploading"
    );

    if (hasUploadingImages) {
      toast.warning("Please wait for all images to finish uploading");
      return;
    }

    // Check if at least one image is marked as main
    const hasMainImage = images.some((img) => img.isMain);
    if (!hasMainImage && images.length > 0) {
      // Automatically set first image as main if none selected
      setMainImage(0);
    }

    onNext();
  };

  const error = form.formState?.errors?.images;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[17px] font-bold mb-4">
          Upload some pictures of your bike
        </h2>
        <p className="text-gray-600 text-sm mb-2">
          Only .jpg .png .jpeg images are accepted. The photos need to be at
          least 900x600px and the max file size is 5MB.
        </p>
        <p className="text-gray-600 mb-6 text-sm leading-7">
          For best results use the image edit function we provide to adjust them
          to the 3:2 image ratio the platform uses.{" "}
          <a href="#" className="text-primary hover:underline">
            Here is a guide
          </a>{" "}
          on how to make your listing look better!
        </p>

        <div
          className={cn(
            `border-2 border-dashed bg-slate-50 rounded-lg p-8 text-center`,
            isDragging ? "border-primary bg-primary/10" : "border-gray-300",
            error && "border-red-500 bg-red-50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="secondary" className="mb-2 bg-white">
              Select images
            </Button>
            <p className="text-sm mt-3 capitalize text-gray-600">
              or drag and drop your images here
            </p>
            {error && (
              <p className="text-sm mt-3 text-red-500">* {error.message}</p>
            )}
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {images.map((image, index) => (
              <div key={index} className="relative border rounded-lg p-2">
                <div className="relative">
                  <img
                    src={image.previewUrl || getFileUrl(image.path)}
                    alt={`Bike image ${index + 1}`}
                    className="w-full border aspect-[3/2] object-cover rounded"
                  />
                  {image.uploadStatus === "uploading" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {image.uploadStatus === "success" && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  {image.uploadStatus === "error" && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500 text-white rounded-full p-1">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  <RadioGroup
                    value={image.isMain ? index.toString() : ""}
                    onValueChange={() => setMainImage(index)}
                    className="py-2"
                  >
                    <div className="flex items-center text-sm space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`main-${index}`}
                        disabled={image.uploadStatus !== "success"}
                      />
                      <label htmlFor={`main-${index}`}>Use as main photo</label>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => removeImage(index)}
                      disabled={image.uploadStatus === "uploading"}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  {image.uploadStatus === "error" && (
                    <div className="text-sm text-red-600 flex items-center justify-between">
                      <span>Upload failed</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-red-600 hover:text-red-700"
                        onClick={() => retryUpload(index)}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex mt-4 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function PricingStep({
  form,
  onBack,
  isSubmitting,
}: {
  form: any;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const calculateWeeklyPrice = () => {
    const dailyRate = form.watch("dailyRate") || 0;
    const weeklyDiscount = form.watch("weeklyDiscount") || 0;
    const discountedPrice = dailyRate * 7 * (1 - weeklyDiscount / 100);
    return discountedPrice.toFixed(2);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-4">Set your pricing</h2>
        <p className="text-gray-600 text-sm leading-7 mb-6">
          The price you charge for your bike is up to you. The price should be
          based on the bike and equipment. To get an idea of market prices, you
          can view comparable listings.
        </p>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="dailyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Price ($) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dailyDiscount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weeklyDiscount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Weekly Discount (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {form.watch("weeklyDiscount") > 0 && (
            <p className="text-sm text-gray-600">
              With a weekly discount of {form.watch("weeklyDiscount")}%
              you&apos;ll get ${calculateWeeklyPrice()} per week
            </p>
          )}

          <div className="pt-6 border-t">
            <FormField
              control={form.control}
              name="requireDeposit"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>Require security deposit</FormLabel>
                    <FormDescription>
                      You can require the rider to pay a security deposit, which
                      covers any potential damage.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
