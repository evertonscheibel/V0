import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardNew } from './pages/DashboardNew';
import { Tickets } from './pages/Tickets';
import { Assets } from './pages/Assets';
import { Certificates } from './pages/Certificates';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Boletos } from './pages/Boletos';
import { Notifications } from './pages/Notifications';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <DashboardNew />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tickets"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Tickets />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/assets"
                        element={
                            <PrivateRoute roles={['admin', 'tecnico']}>
                                <Layout>
                                    <Assets />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/certificates"
                        element={
                            <PrivateRoute roles={['admin', 'tecnico']}>
                                <Layout>
                                    <Certificates />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/knowledge-base"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <KnowledgeBase />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/boletos"
                        element={
                            <PrivateRoute roles={['admin', 'tecnico']}>
                                <Layout>
                                    <Boletos />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Notifications />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute roles={['admin', 'tecnico']}>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute roles={['admin']}>
                                <Layout>
                                    <Users />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
