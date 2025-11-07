import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import type { User } from '../../types/user'

interface UserProfileProps {
  user: User
  onSignOut: () => void
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</label>
          <p className="text-base font-medium text-slate-700 mt-1">{user.name}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
          <p className="text-base font-medium text-slate-700 mt-1">{user.email}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pipedrive Company
          </label>
          <p className="text-base font-medium text-slate-700 mt-1">{user.companyName}</p>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={onSignOut}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
