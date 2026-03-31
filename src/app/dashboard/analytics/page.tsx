export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Analytics Overview</h3>
          <p className="text-on-surface-variant font-body mt-1">Revenue, table turnover, and popular items analysis.</p>
        </div>
      </div>
      <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl flex items-center justify-center">
        <p className="text-outline">Recharts Analytics and Data visualization coming soon (Step 10).</p>
      </div>
    </div>
  );
}
