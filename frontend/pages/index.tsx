import { MapPin, Search } from "lucide-react";
import { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import BikeCard from "@/components/BikeCard";
import { useRouter } from "next/router";

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
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white rounded-lg sm:rounded-full p-2 shadow-lg max-w-4xl mx-auto">
      <div className="flex-1 sm:border-l-0 sm:border-r-0 sm:rounded-none sm:border-y-0 rounded-lg text-sm sm:w-fit border w-full sm:bg-white bg-slate-100 flex items-center px-4">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Where do you want to go?"
          className="w-full bg-transparent p-2 focus:outline-none"
        />
      </div>

      <div className="flex-1  sm:border-r-0 sm:rounded-none sm:border-y-0  rounded-lg  text-sm  sm:w-fit border sm:bg-white w-full bg-slate-100 flex items-center px-4">
        <input
          type="text"
          placeholder="Select dates"
          className="w-full p-2 bg-transparent  focus:outline-none"
        />
      </div>

      <div className="flex-1  sm:border-r-0 sm:rounded-none sm:border-y-0  !border-l rounded-lg  text-sm  sm:w-fit border sm:bg-white w-full bg-slate-100 flex items-center px-4">
        <input
          type="number"
          placeholder="Number of bikes"
          min="1"
          className="w-full p-2 bg-transparent  focus:outline-none"
        />
      </div>

      <button
        onClick={() => {
          router.push("/search");
        }}
        className="bg-primary sm:w-fit w-full text-white px-6 py-2 rounded-full hover:bg-primary transition-colors"
      >
        Search
      </button>
    </div>
  );
}

const bikes = [
  {
    id: 1,
    name: "Curve-E",
    brand: "Babboe",
    type: "Cargo Bike",
    size: "Unisize",
    location: "Schwabing-West",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80",
    instantBook: false,
  },
  {
    id: 2,
    name: "Lumen Ende900",
    brand: "Scott",
    type: "E-Mountain Bike",
    size: "165-175 cm | M",
    location: "Ilsenburg",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&q=80",
    instantBook: true,
  },
  {
    id: 3,
    name: "MITTE - M - Gravel",
    brand: "8bar",
    type: "Gravel Bike",
    size: "175-185 cm | 54cm",
    location: "Mitte",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80",
    instantBook: true,
  },
  {
    id: 4,
    name: "Big E",
    brand: "Babboe",
    type: "Cargo Bike",
    size: "Unisize",
    location: "Bezirk Neukölln",
    price: 38,
    image:
      "https://pedegoelectricbikes.ca/wp-content/uploads/2022/07/Pedego-Avenue-Step-Thru-in-Ocean-Teal.jpg",
    instantBook: false,
  },
];

const recentBikes = [
  {
    id: 1,
    name: "Curve-E",
    brand: "Babboe",
    type: "Cargo Bike",
    size: "Unisize",
    location: "Schwabing-West",
    price: 35,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/132878/thumb_blob.jpg",
    instantBook: false,
  },
  {
    id: 2,
    name: "Lumen Ende900",
    brand: "Scott",
    type: "E-Mountain Bike",
    size: "165-175 cm | M",
    location: "Ilsenburg",
    price: 45,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/175799/thumb_blob.jpg",
    instantBook: true,
  },
  {
    id: 3,
    name: "MITTE - M - Gravel",
    brand: "8bar",
    type: "Gravel Bike",
    size: "175-185 cm | 54cm",
    location: "Mitte",
    price: 40,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/132883/thumb_blob.jpg",
    instantBook: true,
  },
  {
    id: 4,
    name: "Big E",
    brand: "Babboe",
    type: "Cargo Bike",
    size: "Unisize",
    location: "Bezirk Neukölln",
    price: 38,
    image:
      "https://listnride.s3.eu-central-1.amazonaws.com/uploads/ride_image/image_file/171303/thumb_Brompton_M3R_01.jpg",
    instantBook: false,
  },
];

function FrequentlyBooked() {
  return (
    <Carousel className="w-full">
      <div className="relative px-3 max-w-7xl mx-auto my-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Frequently Booked</h2>
          <div className="flex gap-2">
            <CarouselPrevious className="rounded-full" />
            <CarouselNext className="rounded-full" />
          </div>
        </div>

        <CarouselContent className="-ml-1">
          {bikes.map((bike, index) => (
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
      </div>
    </Carousel>
  );
}

function RecentryBooked() {
  return (
    <Carousel className="w-full">
      <div className="relative px-3 max-w-7xl mx-auto my-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Frequently Booked</h2>
          <div className="flex gap-2">
            <CarouselPrevious className="rounded-full" />
            <CarouselNext className="rounded-full" />
          </div>
        </div>

        <CarouselContent className="-ml-1">
          {recentBikes.map((bike, index) => (
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
    <div className="bg-gradient-to-br bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
