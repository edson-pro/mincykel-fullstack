import { CalendarIcon, MapPin, Search } from "lucide-react";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import BikeCard from "@/components/BikeCard";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { api } from "@/lib/api";

import BikeCardSkeleton from "@/components/BikeCardSkeleton";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { cn } from "@/lib/utils";
import Autocomplete from "react-google-autocomplete";

export default function Home() {
  return (
    <div>
      <div className="bg-primary py-10 sm:py-20 px-4 relative">
        <img
          className="absolute object-cover z-0 opacity-35 left-0 w-full top-0 h-full"
          src="/pattern.png"
          alt=""
        />
        <div className="relative z-40">
          <div className="max-w-4xl mx-auto text-center text-white mb-8">
            <h1 className="md:text-4xl text-2xl leading-9 md:leading-[60px] font-bold mb-4">
              Rent bikes from Europe's largest online bike rental platform
            </h1>
          </div>
          <SearchBar />
        </div>
      </div>
      <FrequentlyBooked />
      <PopularCities />
      <RecentryBooked />
    </div>
  );
}

function SearchBar() {
  const router = useRouter();

  const [date, setDate] = useState<any | undefined>({
    from: null,
    to: null,
  });

  const [address, setAddress] = useState<any>({
    formatted_address: "",
    latitude: 0,
    longitude: 0,
  });

  const [quantity, setQuantity] = useState<any>("");

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-lg sm:rounded-full p-2 shadow-lg max-w-4xl mx-auto">
        <div className="flex-1 sm:border-l-0 sm:border-r-0 sm:rounded-none sm:border-y-0 rounded-lg text-sm sm:w-fit border w-full sm:bg-white bg-slate-100 flex items-center px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <Autocomplete
            apiKey={"AIzaSyDmgrmJuvPpY95DES70wZfBFJMh4E-6xcc"}
            onPlaceSelected={(place) =>
              setAddress({
                formatted_address: place?.formatted_address,
                latitude: place?.geometry?.location.lat(),
                longitude: place?.geometry?.location.lng(),
              })
            }
            options={{
              types: ["geocode"], // Focus on geographic addresses
              fields: ["address_components", "geometry", "formatted_address"],
              strictBounds: false,
            }}
            className="w-full bg-transparent p-2 focus:outline-none"
          />
        </div>

        <div className="flex-1  sm:border-r-0 sm:rounded-none sm:border-y-0  rounded-lg  text-sm  sm:w-fit border sm:bg-white w-full bg-slate-100 flex items-center px-4">
          <Popover>
            <PopoverTrigger asChild>
              <a className="flex items-center gap-2 font-medium text-gray-500 cursor-pointer">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                {date?.from && date?.to ? (
                  <span className="ml-2">
                    {format(date.from, "dd MMM")} - {format(date.to, "dd MMM")}
                  </span>
                ) : (
                  <span className="ml-2">Select Dates</span>
                )}
              </a>
            </PopoverTrigger>
            <PopoverContent side="bottom" sideOffset={20} className="p-0">
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                pagedNavigation
                showOutsideDays={false}
                className="rounded-md border p-2"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1  sm:border-r-0 sm:rounded-none sm:border-y-0  !border-l rounded-lg  text-sm  sm:w-fit border sm:bg-white w-full bg-slate-100 flex items-center px-4">
          <input
            type="number"
            placeholder="Number of bikes"
            min="1"
            className="w-full p-2 bg-transparent  focus:outline-none"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            router.push(
              `/search?address=${
                address?.formatted_address
              }&quantity=${quantity}&from=${format(
                date?.from,
                "yyyy-MM-dd"
              )}&to=${format(date?.to, "yyyy-MM-dd")}&latitude=${
                address?.latitude
              }&longitude=${address?.longitude}`
            );
          }}
          className={cn(
            "bg-primary hover:bg-[#307448] sm:w-fit w-full text-white px-6 py-2 rounded-full cursor-pointer transition-colors",
            !address?.formatted_address ? "opacity-50 pointer-events-none" : ""
          )}
        >
          Search
        </button>
      </div>
    </>
  );
}

