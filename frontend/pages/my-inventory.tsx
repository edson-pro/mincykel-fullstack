import { useState } from "react";
import { Bike, List, Plus, PlusCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Calendar, Copy, Edit, MapPin, Power, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// This would typically come from an API
const MOCK_BIKES: Bike[] = [
  {
    id: "23",
    title: "kikar",
    location: "Chennai",
    specifications: "Large • Size: 155-165 cm | 32 cm",
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/100829/thumb_trek_emonda_sl_6_pro_2021_gris__4.jpg",
    dailyPrice: 10,
    weeklyPrice: 56,
    isActive: true,
  },
  // Add more mock bikes as needed
];

export default function BikesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("bikes");

  const filteredBikes = MOCK_BIKES.filter(
    (bike) =>
      bike.title.toLowerCase().includes(search.toLowerCase()) ||
      bike.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit bike:", id);
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
    <div className="max-w-7xl min-h-[70vh] mx-auto px-4 py-8">
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
            <Button variant="outline">
              <List size={16} className="h-4 w-4 mr-3" />
              List view
            </Button>
            <Button>
              <Plus size={16} className="h-5 w-5 mr-3" />
              List an item
            </Button>
          </div>
        </div>

        {filteredBikes.length === 0 ? (
          <NoBikesFound />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  );
}

interface BikeCardProps {
  bike: Bike;
  onEdit: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
  onCalendar: (id: string) => void;
}

function BikeCard({
  bike,
  onEdit,
  onToggle,
  onDelete,
  onCopy,
  onCalendar,
}: BikeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative border-b aspect-[4/3]">
        <img
          src={bike.image}
          alt={bike.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold">{bike.title}</h3>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {bike.location}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{bike.specifications}</p>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="font-semibold">{bike.dailyPrice} €/day</div>
              <div className="text-sm text-muted-foreground">
                {bike.weeklyPrice} €/week
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
