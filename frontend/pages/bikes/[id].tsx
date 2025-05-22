import React, { useRef, useState } from "react";
import { ArrowRight, Award, Lock, Wrench } from "lucide-react";
import { Star, Zap } from "lucide-react";
import { Share, Heart } from "lucide-react";
import { MapPin } from "lucide-react";
import { Clock, Shield, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  RiCodeFill,
  RiFacebookFill,
  RiMailLine,
  RiTwitterXFill,
} from "@remixicon/react";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/router";

export default function BikeDetails() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid relative grid-cols-1 lg:grid-cols-6 gap-y-6 sm:gap-5">
        <div className="col-span-4">
          <img
            src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7"
            alt="Scott Scale 970"
            className="w-full rounded-lg mb-6"
          />

          <BikeHeader
            brand="Scott"
            model="Scale 970 • MTB Hardtail"
            location="Ilsenburg, Deutschland"
            rating={5.0}
            reviews={12}
            instantBooking={true}
          />

          <BikeFeatures />

          <OwnerProfile
            name="Joaquin"
            image="https://images.unsplash.com/photo-1600486913747-55e5470d6f40"
            reviews={4.5}
            responseTime="<12h"
            memberSince="2021"
            isVerified={true}
          />

          <LocationInfo
            address="Abando, Bilbo"
            description="Exact location information is provided after the booking is confirmed."
            mapImageUrl="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/url-https%3A%2F%2Fs3.eu-central-1.amazonaws.com%2Fcdn.listnride.com%2Fassets%2Ficons%2Fbike_map_pin_with_radius.png(11.56444441441441,48.16473351351352)/11.56444441441441,48.16473351351352,14,0,0/1280x320?logo=false&access_token=pk.eyJ1IjoibGlzdG5yaWRlIiwiYSI6ImNrcjR3bHRzMTJpdzUyd254emhua3pkdzIifQ.T8VIOZSGtvHrLPIzc9qAYw"
          />
        </div>

        <div className="sticky h-[650px] col-span-2 top-20">
          <BookingForm pricePerDay={33} pricePerWeek={196} />
        </div>
      </div>
    </div>
  );
}

interface BikeFeatureProps {
  icon: React.ReactNode;
  label: string;
}

function BikeFeature({ icon, label }: BikeFeatureProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm">
      {icon}
      <span>{label}</span>
    </div>
  );
}
function BikeFeatures() {
  return (
    <div className="flex mb-6 gap-3 mt-6">
      <BikeFeature icon={<Lock className="h-4 w-4" />} label="Lock" />
      <BikeFeature icon={<Wrench className="h-4 w-4" />} label="Repair Kit" />
    </div>
  );
}

interface BikeHeaderProps {
  brand: string;
  model: string;
  location: string;
  rating: number;
  reviews: number;
  instantBooking?: boolean;
}
function BikeHeader({
  brand,
  model,
  location,
  rating,
  reviews,
  instantBooking,
}: BikeHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="sm:text-2xl text-xl capitalize font-bold mb-2">
        {brand} | {model}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-600">{location}</span>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold">{rating}</span>
          <span className="text-gray-600 underline">{reviews} Reviews</span>
        </div>
        {instantBooking && (
          <div className="flex items-center gap-1 text-prfill-primary">
            <Zap className="h-4 w-4" />
            <span>Instant booking</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface BookingFormProps {
  pricePerDay: number;
  pricePerWeek: number;
}
function BookingForm({ pricePerDay, pricePerWeek }: BookingFormProps) {
  const [dateRange, setDateRange] = useState("");
  const [pickupTime, setPickupTime] = useState("14:00");
  const [returnTime, setReturnTime] = useState("12:00");
  const [bikeSize, setBikeSize] = useState("175 cm - 185 cm | L");
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">
            {pricePerDay}€ / day
          </div>
          <div className="text-gray-600">{pricePerWeek}€ / week</div>
        </div>
        <div className="flex gap-3">
          <ShareComponent />
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Choose your date range
          </label>
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="03 January - 31 January"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Pickup time
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Return time
            </label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bike size</label>
            <input
              type="text"
              value={bikeSize}
              onChange={(e) => setBikeSize(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>33 € x 29 day(s)</span>
            <span>957,00 €</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount 29 day(s)</span>
            <span>-143,55 €</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>0,00 €</span>
          </div>
          <div className="flex justify-between">
            <span>Insurance</span>
            <span>48,31 €</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>861,76 €</span>
          </div>
          <div className="text-sm text-gray-500 text-right">incl. VAT</div>
        </div>

        <button
          onClick={() => {
            router.push("/checkout?bike=1");
          }}
          className="w-full bg-gray-300 text-white py-2.5 rounded-lg font-medium"
        >
          Book Bike Now
        </button>
      </div>
    </div>
  );
}

interface LocationInfoProps {
  address: string;
  description: string;
  mapImageUrl: string;
}
function LocationInfo({
  address,
  description,
  mapImageUrl,
}: LocationInfoProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Full address after booking</h2>
      <div className="flex items-start gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
        <div>
          <p className="font-medium">{address}</p>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <div className="rounded-lg mt-4 overflow-hidden">
        <img
          src={mapImageUrl}
          alt="Location map"
          className="w-full h-[300px] object-cover"
        />
      </div>
    </div>
  );
}

interface OwnerProfileProps {
  name: string;
  image: string;
  reviews: number;
  responseTime: string;
  memberSince: string;
  isVerified: boolean;
}
function OwnerProfile({
  name,
  image,
  reviews,
  responseTime,
  memberSince,
  isVerified,
}: OwnerProfileProps) {
  return (
    <div className="mb-8 mt-8">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-black">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span>{reviews} Reviews</span>
            </div>
            {isVerified && (
              <div className="flex items-center gap-1">
                <Award className="h-6 w-6 text-primary" />
                <span>Verified</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <SmilePlus className="h-5 w-5 text-primary" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Button>
          View Profile
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
}
function ShareComponent() {
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Share className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="flex !font-sans flex-col gap-3 text-center">
            <div className="text-sm font-medium">Share Bike</div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="icon" variant="outline" aria-label="Embed">
                <RiCodeFill size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share on Twitter"
              >
                <RiTwitterXFill size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share on Facebook"
              >
                <RiFacebookFill size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share via email"
              >
                <RiMailLine size={16} strokeWidth={2} aria-hidden="true" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="input-53"
                  className="pe-9"
                  type="text"
                  defaultValue="https://originui.com/Avx8HD"
                  aria-label="Share link"
                  readOnly
                />
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleCopy}
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed"
                        aria-label={copied ? "Copied" : "Copy to clipboard"}
                        disabled={copied}
                      >
                        <div
                          className={cn(
                            "transition-all",
                            copied
                              ? "scale-100 opacity-100"
                              : "scale-0 opacity-0"
                          )}
                        >
                          <Check
                            className="stroke-emerald-500"
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </div>
                        <div
                          className={cn(
                            "absolute transition-all",
                            copied
                              ? "scale-0 opacity-0"
                              : "scale-100 opacity-100"
                          )}
                        >
                          <Copy size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="px-2 py-1 text-xs">
                      Copy to clipboard
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
