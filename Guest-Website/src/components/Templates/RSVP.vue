<template>
  <section 
      class="flex flex-col items-center bg-neutrals-neu-100 py-40 overflow-hidden"
  >
    <div class="mb-20">
        <DecorativeBranches variant="purple">
            <h4 class="text-heading-s text-brand-pri">RSVP</h4>
        </DecorativeBranches>
    </div>

    <transition name="rsvp-animation" mode="out-in">
      <div class="rsvp-content flex flex-col items-center" :key="activeCondition">
        <template v-if="pending">
            <h3 class="heading text-neutrals-neu-0 text-heading-md mb-16">Let's celebrate</h3>
            <p class="copy mb-40 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Join us as we celebrate this great milestone. Whether you can or cannot be present, you mean the world to us.
            </p>
            <div v-if="isRSVPOpen" class="content flex flex-col gap-12 w-full">
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
        </template>

        <template v-else-if="attending">
            <h3 class="heading text-neutrals-neu-0 text-heading-md mb-16">Great!!</h3>
            <p class="copy mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                We’re so excited that you’d be there to celebrate with us. We can’t wait to celebrate this milestone with you <span class="text-neutrals-neu-0">{{ guestName }}</span>. See you soon!
            </p>
            <div class="content flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card v-if="isCouple" :title="plusOneCardInfo.title" :description="plusOneCardInfo.description">
                    <template #footer>
                        <div v-if="hasPlusOne" class="flex flex-col gap-8 w-full">
                            <Button 
                                label="Edit +1" 
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
                                @click="setSpouseRSVP(true)"
                            />
                            <Button 
                                label="No" 
                                type="secondary" 
                                class="w-full" 
                                :is-loading="activeButton === 'spouse-no'" 
                                @click="setSpouseRSVP(false)"
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
                                label="Edit +1" 
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
                            label="Send gift" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="flex flex-col items-center justify-between text-center px-24 pt-24 grow">
                            <picture>
                                <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp" type="image/webp">
                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif" alt="🥰" width="88" height="88">
                            </picture>
                            <span class="text-s text-center text-brand-pri underline" @click="sendGift">Send another gift</span>
                        </div>
                    </template>
                </Card>
                <Card :title="goodWillCardInfo.title" :description="goodWillCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasSentMessage" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full" 
                            @click="leaveMessage"
                        />
                        <div v-else class="flex flex-col gap-8 w-full">
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
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
            <p class="foot text-sm text-neutrals-neu-46">Want to change your response? <span class="text-brand-pri underline" @click="showUpdateRSVPModal">Update RSVP</span></p>
        </template>

        <template v-else-if="notAttending">
            <h3 class="heading text-neutrals-neu-0 text-heading-md mb-16">That's alright</h3>
            <p class="copy mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Thank you for letting us know <span class="text-neutrals-neu-0">{{ guestName }}</span>, we totally understand. You can still share in our joy by sending a gift or leaving a message.
            </p>
            <div class="content flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card :title="giftingCardInfo.title" :description="giftingCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasGift" 
                            label="Send gift" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="flex flex-col items-center justify-between text-center px-24 pt-24 grow">
                            <picture>
                                <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp" type="image/webp">
                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif" alt="🥰" width="88" height="88">
                            </picture>
                            <span v-if="hasGift" class="text-s text-center text-brand-pri underline" @click="sendGift">Send another gift</span>
                        </div>
                    </template>
                </Card>
                <Card :title="goodWillCardInfo.title" :description="goodWillCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasSentMessage" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full" 
                            @click="leaveMessage"
                        />
                        <div v-else class="flex flex-col gap-8 w-full">
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
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
            <p class="foot text-sm text-neutrals-neu-46">Want to change your response? <span class="text-brand-pri underline" @click="showUpdateRSVPModal">Update RSVP</span></p>
        </template>

        <template v-else>
            <h3 class="heading text-neutrals-neu-0 text-heading-md mb-16">Share in our joy</h3>
            <p class="copy mb-16 max-w-[87vw] text text-neutrals-neu-46 text-center">
                Though we're having a small, private ceremony with immediate family, we couldn't celebrate without letting you know. Thank you for being part of our journey.
            </p>
            <div name="card-animation" tag="div" class="content flex gap-8 p-32 w-full overflow-x-auto max-w-screen scrollbar-hide">
                <Card :title="giftingCardInfo.title" :description="giftingCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasGift" 
                            label="Send gift" 
                            type="primary" 
                            class="w-full" 
                            :is-loading="activeButton === 'send-gift'" 
                            @click="sendGift"
                        />
                        <div v-else class="flex flex-col items-center justify-between text-center px-24 pt-24 grow">
                            <picture>
                                <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp" type="image/webp">
                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.gif" alt="🥰" width="88" height="88">
                            </picture>
                            <span v-if="hasGift" class="text-s text-center text-brand-pri underline" @click="sendGift">Send another gift</span>
                        </div>
                    </template>
                </Card>
                <Card :title="goodWillCardInfo.title" :description="goodWillCardInfo.description">
                    <template #footer>
                        <Button 
                            v-if="!hasSentMessage" 
                            label="Leave a message" 
                            type="primary" 
                            class="w-full"
                            @click="leaveMessage"
                        />
                        <div v-else class="flex flex-col gap-8 w-full">
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
                                @click="deleteMessage"
                            />
                        </div>
                    </template>
                </Card>
            </div>
        </template>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
