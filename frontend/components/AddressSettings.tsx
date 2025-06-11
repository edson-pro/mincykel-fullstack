"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapPin, Plus, Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useQuery } from "react-query";
import useConfirmModal from "@/hooks/useConfirmModal";
import { toast } from "sonner";
import ConfirmModal from "./modals/ConfirmModal";
import Autocomplete from "react-google-autocomplete";
import React from "react";
import AddressForm from "./AddressForm";

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
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
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
