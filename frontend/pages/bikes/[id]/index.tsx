import React, { useId, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  Bike,
  CalendarIcon,
  CircleAlert,
  Loader2,
  Lock,
  Trash,
  Wrench,
} from "lucide-react";
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
import accessories from "@/data/accessories";

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

export default function BikeDetails({ bike: bikeData }: { bike: any }) {
  const [activeImage, setActiveImage] = useState(0);

  const { data: bike, refetch } = useQuery({
    queryKey: ["bike", bikeData.id],
    queryFn: async () => {
      const { data } = await api.get(`/bikes/${bikeData.id}`);
      return data?.data;
    },
    initialData: bikeData,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid relative grid-cols-1 lg:grid-cols-6 gap-y-6 sm:gap-5">
        <div className="col-span-4">
          <img
            src={getFileUrl(bike?.images[activeImage].path)}
            alt={bike?.brand + " " + bike?.model}
            className="w-full border rounded-lg mb-4 h-[480px] object-cover"
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
                  className="w-full border rounded-lg object-cover h-[100px]"
                />
              </a>
            ))}
          </div>

          <BikeHeader
            brand={bike?.brand}
            model={bike?.model}
            location={bike?.address?.street + ", " + bike?.address?.city}
            rating={(bike?.averageRating || 0).toFixed(1) || 0.0}
            reviews={bike?.reviews?.length || 0}
            instantBooking={bike?.directBooking}
          />

          <div style={{ whiteSpace: "pre-wrap" }} className="text-sm leading-6">
            <p>{bike?.description}</p>
          </div>

          <BikeFeatures accessories={bike?.accessories || []} />

          <OwnerProfile
            name={bike?.owner?.name}
            image={getFileUrl(bike?.owner?.profileUrl)}
            memberSince={new Date(bike?.owner?.createdAt)
              .getFullYear()
              .toString()}
            isVerified={true}
          />

          <LocationInfo
            latitude={bike?.address?.latitude}
            longitude={bike?.address?.longitude}
            address={bike?.address?.street + ", " + bike?.address?.city}
          />

          <Reviews bike={bike} refetch={() => refetch()} />
        </div>

        <div className="sticky h-[650px] col-span-2 top-20">
          <BookingForm bike={bike} />
        </div>
      </div>
    </div>
  );
}

function BikeFeature({ Icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm">
      <Icon size={18} />
      <span>{label}</span>
    </div>
  );
}
function BikeFeatures({
  accessories: bikeAccessories,
}: {
  accessories: string[];
}) {
  return (
    <div className="flex mb-6 gap-3 mt-6">
      {bikeAccessories.map((accessory) => {
        const accessoryInfo = accessories.find((a) => a.name === accessory);
        return (
          <BikeFeature
            key={accessory}
            Icon={accessoryInfo?.icon}
            label={accessoryInfo?.name}
          />
        );
      })}
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
  const router = useRouter();
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
          <a
            onClick={() => router.push(`#reviews`)}
            className="text-gray-600 cursor-pointer underline"
          >
            {reviews} Review{reviews === 1 ? "" : "s"}
          </a>
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

  const id = useId();
  const [date, setDate] = useState<DateRange | undefined>();
  const pricePerDay = bike?.dailyRate;
  const pricePerWeek = bike?.dailyRate * 7;

  const days =
    date?.from && date?.to ? differenceInCalendarDays(date.to, date.from) : 0;

  const dayPrice = days * pricePerDay;
  const dailyDiscount = bike?.dailyDiscount || 0;

  const dailyDiscountRate = pricePerDay * (dailyDiscount / 100);

  const totalDiscount = dailyDiscountRate * days;

  const total = dayPrice - totalDiscount;

  const requestPaymentCheckoutMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/booking/create", {
        bikeId: bike.id,
        totalAmount: total,
        startTime: date?.from,
        endTime: date?.to,
        discountAmount: dailyDiscount,
        days,
        pickupTime,
        returnTime,
      });

      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
      setBookingError(error?.response?.data?.message || "Something went wrong");
    },
  });

  const [bookingError, setBookingError] = useState<string | null>(null);

  return (
    <div className="bg-white p-4 pt-3 rounded-lg border">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xl font-bold text-primary">
            {parseFloat(pricePerDay).toFixed(1)}$ / day
          </div>
          <div className="text-gray-600">${pricePerWeek.toFixed(1)} / week</div>
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
            <Input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full py-2 px-4 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Return time
            </label>
            <Input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full py-2 px-4 border rounded-lg"
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
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{total || 0} $</span>
          </div>
        </div>

        {bookingError && (
          <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
            <p className="text-sm">
              <CircleAlert
                className="me-3 -mt-0.5 inline-flex opacity-60"
                size={16}
                aria-hidden="true"
              />
              {bookingError}
            </p>
          </div>
        )}

        <Button
          onClick={() => requestPaymentCheckoutMutation.mutate()}
          disabled={
            requestPaymentCheckoutMutation.isLoading || !date?.from || !date?.to
          }
          className="w-full"
        >
          {requestPaymentCheckoutMutation.isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Book Bike Now
        </Button>
      </div>
    </div>
  );
}

