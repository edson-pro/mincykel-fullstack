import React, { useId, useRef, useState } from "react";
import { ArrowRight, Award, CalendarIcon, Lock, Wrench } from "lucide-react";
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
import axios from "axios";
import { GetServerSideProps } from "next";
import getFileUrl from "@/lib/getFileUrl";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { differenceInCalendarDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

export const getServerSideProps = (async (context) => {
  const { id } = context.params;
  // Fetch data from external API
  const { data } = await axios.get(
    process.env.NEXT_PUBLIC_API_URL + `/api/bikes/${id}`
  );

  const bike = await data?.data;
  // Pass data to the page via props
  return { props: { bike } };
}) satisfies GetServerSideProps<{ bike: any }>;

export default function BikeDetails({ bike }: { bike: any }) {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid relative grid-cols-1 lg:grid-cols-6 gap-y-6 sm:gap-5">
        <div className="col-span-4">
          <img
            src={getFileUrl(bike?.images[activeImage].path)}
            alt={bike?.brand + " " + bike?.model}
            className="w-full rounded-lg mb-4 h-[480px] object-cover"
          />
          <div className="grid grid-cols-5 mb-5 gap-4">
            {bike?.images.map((image: any, index: number) => (
              <a
                className="cursor-pointer"
                onClick={() => setActiveImage(index)}
                key={index}
              >
                <img
                  src={getFileUrl(image.path)}
                  alt={bike?.brand + " " + bike?.model}
                  className="w-full rounded-lg object-cover h-[100px]"
                />
              </a>
            ))}
          </div>

          <BikeHeader
            brand={bike?.brand}
            model={bike?.model}
            location={bike?.address?.street + ", " + bike?.address?.city}
            rating={bike?.rating || 4.5}
            reviews={bike?.reviews || 120}
            instantBooking={bike?.directBooking}
          />

          <div>
            <p>{bike?.description}</p>
          </div>

          <BikeFeatures />

          <OwnerProfile
            name={bike?.owner?.name}
            image={getFileUrl(bike?.owner?.profileUrl)}
            memberSince={new Date(bike?.owner?.createdAt)
              .getFullYear()
              .toString()}
            isVerified={true}
          />

          <LocationInfo
            address={bike?.address?.street + ", " + bike?.address?.city}
            description="Exact location information is provided after the booking is confirmed."
            mapImageUrl="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/url-https%3A%2F%2Fs3.eu-central-1.amazonaws.com%2Fcdn.listnride.com%2Fassets%2Ficons%2Fbike_map_pin_with_radius.png(11.56444441441441,48.16473351351352)/11.56444441441441,48.16473351351352,14,0,0/1280x320?logo=false&access_token=pk.eyJ1IjoibGlzdG5yaWRlIiwiYSI6ImNrcjR3bHRzMTJpdzUyd254emhua3pkdzIifQ.T8VIOZSGtvHrLPIzc9qAYw"
          />
        </div>

        <div className="sticky h-[650px] col-span-2 top-20">
          <BookingForm bike={bike} />
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

function BookingForm({ bike }: any) {
  const [pickupTime, setPickupTime] = useState("14:00");
  const [returnTime, setReturnTime] = useState("12:00");
  const [bikeSize, setBikeSize] = useState(bike?.size);
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();

  const id = useId();
  const [date, setDate] = useState<DateRange | undefined>();
  const pricePerDay = bike?.dailyRate;
  const pricePerWeek = bike?.weeklyRate;

  const days =
    date?.from && date?.to ? differenceInCalendarDays(date.to, date.from) : 0;

  const dayPrice = days * pricePerDay;
  const weekPrice = days * pricePerWeek;
  const dailyDiscount = bike?.dailyDiscount || 0;
  const weeklyDiscount = bike?.weeklyDiscount || 0;

  const dailyDiscountRate = pricePerDay * (dailyDiscount / 100);
  const weeklyDiscountRate = pricePerWeek * (weeklyDiscount / 100);

  const totalDiscount = dailyDiscountRate * days + weeklyDiscountRate * days;

  const total = dayPrice + weekPrice - totalDiscount;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">
            {pricePerDay}$ / day
          </div>
          <div className="text-gray-600">{pricePerWeek}$ / week</div>
        </div>
        <div className="flex gap-3">
          <ShareComponent />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="*:not-first:mt-2">
            <Label htmlFor={id}>Date range picker</Label>
            <Popover>
              <PopoverTrigger className="mt-2" asChild>
                <Button
                  id={id}
                  variant={"outline"}
                  className={cn(
                    "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn("truncate", !date && "text-muted-foreground")}
                  >
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </span>
                  <CalendarIcon
                    size={16}
                    className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>
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
              disabled
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
            <span>
              ${pricePerDay} x {days} day(s)
            </span>
            <span>$ {dayPrice} </span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount {days} day(s)</span>
            <span>$ {totalDiscount || 0} </span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>$ 0,00 </span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span>{total || 0} $</span>
          </div>
          <div className="text-sm text-gray-500 text-right">incl. VAT</div>
        </div>

        <Button
          onClick={() => {
            router.push(
              `/checkout?bike=${
                bike?.id
              }&quantity=${quantity}&startDate=${format(
                date.from,
                "yyyy-MM-dd"
              )}&endDate=${format(date.to, "yyyy-MM-dd")}`
            );
          }}
          disabled={!date?.from || !date?.to}
          className="w-full"
        >
          Book Bike Now
        </Button>
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
  memberSince: string;
  isVerified: boolean;
}
function OwnerProfile({
  name,
  image,
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
            {/* <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span>{reviews} Reviews</span>
            </div> */}
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
                  defaultValue="https://mincykel.com/Avx8HD"
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
