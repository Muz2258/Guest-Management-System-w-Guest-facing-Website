<template>
    <section class="bg-brand-sec-light-200 pt-40 flex flex-col items-center">
        <div class="flex gap-4 items-center mb-32">
            <img src="../../assets/vectors/leaf-branch__left--purple.svg" class="h-6" />
            <h4 class="text-heading-s text-brand-pri">Details</h4>
            <img src="../../assets/vectors/leaf-branch__right--purple.svg" class="h-6" />
        </div> 
        <div class="flex flex-col items-center w-[87%] mb-56">
            <DetailsInfo v-for="(session, index) in sessionDetails" :key="index" v-bind="session" :isLast="index === sessionDetails.length - 1" />
        </div>
        <div class="flex gap-8 justify-center w-full overflow-hidden">
            <img src="../../assets/png/temp-image-details-1.png" />
            <img src="../../assets/png/temp-image-details-2.png" />
            <img src="../../assets/png/temp-image-details-3.png" />
        </div>
    </section>
</template>

<script setup lang="ts">
// Reactive Variables
const sessionDetails = ref<Array<any>>([
    {
        sessionTitle: 'Church Service',
        locationName: 'Devout Christian Assembly',
        locationAddress: 'Alegbo road, off Warri port express way, Warri, Delta state. Nigeria',
        locationCoordinates: '5.541824846954904, 5.729033854442553',
        startTime: '12:00 PM',
        endTime: '1:30 PM',
        remarks: 'Photoshoot with guests and family follows immediately after (30 minutes)'
    },
    {
        sessionTitle: 'Reception',
        locationName: 'DY Events Place',
        locationAddress: 'Edjeba road, off NPA - DSC Express way, Warri, Delta State. Nigeria',
        locationCoordinates: '5.541824846954904, 5.729033854442553',
        startTime: '2:30 PM',
        endTime: '4:00 PM',
        remarks: "Couple’s entrance dance starts at 3:00 pm"
    },
    {
        sessionTitle: 'After Party',
        locationName: 'DY Events Place',
        locationAddress: 'Edjeba road, off NPA - DSC Express way, Warri, Delta State. Nigeria',
        locationCoordinates: '5.541824846954904, 5.729033854442553',
        startTime: '10:00 PM',
        endTime: 'Mama Calls',
    }
]);
</script>

<style scoped>

</style>