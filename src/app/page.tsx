'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// 动态导入 Dashboard（客户端组件）
const Dashboard = dynamic(
  () => import('@/features/dashboard/components/dashboard').then((mod) => mod.Dashboard),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Dashboard />
    </main>
  );
}
