// app/home/page.tsx (Server Component)
import CalendarTile from "../components/CalendarTile";

export default async function Page({ searchParams }: { searchParams: { month?: string } }) {
  // Expect searchParams.month like "2025-10"; default to current month
  const monthParam = searchParams.month;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const month = monthParam ?? `${yyyy}-${mm}`;

  return (
    <CalendarTile initialMonth={month} />
  );
}