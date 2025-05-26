import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import React from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = React.useState("profile");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Account Settings</h1>

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6 min-h-[50vh]">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "account_security" && <AccountSection />}
          {activeTab === "address_book" && <AddressBookSection />}
        </div>
      </div>
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-8">
      <section className="pb-8">
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

function SettingsTabs({ activeTab, onTabChange }: any) {
  const tabs = [
    { id: "profile", label: "Profile Information" },
    { id: "account_security", label: "Account security" },
    { id: "address_book", label: "Address Book" },
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

function AddressBookSection() {
  return <div>AddressBookSection</div>;
}
