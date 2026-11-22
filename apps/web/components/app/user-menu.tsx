'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { ChevronsUpDownIcon, HomeIcon, LogOutIcon, SettingsIcon } from '@/components/ui/icons';
import { Menu, MenuItem, MenuLabel, MenuLink, MenuSeparator } from '@/components/ui/menu';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { signOut, useSession } from '@/lib/session';

/** Account button at the foot of the sidebar: profile, theme and sign-out. */
export function UserMenu() {
  const router = useRouter();
  const session = useSession();
  const user = session.status === 'authenticated' ? session.user : undefined;

  return (
    <Menu
      label="Account menu"
      side="top"
      className="right-0 left-0"
      triggerClassName="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted"
      trigger={
        <>
          <Avatar name={user?.name} src={user?.avatar} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user?.name ?? 'Loading…'}</span>
            <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
        </>
      }
    >
      <MenuLabel className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Theme</span>
        <ThemeSwitcher />
      </MenuLabel>
      <MenuSeparator />
      <MenuLink href="/settings">
        <SettingsIcon /> Settings
      </MenuLink>
      <MenuLink href="/">
        <HomeIcon /> Home page
      </MenuLink>
      <MenuItem
        onClick={async () => {
          await signOut();
          router.push('/login');
        }}
      >
        <LogOutIcon /> Log out
      </MenuItem>
    </Menu>
  );
}
