"use client"

import Image from "next/image"
import { MapPin, Clock, Eye, Calendar, BadgeCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"



  interface Event {
  id: number
  image: string
  title: string
  location: string
  startTime: string
  endTime: string
  ownerName: string
  ownerVerified: boolean
  views: number
  visitsCount: number  
}

export function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
        <Image
            src={event.image}
            alt={event.title}
            width={500}
            height={300}
            className="w-full h-48 object-cover"
        />



      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold">{event.title}</h3>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {event.location}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          {event.startTime} - {event.endTime}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-imo-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-imo-primary">
              {(event.ownerName || event.userName || 'U').charAt(0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">{event.ownerName || event.userName || 'Utilisateur'}</span>
              {event.ownerVerified && (
                <BadgeCheck className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {event.views}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {event.visitsCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
