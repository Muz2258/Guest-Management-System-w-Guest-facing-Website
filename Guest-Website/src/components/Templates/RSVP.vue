<template>
    <section 
        id="love-story" 
        class="flex flex-col items-center bg-brand-sec-light-200 pt-40"
    >
        <div class="flex gap-4 items-center mb-20">
            <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
            <h4 class="text-heading-s text-brand-pri">RSVP</h4>
            <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
        </div>

        <div v-if="isRSVPOpen && isRsvpGuest && guestResponse === 'pending'" class="flex flex-col items-center">
            <h3 class="text-neutrals-neu-0 text-heading-md mb-16">Let's celebrate</h3>
            <p class="mb-40 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Join us as we celebrate this great milestone. Whether you can or cannot be present, you mean the world to us.
            </p>
            <div v-if="isRSVPOpen" class="flex flex-col gap-12 w-full">
                <Button label="Yes! I'd be there" type="primary" class="w-full" :is-loading="activeButton === 'rsvp-yes'" @click="updateRSVP('attending')"/>

                <Button label="Sorry, I can't make it" type="secondary" class="w-full" :is-loading="activeButton === 'rsvp-no'" @click="updateRSVP('not_attending')"/>

                <div class="text-center">
                    <p class="text-xs text-neutrals-neu-46 mb-4">RSVP CLOSES IN:
                        <span class="text-heading-s text-neutrals-neu-0 font-bold ml-8">{{ countdown.days }}</span>
                        <span class="text-xs text-neutrals-neu-46 ml-4"> {{ countdown.days === 1 ? 'day' : 'days' }} </span>
                        <span class="text-heading-s text-neutrals-neu-0 font-bold ml-8"> {{ countdown.hours }}</span>
                        <span class="text-xs text-neutrals-neu-46 ml-4"> {{ countdown.hours === 1 ? 'hour' : 'hours' }}</span>
                    </p>
                </div>
            </div>
        </div>

        <div v-else-if="isRSVPOpen && isRsvpGuest && guestResponse === 'attending'" class="flex flex-col items-center">
            <h3 class="text-neutrals-neu-0 text-heading-md mb-16">Great!!</h3>
            <p class="mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                We’re so excited that you’d be there to celebrate with us. We can’t wait to celebrate this milestone with you <span class="text-neutrals-neu-0">{{ guestName }}</span>. See you soon!
            </p>
            <div class="flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card v-if="isCouple" :title="plusOneCardInfo.title" :description="plusOneCardInfo.description">
                    <template #footer>
                        <div v-if="hasPlusOne" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Change +1" 
                                type="secondary" 
                                class="w-full" 
                                :is-loading="activeButton === 'change-plus-one'" 
                                @click="updatePlusOne"
                            />
                            <Button 
                                label="Remove +1" 
                                type="tertiary" 
                                class="w-full" 
                                @click="removePlusOne"
                            />
                        </div>
                        <div v-else-if="spouseResponse === 'pending'" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Yes" 
                                type="primary" 
                                class="w-full" 
                                :is-loading="activeButton === 'spouse-yes'" 
                                @click="setSpouseRSVP('attending')"
                            />
                            <Button 
                                label="No" 
                                type="secondary" 
                                class="w-full" 
                                :is-loading="activeButton === 'spouse-no'" 
                                @click="setSpouseRSVP('not-attending')"
                            />
                        </div>
                        <div v-else-if="spouseResponse === 'not-attending'" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Add +1" 
                                type="primary" 
                                class="w-full" 
                                :is-loading="activeButton === 'add-plus-one'" 
                                @click="addPlusOne"
                            />
                            <Button 
                                label="Update response" 
                                type="secondary" 
                                class="w-full" 
                                :is-loading="activeButton === 'update-spouse-response'" 
                                @click="changeSpouseRSVP"
                            />
                        </div>
                        <Button 
                            v-else 
                            label="Update response" 
                            type="secondary" 
                            class="w-full" 
                            :is-loading="activeButton === 'update-spouse-response'" 
                            @click="changeSpouseRSVP"
                        />
                    </template>
                </Card>
                <Card v-else-if="!isCouple && plusOneEligible" :title="plusOneCardInfo.title" :description="plusOneCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasPlusOne" 
                            label="Add +1" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'add-plus-one'" 
                            @click="addPlusOne"
                        />
                        <div v-if="hasPlusOne" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Change +1" 
                                type="secondary" 
                                class="w-full" 
                                @click="updatePlusOne"
                            />
                            <Button 
                                label="Remove +1" 
                                type="tertiary" 
                                class="w-full" 
                                @click="removePlusOne"
                            />
                        </div>
                    </template>
                </Card>
                <Card :title="giftingCardInfo.title" :description="giftingCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasGift" 
                            label="See available gifts" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="text-center text-5xl p-12">
                            😘
                        </div>
                    </template>
                </Card>
                <Card :title="wellWishesCardInfo.title" :description="wellWishesCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasWished" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full" 
                            @click="leaveMessage"
                        />
                        <div v-else="spouseResponse === 'pending'" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Edit your message" 
                                type="secondary" 
                                class="w-full" 
                                @click="editMessage"
                            />
                            <Button 
                                label="Delete your message" 
                                type="tertiary" 
                                class="w-full" 
                                :is-loading="activeButton === 'delete-message'" 
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
            <p class="text-sm text-neutrals-neu-46">Want to change your response? <span class="text-brand-pri underline" @click="showUpdateRSVPModal">Update RSVP</span></p>
        </div>

        <div v-else-if="isRSVPOpen && isRsvpGuest && guestResponse === 'not_attending'" class="flex flex-col items-center">
            <h3 class="text-neutrals-neu-0 text-heading-md mb-16">That's alright</h3>
            <p class="mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Thank you for letting us know <span class="text-neutrals-neu-0">{{ guestName }}</span>, we totally understand. You can still share in our joy by sending a gift or leaving a message.
            </p>
            <div class="flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card :title="giftingCardInfo.title" :description="giftingCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasGift" 
                            label="See available gifts" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="text-center text-5xl p-12">
                            😘
                        </div>
                    </template>
                </Card>
                <Card :title="wellWishesCardInfo.title" :description="wellWishesCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasWished" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full" 
                            @click="leaveMessage"
                        />
                        <div v-else="spouseResponse === 'pending'" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Edit your message" 
                                type="secondary" 
                                class="w-full"
                                @click="editMessage"
                            />
                            <Button 
                                label="Delete your message" 
                                type="tertiary" 
                                class="w-full" 
                                :is-loading="activeButton === 'delete-message'" 
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
            <p class="text-sm text-neutrals-neu-46">Want to change your response? <span class="text-brand-pri underline" @click="showUpdateRSVPModal">Update RSVP</span></p>
        </div>

        <div v-else class="flex flex-col items-center">
            <h3 class="text-neutrals-neu-0 text-heading-md mb-16">Share in our joy</h3>
            <p class="mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Though we're having a small, private ceremony with immediate family, we couldn't celebrate without letting you know. Thank you for being part of our journey.
            </p>
            <div class="flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card :title="giftingCardInfo.title" :description="giftingCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasGift" 
                            label="See available gifts" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="text-center text-5xl p-12">
                            😘
                        </div>
                    </template>
                </Card>
                <Card :title="wellWishesCardInfo.title" :description="wellWishesCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasWished" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full"
                            @click="leaveMessage"
                        />
                        <div v-else="spouseResponse === 'pending'" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Edit your message" 
                                type="secondary" 
                                class="w-full"
                                @click="editMessage"
                            />
                            <Button 
                                label="Delete your message" 
                                type="tertiary" 
                                class="w-full" 
                                :is-loading="activeButton === 'delete-message'" 
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        
        <img src="../../assets/png/test-image-rsvp.png" class="mt-64 w-full">
    </section>
