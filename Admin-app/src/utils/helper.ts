import type { GuestName } from "@/types/guest"

const formatGuestName = (name: GuestName, couple: boolean = false, spouseAttending: boolean = false): string => {
  const titles = (): string => {
    if (name.titles) {
      if(name.titles.length > 0) {
        if(couple && spouseAttending) return name.titles.join(' ') + ' & Mrs.'

        return name.titles.join(' ')
      }
      
      if (couple  && spouseAttending) return 'Mr. & Mrs.'
      return ''
    }

    return ''
  }

  const suffixes = (): string => {
    if (name.suffixes && name.suffixes.length > 0) {
        if(couple  && spouseAttending) return ''
        return name.suffixes.join(' ')
    }

    return ''
  }

  const firstName = name?.first_name
  const middleName = name?.middle_name
  const lastName = name?.last_name

  return `${titles()} ${firstName} ${middleName ? middleName : ''} ${lastName ? lastName : ''} ${suffixes()}`.trim()
}

export {
  formatGuestName
}