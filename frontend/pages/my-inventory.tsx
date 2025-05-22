import { useState } from "react";
import { Bike, List, Plus, PlusCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Calendar, Copy, Edit, MapPin, Power, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import { api } from "@/lib/api";
import BikeCardSkeleton from "@/components/BikeCardSkeleton";
import getFileUrl from "@/lib/getFileUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Bike {
  id: string;
  title: string;
  location: string;
  specifications: string;
  image: string;
  dailyPrice: number;
  weeklyPrice: number;
  isActive: boolean;
}

export default function BikesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { data: bikes = [], status } = useQuery({
    queryKey: ["my-inventory"],
    queryFn: () => api.get("/bikes/mine").then(({ data }) => data?.data),
  });

  const filteredBikes = bikes.filter(
    (bike) =>
      bike.model.toLowerCase().includes(search.toLowerCase()) ||
      bike.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit bike:", id);
    router.push(`/bikes/${id}/edit`);
  };

  const handleToggle = (id: string) => {
    console.log("Toggle bike:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete bike:", id);
  };

  const handleCopy = (id: string) => {
    console.log("Copy bike:", id);
  };

  const handleCalendar = (id: string) => {
    console.log("View calendar:", id);
  };

  return (
    <div className="max-w-6xl min-h-[70vh] mx-auto px-4 py-8">
      <div className="space-y-6">
        <h1 className="text-xl font-bold">My bikes and accessories</h1>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2 ml-auto">
            <Button>
              <Plus size={16} className="h-5 w-5 mr-3" />
              List an item
            </Button>
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => {
                return <BikeCardSkeleton />;
              })}
            </div>
          </>
        )}

        {status === "success" && (
          <>
            {filteredBikes.length === 0 ? (
              <NoBikesFound />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {filteredBikes.map((bike) => (
                  <BikeCard
                    key={bike.id}
                    bike={bike}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                    onCalendar={handleCalendar}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BikeCard({
  bike,
  onEdit,
  onToggle,
  onDelete,
  onCopy,
  onCalendar,
}: any) {
  return (
    <Card className="overflow-hidden shadow-none">
      <Link
        href={`/bikes/${bike.id}`}
        className="relative border-b flex aspect-[4/3]- h-[180px]"
      >
        <img
          src={getFileUrl(bike?.images[0]?.path)}
          alt={bike.model}
          className="object-cover w-full h-full"
        />
      </Link>
      <CardContent className="p-2">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Link
              href={`/bikes/${bike.id}`}
              className="font-semibold hover:underline hover:text-primary text-sm"
            >
              {bike.brand}
            </Link>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {bike.address?.street}
              </span>
            </div>
          </div>

          <div className="mt-2 text-sm text-muted-foreground line-clamp-1">
            {bike.category} • Size: {bike.size}
          </div>

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="font-semibold text-sm">
                ${bike?.dailyRate}/Day
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(bike.id)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit bike</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggle(bike.id)}
                className={`h-8 w-8 ${
                  !bike.isActive ? "text-muted-foreground" : ""
                }`}
              >
                <Power className="h-4 w-4" />
                <span className="sr-only">
                  {bike.isActive ? "Disable" : "Enable"} bike
                </span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopy(bike.id)}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy bike</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(bike.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete bike</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoBikesFound() {
  return (
    <div className="text-center min-h-[70px] py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Bike className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No Bikes found</h2>
      <p className="text-muted-foreground leading-7 mb-6">
        We couldn't find any bookings matching <br /> your criteria.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Clear filters
      </Button>
    </div>
  );
}
