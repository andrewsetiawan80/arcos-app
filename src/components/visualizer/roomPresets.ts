/**
 * Preset room images with alpha masks for the Photo Overlay visualizer.
 *
 * Each preset provides:
 *  - photoUrl:     The room photograph (served from /rooms/)
 *  - maskUrl:      A black/white alpha mask — white = wall (tiles render here),
 *                  black = foreground objects that occlude the tiles.
 *  - wallWidthMm:  Optional real-world wall width in mm for scale calibration.
 *  - thumbnail:    Optional smaller thumbnail; falls back to photoUrl.
 */

export type RoomPreset = {
  id: string;
  name: string;
  photoUrl: string;
  maskUrl: string;
  wallWidthMm?: number;
  thumbnail?: string;
};

export const ROOM_PRESETS: RoomPreset[] = [
  {
    id: "living-room-1",
    name: "Living Room",
    photoUrl: "/rooms/living-room-1.jpg",
    maskUrl: "/rooms/living-room-1-mask.png",
    wallWidthMm: 4000,
  },
  {
    id: "living-room-2",
    name: "Fireplace Lounge",
    photoUrl: "/rooms/living-room-2.jpg",
    maskUrl: "/rooms/living-room-2-mask.png",
    wallWidthMm: 5000,
  },
];
