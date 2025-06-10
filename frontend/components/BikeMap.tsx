import getFileUrl from "@/lib/getFileUrl";
import { cn } from "@/lib/utils";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  OverlayView,
  useJsApiLoader,
} from "@react-google-maps/api";
import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRef } from "react";
import { useCallback } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const CustomMarker = ({ position, children, onClick }: any) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
    >
      <div
        className="font-sans accor relative bg-white flex justify-center items-center py-1.5 cursor-pointer px-2 text-[14px] w-fit rounded-md !text-green-600"
        onClick={onClick}
      >
        {children}
      </div>
    </OverlayView>
  );
};

const BikeMap: React.FC<any> = ({ bikes, onBikesChange, center, zoom }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    nonce: "map",
    googleMapsApiKey: "AIzaSyDmgrmJuvPpY95DES70wZfBFJMh4E-6xcc",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }
  }, []);

  const [selectedBike, setSelectedBike] = useState<any | null>(null);

  const [cords, setCords] = useState({
    latitude: null,
    longitude: null,
  });

  const handleBoundsChanged = useCallback(async () => {
    if (!map) return;

    // Debounce the bounds changed event to avoid too many API calls
    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }

    boundsTimeoutRef.current = setTimeout(async () => {
      const bounds = map.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      setCords({
        latitude: ne.lat(),
        longitude: ne.lng(),
      });

      try {
        const mapBikes = await bikes;
        onBikesChange(mapBikes);
      } catch (error) {
        console.error("Error fetching bikes for map bounds:", error);
      }
    }, 500); // 500ms debounce
  }, [map, onBikesChange]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Failed to load Google Maps. Please check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading Google Maps...
      </div>
    );
  }

  const router = useRouter();

  return (
    <>
      <div className="absolute z-50 top-4 flex items-center justify-center left-4 right-4">
        <div className="bg-white cursor-pointer w-fit rounded-full border shadow-md">
          <a
            onClick={(e) => {
              e.preventDefault();
              router.push(
                {
                  pathname: "/search",
                  query: {
                    ...router.query,
                    latitude: cords?.latitude,
                    longitude: cords?.longitude,
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            className={cn("flex items-center px-4 py-2", {
              "opacity-50 cursor-not-allowed":
                !cords?.latitude || !cords?.longitude,
            })}
          >
            <SearchIcon className="h-4 w-4 mr-1.5 text-primary" />
            <span className="text-sm text-primary"> Search Here</span>
          </a>
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onMapLoad}
        onUnmount={onUnmount}
        onBoundsChanged={handleBoundsChanged}
        options={mapOptions}
      >
        {bikes?.map((bike) => (
          <CustomMarker
            position={{
              lat: Number(bike?.address?.latitude),
              lng: Number(bike?.address?.longitude),
            }}
            onClick={(e) => {
              console.log(e);
              e.stopPropagation();
              setSelectedBike(bike);
            }}
          >
            <div>
              <span style={{ fontWeight: "bold" }}>${bike.dailyRate}</span>
            </div>
          </CustomMarker>
        ))}

        {selectedBike && (
          <InfoWindow
            position={{
              lat: Number(selectedBike?.address?.latitude),
              lng: Number(selectedBike?.address?.longitude),
            }}
            onCloseClick={() => setSelectedBike(null)}
          >
            <BikeInfoWindow
              bike={selectedBike}
              onClose={() => setSelectedBike(null)}
            />
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
};

export default BikeMap;

const BikeInfoWindow: React.FC<any> = ({ bike, onClose }) => (
  <div className="p-1 max-w-xs">
    {bike?.images?.length && (
      <img
        src={getFileUrl(bike?.images[0].path)}
        alt={bike.model}
        className="w-full h-32 object-cover rounded mb-2"
      />
    )}

    <div className="space-y-1 text-sm font-sans">
      <p>
        <Link
          className="text-primary hover:underline"
          href={`/bikes/${bike.id}`}
        >
          <span className="font-medium">Model:</span> {bike.model}
        </Link>
      </p>
      <p>
        <span className="font-medium">Price:</span> ${bike.dailyRate}/day
      </p>
      <p>
        <span className="font-medium">Status:</span> {bike.status}
      </p>
      <p>
        <span className="font-medium">Address:</span> {bike?.address?.street}
      </p>
    </div>
  </div>
);