function FrequentlyBooked() {
  const { data = [], status } = useQuery({
    queryKey: ["bikes"],
    queryFn: () =>
      api.get("/bikes/frequently-booked").then(({ data }) => data?.data),
  });
  return (
    <Carousel className="w-full">
      <div className="relative px-3 max-w-6xl mx-auto my-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">Frequently Booked</h2>
          <div className="flex gap-2">
            <CarouselPrevious className="rounded-full" />
            <CarouselNext className="rounded-full" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((e) => {
                return <BikeCardSkeleton />;
              })}
            </div>
          </>
        )}

        {status === "success" && (
          <CarouselContent className="-ml-1">
            {data?.map((bike, index) => (
              <CarouselItem
                key={index}
                className="pl-1 md:basis-1/2 lg:basis-1/4"
              >
                <div className="p-1">
                  <BikeCard bike={bike} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </div>
    </Carousel>
  );
}

function RecentryBooked() {
  const { data = [], status } = useQuery({
    queryKey: ["recent-booked"],
    queryFn: () =>
      api.get("/bikes/recent-booked").then(({ data }) => data?.data),
  });
  return (
    <Carousel className="w-full">
      <div className="relative px-3 max-w-6xl mx-auto my-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recentry Booked</h2>
          <div className="flex gap-2">
            <CarouselPrevious className="rounded-full" />
            <CarouselNext className="rounded-full" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((e) => {
                return <BikeCardSkeleton />;
              })}
            </div>
          </>
        )}

        {status === "success" && (
          <CarouselContent className="-ml-1">
            {data?.map((bike, index) => (
              <CarouselItem
                key={index}
                className="pl-1 md:basis-1/2 lg:basis-1/4"
              >
                <div className="p-1">
                  <BikeCard bike={bike} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        )}
      </div>
    </Carousel>
  );
}

interface City {
  name: string;
  country: string;
}

const cities: any[] = [
  {
    name: "Kigali",
    country: "Rwanda",
    meta: {
      formatted_address: "Kigali, Rwanda",
      latitude: -1.9440727,
      longitude: 30.0618851,
    },
  },
  {
    name: "Gisenyi",
    country: "Rwanda",
    meta: {
      formatted_address: "Gisenyi, Rwanda",
      latitude: -1.6990482,
      longitude: 29.2560996,
    },
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    meta: {
      formatted_address: "Amsterdam, Netherlands",
      latitude: 52.3675734,
      longitude: 4.9041389,
    },
  },
  {
    name: "Barcelona",
    country: "Spain",
    meta: {
      formatted_address: "Barcelona, Spain",
      latitude: 41.3873974,
      longitude: 2.168568,
    },
  },
  {
    name: "Vannes",
    country: "France",
    meta: {
      formatted_address: "Vannes, France",
      latitude: 47.65861659999999,
      longitude: -2.7599022,
    },
  },
  {
    name: "Hamburg",
    country: "Germany",
    meta: {
      formatted_address: "Hamburg, Germany",
      latitude: 53.5488282,
      longitude: 9.987170299999999,
    },
  },
  {
    name: "Motala",
    country: "Sweden",
    meta: {
      formatted_address: "Motala, Sweden",
      latitude: 58.5380335,
      longitude: 15.0470936,
    },
  },
  {
    name: "München",
    country: "Germany",
    meta: {
      formatted_address: "Munich, Germany",
      latitude: 48.1351253,
      longitude: 11.5819806,
    },
  },
  {
    name: "Paris",
    country: "France",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "ÎLE d'ARZ",
    country: "France",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Palma",
    country: "Spain",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Split",
    country: "Croatia",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Málaga",
    country: "Spain",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Alcúdia",
    country: "Spain",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Mauguio",
    country: "France",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Playa Blanca",
    country: "Spain",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "San Bartolomé de Tirajana",
    country: "Spain",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Dresden",
    country: "Germany",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Noirmoutier-en-l'Île",
    country: "France",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Wien",
    country: "Austria",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
  {
    name: "Meran",
    country: "Italy",
    meta: {
      formatted_address: "Paris, France",
      latitude: 48.8575475,
      longitude: 2.3513765,
    },
  },
];

const PopularCities: React.FC = () => {
  const router = useRouter();
  return (
    <div className="bg-gradient-to-br bg-primary py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl px-4  mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <MapPin className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Popular Cities</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {cities.map((city) => (
            <button
              onClick={() => {
                if (city.meta) {
                  router.push(
                    `/search?address=${city.meta.formatted_address}&latitude=${city.meta.latitude}&longitude=${city.meta.longitude}`
                  );
                }
              }}
              key={city.name}
              className="inline-flex items-center px-4 py-2 bg-white rounded-md 
                         text-gray-800 hover:bg-gray-100 transition-all duration-200 
                         transform hover:scale-105 hover:shadow-lg"
            >
              <span className="text-sm font-medium">{city.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
