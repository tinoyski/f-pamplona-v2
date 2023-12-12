import { Spinner } from "flowbite-react";

export default function Loading() {
  return (
    <div className="text-center">
      <Spinner size="lg" aria-label="Center-aligned spinner" />
    </div>
  );
}
