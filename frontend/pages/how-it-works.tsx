import Image from "next/image";
import { Bike, Calendar, CreditCard, MapPin, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-24 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex max-w-xl mx-auto flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter md:text-3xl">
                How Our Bike Rental Works
              </h1>
              <p className="mx-auto text-base leading-7 max-w-[600px] text-muted-foreground">
                Renting a bike with us is simple, convenient, and fun. Follow
                these easy steps to get riding in no time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="w-full py-12 md:py-24 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">1. Find a Bike</h3>
              <p className="text-muted-foreground">
                Use our app to locate available bikes near you. Our map shows
                real-time availability and bike types.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">2. Book Your Ride</h3>
              <p className="text-muted-foreground">
                Select your preferred bike and rental duration. You can book
                instantly or reserve for later.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">3. Pay Securely</h3>
              <p className="text-muted-foreground">
                Complete your payment through our secure payment system. We
                accept all major credit cards and digital wallets.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Bike className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">4. Unlock & Ride</h3>
              <p className="text-muted-foreground">
                Use the app to unlock your bike. The lock will open
                automatically, and you're ready to ride!
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">5. Return the Bike</h3>
              <p className="text-muted-foreground">
                Return your bike to any designated parking zone when you're
                done. Lock it and end your trip in the app.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">6. Rate Your Experience</h3>
              <p className="text-muted-foreground">
                Share your feedback to help us improve. Rate your ride
                experience and the bike condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Got questions? We've got answers. If you can't find what you're
                looking for, feel free to contact our support team.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  What if there are no bikes available near me?
                </AccordionTrigger>
                <AccordionContent>
                  Our app shows real-time availability. If no bikes are
                  available in your immediate area, the app will show you the
                  nearest available bikes and estimated walking time to reach
                  them.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  What happens if I get a flat tire or mechanical issue?
                </AccordionTrigger>
                <AccordionContent>
                  If you encounter any mechanical issues, report it through the
                  app. Our maintenance team will be notified. You can end your
                  trip early and won't be charged for the remaining time.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Is there a time limit for how long I can rent a bike?
                </AccordionTrigger>
                <AccordionContent>
                  You can rent our bikes for as little as 30 minutes or as long
                  as 72 hours. For longer rentals, please contact our customer
                  service for special arrangements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Do I need to wear a helmet?</AccordionTrigger>
                <AccordionContent>
                  We strongly recommend wearing a helmet for your safety. In
                  some locations, it's required by law. Check your local
                  regulations. Some of our stations offer helmet rentals as
                  well.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  What if I return the bike late?
                </AccordionTrigger>
                <AccordionContent>
                  Late returns are automatically charged at our standard rate.
                  If you know you'll need the bike longer, you can extend your
                  rental through the app to avoid higher late fees.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