// Components
import DecorativeBranches from '../Atoms/DecorativeBranches.vue'

// Stores
const uiStore = useUIStore();
const eventStore = useEventStore();
const guestStore = useGuestStore();
const rsvpStore = useRSVPStore();
const goodWillStore = useGoodWillStore();
const giftStore = useGiftStore();

// Store functions

// Store variables
const { isRSVPOpen } = storeToRefs(eventStore);
const { guestData } = storeToRefs(guestStore);
const { rsvpData } = storeToRefs(rsvpStore);
const { goodWillMessage } = storeToRefs(goodWillStore);

// Reactive variables
const activeButton = ref<string | null>(null);
const spouseResponse = ref<string>('pending');
const countdown = ref({
    days: 0,
    hours: 0
});

// Other variables
let countdownInterval: NodeJS.Timeout | null = null;

// Computed variables 
const guestInfo = computed(() => guestData.value?.guest)
const guestRsvp = computed(() => rsvpData.value)
const guestPermissions = computed(() => guestData.value?.permissions)
const guestResponse = computed(() => guestRsvp.value?.rsvp.attendance_status || 'pending')
const hasPlusOne = computed(() => (guestRsvp.value?.plus_one_data?.plus_ones?.length ?? 0) > 0)
const hasSentMessage = computed(() => goodWillMessage.value?.has_message)
const isCouple = computed(() => guestPermissions.value?.is_couple)
const isRsvpGuest = computed(() => guestPermissions.value?.can_rsvp)
const plusOneEligible = computed(() => guestPermissions.value?.can_add_plus_one)
const hasGift = computed(() => giftStore.has_gifted)

const pending = computed(() => {
    return isRSVPOpen.value && isRsvpGuest.value && guestResponse.value === 'pending';
})

const attending = computed(() => {
    return isRSVPOpen.value && isRsvpGuest.value && guestResponse.value === 'attending';
})

const notAttending = computed(() => {
    return isRSVPOpen.value && isRsvpGuest.value && guestResponse.value === 'not_attending';
})

const activeCondition = computed(() => {
    if(pending.value) return 'pending'
    if(notAttending.value) return 'not_attending'
    return 'attending'
})

const guestName = computed(() => {
    const firstName = guestInfo.value?.name.first_name || '';
    const lastName = guestInfo.value?.name.last_name || '';
    const title = guestInfo.value?.name?.titles?.join(' ') || '';

    if(isCouple.value && lastName) {
        return `${title ? title : ''} & Mrs. ${lastName ? lastName : firstName}`;
    } else {
        return `${title ? title : ''} ${firstName}`;
    }
})

