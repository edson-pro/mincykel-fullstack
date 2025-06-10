"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Plus, Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useQuery } from "react-query";
import useConfirmModal from "@/hooks/useConfirmModal";
import { toast } from "sonner";
import ConfirmModal from "./modals/ConfirmModal";
import countries from "@/data/countries";
import { usePlacesWidget } from "react-google-autocomplete";
import Autocomplete from "react-google-autocomplete";
import React from "react";

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

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
}

export default function AddressSettings() {
  const {
    data: addresses,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: () => api.get("/address").then((res) => res.data),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<AddressFormData>({
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

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await api.put(`/address/${editingAddress.id}`, data);
      } else {
        await api.post("/address", data);
      }
      setShowForm(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.reset(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    form.reset();
  };

  const confirmModal = useConfirmModal();

  const handleDelete = (e) => {
    confirmModal.setIsLoading(true);
    return api
      .delete(`/address/${e.id}`)
      .then(() => {
        refetch();
        confirmModal.close();
        toast.success("Address deleted succesfully");
      })
      .catch((e) => {
        confirmModal.setIsLoading(false);
        toast.error(e.message);
      });
  };

  return (
    <>
      {" "}
      <ConfirmModal
        title={"Are you sure you want to delete?"}
        description={`Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, amet
        a! Nihil`}
        meta={confirmModal.meta}
        onConfirm={handleDelete}
        isLoading={confirmModal.isLoading}
        open={confirmModal.isOpen}
        onClose={() => confirmModal.close()}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold ">My Addresses</h2>
            <p className="text-muted-foreground text-sm">
              Manage your saved addresses for faster checkout
            </p>
          </div>
          {!showForm && (
            <Button size={"sm"} onClick={() => setShowForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          )}
        </div>

        {showForm && (
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
                  onSubmit={form.handleSubmit(onSubmit)}
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
                                  (component) =>
                                    component.types.includes("locality")
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
                              className={`flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground shadow-black/5 ring-offset-background transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                            />
                          </FormControl>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger error={fieldState.error?.message}>
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem
                                key={country.name}
                                value={country.name}
                              >
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
                      disabled={form.formState?.isSubmitting}
                      type="submit"
                    >
                      {form.formState?.isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingAddress ? "Update Address" : "Save Address"}
                    </Button>
                    <Button
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
        )}

        {!showForm && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center border rounded-md items-center py-24">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              addresses?.map((address) => (
                <Card key={address.id}>
                  <CardContent className="pt-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="font-medium text-foreground">
                            {address.firstName} {address.lastName}
                          </p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.zipCode}
                          </p>
                          <p>{address.country}</p>
                          {address.phone && <p>{address.phone}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => confirmModal.open({ meta: address })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {!isLoading && !addresses?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base font-medium mb-2">
                    No addresses saved
                  </h3>
                  <p className="text-muted-foreground text-sm text-center mb-4">
                    Add your first address to get started with faster checkout
                  </p>
                  <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </>
  );
}

const GoogleAutocomplete = React.forwardRef<HTMLInputElement, any>(
  ({ onPlaceSelected, apiKey, options, ...props }, ref) => {
    return (
      <Autocomplete
        apiKey={apiKey}
        onPlaceSelected={onPlaceSelected}
        options={{
          types: ["geocode", "establishment"],
          ...options,
        }}
        className={props.className}
      >
        <Input ref={ref} {...props} />
      </Autocomplete>
    );
  }
);
