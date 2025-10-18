/**
 * Fetch status example showcasing different helpers for runtime workflows.
 *
 * Run with: npx ts-node example/fetch-status.ts
 */

import { create } from '../src';

interface IdleStatus {
  readonly type: 'idle';
  readonly requestedAt: number;
}

interface LoadingStatus {
  readonly type: 'loading';
  readonly requestedAt: number;
  readonly progress: number;
}

interface SuccessStatus {
  readonly type: 'success';
  readonly requestedAt: number;
  readonly data: string;
}

interface ErrorStatus {
  readonly type: 'error';
  readonly requestedAt: number;
  readonly message: string;
}

type FetchStatus = IdleStatus | LoadingStatus | SuccessStatus | ErrorStatus;

const status = create<FetchStatus>();

const timeline: FetchStatus[] = [
  { type: 'idle', requestedAt: Date.now() },
  { type: 'loading', requestedAt: Date.now(), progress: 10 },
  { type: 'loading', requestedAt: Date.now(), progress: 55 },
  { type: 'error', requestedAt: Date.now(), message: 'Network timeout' },
];

const retryingTimeline = timeline.map((entry) =>
  status.transform(entry, {
    error: () => ({
      type: 'loading',
      requestedAt: Date.now(),
      progress: 0,
    }),
  })
);

const withProgressBoost = retryingTimeline.map((entry) =>
  status.map(entry, {
    loading: (loading) =>
      loading.progress < 90
        ? { ...loading, progress: loading.progress + 10 }
        : loading,
  })
);

console.log('=== Current status ===');
const current = withProgressBoost.at(-1)!;
console.log(
  status.when(current, {
    idle: () => 'Waiting to start',
    loading: (loading) => `Downloading... ${loading.progress}%`,
    success: (success) => `Completed with payload: ${success.data}`,
    error: (error) => `Failed: ${error.message}`,
  })
);

console.log('\n=== Loading snapshots ===');
const loadingPoints = status.filter(withProgressBoost, 'loading');
loadingPoints.forEach((loading) => {
  console.log(`Progress update: ${loading.progress}%`);
});

console.log('\n=== Reduced stats ===');
const stats = status.match(current, {
  idle: () => ({ level: 'info', retry: false }),
  loading: () => ({ level: 'info', retry: true }),
  success: () => ({ level: 'success', retry: false }),
  error: () => ({ level: 'error', retry: true }),
});
console.log(stats);

console.log('\n=== Partitioned timeline ===');
const partitioned = status.partition(withProgressBoost);
console.log(Object.keys(partitioned).reduce<Record<string, number>>((acc, key) => {
  acc[key] = partitioned[key as keyof typeof partitioned].length;
  return acc;
}, {}));
