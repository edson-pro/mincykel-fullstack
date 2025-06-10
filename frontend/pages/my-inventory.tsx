import { useState } from "react";
import {
  Bike,
  Eye,
  EyeClosed,
  EyeOff,
  List,
  Plus,
  PlusCircle,
  Search,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Calendar, Copy, Edit, MapPin, Power, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "react-query";
import { api } from "@/lib/api";
import BikeCardSkeleton from "@/components/BikeCardSkeleton";
import getFileUrl from "@/lib/getFileUrl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/modals/ConfirmModal";
import useConfirmModal from "@/hooks/useConfirmModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Bike {
  id: string;
  title: string;
  location: string;
  specifications: string;
  image: string;
  dailyPrice: number;
  weeklyPrice: number;
  isActive: boolean;
}

export default function BikesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const {
    data: bikes = [],
    status,
    refetch,
  } = useQuery({
    queryKey: ["my-inventory"],
    queryFn: () => api.get("/bikes/mine").then(({ data }) => data?.data),
  });

  const filteredBikes = bikes.filter(
    (bike) =>
      bike.model.toLowerCase().includes(search.toLowerCase()) ||
      bike.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id: string) => {
    console.log("Edit bike:", id);
    router.push(`/bikes/${id}/edit`);
  };

  const handleToggle = async (bike: any) => {
    await api.patch(`/bikes/${bike.id}/status`, {
      status: bike.status === "unavailable" ? "available" : "unavailable",
    });
    refetch();
  };

  const handleCalendar = (id: string) => {
    console.log("View calendar:", id);
  };

  const confirmModal = useConfirmModal();

  const handleDelete = (id: string) => {
    confirmModal.setIsLoading(true);
    return api
      .delete(`/bikes/${id}`)
      .then(() => {
        refetch();
        confirmModal.close();
        toast.success("Bike deleted succesfully");
      })
      .catch((e) => {
        confirmModal.setIsLoading(false);
        toast.error(e.message);
      });
  };

  return (
    <>
      <ConfirmModal
        title={"Are you sure you want to delete?"}
        description={`Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi, amet
        a! Nihil`}
        meta={confirmModal.meta}
        onConfirm={handleDelete}
        isLoading={confirmModal.isLoading}
        open={confirmModal.isOpen}
        onClose={() => confirmModal.close()}
      />
      <div className="max-w-6xl min-h-[70vh] mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-xl font-bold">My bikes and accessories</h1>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute text-slate-400 z-20 left-3 top-1/2 -translate-y-1/2"
              />
              <Input
                placeholder="Search your bikes here.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm pl-9"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <Button onClick={() => router.push("/list-bike")} size="sm">
                <PlusCircle size={14} className="h-4 w-4 mr-2" />
                List an item
              </Button>
            </div>
          </div>

          {status === "loading" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => {
                  return <BikeCardSkeleton />;
                })}
              </div>
            </>
          )}

          {status === "success" && (
            <>
              {filteredBikes.length === 0 ? (
                <NoBikesFound />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {filteredBikes.map((bike) => (
                    <BikeCard
                      key={bike.id}
                      bike={bike}
                      onEdit={handleEdit}
                      onToggle={handleToggle}
                      onDelete={(e) => confirmModal.open({ meta: e })}
                      onCalendar={handleCalendar}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function BikeCard({ bike, onEdit, onToggle, onDelete }: any) {
  return (
    <Card className={cn("overflow-hidden shadow-none")}>
      <Link
        href={`/bikes/${bike.id}`}
        className="relative border-b flex aspect-[4/3]- h-[180px]"
        style={{
          opacity: bike.status === "unavailable" ? 0.2 : 1,
        }}
      >
        <img
          src={getFileUrl(bike?.images[0]?.path)}
          alt={bike.model}
          className="object-cover w-full h-full"
        />
      </Link>
      <CardContent className="p-2">
        <div className="space-y-3">
          <div
            className={cn("flex justify-between items-start", {
              "opacity-20": bike.status === "unavailable",
            })}
          >
            <Link
              href={`/bikes/${bike.id}`}
              className="font-semibold hover:underline hover:text-primary text-sm"
            >
              {bike.brand}
            </Link>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {bike.address?.street}
              </span>
            </div>
          </div>

          <div
            className={cn("mt-2 text-sm text-muted-foreground line-clamp-1", {
              "opacity-20": bike.status === "unavailable",
            })}
          >
            {bike.category} • Size: {bike.size}
          </div>

          <div className="flex justify-between items-center">
            <div
              className={cn("space-y-1", {
                "opacity-20": bike.status === "unavailable",
              })}
            >
              <div className="font-semibold text-sm">
                ${bike?.dailyRate}/Day
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(bike.id)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit bike</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggle(bike)}
                className={`h-8 w-8 ${
                  bike.status === "unavailable" ? "text-muted-foreground" : ""
                }`}
              >
                {bike.status !== "unavailable" ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {bike.status === "unavailable" ? "Enable" : "Disable"} bike
                </span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(bike.id)}
                className="h-8 w-8 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete bike</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NoBikesFound() {
  return (
    <div className="text-center min-h-[70px] py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Bike className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No Bikes found</h2>
      <p className="text-muted-foreground leading-7 mb-6">
        We couldn't find any bookings matching <br /> your criteria.
      </p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Clear filters
      </Button>
    </div>
  );
}
