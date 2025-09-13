import type { RSVP } from '../types/guests'
import { guestStorage } from '../utils/guestStorage';

export const useRSVPStore = defineStore('rsvp', () => {
    /* -------------------- States -------------------- */
    const rsvpData = ref<RSVP | null>(null)
    const loadingInit = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)


    /* -------------------- Functions ------------------- */
    const fetchRSVPData = async (token: string, forceRefresh = false) => {
        console.log('🔄 Starting RSVP fetch process...', token)
        loadingInit.value = true
        error.value = null

        try {
            if (!forceRefresh) {
                console.log('Checking for cached RSVP data...')
                const isDataCached = guestStorage.checkCache(token)

                if (isDataCached){
                    const cachedData = guestStorage.getGuestData(token)

                    if(cachedData?.guestData?.guestRsvp) {
                        rsvpData.value = cachedData.guestData.guestRsvp
                        console.log('✅ Loaded RSVP data from cache:', rsvpData.value)
                        loadingInit.value = false
                        guestStorage.refreshExpiry()
                        return
                    }else {
                        console.log('❌ Cached RSVP data is invalid or missing, forcing fresh fetch')
                    }
                }
            }

            console.log('📡 Fetching RSVP data from database...')

            const { data: res, error: err } = await supabase
                .rpc('guest_get_rsvp_data', {
                    auth_token: token
                })

            if (err) {
                console.log('❌ Supabase error:', err)
                throw err
            }

            console.log('✅ RSVP data retrieved from database:', res)

            rsvpData.value = res.rsvp

            console.log('✅ RSVP data saved to store successfully:', rsvpData.value)

            // Save to secure storage for future use
            await guestStorage.saveGuestData(token, {guestRsvp: rsvpData.value})
            console.log('✅ RSVP data successfully saved to cache:', rsvpData.value)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'An error occurred'
        } finally {
            loadingInit.value = false
        }
    }

    const initialiseRsvpStoreFromCache = () => {
        console.log('🚀 Fetching RSVP data from cache...')
        const cachedData = guestStorage.getGuestData()
        loadingInit.value = true

        if(cachedData?.guestData?.guestRsvp) {
            rsvpData.value = cachedData.guestData.guestRsvp
            loadingInit.value = false
            guestStorage.refreshExpiry()
            return
        }else {
            console.log('❌ Cached rsvp data is invalid or missing')
        }
    }

    const updateGuestRsvp = async (token: string, data: Partial<{
        attendance_status?: 'attending' | 'not_attending'
        spouse_attending?: boolean | null
        plus_one_attending?: boolean | null
        plus_one_name?: string | null
    }>) => {
        if (!token) {
            console.error('❌ No guest token available to update RSVP')
            throw new Error('No guest token available')
        }

        try {
            loading.value = true
            error.value = null
            console.log('🔄 Starting RSVP update process...', { token, data })

            const {data: res, error: updateError } = await supabase
                .rpc('guest_update_rsvp_data', {
                    auth_token: token,
                    attendance_status: data.attendance_status !== undefined ? data.attendance_status : rsvpData.value?.attendance_status ?? null,
                    spouse_attending: data.spouse_attending !== undefined ? data.spouse_attending : rsvpData.value?.spouse_attending ?? null,
                    plus_one_attending: data.plus_one_attending !== undefined ? data.plus_one_attending : rsvpData.value?.plus_one_attending ?? null,
                    plus_one_name: data.plus_one_name !== undefined ? data.plus_one_name : rsvpData.value?.plus_one_name ?? null
                })

            if (updateError) {
                console.error('❌ Supabase error:', updateError)
                throw updateError
            }

            console.log('✅ RSVP updated successfully:', res)

            await fetchRSVPData(token, true)
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'An error occurred'
        } finally {
            loading.value = false
        }
    }

    const initializePlusOneFormData = () => {
        const existingPlusOne = rsvpData.value?.plus_one_name || ''
        if (existingPlusOne) {
            const names = existingPlusOne.trim().split(' ')
            return {
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || ''
            }
        }
        return {
            firstName: '',
            lastName: ''
        }
    }

    const saveCurrentRsvpData = async (token: string) => {
        guestStorage.saveGuestData(token, {guestRsvp: rsvpData.value})
    }

    return {
        // States
        rsvpData,
        loadingInit,
        loading,
        error,

        // Functions
        fetchRSVPData,
        initialiseRsvpStoreFromCache,
        updateGuestRsvp,
        initializePlusOneFormData,
        saveCurrentRsvpData
    }
});