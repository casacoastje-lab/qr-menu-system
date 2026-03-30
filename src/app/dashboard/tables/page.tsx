import TablesClient from "./TablesClient";

export default function TablesPage() {
  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Floor Management</h3>
          <p className="text-on-surface-variant font-body mt-1">Monitor real-time table status and active customer sessions.</p>
        </div>
        {/* We will pass action to add table into the client component via state */}
      </div>

      <TablesClient />
    </div>
  );
}
