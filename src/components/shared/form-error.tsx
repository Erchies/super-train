export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-red-600 mt-1">{message}</p>;
}

export function AlertError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
      {message}
    </div>
  );
}

export function AlertSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
      {message}
    </div>
  );
}
