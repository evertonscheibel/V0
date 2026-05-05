import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Ticket,
    Laptop,
    FileText,
    BookOpen,
    DollarSign,
    Bell,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    FileBarChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'tecnico', 'cliente'] },
        { path: '/tickets', icon: Ticket, label: 'Tickets', roles: ['admin', 'tecnico', 'cliente'] },
        { path: '/assets', icon: Laptop, label: 'Ativos', roles: ['admin', 'tecnico'] },
        { path: '/certificates', icon: FileText, label: 'Certificados', roles: ['admin', 'tecnico'] },
        { path: '/knowledge-base', icon: BookOpen, label: 'Base de Conhecimento', roles: ['admin', 'tecnico', 'cliente'] },
        { path: '/boletos', icon: DollarSign, label: 'Boletos', roles: ['admin', 'tecnico'] },
        { path: '/reports', icon: FileBarChart, label: 'Relatórios', roles: ['admin', 'tecnico'] },
        { path: '/notifications', icon: Bell, label: 'Notificações', roles: ['admin', 'tecnico', 'cliente'] },
        { path: '/users', icon: Users, label: 'Usuários', roles: ['admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(user?.role || '')
    );

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                {isOpen && (
                    <div className="sidebar-logo">
                        <h2>Gestão TI</h2>
                    </div>
                )}
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            <div className="sidebar-user">
                <div className="user-avatar">
                    <User size={isOpen ? 24 : 20} />
                </div>
                {isOpen && (
                    <div className="user-info">
                        <p className="user-name">{user?.name}</p>
                        <span className="user-role">{user?.role}</span>
                    </div>
                )}
            </div>

            <nav className="sidebar-nav">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={!isOpen ? item.label : ''}
                        >
                            <Icon size={20} />
                            {isOpen && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                {user?.role === 'admin' && (
                    <Link to="/settings" className="nav-item" title={!isOpen ? 'Configurações' : ''}>
                        <Settings size={20} />
                        {isOpen && <span>Configurações</span>}
                    </Link>
                )}
                <button className="nav-item logout-btn" onClick={logout} title={!isOpen ? 'Sair' : ''}>
                    <LogOut size={20} />
                    {isOpen && <span>Sair</span>}
                </button>
            </div>
        </div>
    );
};
