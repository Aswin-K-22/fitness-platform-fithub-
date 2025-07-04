export function isValidLocation(location: any): location is { type: string; coordinates: [number, number] } {
  return (
    location != null &&
    typeof location === 'object' &&
    'type' in location &&
    typeof location.type === 'string' &&
    'coordinates' in location &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    typeof location.coordinates[0] === 'number' &&
    typeof location.coordinates[1] === 'number'
  );
}