// app/(public)/booking/page.tsx
import { createClient } from '@/lib/supabase/server'
import BookingFlow from '@/components/booking/BookingFlow'
import type { MassageService } from '@/lib/types'

export default async function BookingPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('massage_services')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  return <BookingFlow services={(services ?? []) as MassageService[]} />
}