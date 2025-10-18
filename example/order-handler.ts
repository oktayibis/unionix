/**
 * Order handler example that manages lifecycle transitions.
 *
 * Run with: npx ts-node example/order-handler.ts
 */

import { create } from '../src';

interface PendingOrder {
  readonly type: 'pending';
  readonly id: string;
  readonly items: number;
}

interface ProcessingOrder {
  readonly type: 'processing';
  readonly id: string;
  readonly items: number;
  readonly assignedTo: string;
}

interface ShippedOrder {
  readonly type: 'shipped';
  readonly id: string;
  readonly tracking: string;
}

interface DeliveredOrder {
  readonly type: 'delivered';
  readonly id: string;
  readonly signedBy: string;
}

interface CancelledOrder {
  readonly type: 'cancelled';
  readonly id: string;
  readonly reason: string;
}

type OrderStatus = PendingOrder | ProcessingOrder | ShippedOrder | DeliveredOrder | CancelledOrder;

const orders = create<OrderStatus>();

const queue: OrderStatus[] = [
  { type: 'pending', id: 'A-001', items: 3 },
  { type: 'processing', id: 'A-002', items: 1, assignedTo: 'Chris' },
  { type: 'shipped', id: 'A-003', tracking: 'ZX-443-PL' },
  { type: 'cancelled', id: 'A-004', reason: 'Payment failure' },
];

console.log('=== Ops dashboard ===');
queue.forEach((order) => {
  console.log(
    orders.fold(
      order,
      {
        pending: (pending) => `Order ${pending.id} waiting with ${pending.items} items`,
        processing: (processing) => `Order ${processing.id} picked by ${processing.assignedTo}`,
        shipped: (shipped) => `Order ${shipped.id} on the way (${shipped.tracking})`,
      },
      (fallback) => `Order ${fallback.id} status: ${fallback.type}`
    )
  );
});

console.log('\n=== Retry cancelled orders ===');
const retried = queue.map((order) =>
  orders.transform(order, {
    cancelled: (cancelled) => ({
      type: 'pending',
      id: cancelled.id,
      items: 2,
    }),
  })
);
console.log(retried);

console.log('\n=== Assignment updates ===');
const updatedAssignments = retried.map((order) =>
  orders.map(order, {
    pending: (pending) => ({
      ...pending,
      items: pending.items + 1,
    }),
    processing: (processing) => ({
      ...processing,
      assignedTo: 'AutoPicker',
    }),
  })
);
console.log(updatedAssignments);

console.log('\n=== In-flight orders ===');
const inFlight = orders.filter(updatedAssignments, ['processing', 'shipped']);
console.log(inFlight);

console.log('\n=== Quick create helper ===');
const asProcessing = orders.constructor('processing');
const newOrder = asProcessing({ id: 'A-005', items: 5, assignedTo: 'Nora' });
console.log('New processing order?', orders.isProcessing(newOrder));
