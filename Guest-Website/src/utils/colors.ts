export const colors = {
    brand: {
        pri: '#4F1E8B',
        pri_dark_100: '#391762',
        pri_light_100: '#6D34B2',
        sec: '#DDC8F8',
        sec_light_100: '#F5EDFF',
        sec_light_200: '#FAF5FF',
        accent: '#177B61',
    },
    neutral: {
        neu_100: '#FFFFFF',
        neu_96: '#F5F5F5',
        neu_46: '#767676',
        neu_35: '#595959',
        neu_0: '#000000'
    },
    denotive: {
        denote_red: '#AE4646',
        denote_yellow_light: '#FDF2D3',
        denote_green_light: '#C9EEE4'
    }
} as const

export type colorPath = 
  | 'brand.pri'
  | 'brand.pri_dark_100'
  | 'brand.pri_light_100'
  | 'brand.sec'
  | 'brand.sec_light_100'
  | 'brand.sec_light_200'
  | 'brand.accent'
  | 'neutral.neu_100'
  | 'neutral.neu_96'
  | 'neutral.neu_46'
  | 'neutral.neu_35'
  | 'neutral.neu_0'
  | 'denotive.denote_red'
  | 'denotive.denote_yellow_light'
  | 'denotive.denote_green_light'

export const getColor = (path: colorPath): string => {
    const keys = path.split('.')
    let result: any = colors
    for (const key of keys) {
        result = result[key]
    }
    return result
}