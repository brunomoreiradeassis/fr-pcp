import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Sun,
  Moon,
  BarChart3,
  Calculator,
  FileText,
  Package,
  Settings,
  Factory,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    description: 'Visão geral da produção'
  },
  {
    title: '1º Turno',
    url: '/primeiro-turno',
    icon: Sun,
    description: 'Gestão do primeiro turno'
  },
  {
    title: '2º Turno',
    url: '/segundo-turno',
    icon: Moon,
    description: 'Gestão do segundo turno'
  },
  {
    title: 'Processamento',
    url: '/processamento',
    icon: Calculator,
    description: 'Cálculos automáticos'
  },
  {
    title: 'Resultados',
    url: '/resultados',
    icon: BarChart3,
    description: 'Relatórios analíticos'
  },
  {
    title: 'Produtos',
    url: '/produtos',
    icon: Package,
    description: 'Cadastro de produtos'
  },
  {
    title: 'Sistema',
    url: '/sistema',
    icon: Settings,
    description: 'Configurações'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
      : 'hover:bg-accent hover:text-accent-foreground transition-smooth';
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer logout',
        variant: 'destructive'
      });
    }
  };

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-72'} collapsible="icon">
      <SidebarContent className="bg-card/50 backdrop-blur border-r">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-card">
                <Factory className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  FR-PCP
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  Controle de Produção
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs opacity-75 truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User section */}
        <div className="mt-auto p-4 border-t">
          {!collapsed && (
            <div className="mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    {currentUser?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {currentUser?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usuário do sistema
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={collapsed ? 'Sair do sistema' : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}