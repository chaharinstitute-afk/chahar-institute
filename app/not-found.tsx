import { PillButton } from "@/components/shared/pill-button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FDFBF7]">
      <div className="text-center max-w-md">
        <div
          className="text-8xl font-bold mb-4"
          style={{ color: "#013220", fontFamily: "'Poppins', sans-serif" }}
        >
          404
        </div>
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ color: "#1A1A1A", fontFamily: "'Poppins', sans-serif" }}
        >
          Page Not Found
        </h1>
        <p
          className="mb-10"
          style={{ color: "#6B7280", fontFamily: "'Poppins', sans-serif" }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <PillButton href="/" variant="dark" arrow="↗">Go Home</PillButton>
          <PillButton href="/courses" variant="light" arrow="→">View Courses</PillButton>
        </div>
      </div>
    </div>
  );
}
