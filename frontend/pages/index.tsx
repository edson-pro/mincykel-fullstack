import { CalendarIcon, MapPin, Search } from "lucide-react";
import { useRef, useState } from "react";
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
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import Script from "next/script";
import { cn } from "@/lib/utils";

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { address: "" } as any;
  }

  handleChange = (address: any) => {
    this.setState({ address });
  };

  handleSelect = (address) => {
    geocodeByAddress(address)
      .then((results) => getLatLng(results[0]))
      .then((latLng) => console.log("Success", latLng))
      .catch((error) => console.error("Error", error));
  };

  render() {
    return (
      <PlacesAutocomplete
        // @ts-ignore
        value={this.state?.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: "Search Places ...",
                className: "location-search-input",
              })}
            />
            <div className="autocomplete-dropdown-container">
              {loading && <div>Loading...</div>}
              {suggestions.map((suggestion) => {
                const className = suggestion.active
                  ? "suggestion-item--active"
                  : "suggestion-item";
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: "#fafafa", cursor: "pointer" }
                  : { backgroundColor: "#ffffff", cursor: "pointer" };
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

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

  const [address, setAddress] = useState<string>("");
  const [quantity, setQuantity] = useState<any>("");

  return (
    <>
      {" "}
      {/* <Script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></Script> */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-lg sm:rounded-full p-2 shadow-lg max-w-4xl mx-auto">
        <div className="flex-1 sm:border-l-0 sm:border-r-0 sm:rounded-none sm:border-y-0 rounded-lg text-sm sm:w-fit border w-full sm:bg-white bg-slate-100 flex items-center px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Where do you want to go?"
            className="w-full bg-transparent p-2 focus:outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        {/* <LocationSearchInput /> */}

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
              `/search?address=${address}&quantity=${quantity}&from=${date?.from}&to=${date?.to}`
            );
          }}
          disabled={!address || !quantity || !date?.from || !date?.to}
          className={cn(
            "bg-primary sm:w-fit w-full text-white px-6 py-2 rounded-full hover:bg-primary transition-colors",
            !address || !quantity || !date?.from || !date?.to
              ? "opacity-50 cursor-not-allowed"
              : ""
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
    queryKey: ["bikes"],
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

const cities: City[] = [
  { name: "Berlin", country: "Germany" },
  { name: "Amsterdam", country: "Netherlands" },
  { name: "Barcelona", country: "Spain" },
  { name: "Vannes", country: "France" },
  { name: "Hamburg", country: "Germany" },
  { name: "Motala", country: "Sweden" },
  { name: "München", country: "Germany" },
  { name: "Paris", country: "France" },
  { name: "ÎLE d'ARZ", country: "France" },
  { name: "Palma", country: "Spain" },
  { name: "Split", country: "Croatia" },
  { name: "Málaga", country: "Spain" },
  { name: "Alcúdia", country: "Spain" },
  { name: "Mauguio", country: "France" },
  { name: "Playa Blanca", country: "Spain" },
  { name: "San Bartolomé de Tirajana", country: "Spain" },
  { name: "Dresden", country: "Germany" },
  { name: "Noirmoutier-en-l'Île", country: "France" },
  { name: "Wien", country: "Austria" },
  { name: "Meran", country: "Italy" },
];

const PopularCities: React.FC = () => {
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