</template>

<script setup lang="ts">
// Store variables
const guestStore = useGuestStore();
const eventStore = useEventStore();
const uiStore = useUIStore();
const wellWishesStore = useWellWishesStore();
const { isRSVPOpen } = eventStore;
const { deleteWellWish } = wellWishesStore;

// Reactive variables
const activeButton = ref<string | null>(null);
const hasGift = ref(false);
const spouseResponse = ref<string>('pending');
const countdown = ref({
    days: 0,
    hours: 0
});

// Other variables
let countdownInterval: NodeJS.Timeout | null = null;

// Computed variables 
const guestResponse = computed(() => guestStore.guest?.rsvp?.attendance_status || 'pending')

const hasPlusOne = computed(() => guestStore.guest?.rsvp?.plus_one_attending === true)

const plusOneName = computed(() => guestStore.guest?.rsvp?.plus_one_name || '')

const hasWished = computed(() => wellWishesStore.hasWellWish)

const guestName = computed(() => {
    const firstName = guestStore.guest?.first_name || '';
    const lastName = guestStore.guest?.last_name || '';

    if(isCouple.value && lastName) {
        return `Mr. & Mrs. ${lastName}`;
    } else {
        return firstName;
    }
})

const isCouple = computed(() => guestStore.guest?.guest_type === 'couple')

const isRsvpGuest = computed(() => {
    return guestStore.guest?.invitation_type === 'rsvp_guest';
})

const plusOneEligible = computed(() => {
    return guestStore.guest?.plus_one_eligibility === 'eligible';
})

