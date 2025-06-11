import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import countries from "@/data/countries";
import Autocomplete from "react-google-autocomplete";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import { api } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

export default function AddressForm({
  handleCancel,
  onComplete,
  editingAddress,
}) {
  const addressSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    city: z.string().min(1, "City is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
    street: z.string().min(1, "Street is required"),
    phone: z.string().optional(),
    isPrimary: z.boolean().optional(),
    longitude: z.number().optional(),
    latitude: z.number().optional(),
  });

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      city: "",
      zipCode: "",
      country: "",
      street: "",
      phone: "",
      isPrimary: false,
      longitude: 0,
      latitude: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingAddress) {
        await api.put(`/address/${editingAddress.id}`, data);
      } else {
        await api.post("/address", data);
      }
      form.reset();
      onComplete();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 pt-4">
        <CardTitle>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </CardTitle>
        <CardDescription>
          {editingAddress
            ? "Update your address information"
            : "Add a new address to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        error={fieldState.error?.message}
                        placeholder="Enter first name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        error={fieldState.error?.message}
                        placeholder="Enter last name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Autocomplete
                        options={{
                          types: ["geocode"], // Focus on geographic addresses
                          fields: [
                            "address_components",
                            "geometry",
                            "formatted_address",
                          ],
                          strictBounds: false,
                        }}
                        defaultValue={field.value}
                        apiKey={"AIzaSyDmgrmJuvPpY95DES70wZfBFJMh4E-6xcc"}
                        onPlaceSelected={(place) => {
                          console.log(place);
                          const country = countries.find(
                            (country) =>
                              country.name ===
                              place.address_components.find((component) =>
                                component.types.includes("country")
                              )?.long_name
                          )?.name;

                          const city = place.address_components.find(
                            (component) => component.types.includes("locality")
                          )?.long_name;

                          const street =
                            place.address_components.find((component) =>
                              component.types.includes("route")
                            )?.long_name || place?.formatted_address;

                          form.setValue("street", street, {
                            shouldValidate: true,
                          });
                          form.setValue("city", city, {
                            shouldValidate: true,
                          });
                          form.setValue("country", country, {
                            shouldValidate: true,
                          });

                          form.setValue(
                            "latitude",
                            place.geometry.location?.lat(),
                            {
                              shouldValidate: true,
                            }
                          );
                          form.setValue(
                            "longitude",
                            place.geometry.location.lng(),
                            {
                              shouldValidate: true,
                            }
                          );
                        }}
                        className={cn(
                          `flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                          {
                            "border-red-500": fieldState.error?.message,
                          }
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        error={fieldState.error?.message}
                        placeholder="Enter city"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input
                        error={fieldState.error?.message}
                        placeholder="Enter zip code"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="country"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger error={fieldState.error?.message}>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.name} value={country.name}>
                          {country.name}
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
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      error={fieldState.error?.message}
                      placeholder="+1 (555) 123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as primary address</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }}
                size="sm"
                disabled={form.formState?.isSubmitting}
              >
                {form.formState?.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
