"use client"

import { events } from "@/data/mock"
import { EventCard } from "./EventCard"

export function EventsSection() {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  )
}
