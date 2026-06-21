import type { RaceInput, RecordedInputEvent } from '../sim/types';

export class InputRecorder {
  events: RecordedInputEvent[] = [];
  private previous: RaceInput = { throttle: false, nitro: false, shiftUp: false, shiftDown: false };
  record(timeS: number, input: RaceInput) {
    (Object.keys(input) as (keyof RaceInput)[]).forEach(action => {
      if (input[action] !== this.previous[action]) this.events.push({ timeS: Number(timeS.toFixed(4)), action, active: input[action] });
    });
    this.previous = { ...input };
  }
}
