'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, UserCircle2, Sparkles, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/dashboard/glass-card'
import { GradientText } from '@/components/ui/gradient-text'

interface UserProfileData {
    date_of_birth: string
    gender: string
    phone: string
    college_name: string
    department: string
    year_of_study: string
}

export function UserProfileModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<UserProfileData>({
        date_of_birth: '',
        gender: '',
        phone: '',
        college_name: '',
        department: '',
        year_of_study: ''
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setLoading(false)
                    return
                }

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== "PGRST116") {
                    console.error("Error fetching profile:", {
                        message: error.message,
                        code: error.code,
                    });
                    setLoading(false);
                    return;
                }

                if (data) {
                    const profile = data as any;

                    const requiredFields = ['date_of_birth', 'gender', 'phone', 'college_name', 'department', 'year_of_study']
                    const isIncomplete = requiredFields.some(field => !profile[field])

                    if (isIncomplete) {
                        setIsOpen(true)
                        setFormData({
                            date_of_birth: profile.date_of_birth || '',
                            gender: profile.gender || '',
                            phone: profile.phone || '',
                            college_name: profile.college_name || '',
                            department: profile.department || '',
                            year_of_study: profile.year_of_study?.toString() || ''
                        })
                    }
                }
            } catch (error) {
                console.error('Error checking profile:', error)
            } finally {
                setLoading(false)
            }
        }

        checkProfile()
    }, [])

    const handleChange = (field: keyof UserProfileData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error } = await (supabase.from('users') as any)
                .update({
                    date_of_birth: formData.date_of_birth,
                    gender: formData.gender,
                    phone: formData.phone,
                    college_name: formData.college_name,
                    department: formData.department,
                    year_of_study: parseInt(formData.year_of_study),
                    is_active: true
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success('Profile updated successfully!')
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !submitting) {
                // Keep open to enforce completion
            }
        }}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-transparent shadow-none" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <GlassCard className="border-white/60 dark:border-slate-700/60 shadow-2xl" hover={false}>
                    <div className="p-8 space-y-8">
                        <DialogHeader className="space-y-4">
                            <div className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl w-fit shadow-xl shadow-indigo-500/20">
                                <UserCircle2 className="h-10 w-10 text-white" />
                            </div>
                            <DialogTitle className="text-center font-black text-3xl font-headline tracking-tight">
                                <GradientText colors={['#6366f1', '#a855f7']}>Complete Profile</GradientText>
                            </DialogTitle>
                            <DialogDescription className="text-center text-slate-500 font-medium">
                                Help us personalize your MindBloom journey with a few more details about yourself.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        required
                                        className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 transition-all font-bold"
                                        value={formData.date_of_birth}
                                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => handleChange('gender', value)}
                                        required
                                    >
                                        <SelectTrigger id="gender" className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 font-bold">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/20 backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95 shadow-2xl">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="non-binary">Non-binary</SelectItem>
                                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    required
                                    className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 font-bold"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="college_name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">College / University</Label>
                                <Input
                                    id="college_name"
                                    placeholder="e.g. Stanford University"
                                    required
                                    className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 font-bold"
                                    value={formData.college_name}
                                    onChange={(e) => handleChange('college_name', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Department</Label>
                                    <Input
                                        id="department"
                                        placeholder="e.g. Psychology"
                                        required
                                        className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 font-bold"
                                        value={formData.department}
                                        onChange={(e) => handleChange('department', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year_of_study" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Year of Study</Label>
                                    <Select
                                        value={formData.year_of_study}
                                        onValueChange={(value) => handleChange('year_of_study', value)}
                                        required
                                    >
                                        <SelectTrigger id="year_of_study" className="h-11 rounded-xl bg-white/40 dark:bg-slate-900/40 border-2 border-white/20 dark:border-slate-800 focus:border-indigo-500 font-bold">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-white/20 backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95 shadow-2xl">
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                            <SelectItem value="5">Grad / PG</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 flex flex-col items-center gap-4">
                                <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/25 transition-all text-sm uppercase tracking-widest group" disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>Finalize Profile <Sparkles className="ml-2 h-4 w-4 group-hover:scale-125 transition-transform" /></>
                                    )}
                                </Button>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <ShieldCheck className="h-3 w-3" /> Encrypted & Private
                                </div>
                            </DialogFooter>
                        </form>
                    </div>
                </GlassCard>
            </DialogContent>
        </Dialog>
    )
}
