'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, UserCircle2, Sparkles, ShieldCheck } from 'lucide-react'
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

type Props = {
    open: boolean
    onCloseAction: () => void
    user: User | null
}

export function UserProfileModal({ open, onCloseAction, user }: Props) {
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState<UserProfileData>({
        date_of_birth: '',
        gender: '',
        phone: '',
        college_name: '',
        department: '',
        year_of_study: '',
    })

    /* -------------------- Load Profile -------------------- */
    useEffect(() => {
        if (!open || !user) return

        const loadProfile = async () => {
            setLoading(true)

            const { data, error } = await (supabase.from('users') as any)
                .select('*')
                .eq('auth_user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                toast.error('Failed to load profile')
                setLoading(false)
                return
            }

            if (data) {
                setFormData({
                    date_of_birth: data.date_of_birth ?? '',
                    gender: data.gender ?? '',
                    phone: data.phone ?? '',
                    college_name: data.college_name ?? '',
                    department: data.department ?? '',
                    year_of_study: data.year_of_study?.toString() ?? '',
                })
            }

            setLoading(false)
        }

        loadProfile()
    }, [open, user, supabase])

    /* -------------------- Submit -------------------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSubmitting(true)

        const { error } = await (supabase.from('users') as any)
            .update({
                date_of_birth: formData.date_of_birth,
                gender: formData.gender,
                phone: formData.phone,
                college_name: formData.college_name,
                department: formData.department,
                year_of_study: parseInt(formData.year_of_study),
                is_active: true,
            })
            .eq('auth_user_id', user.id)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Profile updated successfully')
            onCloseAction()
        }

        setSubmitting(false)
    }

    if (!open) return null

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCloseAction()}>
            <DialogContent className="sm:max-w-[550px] p-0 border-none bg-transparent shadow-none">
                <GlassCard hover={false}>
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <div className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl w-fit">
                                <UserCircle2 className="h-10 w-10 text-white" />
                            </div>
                            <DialogTitle className="text-center text-3xl font-black">
                                <GradientText colors={['#6366f1', '#a855f7']}>
                                    Profile
                                </GradientText>
                            </DialogTitle>
                            <DialogDescription className="text-center text-slate-500">
                                Manage your personal details
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date_of_birth: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label>Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(v) =>
                                            setFormData({ ...formData, gender: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="non-binary">Non-binary</SelectItem>
                                            <SelectItem value="prefer-not-to-say">
                                                Prefer not to say
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Input
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />

                            <Input
                                placeholder="College / University"
                                value={formData.college_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, college_name: e.target.value })
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Department"
                                    value={formData.department}
                                    onChange={(e) =>
                                        setFormData({ ...formData, department: e.target.value })
                                    }
                                />

                                <Select
                                    value={formData.year_of_study}
                                    onValueChange={(v) =>
                                        setFormData({ ...formData, year_of_study: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1st</SelectItem>
                                        <SelectItem value="2">2nd</SelectItem>
                                        <SelectItem value="3">3rd</SelectItem>
                                        <SelectItem value="4">4th</SelectItem>
                                        <SelectItem value="5">PG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="flex flex-col gap-3">
                                <Button type="submit" disabled={submitting} className="w-full">
                                    {submitting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            Save <Sparkles className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
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
