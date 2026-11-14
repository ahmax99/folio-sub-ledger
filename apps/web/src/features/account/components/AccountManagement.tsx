'use client'

import { useNavigate } from '@tanstack/react-router'

import { TriangleAlert, User } from 'lucide-react'

import { Button } from '@/components/atoms'
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/molecules'
import { PROTECTED_ROUTES } from '@/features/auth/lib/routes'

import { DeleteAccountButton } from './DeleteAccountButton'

export type AccountTab = 'profile' | 'danger-zone'

interface AccountManagementProps {
  activeTab: AccountTab
  onTabChange: (tab: AccountTab) => void
}

export const AccountManagement = ({
  activeTab,
  onTabChange
}: Readonly<AccountManagementProps>) => {
  const navigate = useNavigate()

  return (
    <Tabs
      onValueChange={(value) => onTabChange(value as AccountTab)}
      value={activeTab}
    >
      <TabsList className="grid h-fit w-full grid-cols-2">
        <TabsTrigger value="profile">
          <User />
          <span className="max-sm:hidden">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="danger-zone">
          <TriangleAlert />
          <span className="max-sm:hidden">Danger Zone</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        className="flex flex-col justify-center gap-4"
        value="profile"
      >
        <h2 className="text-2xl font-medium">Settings</h2>
        <Card className="flex flex-row items-center justify-between">
          <CardContent>
            <h3 className="text-lg font-medium">Update Profile</h3>
            <p>You can update your account name.</p>
          </CardContent>
          <CardContent>
            <Button
              onClick={() => navigate({ to: PROTECTED_ROUTES.ACCOUNT_EDIT })}
            >
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent
        className="flex flex-col justify-center gap-4"
        value="danger-zone"
      >
        <h2 className="text-2xl font-medium">Danger Zone</h2>
        <Card className="border-destructive flex flex-row items-center justify-between">
          <CardContent>
            <h3 className="text-lg font-medium">Delete this account</h3>
            <p>
              Once you delete this account, there is no going back. Please be
              certain.
            </p>
          </CardContent>
          <CardContent>
            <DeleteAccountButton />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
