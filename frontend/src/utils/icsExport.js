/**
 * Generates and triggers download of an RFC 5545 compliant iCalendar (.ics) file
 * from an AI-generated itinerary string.
 */
export function exportItineraryToICS(destination, itineraryMarkdown) {
  if (!itineraryMarkdown) return;

  const now = new Date();
  const formatICSDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Base trip start date is tomorrow morning 09:00 local time
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(9, 0, 0, 0);

  // Split itinerary by Day headings (e.g. ## Day 1, Day 1:)
  const dayBlocks = itineraryMarkdown.split(/(?=##?\s*Day\s*\d+)/i).filter(b => b.trim().length > 0);

  let events = [];

  if (dayBlocks.length > 0) {
    dayBlocks.forEach((block, idx) => {
      const dayNum = idx + 1;
      const eventStart = new Date(startDate.getTime() + idx * 24 * 60 * 60 * 1000);
      const eventEnd = new Date(eventStart.getTime() + 10 * 60 * 60 * 1000); // 9am to 7pm

      // Extract title line
      const lines = block.trim().split('\n');
      const titleLine = lines[0].replace(/^#+\s*/, '').trim();
      const description = lines.slice(1).join('\n')
        .replace(/[*_#]/g, '')
        .replace(/\n\n+/g, ' \\n ')
        .replace(/\n/g, ' \\n ')
        .trim();

      events.push(`BEGIN:VEVENT
UID:${Date.now()}-day${dayNum}@travelcompanionai.com
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(eventStart)}
DTEND:${formatICSDate(eventEnd)}
SUMMARY:${destination} - ${titleLine || `Day ${dayNum}`}
LOCATION:${destination}
DESCRIPTION:${description.slice(0, 500)}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${destination} Day ${dayNum} starts soon!
END:VALARM
END:VEVENT`);
    });
  } else {
    // Fallback single all-day trip event
    const eventEnd = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    events.push(`BEGIN:VEVENT
UID:${Date.now()}@travelcompanionai.com
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(eventEnd)}
SUMMARY:Trip to ${destination}
LOCATION:${destination}
DESCRIPTION:${itineraryMarkdown.replace(/[*_#]/g, '').slice(0, 500)}
STATUS:CONFIRMED
END:VEVENT`);
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Travel Companion AI//Autonomous Digital Concierge//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n');

  // Trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = destination.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `${safeName}_Itinerary.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
