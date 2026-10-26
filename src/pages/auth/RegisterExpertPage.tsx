import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, ArrowRight, GraduationCap, Link2 } from 'lucide-react'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { AuthLayout, TextField, PasswordField, SubmitButton, PasswordStrength, AuthNotice } from './_shared'

const schema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type F = z.infer<typeof schema>

export default function RegisterExpertPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })
  const pw = watch('password', '')

  const mutation = useMutation({
    mutationFn: (d: F) => authApi.registerExpert({
      first_name: d.first_name,
      last_name: d.last_name,
      email: d.email,
      password: d.password,
    }),
    onSuccess: (res) => {
      const { access, refresh, user } = res.data
      setAuth(user, access, refresh)
      toast.success('Account created! Now complete your application.')
      navigate('/expert/apply')
    },
    onError: (e: any) => toast.error(e.response?.data?.email?.[0] || 'Registration failed. Try again.'),
  })

  return (
    <AuthLayout
      title="Create expert account"
      subtitle="Step 1 of 2: basic info. Skills and bio come next."
      footer={
        <>
          <div>Already have an account? <Link className="gx-link" to="/login?from=expert">Sign in</Link></div>
          <div style={{ marginTop: 8 }}><Link className="gx-muted-link" to="/">Back to home</Link></div>
        </>
      }
    >
      <AuthNotice icon={<GraduationCap size={16} />}>
        <strong>Expert application, step 1 of 2.</strong> Create your account, then complete the application form.
      </AuthNotice>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} noValidate>
        <div className="gx-row">
          <TextField label="First name" placeholder="Ahmed" error={errors.first_name?.message} {...register('first_name')} />
          <TextField label="Last name" placeholder="Khalid" error={errors.last_name?.message} {...register('last_name')} />
        </div>
        <TextField label="Email address" type="email" placeholder="you@example.com" autoComplete="email"
          icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} />
        <PasswordField label="Password" placeholder="Min. 8 characters" autoComplete="new-password"
          icon={<Lock size={16} />} error={errors.password?.message} {...register('password')} />
        <PasswordStrength value={pw} />
        <PasswordField label="Confirm password" placeholder="Re-enter your password" autoComplete="new-password"
          icon={<Lock size={16} />} error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div style={{ height: 8 }} />
        <SubmitButton loading={mutation.isPending} loadingText="Creating account...">Continue to application <ArrowRight size={16} /></SubmitButton>
      </form>
    </AuthLayout>
  )
}
