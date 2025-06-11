import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Bolt,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Layers2,
  ListCheck,
  LogOut,
  Pin,
  Search,
  User,
  UserPen,
} from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/auth.context";
import { Skeleton } from "../ui/skeleton";
import LogoutModal from "../modals/LogoutModal";
import useModalState from "@/hooks/useModalState";
import Autocomplete from "react-google-autocomplete";
import getFileUrl from "@/lib/getFileUrl";

export default function Navigation() {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [address, setAddress] = useState<any>({
    formatted_address: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const address = searchParams.get("address");
    if (address) {
      setAddress({
        formatted_address: address,
      });
    }
  }, [searchParams.get("address")]);

  const router = useRouter();

  console.log(address);

  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b">
      <div
        className={cn("mx-auto px-3 sm:px-3 lg:px-3", {
          "max-w-6xl": pathname !== "/search",
        })}
      >
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-5">
            <Logo />
            {pathname === "/search" && (
              <form
                onSubmit={(e) => {
                  console.log(address);
                  e.preventDefault();
                  if (!address?.formatted_address) {
                    return;
                  }
                  router.push({
                    pathname: "/search",
                    query: {
                      address: address?.formatted_address,
                      latitude: address?.latitude,
                      longitude: address?.longitude,
                    },
                  });
                }}
                className="bg-slate-100 focus-within:ring-primary  focus-within:ring-offset-2 focus-within:ring-2 w-[250px] flex items-center justify-between px-1 rounded-full"
              >
                <Autocomplete
                  apiKey={"AIzaSyDmgrmJuvPpY95DES70wZfBFJMh4E-6xcc"}
                  defaultValue={address?.formatted_address}
                  onPlaceSelected={(place) => {
                    setAddress({
                      formatted_address: place?.formatted_address,
                      latitude: place?.geometry?.location?.lat(),
                      longitude: place?.geometry?.location?.lng(),
                    });
                  }}
                  options={{
                    types: ["geocode"], // Focus on geographic addresses
                    fields: [
                      "address_components",
                      "geometry",
                      "formatted_address",
                    ],
                    strictBounds: false,
                  }}
                  className="w-full pl-3 text-sm bg-transparent p-2 focus:outline-none"
                />
                <button className="p-2 bg-primary rounded-full flex w-8 h-8 items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
            )}
          </div>
          <NavLinks />
          <UserActions />
        </div>
      </div>
    </header>
  );
}

function NavLinks() {
  const links = [
    { href: "/", label: "Home" },
    // { href: "/search", label: "Find a bike" },
    { href: "/how-it-works", label: "How it works" },
  ];

  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-4">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-gray-700 py-1 px-3 text-[15px] hover:!text-primary rounded-md hover:bg-primary/20 font-medium",
            {
              "!text-primary bg-primary/20 text-gray-900": pathname === href,
            }
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function UserActions() {
  const router = useRouter();

  const { user, loading } = useAuth();

  return (
    <>
      {loading ? (
        <>
          <div className="flex items-center gap-4">
            <Skeleton className="w-[100px] h-8 !bg-primary/20" />
            <Skeleton className="w-8 h-8 rounded-full !bg-primary/20" />
          </div>
        </>
      ) : (
        <>
          {user ? (
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  router.push("/list-bike");
                }}
              >
                Rent out your Bike
              </Button>

              <Profile />
            </div>
          ) : (
            <div className="gap-2 flex">
              <Button
                onClick={() => {
                  router.push("/login");
                }}
                className="h-[34px] "
                variant="outline"
                size="sm"
              >
                Log in
              </Button>
              <Button
                onClick={() => {
                  router.push("/register");
                }}
                className="h-[34px] bg-green-700 hover:bg-green-800"
                size="sm"
              >
                Create an account
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Profile() {
  const router = useRouter();

  const { user, loading } = useAuth();

  const logoutModal = useModalState();

  return (
    <>
      <LogoutModal open={logoutModal.isOpen} onClose={logoutModal.close} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
            <Avatar>
              <AvatarImage
                src={getFileUrl(user?.profileUrl)}
                alt={user?.name}
              />
              <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="ms-2 opacity-60"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-80">
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.name}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                router.push("/my-booking");
              }}
            >
              <ListCheck
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>My Bookings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/my-inventory");
              }}
            >
              <Layers2
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>My Inventory</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                router.push("/list-bike");
              }}
            >
              <BookOpen
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>List An Item</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* <DropdownMenuItem>
              <User
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Profile</span>
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => {
                router.push("/settings");
              }}
            >
              <Bolt
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Account Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logoutModal.open()}>
            <LogOut
              size={16}
              strokeWidth={2}
              className="opacity-60"
              aria-hidden="true"
            />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
