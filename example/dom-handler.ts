/**
 * DOM handler example that turns events into UI instructions.
 *
 * Run with: npx ts-node example/dom-handler.ts
 */

import { create } from '../src';

interface ClickEvent {
  readonly type: 'click';
  readonly targetId: string;
  readonly metaKey: boolean;
}

interface InputEvent {
  readonly type: 'input';
  readonly targetId: string;
  readonly value: string;
}

interface FocusEvent {
  readonly type: 'focus';
  readonly targetId: string;
}

interface BlurEvent {
  readonly type: 'blur';
  readonly targetId: string;
}

type DomEvent = ClickEvent | InputEvent | FocusEvent | BlurEvent;

const events = create<DomEvent>();

const eventLog: DomEvent[] = [
  { type: 'focus', targetId: 'search' },
  { type: 'input', targetId: 'search', value: 'pi' },
  { type: 'click', targetId: 'search-submit', metaKey: false },
  { type: 'blur', targetId: 'search' },
  { type: 'input', targetId: 'search', value: 'pikachu' },
];

console.log('=== Event log ===');
eventLog.forEach((event) => {
  console.log(
    events.when(event, {
      click: (click) => `Click on #${click.targetId} (meta: ${click.metaKey})`,
      input: (input) => `Input on #${input.targetId}: "${input.value}"`,
      focus: (focus) => `Focus on #${focus.targetId}`,
      blur: (blur) => `Blur on #${blur.targetId}`,
    })
  );
});

console.log('\n=== Latest actionable event ===');
const latest = eventLog.at(-1)!;
const action = events.match(latest, {
  click: (click) => ({ type: 'submit', target: click.targetId }),
  input: (input) => ({ type: 'update-model', target: input.targetId, value: input.value }),
  focus: (focus) => ({ type: 'highlight', target: focus.targetId }),
  blur: (blur) => ({ type: 'clear-highlight', target: blur.targetId }),
});
console.log(action);

console.log('\n=== Inputs needing validation ===');
const pendingValidation = events.filterBy(eventLog, {
  input: (input) => input.value.length > 3,
});
pendingValidation.forEach((input) => {
  console.log(`Validate #${input.targetId} with value "${input.value}"`);
});

console.log('\n=== Fold into commands ===');
const commands = eventLog.map((event) =>
  events.fold(
    event,
    {
      click: (click) => `dispatch(click:${click.targetId})`,
      input: (input) => `dispatch(input:${input.targetId}="${input.value}")`,
    },
    (unknown) => `noop(${unknown.type})`
  )
);
console.log(commands);

console.log('\n=== Constructing synthetic input ===');
const createInput = events.constructor('input');
const synthetic = createInput({ targetId: 'search', value: 'charizard' });
console.log(`Synthetic event is input?`, events.isInput(synthetic));
