import React from "react";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormStep = "category" | "details" | "pictures" | "location" | "pricing";

interface BikeFormData {
  // Category
  category: string;
  subcategory: string;

  // Details
  brand: string;
  model: string;
  description: string;
  variants: Array<{
    riderHeight: string;
    frameSize: string;
    bicycleNumber: string;
    frameNumber: string;
  }>;

  // Location
  useExistingLocation: boolean;
  street: string;
  zipCode: string;
  city: string;
  country: string;

  // Pictures
  images: Array<{
    url: string;
    isMain: boolean;
  }>;

  // Pricing
  dailyPrice: number;
  dailyDiscount: number;
  weeklyDiscount: number;
  requireDeposit: boolean;
}

const STEPS: FormStep[] = [
  "category",
  "details",
  "pictures",
  "location",
  "pricing",
];

export default function ListBike() {
  const [currentStep, setCurrentStep] = useState<FormStep>("category");
  const [formData, setFormData] = useState<BikeFormData>({
    category: "",
    subcategory: "",
    brand: "",
    model: "",
    description: "",
    variants: [],
    useExistingLocation: false,
    street: "",
    zipCode: "",
    city: "",
    country: "",
    images: [],
    dailyPrice: 0,
    dailyDiscount: 0,
    weeklyDiscount: 0,
    requireDeposit: false,
  });

  const currentStepIndex = STEPS.indexOf(currentStep);

  const updateFormData = (data: Partial<BikeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  return (
    <div
      className="max-w-7xl min-h-[70vh] mt-4 mx-auto px-4 py-5
    "
    >
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

        {/* Form Steps */}
        {currentStep === "category" && (
          <CategoryStep
            data={formData}
            onUpdate={updateFormData}
            onNext={goToNextStep}
          />
        )}
        {currentStep === "details" && (
          <DetailsStep
            data={formData}
            onUpdate={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}
        {currentStep === "pictures" && (
          <PicturesStep
            data={formData}
            onUpdate={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}
        {currentStep === "location" && (
          <LocationStep
            data={formData}
            onUpdate={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}
        {currentStep === "pricing" && (
          <PricingStep
            data={formData}
            onUpdate={updateFormData}
            onBack={goToPreviousStep}
            onSubmit={() => console.log("Form submitted:", formData)}
          />
        )}
      </div>
    </div>
  );
}

interface CategoryStepProps {
  data: BikeFormData;
  onUpdate: (data: Partial<BikeFormData>) => void;
  onNext: () => void;
}

export function CategoryStep({ data, onUpdate, onNext }: CategoryStepProps) {
  const categories = [
    { value: "road", label: "Road Bike" },
    { value: "mountain", label: "Mountain Bike" },
    { value: "hybrid", label: "Hybrid Bike" },
    { value: "electric", label: "Electric Bike" },
  ];

  const subcategories = {
    road: ["Racing", "Endurance", "Gravel"],
    mountain: ["Trail", "Enduro", "Downhill"],
    hybrid: ["City", "Comfort", "Fitness"],
    electric: ["City", "Mountain", "Folding"],
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-2">What type of bike is it?</h2>
        <p className="text-gray-600 text-sm mb-6">
          First, select the category of your bike. Then select the right
          subcategory.
        </p>
        <div className="grid gap-4">
          <Select
            value={data.category}
            onValueChange={(value) =>
              onUpdate({ category: value, subcategory: "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select the bike category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={data.subcategory}
            onValueChange={(value) => onUpdate({ subcategory: value })}
            disabled={!data.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Specify the subcategory" />
            </SelectTrigger>
            <SelectContent>
              {data.category &&
                subcategories[data.category as keyof typeof subcategories].map(
                  (sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  )
                )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!data.category || !data.subcategory}>
          Next
        </Button>
      </div>
    </div>
  );
}

interface DetailsStepProps {
  data: BikeFormData;
  onUpdate: (data: Partial<BikeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DetailsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: DetailsStepProps) {
  const [charCount, setCharCount] = useState(data.description.length);

  const addVariant = () => {
    onUpdate({
      variants: [
        ...data.variants,
        { riderHeight: "", frameSize: "", bicycleNumber: "", frameNumber: "" },
      ],
    });
  };

  const removeVariant = (index: number) => {
    onUpdate({
      variants: data.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const newVariants = [...data.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onUpdate({ variants: newVariants });
  };

  return (
    <div>
      <div className="space-y-6 grid sm:grid-cols-2 sm:gap-8">
        <div>
          <h2 className="text-[17px] font-bold mb-4">
            What is the brand, model, and size of your bike?
          </h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={data.brand}
                onChange={(e) => onUpdate({ brand: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={data.model}
                onChange={(e) => onUpdate({ model: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description (min. 100 characters) *
              </Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => {
                  onUpdate({ description: e.target.value });
                  setCharCount(e.target.value.length);
                }}
                className="h-32"
                required
              />
              <div className="text-sm text-gray-500 mt-1">{charCount}/1500</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-4">
            How many variants would you like to add?
          </h3>
          <div className="space-y-4">
            {data.variants.map((variant, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 p-4 border rounded-lg relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => removeVariant(index)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div>
                  <Label htmlFor={`riderHeight-${index}`}>Rider height *</Label>
                  <Input
                    id={`riderHeight-${index}`}
                    value={variant.riderHeight}
                    onChange={(e) =>
                      updateVariant(index, "riderHeight", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`frameSize-${index}`}>Frame size</Label>
                  <Input
                    id={`frameSize-${index}`}
                    value={variant.frameSize}
                    onChange={(e) =>
                      updateVariant(index, "frameSize", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`bicycleNumber-${index}`}>
                    Bicycle number
                  </Label>
                  <Input
                    id={`bicycleNumber-${index}`}
                    value={variant.bicycleNumber}
                    onChange={(e) =>
                      updateVariant(index, "bicycleNumber", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`frameNumber-${index}`}>Frame number</Label>
                  <Input
                    id={`frameNumber-${index}`}
                    value={variant.frameNumber}
                    onChange={(e) =>
                      updateVariant(index, "frameNumber", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addVariant} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add variant
            </Button>
          </div>
        </div>
      </div>
      <div className="flex mt-6 justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!data.brand || !data.model || data.description.length < 100}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface LocationStepProps {
  data: BikeFormData;
  onUpdate: (data: Partial<BikeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function LocationStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: LocationStepProps) {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-[17px] font-bold mb-4">
          Where can the bike be picked up?
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Where is your bike located? Don&apos;t worry, the exact location of
          your bike will ONLY be forwarded when you have confirmed a rental
          request.
        </p>

        <RadioGroup
          value={data.useExistingLocation ? "existing" : "new"}
          onValueChange={(value) =>
            onUpdate({ useExistingLocation: value === "existing" })
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">334323 3232323 Chennai India</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new">Add new location</Label>
          </div>
        </RadioGroup>

        {!data.useExistingLocation && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="col-span-2">
              <Label htmlFor="street">Street and Number *</Label>
              <Input
                id="street"
                value={data.street}
                onChange={(e) => onUpdate({ street: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                value={data.zipCode}
                onChange={(e) => onUpdate({ zipCode: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={data.country}
                onChange={(e) => onUpdate({ country: e.target.value })}
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={
            !data.useExistingLocation &&
            (!data.street || !data.zipCode || !data.city || !data.country)
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
}

interface PicturesStepProps {
  data: BikeFormData;
  onUpdate: (data: Partial<BikeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function PicturesStep({ data, onUpdate, onNext, onBack }: PicturesStepProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    const newImages = validFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isMain: false,
    }));

    onUpdate({
      images: [...data.images, ...newImages],
    });
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const setMainImage = (index: number) => {
    const newImages = data.images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onUpdate({ images: newImages });
  };

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
        <p className="text-gray-600 mb-6  text-sm leading-7">
          For best results use the image edit function we provide to adjust them
          to the 3:2 image ratio the platform uses.{" "}
          <a href="#" className="text-primary hover:underline">
            Here is a guide
          </a>{" "}
          on how to make your listing look better!
        </p>

        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"}
          `}
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
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="secondary" className="mb-2">
              Select images
            </Button>
            <p className="text-sm mt-3 capitalize text-gray-600">
              or drag and drop your images here
            </p>
          </Label>
        </div>

        {data.images.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {data.images.map((image, index) => (
              <div key={index} className="relative border rounded-lg p-2">
                <img
                  src={image.url}
                  alt={`Bike image ${index + 1}`}
                  className="w-full aspect-[3/2] object-cover rounded"
                />
                <div className="mt-2 space-y-2">
                  <RadioGroup
                    value={image.isMain ? index.toString() : ""}
                    onValueChange={() => setMainImage(index)}
                    className="py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`main-${index}`}
                      />
                      <Label htmlFor={`main-${index}`}>Use as main photo</Label>
                    </div>
                  </RadioGroup>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex mt-4 justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={data.images.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
}

interface PricingStepProps {
  data: BikeFormData;
  onUpdate: (data: Partial<BikeFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function PricingStep({
  data,
  onUpdate,
  onBack,
  onSubmit,
}: PricingStepProps) {
  const calculateWeeklyPrice = () => {
    const dailyPrice = data.dailyPrice || 0;
    const weeklyDiscount = data.weeklyDiscount || 0;
    const discountedPrice = dailyPrice * 7 * (1 - weeklyDiscount / 100);
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
          <div>
            <Label htmlFor="dailyPrice">Daily Price (€) *</Label>
            <Input
              id="dailyPrice"
              type="number"
              min="0"
              step="0.01"
              value={data.dailyPrice}
              onChange={(e) =>
                onUpdate({ dailyPrice: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dailyDiscount">Daily Discount (%)</Label>
              <Input
                id="dailyDiscount"
                type="number"
                min="0"
                max="100"
                value={data.dailyDiscount}
                onChange={(e) =>
                  onUpdate({ dailyDiscount: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="weeklyDiscount">Weekly Discount (%)</Label>
              <Input
                id="weeklyDiscount"
                type="number"
                min="0"
                max="100"
                value={data.weeklyDiscount}
                onChange={(e) =>
                  onUpdate({ weeklyDiscount: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          {data.weeklyDiscount > 0 && (
            <p className="text-sm text-gray-600">
              With a weekly discount of {data.weeklyDiscount}% you&apos;ll get €
              {calculateWeeklyPrice()} per week
            </p>
          )}

          <div className="pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireDeposit">Require security deposit</Label>
                <p className="text-sm text-gray-500">
                  You can require the rider to pay a security deposit, which
                  covers any potential damage.
                </p>
              </div>
              <Switch
                id="requireDeposit"
                checked={data.requireDeposit}
                onCheckedChange={(checked) =>
                  onUpdate({ requireDeposit: checked })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={!data.dailyPrice}>
          Submit
        </Button>
      </div>
    </div>
  );
}
