import { CalendarIcon, MapPin, RefreshCcw, Star } from "lucide-react";
import { Users, Filter, Search as SearchIcon } from "lucide-react";
import Link from "next/link";

import { Calendar } from "@/components/ui/calendar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { format } from "date-fns";
import router, { useRouter } from "next/router";
import categories from "@/data/categories";
import brands from "@/data/brands";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("../components/BikeMap"), {
  ssr: false,
});

export default function Search() {
  const searchParams = useSearchParams();

  const address = searchParams.get("address");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const [date, setDate] = useState<any>({
    from: null,
    to: null,
  });
  const [bikeType, setBikeType] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [numberOfBikes, setNumberOfBikes] = useState<string>("1");

  useEffect(() => {
    if (from && to) {
      setDate({
        from: new Date(from),
        to: new Date(to),
      });
    }
  }, [from, to]);

  useEffect(() => {
    if (searchParams.get("numberOfBikes")) {
      setNumberOfBikes(searchParams.get("numberOfBikes"));
    }
  }, [searchParams.get("numberOfBikes")]);

  useEffect(() => {
    setBikeType(searchParams.get("bikeType"));
  }, [searchParams.get("bikeType")]);

  useEffect(() => {
    setBrand(searchParams.get("brand"));
  }, [searchParams.get("brand")]);

  useEffect(() => {
    setSort(searchParams.get("sort"));
  }, [searchParams.get("sort")]);

  const {
    data: bikes = [],
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: [
      "bikes",
      address,
      numberOfBikes,
      date,
      bikeType,
      brand,
      sort,
      latitude,
      longitude,
    ],
    keepPreviousData: true,
    queryFn: async () => {
      const obj = {
        address,
        numberOfBikes,
        latitude,
        longitude,
        category: bikeType,
        brand,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };

      if (sort) {
        obj.sortBy =
          sort === "newest" || sort === "oldest"
            ? "createdAt"
            : sort === "price-low"
            ? "dailyRate"
            : "dailyRate";
        obj.sortOrder =
          sort === "newest"
            ? "DESC"
            : sort === "oldest"
            ? "ASC"
            : sort === "price-low"
            ? "ASC"
            : "DESC";
      }

      const response = await api.get("/bikes/search", {
        params: obj,
      });
      return response?.data?.data;
    },
  });

  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-40 bg-white border-b">
        <div className="w-full py-1 px-3 overflow-x-auto">
          {isFetching && !isLoading && (
            <div className="progress-bar h-[3px] opacity-70 absolute top-0 left-0 rounded-t-md bg-primary/20 w-full overflow-hidden">
              <div className="progress-bar-value w-full h-full bg-primary" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 p-1 min-w-max">
            {/* Select dates */}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-3 pr-4 flex items-center gap-2 h-9 bg-white"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {date?.from && date?.to ? (
                    <span>
                      {format(date.from, "dd MMM")} -{" "}
                      {format(date.to, "dd MMM")}
                    </span>
                  ) : (
                    <span>Select dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" sideOffset={20} className="p-0">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  showOutsideDays={true}
                  className="rounded-md border p-2"
                />
              </PopoverContent>
            </Popover>

            {/* Number of bikes */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-3 pr-4 flex items-center gap-2 h-9 bg-white"
                >
                  <Users className="h-4 w-4" />
                  <span>Number of bikes</span>
                  {numberOfBikes ? (
                    <span className="bg-primary text-white px-1.5 rounded-md text-sm">
                      {numberOfBikes}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="start">
                <Select
                  value={numberOfBikes}
                  onValueChange={(value) => {
                    router.push(
                      {
                        pathname: "/search",
                        query: {
                          ...router.query,
                          numberOfBikes: value,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
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
                  className="rounded-full pl-3 pr-4 flex items-center gap-2 h-9 bg-white"
                >
                  <Filter className="h-4 w-4" />
                  <span>Bike type</span>
                  {bikeType ? (
                    <span className="bg-slate-100 capitalize text-slate-800 px-2 py-0.5 rounded-md text-xs">
                      {bikeType}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuRadioGroup
                  value={bikeType}
                  onValueChange={(value) => {
                    router.push(
                      {
                        pathname: "/search",
                        query: {
                          ...router.query,
                          bikeType: value,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  <DropdownMenuRadioItem value="">
                    All Types
                  </DropdownMenuRadioItem>
                  {categories.map((e) => (
                    <DropdownMenuRadioItem key={e.value} value={e.value}>
                      {e.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Brand */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-4 pr-4 flex items-center gap-2 h-9 bg-white"
                >
                  <span>Brand</span>
                  {brand ? (
                    <span className="bg-slate-100 capitalize text-slate-800 px-2 py-0.5 rounded-md text-xs">
                      {brand}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuRadioGroup
                  value={brand}
                  onValueChange={(value) => {
                    router.push(
                      {
                        pathname: "/search",
                        query: {
                          ...router.query,
                          brand: value,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  <DropdownMenuRadioItem value="">
                    All Brands
                  </DropdownMenuRadioItem>
                  {brands.map((e) => (
                    <DropdownMenuRadioItem key={e.value} value={e.value}>
                      {e.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full pl-4 pr-4 flex items-center gap-2 h-9 bg-white"
                >
                  <span>Sort</span>
                  {sort ? (
                    <span className="bg-slate-100 capitalize text-slate-800 px-2 py-0.5 rounded-md text-xs">
                      {sort}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => {
                    router.push(
                      {
                        pathname: "/search",
                        query: {
                          ...router.query,
                          sort: value,
                        },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                >
                  <DropdownMenuRadioItem value="price-low">
                    Price: Low to High
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price-high">
                    Price: High to Low
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="newest">
                    Newest
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    Oldest
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <BikeList bikes={bikes} isLoading={isLoading} />
        <div className="hidden lg:block h-[calc(100vh-100px)] sticky top-[120px]">
          <DynamicMap
            bikes={bikes}
            onBikesChange={() => {}}
            center={{ lat: Number(latitude), lng: Number(longitude) }}
            zoom={15}
          />
        </div>
      </div>
    </div>
  );
}

function BikeList({ bikes, isLoading }: { bikes: any[]; isLoading: boolean }) {
  return (
    <div className="p-5">
      <div className="space-y-4">
        {isLoading && (
          <>
            {[1, 2, 3, 4, 5].map((e) => {
              return (
                <>
                  <div className="flex border p-2 rounded-md items-center- gap-3">
                    {/* Image skeleton */}
                    <div className="w-[180px] h-[130px] bg-gray-200 rounded-md animate-pulse flex-shrink-0"></div>

                    {/* Content skeleton */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {/* Title skeleton */}
                        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>

                        {/* Specs skeleton */}
                        <div className="h-4 bg-gray-200 rounded-md w-1/4 animate-pulse"></div>

                        {/* Location skeleton */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-5 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
                        </div>

                        {/* Type skeleton */}
                        <div className="h-5 bg-gray-200 rounded-md w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </>
        )}

        {!isLoading && !bikes.length ? (
          <div className="flex items-center py-24 justify-center ">
            <div className="max-w-md flex items-center justify-center flex-col mx-auto text-center px-4">
              <img src="/bicycle.png" alt="" className="w-24 h-24 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                No bikes found.
              </h2>
              <p className="text-gray-500 leading-7 mb-8 text-sm">
                We couldn't find any bikes matching your search criteria, Please
                try changing your search criteria.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="sm"
                  onClick={() =>
                    router.push({
                      pathname: "/search",
                      query: {
                        ...router.query,
                        bikeType: undefined,
                        brand: undefined,
                        sort: undefined,
                      },
                    })
                  }
                >
                  <RefreshCcw size={16} className="mr-2" />
                  Reset filters
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        {bikes?.map((bike) => (
          <Link
            key={bike.id}
            href={`/bikes/${bike.id}`}
            className="block bg-white rounded-lg border transition-shadow"
          >
            <div className="flex gap-4 p-2">
              <img
                src={getFileUrl(bike?.images[0].path)}
                alt={bike.brand}
                className="w-[180px] h-[120px] border bg-slate-200 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold mb-1 text-base">
                      {bike?.brand}
                    </h3>
                    <p className="text-gray-600 text-sm">{bike?.model}</p>
                  </div>
                  <div className="text-right text-sm">
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
