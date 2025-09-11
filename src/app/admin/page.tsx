import { redirect } from 'next/navigation';

export default function AdminPage() {
  // O usuário que acessar /admin será redirecionado para a página de login do admin
  redirect('/admin/login');
}
