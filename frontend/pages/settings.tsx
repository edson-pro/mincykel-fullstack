import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import React from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Account Settings</h1>

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "account" && <AccountSection />}
          {activeTab === "availability" && <AvailabilitySection />}
          {activeTab === "location" && <LocationSection />}
        </div>
      </div>
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-8 border-b">
      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">Password</h2>
        <div className="max-w-md">
          <input
            type="password"
            placeholder="Current password"
            className="w-full px-4  p-2 border rounded-lg mb-4"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full px-4 p-2 border rounded-lg mb-4"
          />
          <Button>Update your password</Button>
        </div>
      </section>

      <section>
        <h2 className="text-base font-medium mb-4">Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street and Number
            </label>
            <input
              type="text"
              defaultValue="334323"
              className="w-full px-3 text-sm p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              defaultValue="3232323"
              className="w-full px-3 text-sm p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              defaultValue="Chennai"
              className="w-full px-3 text-sm p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              defaultValue="India"
              className="w-full px-3 text-sm p-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button>Update Address</Button>
        </div>
      </section>
    </div>
  );
}

function AvailabilitySection() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-medium mb-4">Calendar Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-sm mb-2">
                Automatic Availability
              </h3>
              <p className="text-sm text-gray-600">
                Automatically manage your bike's availability
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium text-sm mb-2">
                Minimum Notice Period
              </h3>
              <p className="text-sm text-gray-600">
                Set how much advance notice you need before a booking
              </p>
            </div>
            <select className="p-2 text-sm border rounded-lg">
              <option>6 hours</option>
              <option>12 hours</option>
              <option>24 hours</option>
              <option>48 hours</option>
            </select>
          </div>
        </div>
      </section>

      <section className="!mb-28">
        <h2 className="text-base font-medium mb-4">Blocked Dates</h2>
        <div className="border rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-4">
            Select dates when your bikes are not available for rent
          </p>
          <Button>Add Blocked Dates</Button>
        </div>
      </section>
    </div>
  );
}

function LocationSection() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-medium mb-4">Pickup Location</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <h3 className="font-medium mb-2">Current Location</h3>
              <p className="text-gray-600 text-sm">334323, Chennai, India</p>
            </div>
          </div>
          <Button>Update Location</Button>
        </div>
      </section>

      <section className="!mb-28">
        <h2 className="text-base font-medium mb-4">Preferred Meeting Points</h2>
        <div className="border rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-4">
            Add locations where you prefer to meet renters for bike handover
          </p>
          <Button>Add Meeting Point</Button>
        </div>
      </section>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-8">
      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">Profile Picture</h2>
        <div className="flex items-start gap-8">
          <div>
            <div className="w-32 h-32 bg-pink-500 rounded-full flex items-center justify-center text-white text-4xl">
              N
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm leading-7 text-gray-600 mb-2">
              Please upload only formats as jpg, jpeg, png.
              <br />
              Maximum size is 20mb. Minimum dimension is 100px x 100px.
            </p>
            <button className="px-4 mt-2 text-sm py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Upload new picture
            </button>
          </div>
        </div>
      </section>

      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">General Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue="Ntwali"
              className="w-full py-2 px-3 text-sm border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue="Edson"
              className="w-full py-2 px-3 text-sm border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button>Update Profile</Button>
        </div>
      </section>

      <section className="border-b pb-8">
        <h2 className="text-base font-medium mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="ntwaliedson@gmail.com"
              disabled
              className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              To change your email address please contact us via e-mail at
              info@mincykel.com
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex items-center gap-4">
              <input
                type="tel"
                defaultValue="+250 78 8209629"
                disabled
                className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button>Update Profile</Button>
        </div>
      </section>

      <section>
        <h2 className="text-base font-medium mb-4">Profile Bio</h2>
        <textarea
          className="w-full text-sm p-3 border rounded-lg h-32"
          placeholder="Tell us about yourself..."
          defaultValue="Hey folks, my name is Ntwali, and I just joined ListNRide. I look forward to riding & renting nice bikes!"
        />
        <div className="mt-3">
          <Button>Update Bio</Button>
        </div>
      </section>
    </div>
  );
}

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "availability", label: "Availability" },
    { id: "location", label: "Location" },
  ];

  return (
    <div className="border-b">
      <nav className="flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-3 ${
              activeTab === tab.id
                ? "border-b-[3px] border-primary text-primary font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
