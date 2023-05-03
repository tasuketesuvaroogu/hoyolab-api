const GENSHIN_GAME_RECORD_URL =
  'https://bbs-api-os.hoyolab.com/game_record/genshin/api'

const GENSHIN_HKE_URL = 'https://sg-hk4e-api.hoyolab.com'

const SG_PUBLIC_URL = 'https://sg-public-api.hoyolab.com'

export const GAMES_ACCOUNT =
  'https://api-account-os.hoyolab.com/account/binding/api/getUserGameRolesByCookieToken'

export const GENSHIN_GAME_RECORD_REFERER = 'https://act.hoyolab.com'
export const GENSHIN_GAME_RECORD = `${GENSHIN_GAME_RECORD_URL}/index`
export const GENSHIN_CHARACTERS_LIST = `${GENSHIN_GAME_RECORD_URL}/character`
export const GENSHIN_CHARACTERS_SUMMARY = `${GENSHIN_GAME_RECORD_URL}/avatarBasicInfo`
export const GENSHIN_SPIRAL_ABYSS = `${GENSHIN_GAME_RECORD_URL}/spiralAbyss`
export const GENSHIN_DAILY_NOTE = `${GENSHIN_GAME_RECORD_URL}/dailyNote`

export const GENSHIN_DIARY = `${GENSHIN_HKE_URL}/event/ysledgeros/month_info`
export const GENSHIN_DIARY_DETAIL = `${GENSHIN_HKE_URL}/event/ysledgeros/month_detail`

export const GENSHIN_DAILY_INFO = `${GENSHIN_HKE_URL}/event/sol/info`
export const GENSHIN_DAILY_REWARD = `${GENSHIN_HKE_URL}/event/sol/home`
export const GENSHIN_DAILY_CLAIM = `${GENSHIN_HKE_URL}/event/sol/sign`

export const HSR_DAILY_INFO = `${SG_PUBLIC_URL}/event/luna/os/info`
export const HSR_DAILY_REWARD = `${SG_PUBLIC_URL}/event/luna/os/home`
export const HSR_DAILY_CLAIM = `${SG_PUBLIC_URL}/event/luna/os/sign`

export const GENSHIN_REDEEM_CODE = `${GENSHIN_HKE_URL}/common/apicdkey/api/webExchangeCdkey`
