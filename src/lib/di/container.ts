import { createAvailabilityService } from "@/features/meetings/services/availability-service"
import { timezoneService } from "@/features/timezones/services/timezone-service"

export const timezones = timezoneService
export const availability = createAvailabilityService(timezones)
