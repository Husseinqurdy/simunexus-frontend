import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Lock, ArrowRight } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Role } from '@/types'
import { AuthLayout, PasswordField, SubmitButton, PasswordStrength, AuthNotice } from './_shared'

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function SetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch } = useForm<{ password: string; confirm: string }>()
  const pw = watch('password', '')

  const mutation = useMutation({
    mutationFn: (d: { password: string }) =>
      authApi.setPassword({ uid: params.get('uid'), token: params.get('token'), password: d.password }),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Password set! Welcome to GSH.')
      navigate(ROLE_HOME[user.role as Role])
    },
    onError: () => toast.error('This link has expired or is invalid.'),
  })

  return (
    <AuthLayout
      title="Set your password"
      subtitle="Your GSH account was created automatically. Set a password to access your dashboard."
      footer={<div>Already have a password? <Link className="gx-link" to="/login">Sign in</Link></div>}
    >
      <form
        onSubmit={handleSubmit(d => { if (d.password !== d.confirm) { toast.error('Passwords do not match'); return } mutation.mutate(d) })}
        noValidate
      >
        <PasswordField label="New password" placeholder="Min. 8 characters" autoComplete="new-password" icon={<Lock size={16} />}
          error={pw.length > 0 && pw.length < 8 ? 'Too short: minimum 8 characters' : undefined}
          {...register('password', { required: true, minLength: 8 })} />
        <PasswordStrength value={pw} />
        <PasswordField label="Confirm password" placeholder="Repeat your password" autoComplete="new-password" icon={<Lock size={16} />}
          {...register('confirm', { required: true })} />
        <div style={{ height: 8 }} />
        <SubmitButton loading={mutation.isPending} loadingText="Setting password...">Set password and sign in <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}
