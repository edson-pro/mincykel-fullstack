import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MapPin, Zap } from "lucide-react";
import Link from "next/link";

export default function BikeCard({ bike }) {
  return (
    <Link href={`/bikes/${bike.id}`}>
      <Card key={bike.id} className="min-w-[300px] shadow-none flex-none">
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={bike.image}
              alt={`${bike.brand} ${bike.name}`}
              className="rounded-t-lg h-[210px] w-full border-b bg-slate-50 object-cover"
            />
            {bike.instantBook && (
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-primary px-2 py-1 text-sm text-white">
                <Zap className="h-4 w-4" />
                Instant booking
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm capitalize">{bike.brand}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {bike.location}
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{bike.name}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {bike.type} • Size: {bike.size}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="text-lg font-semibold">
            €{bike.price}
            <span className="text-sm font-normal text-muted-foreground">
              /day
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