const plusOneCardInfo = computed(() => {
    if(isCouple.value) {
        if(hasPlusOne.value) {
            return {
                title: '+1 Added',
                description: {
                    before: 'You\'ve added ',
                    guestName: plusOneName.value,
                    after: ' as your +1. You can change this anytime.'
                }
            }
        }else if(spouseResponse.value === 'attending') {
            return {
                title: 'Perfect!',
                description: 'We\'re excited to have both of you celebrate with us. See you soon!'
            }
        } else if(spouseResponse.value === 'not-attending') {
            return {
                title: 'That\'s okay!',
                description: 'You can still add a +1 if you\'d like to bring someone else along.'
            }
        }else {
            return {
                title: 'Attending with spouse?',
                description: 'If you would be coming along with your spouse, please let us know.'
            }
        }
    } else {
        if(hasPlusOne.value) {
            return {
                title: '+1 Added',
                description: {
                    before: 'You\'ve added ',
                    guestName: plusOneName.value,
                    after: ' as your +1. You can change this anytime.'
                }
            }
        } else {
            return {
                title: 'Have a +1?',
                description: 'If you would like to bring a guest, please let us know.'
            }
        }
    }
})

const giftingCardInfo = computed(() => {
    if(hasGift.value) {
        return {
            title: 'Gift sent!',
            description: {
                before: 'Thank you',
                guestName: guestName.value,
                after: 'for your gift. We appreciate you dearly.'
            }
        }
    } else {
        return {
            title: 'Send a gift',
            description: 'If you wish to honor us with a gift, we have a registry set up for your convenience.'
        }
    }
})

const wellWishesCardInfo = computed(() => {
    if(hasWished.value) {
        return {
            title: 'Message Sent!',
            description: {
                before: 'Thank you',
                guestName: guestName.value,
                after: 'for your message of love. We appreciate you dearly.'
            }
        }
    } else {
        return {
            title: 'Write on our wall',
            description: 'Leave a message for us to see. We appreciate your love and support!'
        }
    }
})

// Functions
const updateCountdown = () => {
    if (!eventStore.eventDetails) {
        countdown.value = { days: 0, hours: 0 };
        return;
    }

    const now = new Date();
    const rsvpDeadline = new Date(
        eventStore.eventDetails.rsvpEndDate + 'T' + eventStore.eventDetails.rsvpEndTime
    );
    
    const timeDiff = rsvpDeadline.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
        countdown.value = { days: 0, hours: 0 };
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        return;
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    countdown.value = { days, hours };
}

const updateRSVP = async (status: 'attending' | 'not_attending') => {
    const buttonId = status === 'attending' ? 'rsvp-yes' : 'rsvp-no';
    activeButton.value = buttonId;

    try {
        if(!guestStore.guest?.guest_id) {
            throw new Error('No guest ID available');
        }

        await guestStore.updateGuestRSVP(status);

        console.log(`RSVP updated to ${status} successfully.`);
    } catch (error) {
        console.error('Error updating RSVP:', error);
    } finally {
        activeButton.value = null;
    }
}

const setSpouseRSVP = (status: string) => {
    const buttonId = status === 'attending' ? 'spouse-yes' : 'spouse-no';
    activeButton.value = buttonId;

    setTimeout(() => {
        spouseResponse.value = status;
        activeButton.value = null;
    }, 1000);
}

const changeSpouseRSVP = () => {
    activeButton.value = 'update-spouse-response';

    setTimeout(() => {
        spouseResponse.value = 'pending';
        activeButton.value = null;
    }, 1000);
}

const addPlusOne = () => {
    console.log('Adding plus one...');
    uiStore.showPlusOneModal();
}

const updatePlusOne = () => {
    console.log('Updating plus one...');
    uiStore.showPlusOneModal();
}

const removePlusOne = () => {
    console.log('Removing plus one...');
    uiStore.showRemovePlusOneModal();
}

const sendGift = () => {
    activeButton.value = 'send-gift';

    setTimeout(() => {
        hasGift.value = true;
        activeButton.value = null;
    }, 1000);
}

const leaveMessage = () => {
    console.log('Sending well wishes message...');
    uiStore.showWellWishesModal();
}

const editMessage = () => {
    console.log('Editing well wishes message...');
    uiStore.showWellWishesModal();
}

const deleteMessage = async () => {
    try {
        if(!guestStore.guest?.guest_id) {
            throw new Error('No guest ID available');
        }

        console.log('Deleting well wishes message...');
        activeButton.value = 'delete-message';

        await deleteWellWish(guestStore.guest?.guest_id);

        console.log('Well wishes message deleted successfully.');
    } catch (error) {
        console.error('Error deleting well wishes message:', error);
    } finally {
        activeButton.value = null;
    }
}

const showUpdateRSVPModal = () => {
    console.log('Opening Update RSVP modal...');
    uiStore.showUpdateRSVPModal();
}

// Initialize countdown on mount
onMounted(() => {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 3600000);
});

// Cleanup on unmount
onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
});
</script>

<style scoped>
</style>