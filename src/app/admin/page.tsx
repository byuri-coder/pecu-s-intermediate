import { redirect } from 'next/navigation';

export default function AdminPage() {
  // O usuário que acessar /admin será redirecionado para o dashboard
  redirect('/admin/dashboard');
}