interface LocationInfoProps {
  address: string;
  latitude: number;
  longitude: number;
}
function LocationInfo({ address, latitude, longitude }: LocationInfoProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Full address after booking</h2>
      <div className="flex items-start gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
        <div>
          <p className="font-medium">{address}</p>
          <p className="text-gray-600 text-sm">
            Exact location information is provided after the booking is
            confirmed.
          </p>
        </div>
      </div>
      <div className="rounded-lg border mt-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="h-[200px] w-[200px] bg-primary/20 border-primary border rounded-full flex items-center justify-center">
            <div className="h-12 w-12 shadow-lg bg-white rounded-full flex items-center justify-center">
              <Bike className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <img
          className="w-full h-[250px] bg-slate-200 object-cover"
          src={`https://maps.googleapis.com/maps/api/staticmap?
center=${latitude},${longitude}&
zoom=14&
size=600x400&
maptype=roadmap&
key=AIzaSyDmgrmJuvPpY95DES70wZfBFJMh4E-6xcc`}
          alt={`Map at ${latitude},${longitude}`}
        ></img>
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
      {/* <div className="flex items-center gap-2 text-sm text-gray-600">
        <Button>
          View Profile
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </div> */}
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

import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function Reviews({ bike, refetch }: { bike: any; refetch: () => void }) {
  const [open, setOpen] = useState(false);
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-[#CCDB3A] text-[#CCDB3A]"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  const { user } = useAuth();

  const router = useRouter();

  return (
    <>
      <div id="reviews" className="max-w-4xl mx-auto- py-6 mt-3 bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Bike Reviews
        </h2>

        <div className="grid grid-cols-6 gap-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-2">
              {renderStars(bike?.averageRating || 0)}
              <span className="text-xl font-semibold text-gray-900">
                {bike?.averageRating?.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <span className="text-slate-500">
                {bike?.reviews?.length} People reviewed
              </span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-[#124A01] mb-2">
                How the rating works
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#124A01] mb-3">
                Review this product
              </h3>

              <Button
                onClick={() => {
                  if (user) {
                    setOpen(true);
                  } else {
                    router.push(`/login?redirect=${router.asPath}`);
                  }
                }}
                className="bg-[#124A01] w-full hover:bg-[#124A01] text-white px-6 py-2"
              >
                {user ? "Write a review" : "Sign in to write a review"}
              </Button>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="col-span-4 space-y-6">
            {bike?.reviews
              ?.sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              ?.map((review: any) => (
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="">
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-10 h-10 bg-gray-200">
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex fc items-center gap-3 mb-1">
                          <span className="font-semibold text-sm text-[#124A01]">
                            {review?.user?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          {renderStars(review?.rating)}
                          <span className="font-semibold text-[#124A01] ml-1">
                            {review?.rating?.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3 mt-3">
                          Reviewed on{" "}
                          <span className="font-medium text-[#124A01]">
                            {format(review?.createdAt, "MMMM dd, yyyy")}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                          {review?.content}
                        </p>

                        {review?.photos?.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              Review photos
                            </span>
                          </div>
                        )}

                        {review?.photos?.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {review?.photos?.map((photo, i) => (
                              <img
                                key={i}
                                src={getFileUrl(photo?.path)}
                                alt="Review photo"
                                className="w-12 h-12 object-cover border rounded-lg overflow-hidden"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
      <ReviewDialog
        refetch={refetch}
        open={open}
        onOpenChange={setOpen}
        bike={bike}
      />
    </>
  );
}

import { X, Paperclip } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth.context";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useMutation, useQuery } from "react-query";

function ReviewDialog({
  open,
  onOpenChange,
  bike,
  refetch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: any;
  refetch: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState<any[]>([]);

  const maxCharacters = 500;

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleStarHover = (starIndex: number) => {
    setHoveredRating(starIndex + 1);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const isActive = i < (hoveredRating || rating);
      return (
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              isActive
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      );
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      await api.post(`/bikes/${bike?.id}/reviews`, {
        rating,
        content: reviewText,
        photos: attachedPhotos,
      });
      // reset
      setRating(0);
      setReviewText("");
      setAttachedPhotos([]);

      toast.success("Review created successfully");
      onOpenChange(false);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Request a signed URL from your backend
      const {
        data: { signedUrl, key },
      } = await api.post("/sign", {
        fileName: data.file.name,
        fileType: data.file.type,
        fileSize: data.file.size,
      });

      // Step 2: Upload the file directly to S3 using the signed URL
      await axios.put(signedUrl, data.file, {
        headers: {
          "Content-Type": data.file.type,
        },
      });

      return key;
    },
    onSuccess: (data) => {
      setAttachedPhotos((prev) => [...prev, { path: data }]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload file");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ file });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 mx-auto p-0">
        <DialogHeader className="pb-3 pt-2 px-4 border-b space-y-1">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Bike Review
          </DialogTitle>
          <p className="text-sm text-gray-600 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6 py-3 px-4">
            {/* Description */}

            {/* Rating Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Rate this Product
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Tell others what you think
              </p>
              <div className="flex gap-1">{renderStars()}</div>
            </div>

            {/* Review Text */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Write a review
              </h3>
              <div className="relative">
                <Textarea
                  placeholder="Describe how you feel about the product (Optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={maxCharacters}
                  className="min-h-[120px] resize-none bg-gray-50 border-gray-200 focus:bg-white"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {reviewText.length}/{maxCharacters}
                </div>
              </div>
            </div>

            {/* Attach Photos */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Attach Photos
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Attach product photos, up to 6 photos are allowed.
              </p>

              <div className="grid grid-cols-5 gap-2 mb-0">
                {attachedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={getFileUrl(photo?.path) || "/placeholder.svg"}
                        alt={`Attached photo ${index + 1}`}
                        width={60}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === attachedPhotos.length - 1 && (
                      <div className="absolute inset-0 bg-black/20 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <a
                          className="cursor-pointer"
                          onClick={() => {
                            setAttachedPhotos((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash className="w-6 h-6 text-white" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={uploadMutation?.isLoading}
                className="text-slate-700 mt-3 border-slate-300 hover:bg-slate-50"
                onClick={() => inputRef.current?.click()}
              >
                {uploadMutation?.isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 mr-2" />
                )}
                Attach
              </Button>
              <input
                type="file"
                ref={inputRef}
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e);
                }}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-3 py-3 border-t">
          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating || !reviewText}
            className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Submit Your Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