const plusOneName = computed(() => {
  const name = guestRsvp.value?.plus_one_data?.plus_ones[0]?.name || ''
  return name ? `${name.titles ? name.titles.join(' ') : ''} ${name.first_name} ${name.last_name}` : 'your +1'
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
            title: 'Want to send a gift?',
            description: 'If you wish to honor us with a gift, we have a registry set up for your convenience.'
        }
    }
})

const goodWillCardInfo = computed(() => {
    if(hasSentMessage.value) {
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

    if(!guestData.value?.auth_token) {
        console.error('❌ No guest token available to update RSVP');
        return;
    }

    const token = guestData.value.auth_token;

    try {
        await rsvpStore.updateGuestRsvp(token, {attendance_status: status});
        console.log(`RSVP updated to ${status} successfully.`);
    } catch (error) {
        // Error handling is now done in the store
        console.error('Error updating RSVP - see store for details');
    } finally {
        activeButton.value = null;
    }
}

const setSpouseRSVP = async (status: boolean) => {
    spouseResponse.value = status ? 'attending' : 'not-attending';
    activeButton.value = status ? 'spouse-yes' : 'spouse-no';

    if(!guestData.value?.auth_token) {
        console.error('❌ No guest token available to update RSVP');
        return;
    }
    
    const token = guestData.value.auth_token;

    try {
        await rsvpStore.updateGuestRsvp(token, {spouse_attending: status});
        console.log(`Spouse RSVP set to ${status} successfully.`);
    } catch (error) {
        // Error handling is now done in the store
        console.error('Error setting spouse RSVP - see store for details');
    } finally {
        activeButton.value = null;
    }
}

const changeSpouseRSVP = () => {
    console.log('Updating spouse RSVP...');
    activeButton.value = 'update-spouse-response';
    spouseResponse.value = 'pending';
}

const addPlusOne = () => {
    console.log('Adding plus one...');
    uiStore.showHidePlusOneModal(true);
}

const updatePlusOne = () => {
    console.log('Updating plus one...');
    uiStore.showHidePlusOneModal(true);
}

const removePlusOne = () => {
    console.log('Removing plus one...');
    uiStore.showHideRemovePlusOneModal(true);
}

const sendGift = () => {
    console.log('Sending gift...');
    uiStore.showHideBottomSheet(true);
    uiStore.showHideGiftingSheets('gifting-form');
}

const leaveMessage = () => {
    console.log('Sending good will message...');
    uiStore.showHideGoodWillModal(true);
}

const editMessage = () => {
    console.log('Editing good will message...');
    uiStore.showHideGoodWillModal(true);
}

const deleteMessage = () => {
    console.log('Showing delete confirmation dialog...');
    uiStore.showHideDeleteGoodWillModal(true);
}

const showUpdateRSVPModal = () => {
    console.log('Opening Update RSVP modal...');
    uiStore.showHideUpdateRSVPModal(true);
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
.rsvp-animation-enter-active .heading {
    transition: all 0.8s cubic-bezier(.32,.19,.24,.98) 0.2s;
}

.rsvp-animation-enter-active .copy {
    transition: all 0.6s cubic-bezier(.32,.19,.24,.98);
}

.rsvp-animation-leave-active .heading {
    transition: all 0.4s cubic-bezier(.32,.19,.24,.98);
}

.rsvp-animation-leave-active .copy {
    transition: all 0.4s cubic-bezier(.32,.19,.24,.98) 0.1s;
}

.rsvp-animation-enter-active .content {
    transition: all 1s cubic-bezier(.32,.19,.24,.98) 0.2s;
}

.rsvp-animation-enter-active .foot {
    transition: all 0.5s cubic-bezier(.32,.19,.24,.98) 0.6s;
}

.rsvp-animation-enter-from .heading, .rsvp-animation-leave-to .heading {
    opacity: 0;
    transform: translateY(-100%);
}

.rsvp-animation-enter-from .copy, .rsvp-animation-leave-to .copy {
    opacity: 0;
    transform: translateY(-40%);
}

.rsvp-animation-enter-from .content, .rsvp-animation-leave-to .content {
    opacity: 0;
    transform: translateX(40%);
}

.rsvp-animation-enter-from .foot, .rsvp-animation-leave-to .foot {
    opacity: 0;
}
</style>