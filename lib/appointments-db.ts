import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data', 'appointments.json');

export interface Appointment {
  id: string;
  service: { category: string; service: string };
  dateTime: { date: string; time: string; timezone: string; duration: string };
  contact: { name: string; email: string; phone: string; company: string; jobTitle: string; companySize: string };
  requirements: { useCase: string; budget: string; timeline: string; goals: string[]; challenges: string };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  leadScore: number;
  leadTier: 'hot' | 'warm' | 'cool' | 'cold';
  createdAt: string;
  updatedAt: string;
}

function readAll(): Appointment[] {
  if (!existsSync(DATA_PATH)) return [];
  try {
    const raw = readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(appointments: Appointment[]): void {
  writeFileSync(DATA_PATH, JSON.stringify(appointments, null, 2), 'utf-8');
}

export function getAppointments(filters?: {
  status?: string;
  date?: string;
  search?: string;
}): Appointment[] {
  let list = readAll();

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.date) {
    list = list.filter((a) => a.dateTime.date === filters.date);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.contact.name.toLowerCase().includes(q) ||
        a.contact.email.toLowerCase().includes(q) ||
        a.contact.company.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAppointmentById(id: string): Appointment | undefined {
  return readAll().find((a) => a.id === id);
}

export function createAppointment(data: Omit<Appointment, 'createdAt' | 'updatedAt'>): Appointment {
  const all = readAll();
  const now = new Date().toISOString();
  const appointment: Appointment = { ...data, createdAt: now, updatedAt: now };
  all.push(appointment);
  writeAll(all);
  return appointment;
}

export function updateAppointmentStatus(id: string, status: Appointment['status']): Appointment | null {
  const all = readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  writeAll(all);
  return all[idx];
}

export function deleteAppointment(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((a) => a.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

export function getBookedSlots(date: string): string[] {
  const all = readAll();
  return all
    .filter((a) => a.dateTime.date === date && a.status !== 'cancelled')
    .map((a) => a.dateTime.time);
}

export function getStats() {
  const all = readAll();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];

  return {
    total: all.length,
    today: all.filter((a) => a.dateTime.date === today).length,
    thisWeek: all.filter((a) => a.createdAt >= weekStr).length,
    byStatus: {
      pending: all.filter((a) => a.status === 'pending').length,
      confirmed: all.filter((a) => a.status === 'confirmed').length,
      completed: all.filter((a) => a.status === 'completed').length,
      cancelled: all.filter((a) => a.status === 'cancelled').length,
    },
    byTier: {
      hot: all.filter((a) => a.leadTier === 'hot').length,
      warm: all.filter((a) => a.leadTier === 'warm').length,
      cool: all.filter((a) => a.leadTier === 'cool').length,
      cold: all.filter((a) => a.leadTier === 'cold').length,
    },
  };
}
