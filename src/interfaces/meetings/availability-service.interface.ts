import type {
  MeetingAvailability,
  MeetingDuration,
  Participant,
} from "@/features/meetings/models/meeting"

export interface AvailabilityService {
  calculate(
    date: string,
    referenceZone: string,
    participants: readonly Participant[],
    duration: MeetingDuration,
  ): MeetingAvailability
}
