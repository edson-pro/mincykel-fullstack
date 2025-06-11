import React from "react";

import { useState } from "react";
import { CalendarDays, CalendarX, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookings = [], status } = useQuery({
    queryKey: ["my-bookings", search],
    keepPreviousData: true,
    queryFn: async () => {
      const { data } = await api.get("/booking/my-bookings");
      return data;
    },
  });

  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesSearch =
      booking.bike?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      booking.bike?.model?.toLowerCase().includes(search.toLowerCase()) ||
      booking.bike?.description?.toLowerCase().includes(search.toLowerCase()) ||
      booking.address?.city?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto min-h-[80vh] px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-6">My Bookings</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute z-20 left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBookings.length === 0 && status === "success" && (
        <NoBookingsFound />
      )}

      {status === "loading" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => {
              return (
                <div className=" border rounded-lg">
                  <div className="p-2">
                    <Skeleton className="h-[180px] w-full border-b object-cover" />
                    <div className="flex items-center justify-between gap-2 py-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="py-1">
                      <Skeleton className="h-4 w-44" />
                    </div>
                  </div>

                  <div className="py-2 px-3 border-t">
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {filteredBookings.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BookingCard({ booking }: any) {
  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative">
          <Link href={`/checkout_success?bookingId=${booking.id}`}>
            <img
              src={getFileUrl(booking.bike?.images[0]?.path)}
              alt={booking.bike?.brand + " " + booking.bike?.model}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </Link>
          <Badge
            className={cn(`absolute text-white top-2 right-2`, {
              "bg-blue-500": booking.status === "confirmed",
              "bg-green-500": booking.status === "completed",
              "bg-red-500": booking.status === "cancelled",
            })}
            variant="secondary"
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-[14.5px] mb-2">
            <Link
              href={`/checkout_success?bookingId=${booking.id}`}
              className="hover:underline"
            >
              {booking.bike?.brand + " | " + booking.bike?.model}
            </Link>
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>
                {booking.bike?.address?.city}, {booking.bike?.address?.country}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2.5 border-t">
        <div className="text-sm font-semibold text-primary">
          ${parseFloat(booking?.totalAmount)?.toFixed(2)}
        </div>
      </CardFooter>
    </Card>
  );
}

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import { api } from "@/lib/api";
import getFileUrl from "@/lib/getFileUrl";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function NoBookingsFound() {
  return (
    <div className="text-center min-h-[70px] py-24">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No bookings found</h2>
      <p className="text-muted-foreground leading-7 mb-6">
        We couldn't find any bookings matching <br /> your criteria.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Clear filters
      </Button>
    </div>
  );
}
