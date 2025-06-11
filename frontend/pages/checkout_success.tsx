import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Bike,
  Download,
  Phone,
  Mail,
  Home,
  Share2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth.context";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "react-query";
import { api } from "@/lib/api";
import getFileUrl from "@/lib/getFileUrl";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Component() {
  const { user } = useAuth();

  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");

  const { data: booking, status } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const { data } = await api.get(`/booking/${bookingId}`);
      return data;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get(`/booking/${booking?.id}/invoice`, {
        responseType: "blob", // Ensure binary response
      });

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `booking-invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up memory
    },
    onSuccess: () => {
      toast.success("Invoice downloaded successfully");
    },
    onError: () => {
      toast.error("Failed to download invoice");
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-base text-gray-600">
            Your bike rental has been successfully booked
          </p>
        </div>
        {status === "loading" && (
          <>
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          </>
        )}

        {status === "success" && (
          <>
            {" "}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Main Booking Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Booking Summary */}
                <Card>
                  <CardHeader className="px-4 pt-4">
                    <CardTitle className="flex items-center gap-2">
                      <Bike className="w-5 h-5" />
                      Booking Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Booking Reference
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        #BR-{booking?.id}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex gap-3">
                        <img
                          src={getFileUrl(booking?.bike?.images[0]?.path)}
                          alt={
                            booking?.bike?.brand + " " + booking?.bike?.model
                          }
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-sm mb-2">
                            {booking?.bike?.brand + " " + booking?.bike?.model}
                          </h3>
                          <p className="text-sm text-gray-600">
                            - {booking?.bike?.size}
                          </p>
                          <p className="text-sm text-gray-600">
                            - {booking?.bike?.category}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {booking?.startTime && (
                            <span>
                              {format(new Date(booking?.startTime), "PP")} -{" "}
                              {format(new Date(booking?.endTime), "PP")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{booking?.days} days rental</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{booking?.bike?.address?.city}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pickup Information */}
                <Card>
                  <CardHeader className="px-4 pt-4">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Pickup Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Pickup Location
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {booking?.bike?.address?.city},{" "}
                          {booking?.bike?.address?.country}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {booking?.bike?.address?.street}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {booking?.bike?.address?.zip}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          {booking?.bike?.address?.phone}
                        </p>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${booking?.bike?.address?.street}`}
                          className="text-blue-600 text-sm hover:underline mt-2 block"
                          target="_blank"
                        >
                          View on map
                        </a>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Pickup Time
                        </h4>
                        {booking && (
                          <>
                            {" "}
                            <p className="text-sm text-gray-600 mb-1">
                              {format(
                                new Date()?.setHours(
                                  // @ts-ignore
                                  ...booking?.pickupTime.split(":").map(Number)
                                ),
                                "h:mm a"
                              )}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {format(
                                new Date()?.setHours(
                                  // @ts-ignore
                                  ...booking?.returnTime.split(":").map(Number)
                                ),
                                "h:mm a"
                              )}
                            </p>
                          </>
                        )}

                        <p className="text-sm text-green-600 font-medium">
                          Please arrive 15 minutes early
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        What to Bring
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Valid government-issued ID</li>
                        <li>• Credit card for security deposit</li>
                        <li>• Confirmation email (this page)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Important Information */}
                <Card>
                  <CardHeader className="px-4 pt-4">
                    <CardTitle>Important Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Cancellation Policy
                        </h4>
                        <p className="text-sm text-gray-600">
                          Free cancellation up to 24 hours before pickup time
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Late Return</h4>
                        <p className="text-sm text-gray-600">
                          $10 per hour for late returns
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">
                        Safety Requirements
                      </h4>
                      <p className="text-sm text-gray-600">
                        Helmets are provided free of charge and are required by
                        local law. Please inspect the bike before leaving and
                        report any issues immediately.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Payment Summary */}
                <Card>
                  <CardHeader className="px-4 pt-4">
                    <CardTitle>Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Bike rental ({booking?.days} days)</span>
                      <span>${booking?.totalAmount}</span>
                    </div>{" "}
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span>${booking?.discountAmount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid</span>
                      <span>${booking?.totalAmount}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => downloadMutation.mutate()}
                      disabled={downloadMutation.isLoading}
                      className="w-full"
                      variant="outline"
                    >
                      {downloadMutation.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Download Receipt
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader className="px-4 pt-4">
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>support@mincykel.com</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Available 24/7 for booking support
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button className="rounded-lg" asChild size="lg">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button
                className="rounded-lg"
                asChild
                variant="outline"
                size="lg"
              >
                <Link href="/my-booking">
                  <Bike className="w-4 h-4 mr-2" />
                  View all bookings
                </Link>
              </Button>
            </div>
            {/* Confirmation Email Notice */}
            <div className="text-center mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to{" "}
                <span className="font-medium text-primary underline">
                  {user?.email}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
