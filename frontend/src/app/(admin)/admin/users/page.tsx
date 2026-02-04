"use client";

import { useEffect, useState } from "react";
import { adminService, type AdminUserDto } from "@/lib/services";
import { Loader, Button } from "@/components/ui";

function formatCreatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminService
      .getUsers(page, limit)
      .then((res) => {
        if (!cancelled) {
          setUsers(res.users);
          setTotal(res.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users");
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          User list and account overview. Paginated from backend.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12">
          <Loader size="lg" label="Loading users…" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 py-12 text-center">
          <p className="text-red-300">{error}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() => setPage(1)}
          >
            Try again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 py-12 text-center">
          <p className="text-neutral-400">No users found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-neutral-700/50 bg-neutral-900/50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-700/50 bg-neutral-800/50">
                    <th className="px-4 py-3 font-medium text-neutral-300">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-300">
                      Name
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-300">
                      Role
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-300">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-700/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {user.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            user.role === "admin"
                              ? "inline-flex rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-200"
                              : "text-neutral-400"
                          }
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {formatCreatedAt(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
              of {total}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
