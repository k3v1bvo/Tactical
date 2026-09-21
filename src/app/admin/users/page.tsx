'use client';

import React, { useState } from 'react';
import { demoAdmin, demoVendor, demoClient } from '@/lib/demo-data';
import { Users, Shield, ShieldCheck, User, UserCog, Mail, Ban, RotateCcw, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/types';

const demoUsers = [
  { ...demoAdmin, role: 'admin' as AppRole, status: 'active', lastLogin: '2026-09-20T12:00:00Z', ordersCount: 0 },
  { ...demoVendor, role: 'vendor' as AppRole, status: 'active', lastLogin: '2026-09-20T10:30:00Z', ordersCount: 0 },
  { ...demoClient, role: 'client' as AppRole, status: 'active', lastLogin: '2026-09-19T18:00:00Z', ordersCount: 10 },
  { id: 'client-02', email: 'maria@ejemplo.com', full_name: 'María Guerrera', phone: '+58 412-555-0003', avatar_url: null, created_at: '2026-07-15T00:00:00Z', updated_at: '2026-07-15T00:00:00Z', role: 'client' as AppRole, status: 'active', lastLogin: '2026-09-18T09:00:00Z', ordersCount: 5 },
  { id: 'client-03', email: 'pedro@ejemplo.com', full_name: 'Pedro Ranger', phone: '+58 412-555-0004', avatar_url: null, created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z', role: 'client' as AppRole, status: 'suspended', lastLogin: '2026-08-20T14:00:00Z', ordersCount: 2 },
];

const roleColors: Record<AppRole, string> = { admin: '#ef4444', vendor: '#3b82f6', client: '#10b981' };
const roleLabels: Record<AppRole, string> = { admin: 'Admin', vendor: 'Vendor', client: 'Cliente' };

// Permissions matrix
const allPermissions = ['products.create', 'products.read', 'products.update', 'products.delete', 'orders.create', 'orders.read', 'orders.update', 'payments.verify', 'payments.read', 'categories.read', 'categories.create', 'reports.view', 'reports.export', 'audit.view', 'settings.edit', 'roles.manage', 'users.read', 'users.update'];
const rolePermissions: Record<AppRole, string[]> = {
  admin: allPermissions,
  vendor: ['products.create', 'products.read', 'products.update', 'products.delete', 'orders.read', 'payments.verify', 'payments.read', 'categories.read', 'reports.view'],
  client: ['products.read', 'orders.create', 'orders.read', 'payments.read', 'categories.read'],
};

export default function AdminUsersPage() {
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Usuarios & Roles</h1>
          <p className="text-sm text-tactical-500">{demoUsers.length} usuarios registrados</p>
        </div>
        <button onClick={() => setShowPermissions(!showPermissions)} className="btn-ghost flex items-center gap-2 text-sm">
          <UserCog size={14} /> {showPermissions ? 'Ver Usuarios' : 'Matriz de Permisos'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {(['admin', 'vendor', 'client'] as AppRole[]).map(role => {
          const count = demoUsers.filter(u => u.role === role).length;
          return (
            <div key={role} className="metric-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${roleColors[role]}15` }}>
                  <Shield size={16} style={{ color: roleColors[role] }} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-tactical-500">{roleLabels[role]}s</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!showPermissions ? (
        /* Users Table */
        <div className="glass-card-static overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-tactical">
              <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th>Acciones</th></tr></thead>
              <tbody>
                {demoUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tactical-700 to-tactical-800 flex items-center justify-center text-sm font-bold text-tactical-300">
                          {user.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-tactical-200">{user.full_name}</div>
                          <div className="text-[10px] text-tactical-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: `${roleColors[user.role]}15`, color: roleColors[user.role] }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: roleColors[user.role] }} />
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-delivered' : 'badge-cancelled'}`}>
                        {user.status === 'active' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="text-xs">{new Date(user.lastLogin).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.05]" onClick={() => toast.info('Cambio de rol próximamente')}>
                          <UserCog size={14} className="text-tactical-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/[0.05]" onClick={() => toast.info('Correo enviado')}>
                          <Mail size={14} className="text-tactical-400" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-alert/10" onClick={() => toast.warning(user.status === 'active' ? 'Usuario suspendido' : 'Usuario reactivado')}>
                          {user.status === 'active' ? <Ban size={14} className="text-tactical-500" /> : <RotateCcw size={14} className="text-green-tactical" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Permissions Matrix */
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Matriz de Permisos por Rol</h3>
          <div className="overflow-x-auto">
            <table className="table-tactical text-xs">
              <thead>
                <tr>
                  <th>Permiso</th>
                  {(['admin', 'vendor', 'client'] as AppRole[]).map(role => (
                    <th key={role} className="text-center">
                      <span style={{ color: roleColors[role] }}>{roleLabels[role]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allPermissions.map(perm => (
                  <tr key={perm}>
                    <td className="font-mono text-tactical-300">{perm}</td>
                    {(['admin', 'vendor', 'client'] as AppRole[]).map(role => (
                      <td key={role} className="text-center">
                        {rolePermissions[role].includes(perm) ? (
                          <ShieldCheck size={16} className="text-green-tactical mx-auto" />
                        ) : (
                          <span className="text-tactical-700">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
