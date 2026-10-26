import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, ArrowRight, GraduationCap, Link2 } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import type { Role } from '@/types'
import { AuthLayout, TextField, PasswordField, SubmitButton, PasswordStrength, AuthNotice } from './_shared'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type F = z.infer<typeof schema>

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromExpert = searchParams.get('from') === 'expert'
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (d: F) => authApi.login(d.email, d.password),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Welcome back!')
      // Kama alikuja kutoka apply-expert → peleka moja kwa moja kwenye application form
      if (fromExpert && (user.role === 'client' || user.role === 'expert')) navigate('/expert/apply')
      else navigate(ROLE_HOME[user.role as Role])
    },
    onError: () => toast.error('Invalid email or password.'),
  })

  return (
    <AuthLayout
      title={fromExpert ? 'Sign in to apply' : 'Welcome back'}
      subtitle={fromExpert ? 'Sign in to your GSH account to continue.' : 'Sign in to your GSH account.'}
      footer={
        <>
          <div>Don't have an account? <Link className="gx-link" to={fromExpert ? '/register?from=expert' : '/register'}>Create one</Link></div>
          {!fromExpert && <div>Want to submit without an account? <Link className="gx-link" to="/submit">Submit here</Link></div>}
          <div style={{ marginTop: 8 }}>
            <Link className="gx-muted-link" to="/">Back to home</Link>
            <span style={{ margin: '0 8px', color: '#C3CEE2' }}>|</span>
            <Link className="gx-muted-link" to="/apply-expert">Become an expert</Link>
          </div>
        </>
      }
    >
      {fromExpert && (
        <AuthNotice icon={<GraduationCap size={16} />}>
          <strong>Expert application.</strong> Sign in, then you'll be taken to the application form.
        </AuthNotice>
      )}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} noValidate>
        <TextField label="Email address" type="email" placeholder="you@example.com" autoComplete="email"
          icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
        <PasswordField label="Password" placeholder="Enter your password" autoComplete="current-password"
          icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
        <div style={{ height: 8 }} />
        <SubmitButton loading={mutation.isPending} loadingText="Signing in...">Sign in <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}
