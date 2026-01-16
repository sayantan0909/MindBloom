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
import { Loader2 } from 'lucide-react'

// Explicitly define the row type or use 'any' if inference is tricky locally
// This ensures we don't get 'never' errors
interface UserRow {
    date_of_birth: string | null
    gender: string | null
    phone: string | null
    college_name: string | null
    department: string | null
    year_of_study: number | null
}

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

                if (error) {
                    console.error('Error fetching profile:', error)
                    setLoading(false)
                    return
                }

                if (data) {
                    const profile = data as any; // Cast to any to avoid strict type issues with 'never' if inference failed

                    // Check if any required fields are missing
                    const requiredFields = ['date_of_birth', 'gender', 'phone', 'college_name', 'department', 'year_of_study']
                    const isIncomplete = requiredFields.some(field => !profile[field])

                    if (isIncomplete) {
                        setIsOpen(true)
                        // Pre-fill existing data if any
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

            const { error } = await supabase
                .from('users')
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
                // Prevent closing if we want to enforce it. 
                // For now, let's allow inspection but maybe re-open on nav? 
                // The checking logic runs on mount. If they close and reload, it opens again.
            }
        }}>
            <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Please provide a few details to help us personalize your MindBloom experience.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                required
                                value={formData.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => handleChange('gender', value)}
                                required
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="non-binary">Non-binary</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            required
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="college_name">College Name</Label>
                        <Input
                            id="college_name"
                            placeholder="Enter your college name"
                            required
                            value={formData.college_name}
                            onChange={(e) => handleChange('college_name', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                placeholder="e.g. Computer Science"
                                required
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year_of_study">Year of Study</Label>
                            <Select
                                value={formData.year_of_study}
                                onValueChange={(value) => handleChange('year_of_study', value)}
                                required
                            >
                                <SelectTrigger id="year_of_study">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                    <SelectItem value="5">5th Year+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Complete Profile'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
