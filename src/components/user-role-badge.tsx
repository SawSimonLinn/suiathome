import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';

type UserRoleBadgeProps = {
  user: User;
};

export function UserRoleBadge({ user }: UserRoleBadgeProps) {
  if (user.role !== 'admin') {
    return null;
  }

  return <Badge variant="secondary">Admin</Badge>;
}
