import { Info, Loader2 } from "lucide-react";

import React from "react";
import { CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useMutation, useQuery } from "react-query";
import getFileUrl from "@/lib/getFileUrl";
import { differenceInCalendarDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Checkout() {
  const searchParams = useSearchParams();

  const bikeId = searchParams.get("bike");
  const quantity = searchParams.get("quantity");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const dateRange = {
    from: new Date(startDate),
    to: new Date(endDate),
  };

  const { data: bike, status } = useQuery({
    queryKey: ["bike", bikeId],
    queryFn: async () => {
      const response = await api.get(`/bikes/${bikeId}`);
      return response?.data?.data;
    },
  });

  const days = dateRange.to
    ? differenceInCalendarDays(dateRange.to, dateRange.from)
    : 0;
  const total = bike?.dailyRate * days;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-6">
          {status === "success" && (
            <OrderDetails bike={bike} quantity={quantity} />
          )}

          {/* <PaymentSection onPaymentSubmit={() => {}} /> */}
          <AddressSection onAddressSubmit={() => {}} />
        </div>

        <div>
          <OrderSummary
            dateRange={`${format(dateRange.from, "dd MMM, HH:mm")} - ${format(
              dateRange.to,
              "dd MMM, HH:mm"
            )}`}
            subtotal={bike?.dailyRate}
            discount={0}
            bike={bike}
            days={days}
            total={total}
            quantity={quantity}
          />
        </div>
      </div>
    </div>
  );
}

interface AddressSectionProps {
  onAddressSubmit: (data: AddressFormData) => void;
}

interface AddressFormData {
  firstName: string;
  lastName: string;
  street: string;
  zipCode: string;
  city: string;
  country: string;
}
function AddressSection({ onAddressSubmit }: AddressSectionProps) {
  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm mb-4">
      <h2 className="text-base font-semibold mb-6">Address</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Ntwali"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder="Edson"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street and Number<span className="text-red-500">*</span>
          </label>
          <input type="text" className="w-full p-3 border rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code<span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City<span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country<span className="text-red-500">*</span>
            </label>
            <input type="text" className="w-full p-3 border rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetails({ bike, quantity }: any) {
  return (
    <div className="border p-3 rounded-lg mb-4">
      <h2 className="text-base font-semibold mb-4">Order Details</h2>

      <div className="flex gap-4">
        <img
          src={getFileUrl(bike?.images[0].path)}
          alt={`${bike.brand} ${bike.model}`}
          className="w-40 h-32 border object-contain rounded-lg"
        />

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[17px]">{bike.brand}</h3>
              <p className="text-gray-600">{bike.model}</p>
              <p className="text-gray-600">
                {bike.category} - {bike.size}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{bike.dailyRate} $ / day</p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-gray-600">Quantity: {quantity} Bike(s)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  dateRange,
  discount,
  bike,
  days,
  total,
  quantity,
}: any) {
  const requestPaymentCheckoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/rent/request-payment-checkout", {
        bikeId: bike.id,
        quantity,
        total,
      });

      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  return (
    <div className="sticky top-20 h-[600px]">
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-base font-semibold mb-4">Booking overview</h2>

        <div className="bg-gray-100 p-3 rounded-lg mb-6">
          <span className="text-gray-600">{dateRange}</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span>Days</span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <span> {days} </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span>Subtotal</span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <span>$ {total} </span>
          </div>

          <div className="flex justify-between text-green-600">
            <div className="flex items-center gap-2">
              <span>Discount {bike?.quantity} day(s)</span>
              <Info className="h-4 w-4" />
            </div>
            <span>$ -{discount} </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg mb-1">
            <span>Total amount</span>
            <span> $ {total?.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 text-right">incl. VAT</p>
        </div>

        <Button
          onClick={() => requestPaymentCheckoutMutation.mutate()}
          disabled={requestPaymentCheckoutMutation.isLoading}
          className="w-full bg-primary text-white py-2 rounded-lg font-medium mt-6 "
        >
          {requestPaymentCheckoutMutation.isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Pay & Rent now
        </Button>

        <p className="text-sm text-gray-500 text-center mt-4">
          By clicking "Rent now" you agree to the List'n'Ride{" "}
          <a href="#" className="text-primary">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary">
            Privacy Policy
          </a>
          .
        </p>

        <div className="text-center mt-4">
          <a href="#" className="text-primary text-sm">
            You need help?
          </a>
        </div>
      </div>
    </div>
  );
}

interface PaymentSectionProps {
  onPaymentSubmit: (data: PaymentFormData) => void;
}

interface PaymentFormData {
  cardNumber: string;
  expiry: string;
  cvc: string;
}

function PaymentSection({ onPaymentSubmit }: PaymentSectionProps) {
  return (
    <div className="bg-white p-4 pt-3 rounded-lg border mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-semibold">Payment</h2>
        <div className="flex gap-4">
          <img src="/icons/visa.svg" alt="Visa" className="h-8" />
          <img src="/icons/mastercard.svg" alt="Mastercard" className="h-8" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">Credit or debit card</span>
        </div>

        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          className="w-full p-3 border rounded-lg"
          maxLength={19}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="MM/YY"
            className="p-3 border rounded-lg"
            maxLength={5}
          />
          <input
            type="text"
            placeholder="123"
            className="p-3 border rounded-lg"
            maxLength={3}
          />
        </div>
      </div>
    </div>
  );
}
