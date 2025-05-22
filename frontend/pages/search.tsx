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
        <div className="hidden lg:block h-[calc(100vh-100px)] sticky top-[120px]">
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
  const searchParams = useSearchParams();

  const address = searchParams.get("address");
  const numberOfBikes = searchParams.get("numberOfBikes");

  const { data: bikes = [], status } = useQuery({
    queryKey: ["bikes", address, numberOfBikes],
    queryFn: async () => {
      const response = await api.get("/bikes/search");
      return response?.data?.data;
    },
  });

  return (
    <div className="p-5">
      <div className="space-y-4">
        {status === "loading" && (
          <>
            {" "}
            {[1, 2, 3, 4, 5].map((e) => {
              return (
                <>
                  <div className="flex border p-2 rounded-md items-center- gap-3">
                    {/* Image skeleton */}
                    <div className="w-[200px] h-[170px] bg-gray-200 rounded-md animate-pulse flex-shrink-0"></div>

                    {/* Content skeleton */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Title skeleton */}
                        <div className="h-5 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>

                        {/* Specs skeleton */}
                        <div className="h-6 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>

                        {/* Location skeleton */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
                        </div>

                        {/* Type skeleton */}
                        <div className="h-6 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </>
        )}
        {bikes?.map((bike) => (
          <Link
            key={bike.id}
            href={`/bikes/${bike.id}`}
            className="block bg-white rounded-lg border transition-shadow"
          >
            <div className="flex gap-4 p-3">
              <img
                src={getFileUrl(bike.images[0].path)}
                alt={bike.brand}
                className="w-48 h-full bg-slate-100 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{bike?.brand}</h3>
                    <p className="text-gray-600 text-sm">{bike?.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{bike?.dailyRate} $/day</p>
                  </div>
                </div>

                <div className="flex mt-4 items-center gap-1  text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {bike?.address?.street}, {bike?.address?.city}
                  </span>
                </div>

                <div className="mt-2 text-sm text-muted-foreground line-clamp-1">
                  {bike.category} • Size: {bike.size}
                </div>

                {bike?.rating && (
                  <div className="flex text-sm items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                    <span className="font-semibold">{bike?.rating}</span>
                    {bike?.reviews && (
                      <span className="text-gray-600">({bike?.reviews})</span>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { useQuery } from "react-query";
import { api } from "@/lib/api";
import getFileUrl from "@/lib/getFileUrl";

function SearchFilters() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [bikeType, setBikeType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [riderHeight, setRiderHeight] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [numberOfBikes, setNumberOfBikes] = useState<string>("1");

  const handleClearAll = () => {
    setDate(undefined);
    setBikeType("");
    setBrand("");
    setRiderHeight("");
    setSort("");
    setNumberOfBikes("1");
  };

  return (
    <div className="sticky top-14 z-40 bg-white border-b">
      <div className="w-full py-1 px-3 overflow-x-auto">
        <div className="flex flex-wrap gap-2 p-1 min-w-max">
          {/* Select dates */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-3 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <Calendar className="h-4 w-4" />
                <span>Select dates</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Number of bikes */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-3 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <Users className="h-4 w-4" />
                <span>Number of bikes</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <Select value={numberOfBikes} onValueChange={setNumberOfBikes}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">1 bike</SelectItem>
                    <SelectItem value="2">2 bikes</SelectItem>
                    <SelectItem value="3">3 bikes</SelectItem>
                    <SelectItem value="4">4 bikes</SelectItem>
                    <SelectItem value="5">5+ bikes</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>

          {/* Bike type */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-3 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <Filter className="h-4 w-4" />
                <span>Bike type</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuRadioGroup
                value={bikeType}
                onValueChange={setBikeType}
              >
                <DropdownMenuRadioItem value="mountain">
                  Mountain Bike
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="road">
                  Road Bike
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="hybrid">
                  Hybrid Bike
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="electric">
                  Electric Bike
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="city">
                  City Bike
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Brand */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-4 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <span>Brand</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuRadioGroup value={brand} onValueChange={setBrand}>
                <DropdownMenuRadioItem value="trek">Trek</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="specialized">
                  Specialized
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="giant">
                  Giant
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="cannondale">
                  Cannondale
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="scott">
                  Scott
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rider Height */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-4 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <span>Rider Height</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuRadioGroup
                value={riderHeight}
                onValueChange={setRiderHeight}
              >
                <DropdownMenuRadioItem value="150-160">
                  150-160 cm
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="160-170">
                  160-170 cm
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="170-180">
                  170-180 cm
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="180-190">
                  180-190 cm
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="190+">
                  190+ cm
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full pl-4 pr-4 flex items-center gap-2 h-10 bg-white"
              >
                <span>Sort</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start">
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="price-low">
                  Price: Low to High
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="price-high">
                  Price: High to Low
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popular">
                  Most Popular
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="newest">
                  Newest
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear all */}
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="rounded-full pl-4 pr-4 flex items-center gap-2 h-10 text-green-700 hover:text-green-800 hover:bg-green-50"
          >
            Clear all
          </Button>
        </div>
      </div>
    </div>
  );
}
