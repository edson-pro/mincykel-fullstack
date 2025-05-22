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

interface Booking {
  id: string;
  title: string;
  status: "upcoming" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  price: number;
  image: string;
  location: string;
}

// This would typically come from an API
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    title: "Mountain Bike - Trek Fuel EX 8",
    status: "upcoming",
    startDate: "2025-01-15",
    endDate: "2025-01-17",
    price: 75,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/47891/thumb_1619562446-5c6a811109d26_D419F3C4-AF0A-4657-BD42-784A87714CC2.jpg",
    location: "Munich, Germany",
  },
  {
    id: "2",
    title: "Road Bike - Specialized Tarmac",
    status: "completed",
    startDate: "2024-12-20",
    endDate: "2024-12-22",
    price: 60,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/93159/thumb_IMG_20220409_164236.jpg",
    location: "Berlin, Germany",
  },
  {
    id: "3",
    title: "Electric Bike - RadCity 5 Plus",
    status: "cancelled",
    startDate: "2024-12-10",
    endDate: "2024-12-12",
    price: 90,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/149054/thumb_blob.jpg",
    location: "Hamburg, Germany",
  },
  {
    id: "4",
    title: "Hybrid Bike - Cannondale Quick",
    status: "upcoming",
    startDate: "2025-01-20",
    endDate: "2025-01-22",
    price: 45,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/60845/thumb_1621330966-WRC_ALUMINIO.jpg",
    location: "Frankfurt, Germany",
  },
  {
    id: "3",
    title: "Electric Bike - RadCity 5 Plus",
    status: "cancelled",
    startDate: "2024-12-10",
    endDate: "2024-12-12",
    price: 90,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/149054/thumb_blob.jpg",
    location: "Hamburg, Germany",
  },
];

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    const matchesSearch =
      booking.title.toLowerCase().includes(search.toLowerCase()) ||
      booking.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-6">My Bookings</h1>
        <BookingsFilter
          search={search}
          status={statusFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
        />
      </div>

      {filteredBookings.length === 0 && <NoBookingsFound />}

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

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const statusColors = {
    upcoming: "bg-blue-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={booking.image}
            alt={booking.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge
            className={`absolute text-white top-2 right-2 ${
              statusColors[booking.status]
            }`}
            variant="secondary"
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[15px] truncate mb-2">
            {booking.title}
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{booking.location}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t">
        <div className="text-base font-semibold">
          €{booking.price.toFixed(2)}
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

interface BookingsFilterProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function BookingsFilter({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: BookingsFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Bookings</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
export function NoBookingsFound() {
  return (
    <div className="text-center min-h-[70px] py-12">
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
