<template>
    <div class="flex space-x-8 w-full">
        <div class="flex flex-col items-center space-y-2 px-6 pt-8">
            <div class="size-12 rounded-full bg-brand-pri"></div>
            <div
                v-if="!isLast"
                class="w-[1px] flex grow bg-brand-sec"
            ></div>
        </div>
        <div class="flex flex-col gap-16 pb-32">
            <h3 class="text-heading-md text-neutrals-neu-0">{{ sessionTitle }}</h3>
            <div class="flex gap-4">
                <Icon name="location-pin" :size="16" :color="getColor('neutral.neu_35')" class="mt-4"/>
                <div class="flex flex-col gap-4">
                    <p class="text-neutrals-neu-0 text">{{ locationName }}</p>
                    <p class="text-neutrals-neu-35 text-s">{{ locationAddress }}</p>
                    <button 
                        v-if="locationCoordinates" 
                        @click="handleDirectionsClick"
                        class="text-brand-pri text-s underline mt-8 text-left"
                    >
                        {{ isMobileDevice ? 'Get Directions' : 'Open in Google Maps' }}
                    </button>
                </div>
            </div>
            <div class="flex gap-4">
                <Icon name="alarm-clock" :size="16" :color="getColor('neutral.neu_35')" class="mt-4"/>
                <div class="flex flex-col gap-4">
                    <p class="text-neutrals-neu-0 text">{{ startTime }} - {{ endTime }}</p>
                    <p v-if="remarks" class="text-neutrals-neu-35 text-s">{{ remarks }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Utilities
import { getColor } from '../../utils/colors';
import Icon from '../Icon';

// Reactive variables
const props = defineProps({
    sessionTitle: {
        type: String,
        required: true
    },
    locationName: {
        type: String,
        required: true
    },
    locationAddress: {
        type: String,
        required: true
    },
    locationCoordinates: {
        type: String,
        required: false
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: false
    },
    remarks: {
        type: String,
        required: false
    },
    isLast: {
        type: Boolean,
        required: false,
        default: false
    }
});

// Computed property to detect mobile/tablet devices
const isMobileDevice = computed(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

/* // Function to create the Google Maps URL
const createGoogleMapsUrl = (coordinates: string) => {
    const [lat, lng] = coordinates.split(',').map(coord => coord.trim());
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

// Function to create the maps URL scheme for mobile devices
const createMobileMapUrl = (coordinates: string) => {
    const [lat, lng] = coordinates.split(',').map(coord => coord.trim());
    
    // Different URL schemes for different platforms
    const mapUrls = {
        google: `https://www.google.com/maps?q=${lat},${lng}&z=15`,
        apple: `maps://maps.apple.com/?q=${lat},${lng}`,
        waze: `waze://?ll=${lat},${lng}&navigate=yes`,
    };

    return mapUrls;
}; */

// Handle click on the directions button
const handleDirectionsClick = () => {
    if (!props.locationCoordinates) return;

    const [lat, lng] = props.locationCoordinates.split(',').map(coord => coord.trim())

    if(isMobileDevice.value) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isAndroid) {
            // For Android, open Google Maps
            window.location.href = `geo:${lat},${lng}?q=${lat},${lng}`;
        } else if (isIOS) {
            // For iOS, open Apple Maps
            window.location.href = `maps://maps.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}`;
        } else {
            // Fallback for other mobile devices
            window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15`, '_blank');
        }
    }else {
        // For desktop, simply open Google Maps in a new tab
        window.open(`maps://maps.google.com/maps?q=${lat},${lng}`, '_blank');
    }

    /* if (isMobileDevice.value) {
        // For mobile devices, create a custom element that will trigger the native app selection
        const urls = createMobileMapUrl(props.locationCoordinates);
        
        // Create hidden links for each map application
        const googleLink = document.createElement('a');
        googleLink.href = urls.google;
        googleLink.style.display = 'none';
        document.body.appendChild(googleLink);

        const appleLink = document.createElement('a');
        appleLink.href = urls.apple;
        appleLink.style.display = 'none';
        document.body.appendChild(appleLink);

        const wazeLink = document.createElement('a');
        wazeLink.href = urls.waze;
        wazeLink.style.display = 'none';
        document.body.appendChild(wazeLink);

        // Try opening the links - the device will handle which one to use
        try {
            wazeLink.click();
            setTimeout(() => {
                appleLink.click();
                setTimeout(() => {
                    googleLink.click();
                }, 100);
            }, 100);
        } finally {
            // Clean up the elements
            setTimeout(() => {
                document.body.removeChild(googleLink);
                document.body.removeChild(appleLink);
                document.body.removeChild(wazeLink);
            }, 1000);
        }
    } else {
        // For desktop, simply open Google Maps in a new tab
        window.open(createGoogleMapsUrl(props.locationCoordinates), '_blank');
    } */
};
</script>

<style scoped>

</style>