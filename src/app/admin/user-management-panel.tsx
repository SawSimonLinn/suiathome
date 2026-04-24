'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUser } from '@/lib/supabase/admin';

export function UserManagementPanel({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? users.filter((u) => u.name?.toLowerCase().includes(q)) : users;
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / 10);
  const pageUsers = filtered.slice(page * 10, (page + 1) * 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="sm:max-w-xs"
        />
        <span className="text-sm text-muted-foreground sm:ml-auto">
          {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto border-2 border-foreground bg-paper paper-shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell text-right">Likes</TableHead>
              <TableHead className="hidden md:table-cell text-right">Favorites</TableHead>
              <TableHead className="hidden md:table-cell text-right">Comments</TableHead>
              <TableHead className="hidden md:table-cell text-right">Posts</TableHead>
              <TableHead className="hidden sm:table-cell">Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageUsers.length > 0 ? (
              pageUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || <span className="text-muted-foreground italic">Unnamed</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                    {user.likes}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                    {user.favorites}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                    {user.comments}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                    {user.posts}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/profile/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  {search ? `No users match "${search}".` : 'No users yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
