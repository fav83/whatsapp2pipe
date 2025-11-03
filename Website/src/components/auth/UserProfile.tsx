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
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-base text-gray-900">{user.name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-base text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">
            Pipedrive Company
          </label>
          <p className="text-base text-gray-900">{user.companyName}</p>
          <p className="text-sm text-gray-500">{user.companyDomain}</p>
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
