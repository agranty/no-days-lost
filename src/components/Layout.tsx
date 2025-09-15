import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useResponsiveText } from '@/lib/responsive-utils';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dumbbell, 
  Plus, 
  History, 
  TrendingUp, 
  Weight, 
  User,
  LogOut,
  Shield,
  Wand2,
  Menu,
  Home,
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const getNavigation = (isAdmin: boolean) => [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Add Workout', href: '/log', icon: Plus },
  { title: 'Generate', href: '/generate', icon: Wand2 },
  { title: 'History', href: '/history', icon: History },
  { title: 'Progress', href: '/progress', icon: TrendingUp },
  { title: 'Weight', href: '/weight', icon: Weight },
  ...(isAdmin ? [{ title: 'Admin', href: '/admin', icon: Shield }] : []),
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const navigation = getNavigation(userProfile?.role === 'admin');
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2 px-2">
            <Link to="/welcome" className="flex items-center">
              {state === "expanded" ? (
                <img 
                  src="/lovable-uploads/810109da-95f8-4bd2-8e44-0c79a9cfa2a2.png" 
                  alt="No Days Lost" 
                  className="h-8 w-auto object-contain hover:opacity-80 transition-opacity cursor-pointer"
                />
              ) : (
                <img 
                  src="/lovable-uploads/8e77a1a0-58bb-45aa-9fc9-d0297bffb73f.png" 
                  alt="No Days Lost" 
                  className="h-6 w-6 object-contain hover:opacity-80 transition-opacity cursor-pointer"
                />
              )}
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary border-r-2 border-primary" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User section at bottom */}
        <div className="mt-auto p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start px-2",
                  state === "collapsed" ? "px-0 justify-center" : ""
                )}
              >
                <User className="h-4 w-4" />
                {state === "expanded" && (
                  <span className="ml-2 truncate text-sm">
                    {userProfile?.display_name || user?.email}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.display_name || user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Clean minimal header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1" />
              {/* Optional: Add any global actions here if needed */}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}