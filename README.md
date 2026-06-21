# Quarter Mile Arcade

A browser drag-racing MVP built with Vite, TypeScript, and PixiJS. All visuals are original vector placeholders drawn at runtime.

## Run

```bash
npm install
npm run dev
```

Tests and production build:

```bash
npm test
npm run build
```

## Controls

- `Space`: throttle
- `ArrowUp`: shift up
- `ArrowDown`: shift down
- `N`: nitro

Touch controls are shown below the race canvas. Shift close to the redline, manage traction, and use nitro to improve your elapsed time. Completed races award money. Garage upgrades and the top ten local runs persist in `localStorage`.

## Race events

- Quarter Mile: 402.336 m acceleration race
- Standing Mile: 1609.344 m acceleration and high-speed race
- 10 km Top Speed: a long run for measuring maximum speed

Each event has its own base prize, time bonus, local leaderboard, and recorded maximum speed.

At the finish line, the camera stops tracking while the car continues through at its simulated speed. A result is recorded only after the complete car has cleared the line; press `Space` to return to the garage.

## Cars

- Comet R is included from the beginning.
- Apex RS is a lighter, more powerful six-speed sports car available from the garage dealer for $25,000.
- Brickhouse V8 is a heavy van with ten upgrade levels and a very high tuning ceiling.
- Needle Dragster is a long, light quarter-mile specialist with narrow front wheels and huge rear tires.
- Starbolt X1 has a delayed power ramp but is designed for extreme long-distance top speed.

Cars have separate upgrade levels. Existing saves are migrated automatically to the multi-car profile format without losing Comet R progression.

Maxing every workshop category on a car unlocks Pro Setup: short/balanced/long final drive, endurance/balanced/burst NOS flow, adjustable shift-light timing, and launch/balanced/top-speed tire setups. These settings persist per car.

The workshop also includes a five-level NOS system upgrade. Each level increases boost force by 12% and capacity by 0.4 seconds.

## Visual tracks

- Neon Dusk: the original sunset mountain route
- Red Mesa: a bright desert road with mesas and cacti
- Polar Run: an arctic ice road with snow and ice formations

Visual track selection is independent of race distance and persists in the local profile.

## Audio

The race uses procedural Web Audio for RPM-driven engine tone, throttle volume, wheelspin, wind, NOS, shifts, start lights, and finish feedback. Audio starts from the race button user gesture to comply with browser autoplay policies and can be muted during a race.
Continuous race audio fades out over three seconds during the post-finish run-out while the finish signal remains audible.

## Local development access

Running `npm run dev` grants the local profile $10,000,000 and ownership of every car for testing. This uses Vite's development flag and is excluded from production builds and Vercel deployments.

## Architecture

- `src/sim/`: renderer-independent deterministic physics and auto-race test helper
- `src/game/`: fixed-step controller, input-event recorder, and PixiJS view
- `src/ui/`: garage and race-screen orchestration
- `src/storage/`: versioned local profile persistence
- `src/data/`: base car and upgrade effects
- `src/tests/`: headless simulator tests

`RaceSimulator.step(dt, input)` has no browser or rendering dependency. The game feeds it a fixed 1/120-second timestep, making a race reproducible from its car configuration and recorded input events. Recorded events are stored with leaderboard entries, providing the data needed for future ghost playback.

## Simulator assumptions

This is an approachable arcade model rather than a vehicle-dynamics package. Engine torque is linearly interpolated from a configurable RPM/torque curve. Gear and final-drive ratios convert torque to wheel force. Available force is capped by a simple tire friction limit; force beyond the limit is reported as wheelspin. Aerodynamic drag scales with speed squared, while rolling resistance is constant. Nitro adds wheel force while throttle is held and capacity remains. Shifts briefly interrupt drive force.

Releasing throttle applies RPM- and gear-dependent engine braking. This makes RPM fall more aggressively in low gears and requires sustained throttle to keep the engine in its power band.

The race ends at exactly 402.336 m. Finish time is interpolated within the last simulation step to reduce fixed-step timing error.

## Extending

Ghost playback can reconstruct input state by walking a saved run's `replay` events while stepping another simulator at the same fixed rate. New cars can implement `CarConfig`; upgrade balance is isolated in `buildCar`. For production, add profile schema migrations, audio, AI opponents, and replay validation.
