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
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  referral_code: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type F = z.infer<typeof schema>

const ROLE_HOME: Record<Role, string> = {
  client: '/client', expert: '/expert', admin: '/admin', developer: '/developer'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromExpert = searchParams.get('from') === 'expert'
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })
  const pw = watch('password', '')

  const mutation = useMutation({
    // confirmPassword ni ukaguzi wa client tu — haitumwi kwenye API
    mutationFn: (d: F) => authApi.register({
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      password: d.password,
      referral_code: d.referral_code,
    }),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Account created! Welcome to GSH.')
      if (fromExpert) navigate('/expert/apply')
      else navigate(ROLE_HOME[user.role as Role])
    },
    onError: (e: any) => toast.error(e.response?.data?.email?.[0] || 'Registration failed. Try again.'),
  })

  return (
    <AuthLayout
      title={fromExpert ? 'Create expert account' : 'Create your account'}
      subtitle={fromExpert ? 'Step 1 of 2: basic info. Skills and test come next.' : 'Submit projects, track progress and get results.'}
      footer={
        <>
          <div>Already have an account? <Link className="gx-link" to={fromExpert ? '/login?from=expert' : '/login'}>Sign in</Link></div>
          <div style={{ marginTop: 8 }}><Link className="gx-muted-link" to="/">Back to home</Link></div>
        </>
      }
    >
      {fromExpert && (
        <AuthNotice icon={<GraduationCap size={16} />}>
          <strong>Expert application.</strong> Create your account, then you'll be taken to the application form.
        </AuthNotice>
      )}
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} noValidate>
        <div className="gx-row">
          <TextField label="First name" placeholder="John" error={errors.first_name?.message} {...register('first_name')} />
          <TextField label="Last name" placeholder="Doe" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <TextField label="Email address" type="email" placeholder="you@example.com" autoComplete="email"
          icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
        <PasswordField label="Password" placeholder="Min. 8 characters" autoComplete="new-password"
          icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
        <PasswordStrength value={pw} />
        <PasswordField label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password"
          icon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        {!fromExpert && (
          <TextField label={<>Referral code <span className="opt">(optional)</span></>} placeholder="Enter referral code"
            icon={<Link2 size={16} />} {...register('referral_code')} />
        )}
        <div style={{ height: 8 }} />
        <SubmitButton loading={mutation.isPending} loadingText="Creating account...">
          {fromExpert ? 'Continue to application' : 'Create account'} <ArrowRight size={16} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
