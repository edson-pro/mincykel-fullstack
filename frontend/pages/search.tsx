import { MapPin, Minus, Plus, Star } from "lucide-react";
import {
  Calendar,
  Users,
  Filter,
  ChevronDown,
  Search as SearchIcon,
} from "lucide-react";
import Link from "next/link";

export default function Search() {
  return (
    <div className="min-h-screen">
      <SearchFilters />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <BikeList />
        <div className="hidden lg:block h-[calc(100vh-120px)] sticky top-[120px]">
          <MapView />
        </div>
      </div>
    </div>
  );
}

interface Bike {
  id: string;
  image: string;
  brand: string;
  model: string;
  location: string;
  specs: string[];
  pricePerDay: number;
  pricePerWeek: number;
  rating?: number;
  reviews?: number;
}

function BikeList() {
  const bikes: Bike[] = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      brand: "Batavus (Water)",
      model: "3 gears",
      location: "Amsterdam-Centrum",
      specs: ["City Bike", "Size: Unisize"],
      pricePerDay: 17,
      pricePerWeek: 104,
      rating: 4.67,
      reviews: 6,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      brand: "Transporter (Water)",
      model: "Cargo",
      location: "Amsterdam-Centrum",
      specs: ["Cargo Bike", "Size: Unisize"],
      pricePerDay: 35,
      pricePerWeek: 245,
      rating: 5.0,
      reviews: 4,
    },
  ];

  return (
    <div className="p-5">
      <div className="space-y-4">
        {bikes.map((bike) => (
          <Link
            key={bike.id}
            href={`/bikes/${bike.id}`}
            className="block bg-white rounded-lg border transition-shadow"
          >
            <div className="flex gap-4 p-3">
              <img
                src={bike.image}
                alt={bike.brand}
                className="w-48 h-full object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{bike.brand}</h3>
                    <p className="text-gray-600 text-sm">{bike.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{bike.pricePerDay} €/day</p>
                    <p className="text-gray-600 text-sm">
                      {bike.pricePerWeek} €/week
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{bike.location}</span>
                </div>

                <div className="mt-2">
                  {bike.specs.map((spec, index) => (
                    <span key={index} className="text-sm text-gray-600">
                      {index > 0 && " • "}
                      {spec}
                    </span>
                  ))}
                </div>

                {bike.rating && (
                  <div className="flex text-sm items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="font-semibold">{bike.rating}</span>
                    {bike.reviews && (
                      <span className="text-gray-600">({bike.reviews})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MapView() {
  return (
    <div className="relative h-full bg-blue-50 rounded-lg">
      <div className="absolute top-4 flex items-center justify-center left-4 right-4">
        <div className="bg-white cursor-pointer w-fit rounded-full border shadow-md">
          <div className="flex items-center px-4 py-2">
            <SearchIcon className="h-4 w-4 mr-1.5 text-primary" />
            <span className="text-sm text-primary"> Search Here</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 left-3">
        <div className="bg-white rounded-lg shadow-md px-3 py-1 text-sm">
          20 km
        </div>
      </div>

      <iframe
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15950.035237767692!2d30.10118315!3d-1.949584349999982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srw!4v1736111800319!5m2!1sen!2srw"
        style={{ border: 0 }}
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

function SearchFilters() {
  return (
    <div className="sticky top-14 z-40 bg-white border-b">
      <div className="flex flex-wrap items-center gap-2 p-3 mx-auto">
        <button className="flex items-center gap-2  text-sm px-4 py-2 rounded-full border hover:bg-gray-50">
          <Calendar className="h-4 w-4" />
          <span>Select dates</span>
        </button>

        <button className="flex text-sm items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50">
          <Users className="h-4 w-4" />
          <span>Number of bikes</span>
        </button>

        <button className="flex  text-sm items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          <span>Bike type</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <button className="flex  text-sm items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50">
          <span>Brand</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <button className="flex  text-sm items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50">
          <span>Rider Height</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <button className="flex  text-sm items-center gap-2 px-4 py-2 rounded-full border hover:bg-gray-50">
          <span>Sort</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        <button className="text-primary text-sm hover:underline">
          Clear all
        </button>

        <div className="ml-auto text-sm text-gray-500">
          379 bikes to rent in Amsterdam, Netherlands
        </div>
      </div>
    </div>
  );
}
