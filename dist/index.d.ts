/**
 * Represents a set of available languages as an enumerated type.
 */
declare enum LanguageEnum {
    /**
     * Simplified Chinese language code.
     */
    SIMPLIFIED_CHINESE = "zh-cn",
    /**
     * Traditional Chinese language code.
     */
    TRADIIONAL_CHINESE = "zh-tw",
    /**
     * German language code.
     */
    GERMAN = "de-de",
    /**
     * English language code.
     */
    ENGLISH = "en-us",
    /**
     * Spanish language code.
     */
    SPANISH = "es-es",
    /**
     * French language code.
     */
    FRENCH = "fr-fr",
    /**
     * Indonesian language code.
     */
    INDONESIAN = "id-id",
    /**
     * Italian language code.
     */
    ITALIAN = "it-it",
    /**
     * Japanese language code.
     */
    JAPANESE = "ja-jp",
    /**
     * Korean language code.
     */
    KOREAN = "ko-kr",
    /**
     * Portuguese language code.
     */
    PORTUGUESE = "pt-pt",
    /**
     * Russian language code.
     */
    RUSSIAN = "ru-ru",
    /**
     * Thai language code.
     */
    THAI = "th-th",
    /**
     * Turkish language code.
     */
    TURKISH = "tr-tr",
    /**
     * Vietnamese language code.
     */
    VIETNAMESE = "vi-vn"
}

/**
 * Represents a set of utility methods for working with languages.
 *
 * @internal
 * @category Internal
 * @class
 */
declare class Language {
    /**
     * Parses a language string into its corresponding LanguageEnum value.
     *
     * @param lang The language string to parse, or null/undefined to default to English.
     * @returns The LanguageEnum value corresponding to the provided string, or English if the string is invalid or undefined.
     */
    static parseLang(lang?: string | null): LanguageEnum;
}

/**
 * Defines the structure of a cookie object.
 *
 * @interface
 */
interface ICookie {
    /**
     * The value of the "ltoken" cookie.
     */
    ltoken: string;
    /**
     * The value of the "ltuid" cookie.
     */
    ltuid: number;
    /**
     * The value of the "cookieToken" cookie, if it exists.
     */
    cookieToken?: string | null;
    /**
     * The value of the "accountId" cookie, if it exists.
     */
    accountId?: number;
    /**
     * The value of the "mi18nLang" cookie, if it exists.
     * This can be either a string or a LanguageEnum value.
     */
    mi18nLang?: LanguageEnum | string | null;
}

/**
 * Represents a cookie object.
 *
 * @class
 * @category Main
 */
declare class Cookie {
    /**
     * Parses a cookie string and returns a parsed ICookie object.
     *
     * @param cookieString - The cookie string to be parsed.
     * @returns {string} - A parsed ICookie object.
     * @throws {HoyolabError} when ltuid or ltoken keys are not found in the cookie string.
     */
    static parseCookieString(cookieString: string): ICookie;
    /**
     * Converts an `ICookie` object into a cookie string.
     * @param {ICookie} cookie - The `ICookie` object to convert.
     * @returns {string} A string representing the cookie.
     * @throws {HoyolabError} If the `ltuid` or `ltoken` key is missing in the `ICookie` object.
     */
    static parseCookie(cookie: ICookie): string;
}

/**
 * Represents the base type that can be used for properties in a request body,
 * request header, or request parameter.
 */
type BaseType = {
    [x: string]: string | number | boolean | null | undefined | string[] | number[] | never[];
};
/**
 * Represents the type that can be used for the body of a request.
 */
type RequestBodyType = BaseType;
/**
 * Represents the type that can be used for the headers of a request.
 */
type RequestHeaderType = BaseType;
/**
 * Represents the type that can be used for the parameters of a request.
 */
type RequestParamType = BaseType;
/**
 * Represents the interface for a response from the server.
 */
interface IResponse {
    /**
     * The status code of the response.
     */
    retcode: number;
    /**
     * A message associated with the response.
     */
    message: string;
    /**
     * The data returned by the server.
     */
    data: unknown;
}

/**
 * Class for handling HTTP requests with customizable headers, body, and parameters.
 *
 * @class
 * @internal
 * @category Internal
 */
declare class Request {
    private headers;
    /**
     * Body of the request.
     */
    private body;
    /**
     * Query parameters for the request.
     */
    private params;
    /**
     * The cache used for the request
     */
    private cache;
    /**
     * Flag indicating whether Dynamic Security is used.
     */
    private ds;
    /**
     * The number of request attempts made.
     */
    private retries;
    /**
     * Constructor for the Request class.
     *
     * @param cookies - A string of cookies to be added to the request headers (default: null).
     */
    constructor(cookies?: string | null);
    /**
     * Set Referer Headers
     *
     * @param url - The URL string of referer
     * @returns The updated Request instance.
     */
    setReferer(url: string): Request;
    /**
     * Set Body Parameter
     *
     * @param body - RequestBodyType as object containing the body parameters.
     * @returns This instance of Request object.
     */
    setBody(body: RequestBodyType): Request;
    /**
     * Sets search parameters or query parameter.
     *
     * @param params - An object of query parameter to be set.
     * @returns {Request} - Returns this Request object.
     */
    setParams(params: RequestParamType): Request;
    /**
     * Set to used Dynamic Security or not
     *
     * @param flag boolean Flag indicating whether to use dynamic security or not (default: true).
     * @returns {this} The current Request instance.
     */
    setDs(flag?: boolean): Request;
    /**
     * Set Language
     *
     * @param lang Language Language that used for return of API (default: Language.ENGLISH).
     * @returns {this}
     */
    setLang(lang?: LanguageEnum): Request;
    /**
     * Send the HTTP request.
     *
     * @param url - The URL to send the request to.
     * @param method - The HTTP method to use. Defaults to 'GET'.
     * @param ttl - The TTL value for the cached data in seconds.
     * @returns A Promise that resolves with the response data, or rejects with a HoyolabError if an error occurs.
     * @throws {HoyolabError} if an error occurs rejects with a HoyolabError
     */
    send(url: string, method?: 'GET' | 'POST', ttl?: number): Promise<IResponse>;
}

type CacheKey = {
    url: string;
    params: object;
    body: object;
    method: string;
};
/**
 * Represents a cache object for storing and retrieving data using a key-value pair.
 *
 * @class
 * @internal
 * @category Internal
 */
declare class Cache {
    /**
     * The default time-to-live (TTL) value for cached data in seconds.
     */
    private stdTTL;
    /**
     * The NodeCache instance used to store and retrieve data.
     */
    private nodeCache;
    /**
     * Generates a cache key based on the URL, query parameters, and body of a request.
     *
     * @param key - The key object containing the URL, query parameters, and body of the request.
     * @returns A unique MD5 hash key generated from the key object.
     */
    private generateKey;
    /**
     * Sets a value in the cache with a given key and TTL.
     *
     * @param key - The key object containing the URL, query parameters, and body of the request.
     * @param value - The value to be stored in the cache.
     * @param ttl - The TTL value for the cached data in seconds.
     * @returns True if the value was successfully stored in the cache, false otherwise.
     */
    set(key: CacheKey, value: object, ttl?: number): boolean;
    /**
     * Retrieves a value from the cache using a given key.
     *
     * @param key - The key object containing the URL, query parameters, and body of the request.
     * @returns The cached value if it exists, null otherwise.
     */
    get(key: CacheKey): object | null | undefined;
    /**
     * Checks if a key exists in the cache.
     *
     * @param key - The key object containing the URL, query parameters, and body of the request.
     * @returns True if the key exists in the cache, false otherwise.
     */
    has(key: CacheKey): boolean;
    /**
     * Deletes a key-value pair from the cache.
     *
     * @param key - The key object containing the URL, query parameters, and body of the request.
     * @returns True if the key-value pair was successfully deleted from the cache, false otherwise.
     */
    del(key: CacheKey): number;
}

/**
 * Generates a dynamic secret (DS) string for use in the Genshin Impact API.
 *
 * @returns The generated DS string.
 */
declare function generateDS(): string;
/**
 * Delays the execution of the code for a specified number of seconds.
 * @param second - The number of seconds to delay.
 * @returns A Promise that resolves after the specified number of seconds.
 */
declare function delay(second: number): Promise<void>;

/**
 * Represents the options for accessing the Hoyolab API.
 *
 * @interface
 */
interface IHoyolabOptions {
    /**
     * The cookie used to authenticate the request. This can be either a string or an {@link ICookie} object.
     */
    cookie: ICookie | string;
    /**
     * The language to use for the request. This should be a value of {@link LanguageEnum}.
     */
    lang?: LanguageEnum;
}
/**
 * Represents a game linked to a Hoyolab account.
 *
 * @interface
 */
interface IGame {
    /**
     * The game's business type.
     */
    game_biz: string;
    /**
     * The game's server region.
     */
    region: string;
    /**
     * The game's unique ID.
     */
    game_uid: string;
    /**
     * The game's nickname.
     */
    nickname: string;
    /**
     * The game's level.
     */
    level: number;
    /**
     * Whether the game is currently chosen as the active game.
     */
    is_chosen: boolean;
    /**
     * The name of the game's region.
     */
    region_name: string;
    /**
     * Whether the game is an official miHoYo game.
     */
    is_official: boolean;
}
/**
 * Represents a list of games linked to a Hoyolab account.
 *
 * @interface
 */
interface IGamesList {
    /**
     * The list of games linked to the account. This should be a value of {@link IGame}.
     */
    list: IGame[];
}

declare enum GamesEnum {
    GENSHIN_IMPACT = "hk4e_global",
    HONKAI_IMPACT = "bh3_global",
    HONKAI_STAR_RAIL = "hkrpg_global"
}

/**
 * Represents the Hoyolab API client.
 *
 * @class
 * @category Main
 */
declare class Hoyolab {
    /**
     * The parsed ICookie object used to authenticate requests.
     */
    readonly cookie: ICookie;
    /**
     * The underlying `Request` object used to make HTTP requests.
     */
    readonly request: Request;
    /**
     * The language used for API responses.
     */
    lang: LanguageEnum;
    /**
     * Creates a new instance of `Hoyolab`.
     *
     * @constructor
     * @param {IHoyolabOptions} options - The options to initialize the `Hoyolab` instance.
     * @throws {HoyolabError} If `ltuid` or `ltoken` keys are missing in the `ICookie` object.
     */
    constructor(options: IHoyolabOptions);
    /**
     * Get the list of games on this Hoyolab account.
     *
     * @async
     * @param {GamesEnum} [game] The optional game for which to retrieve accounts.
     * @throws {HoyolabError} Thrown if there are no game accounts on this Hoyolab account.
     * @returns {Promise<IGame[]>} The list of games on this Hoyolab account.
     */
    gamesList(game?: GamesEnum): Promise<IGame[]>;
    /**
     * Get the account of a specific game from the games list.
     *
     * @async
     * @param {GamesEnum} game - The game that the account belongs to.
     * @throws {HoyolabError} If there is no game account on this hoyolab account.
     * @returns {Promise<IGame>} The game account.
     */
    gameAccount(game: GamesEnum): Promise<IGame>;
}

/**
 * Interface for redeeming a code in Genshin Impact.
 */
interface IRedeemCode {
    /**
     * The data returned from redeeming the code. It can be a string or null.
     */
    data: string | null;
    /**
     * A message describing the result of redeeming the code.
     */
    message: string;
    /**
     * The return code from redeeming the code. A non-zero code indicates an error occurred.
     */
    retcode: number;
}

/**
 * Class representing the Redeem module for Genshin Impact's Hoyolab API.
 *
 * @public
 * @internal
 * @category Module
 */
declare class RedeemModule {
    private request;
    private lang;
    private game;
    private region;
    private uid;
    /**
     * Constructs a new RedeemModule object.
     * @param request - The Request object used for making HTTP requests.
     * @param lang - The language to use for the API response.
     * @param game - The game to redeem the code for.
     * @param region - The region of the user's account. If null, the API will use the default region for the game.
     * @param uid - The user ID of the account. If null, the API will use the user ID associated with the provided auth cookies.
     */
    constructor(request: Request, lang: LanguageEnum, game: GamesEnum, region: string | null, uid: number | null);
    /**
     * Redeems a code for a specific game and account.
     *
     * @param code - The code to redeem.
     * @returns A promise that resolves to an IRedeemCode object containing information about the redemption status.
     * @throws HoyolabError if the API returns an error.
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    claim(code: string): Promise<IRedeemCode>;
}

/**
 * Interface representing a daily award item.
 */
interface IDailyAwardItem {
    /**
     * The icon of the award item.
     */
    icon: string;
    /**
     * The name of the award item.
     */
    name: string;
    /**
     * The count of the award item.
     */
    cnt: number;
}
/**
 * Interface representing a daily information .
 */
interface IDailyInfo {
    /**
     * The total number of days the user has signed in.
     */
    total_sign_day: number;
    /**
     * The current date in YYYY-MM-DD format.
     */
    today: string;
    /**
     * Whether the user has signed in today.
     */
    is_sign: boolean;
    /**
     * Whether this is the user's first time signing in.
     */
    first_bind: boolean;
    /**
     * Whether the user has subscribed to the game.
     */
    is_sub: boolean;
    /**
     * The region of the user's game account.
     */
    region: string;
    /**
     * Whether today is the last day of the current month.
     */
    month_last_day: boolean;
    short_sign_day: number;
    sign_cnt_missed: number;
}
/**
 * An object describing a daily reward.
 */
interface IDailyReward {
    /**
     * The month number in which the reward is available.
     */
    month: number;
    /**
     * Whether the user can resign for the reward.
     */
    resign: boolean;
    /**
     * The current date in string format.
     */
    now: string;
    /**
     * The business code of the reward.
     */
    biz: string;
    /**
     * The award item associated with the reward.
     */
    award: IDailyAwardItem;
}
/**
 * Represents daily rewards for a specific month.
 */
interface IDailyRewards {
    /**
     * Represents daily rewards for a specific month.
     */
    month: number;
    /**
     * Represents daily rewards for a specific month.
     */
    resign: boolean;
    /**
     * The date of the reward in miliseconds.
     */
    now: string;
    /**
     * The business name associated with the reward.
     */
    biz: string;
    /**
     * An array of daily award items.
     */
    awards: IDailyAwardItem[];
}
/**
 * Interface representing the response data for claiming daily rewards.
 */
interface IDailyClaim {
    /** The status of the claim request. */
    status: string;
    /** The response code for the claim request. */
    code: number;
    /** The claimed reward, if any. */
    reward: IDailyReward | null;
    /** Information about the user's daily claim status. */
    info: IDailyInfo;
}

/**
 * DailyModule class provides methods to interact with Genshin Impact's daily module endpoints.
 *
 * @class
 * @internal
 * @category Module
 */
declare class DailyModule {
    private request;
    private lang;
    private game;
    private dailyInfoUrl;
    private dailyRewardUrl;
    private dailySignUrl;
    constructor(request: Request, lang: LanguageEnum, game: GamesEnum);
    /**
     * Retrieves daily information.
     *
     * @returns {Promise<IDailyInfo>} A promise that resolves to an IDailyInfo object.
     */
    info(): Promise<IDailyInfo>;
    /**
     * Retrieve daily rewards information.
     *
     * @returns {Promise<IDailyRewards>} A promise that resolves to an IDailyRewards object.
     */
    rewards(): Promise<IDailyRewards>;
    /**
     * Get the daily reward for a specific day or the current day
     *
     * @param {number | null} day - The day to retrieve the reward for. If null, retrieve the reward for the current day.
     * @returns {Promise<IDailyReward>} - A promise that resolves with the daily reward for the specified day or the current day
     * @throws {HoyolabError} - If the specified day is not a valid date in the current month or if the reward for the specified day is undefined.
     */
    reward(day?: number | null): Promise<IDailyReward>;
    /**
     * Claim the daily rewards.
     *
     * @returns {Promise<IDailyClaim>} The claim information.
     */
    claim(): Promise<IDailyClaim>;
}

/**
 * Enum for diary months.
 * @readonly
 * @enum {number}
 */
declare enum DiaryMonthEnum {
    /**
     * Current month
     */
    CURRENT = 3,
    /**
     * One month ago
     */
    ONE_MONTH_AGO = 2,
    /**
     * Two months ago
     */
    TWO_MONTH_AGO = 1
}
/**
 * Enum for diary rewards.
 * @readonly
 * @enum {number}
 */
declare enum DiaryEnum {
    /**
     * Primogems reward
     */
    PRIMOGEMS = 1,
    /**
     * Mora reward
     */
    MORA = 2
}

/**
 * Interface representing the base structure of a Genshin diary.
 */
interface IGenshinDiaryBase {
    /**
     * The unique identifier of the diary.
     */
    uid: number;
    /**
     * The region of the diary.
     */
    region: string;
    /**
     * The nickname associated with the diary.
     */
    nickname: string;
    /**
     * An array of optional months for the diary.
     */
    optional_month: number[];
    /**
     * The current month's data for the diary.
     */
    data_month: number;
}
/**
 * Interface representing additional information for a Genshin diary.
 * @extends {IGenshinDiaryBase}
 */
interface IGenshinDiaryInfo extends IGenshinDiaryBase {
    /**
     * The month of the diary.
     */
    month: number;
    /**
     * The data for the current month.
     */
    month_data: {
        /**
         * The current number of primogems.
         */
        current_primogems: number;
        /**
         * The current amount of mora.
         */
        current_mora: number;
        /**
         * The number of primogems from last month.
         */
        last_primogems: number;
        /**
         * The amount of mora from last month.
         */
        last_mora: number;
        /**
         * The rate of primogems earned.
         */
        primogem_rate: number;
        /**
         * The rate of mora earned.
         */
        mora_rate: number;
        /**
         * An array of grouped actions.
         */
        group_by: {
            /**
             * The action ID.
             */
            action_id: number;
            /**
             * The action name.
             */
            action: string;
            /**
             * The number of actions performed.
             */
            num: number;
            /**
             * The percentage of actions performed.
             */
            percent: number;
        }[];
    };
    /**
     * The data for the current day.
     */
    day_data: {
        /**
         * The current number of primogems.
         */
        current_primogems: number;
        /**
         * The current amount of mora.
         */
        current_mora: number;
    };
}
/**
 * Interface representing the history of a Genshin diary.
 */
interface IGenshinDiaryHistory {
    /**
     * The ID of the action.
     */
    action_id: number;
    /**
     * The name of the action.
     */
    action: string;
    /**
     * The time the action was performed.
     */
    time: string;
    /**
     * The number of times the action was performed.
     */
    num: number;
}
/**
 * Interface representing detailed information for a Genshin diary.
 * @extends {IGenshinDiaryBase}
 */
interface IGenshinDiaryDetail extends IGenshinDiaryBase {
    /**
     * The current page of the diary.
     */
    current_page: number;
    /**
     * An array of history objects.
     */
    list: IGenshinDiaryHistory[];
}

/**
 * A module to interact with the Genshin Impact diary endpoints of the Hoyolab API
 *
 * @public
 * @internal
 * @category Module
 */
declare class DiaryModule {
    private request;
    private lang;
    private region;
    private uid;
    /**
     * Constructs a DiaryModule instance
     *
     * @param request - An instance of the Request class to make HTTP requests
     * @param lang - A LanguageEnum value for the language of the user
     * @param region - A string value for the region of the user
     * @param uid - A number value for the UID of the user
     */
    constructor(request: Request, lang: LanguageEnum, region: string | null, uid: number | null);
    /**
     * Returns the diary information of a given month for a user
     *
     * @param month - A DiaryMonthEnum value for the month of the diary information requested. Default is CURRENT.
     * @returns A promise that resolves to an IGenshinDiaryInfo object
     * @throws {@link HoyolabError} when the uid or region parameter is missing or invalid
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    diaries(month?: DiaryMonthEnum): Promise<IGenshinDiaryInfo>;
    /**
     * Returns the diary details of a given type and month for a user
     *
     * @param type - A DiaryEnum value for the type of diary details requested
     * @param month - A DiaryMonthEnum value for the month of the diary details requested. Default is CURRENT.
     * @returns A promise that resolves to an IGenshinDiaryDetail object
     * @throws {@link HoyolabError} when the uid or region parameter is missing or invalid, or when the type or month parameter is invalid
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    detail(type: DiaryEnum, month?: DiaryMonthEnum): Promise<IGenshinDiaryDetail>;
}

/**
 * An enum representing the schedule type for Abyss.
 * @readonly
 * @enum {number}
 */
declare enum AbyssScheduleEnum {
    /**
     * The current schedule.
     */
    CURRENT = 1,
    /**
     * The previous schedule.
     */
    PREVIOUS = 2
}

/**
 * The interface for Genshin Impact character weapon information.
 */
interface IGenshinCharacterWeapon {
    /**
     * The ID of the weapon.
     */
    id: number;
    /**
     * The name of the weapon.
     */
    name: string;
    /**
     * The icon of the weapon.
     */
    icon: string;
    /**
     * The type of the weapon.
     */
    type: number;
    /**
     * The rarity level of the weapon.
     */
    rarity: number;
    /**
     * The level of the weapon.
     */
    level: number;
    /**
     * The promote level of the weapon.
     */
    promote_level: number;
    /**
     * The type name of the weapon.
     */
    type_name: string;
    /**
     * The description of the weapon.
     */
    desc: string;
    /**
     * The affix level of the weapon.
     */
    affix_level: number;
}
/**
 * Represents a set of reliquaries that can be equipped by a character in Genshin Impact.
 */
interface IGenshinCharacterReliquariesSet {
    /**
     * The unique identifier of the reliquary set.
     */
    id: number;
    /**
     * The name of the reliquary set.
     */
    name: string;
    /**
     * The affixes of the reliquary set.
     */
    affixes: IGenshinCharacterReliquariesAffix[];
}
/**
 * Represents a single reliquary that can be equipped by a character in Genshin Impact.
 */
interface IGenshinCharacterReliquaries {
    /**
     * The unique identifier of the reliquary.
     */
    id: number;
    /**
     * The name of the reliquary.
     */
    name: string;
    /**
     * The icon of the reliquary.
     */
    icon: string;
    /**
     * The position of the reliquary.
     */
    pos: number;
    /**
     * The rarity of the reliquary.
     */
    rarity: number;
    /**
     * The level of the reliquary.
     */
    level: number;
    /**
     * The set of the reliquary.
     */
    set: IGenshinCharacterReliquariesSet;
    /**
     * The name of the position of the reliquary.
     */
    pos_name: string;
}
/**
 * Represents a single affix of a reliquary set in the Genshin Impact game.
 */
interface IGenshinCharacterReliquariesAffix {
    /**
     * The activation number of the affix.
     */
    activation_number: number;
    /**
     * The effect of the affix.
     */
    effect: string;
}
/**
 * Defines the shape of a Genshin Impact character constellation object.
 */
interface IGenshinCharacterConstellation {
    /**
     * The unique identifier of the constellation.
     */
    id: number;
    /**
     * The name of the constellation.
     */
    name: string;
    /**
     * The icon of the constellation.
     */
    icon: string;
    /**
     * The effect of the constellation.
     */
    effect: string;
    /**
     * Whether the constellation is activated.
     */
    is_actived: boolean;
    /**
     * The position of the constellation.
     */
    pos: number;
}
interface IGenshinCharacterCostume {
    id: number;
    name: string;
    icon: string;
}
/**
 * Represents the base information of a Genshin Impact character.
 */
interface IGenshinCharacterBase {
    /**
     * The character ID.
     */
    id: number;
    /**
     * The URL of the character's full image.
     */
    image: string;
    /**
     * The URL of the character's icon.
     */
    icon: string;
    /**
     * The name of the character.
     */
    name: string;
    /**
     * The element of the character.
     */
    element: string;
    /**
     * The rarity of the character.
     */
    rarity: number;
}
/**
 * This interface extends the IGenshinCharacterBase interface and defines an object
 * representing a fully detailed character avatar in the Genshin Impact game,
 * including additional properties such as the character's current level,
 * equipped weapon, constellations, and costumes.
 */
interface IGenshinCharacterAvatarFull extends IGenshinCharacterBase {
    /**
     * The current fetter of the character
     */
    fetter: number;
    /**
     * The current level of the character
     */
    level: number;
    /**
     * The equipped weapon of the character
     */
    weapon: IGenshinCharacterWeapon;
    /**
     * The list of reliquaries equipped by the character, if any
     */
    reliquaries: IGenshinCharacterReliquaries[] | [];
    /**
     * The list of constellations of the character
     */
    constellations: IGenshinCharacterConstellation[];
    /**
     * The number of activated constellations of the character
     */
    actived_constellation_num: number;
    /**
     * The list of costumes of the character, if any
     */
    costumes: IGenshinCharacterCostume[] | [];
    /**
     * An external property that can hold any type of data or null
     */
    external: unknown | null;
}
/**
 * Represents a character role in Genshin Impact.
 */
interface IGenshinCharacterRole {
    /**
     * The URL of the avatar image of the character role.
     */
    AvatarUrl: string;
    /**
     * The nickname of the character role.
     */
    nickname: string;
    /**
     * The region of the character role.
     */
    region: string;
    /**
     * The level of the character role.
     */
    level: number;
}
/**
 * Represents a collection of Genshin Impact characters and user information
 */
interface IGenshinCharacters {
    /**
     * List of Genshin Impact characters
     */
    avatars: IGenshinCharacterAvatarFull[];
    /**
     * User information associated with the characters
     */
    role: IGenshinCharacterRole;
}
/**
 * Interface for a summary of Genshin Impact characters, containing only basic information and weapon type.
 */
interface IGenshinCharacterSummary {
    /**
     * An array of characters, containing basic information and weapon type.
     */
    avatars: Array<
    /**
     * Basic information of a Genshin Impact character.
     */
    IGenshinCharacterBase & {
        /**
         * The type of weapon used by the character.
         */
        weapon_type: number;
        /**
         * The name of the weapon type used by the character.
         */
        weapon_type_name: string;
    }>;
}

/**
 * Interface for Genshin Impact daily note.
 */
interface IGenshinDailyNote {
    /**
     * Current resin.
     */
    current_resin: number;
    /**
     * Maximum resin.
     */
    max_resin: number;
    /**
     * Resin recovery time.
     */
    resin_recovery_time: string;
    /**
     * Number of finished tasks.
     */
    finished_task_num: number;
    /**
     * Total number of tasks.
     */
    total_task_num: number;
    /**
     * Whether extra task reward is received or not.
     */
    is_extra_task_reward_received: boolean;
    /**
     * Remaining resin discount number.
     */
    remain_resin_discount_num: number;
    /**
     * Maximum resin discount number.
     */
    resin_discount_num_limit: number;
    /**
     * Current expedition number.
     */
    current_expedition_num: number;
    /**
     * Maximum expedition number.
     */
    max_expedition_num: number;
    /**
     * List of expeditions.
     */
    expeditions: {
        /**
         * Avatar side icon.
         */
        avatar_side_icon: string;
        /**
         * Expedition status.
         */
        status: 'Finished' | 'Ongoing';
        /**
         * Remaining time of the expedition.
         */
        remained_time: string;
    }[];
    /**
     * Current home coin.
     */
    current_home_coin: number;
    /**
     * Maximum home coin.
     */
    max_home_coin: number;
    /**
     * Home coin recovery time.
     */
    home_coin_recovery_time: string;
    /**
     * URL of calendar.
     */
    calendar_url: string;
    /**
     * Transformer information.
     */
    transformer: {
        /**
         * Whether it is obtained or not.
         */
        obtained: boolean;
        /**
         * Recovery time.
         */
        recovery_time: {
            /**
             * Days.
             */
            Day: number;
            /**
             * Hours.
             */
            Hour: number;
            /**
             * Minutes.
             */
            Minute: number;
            /**
             * Seconds.
             */
            Second: number;
            /**
             * Whether recovery time is reached or not.
             */
            reached: boolean;
        };
        /**
         * URL of the wiki page.
         */
        wiki: string;
        /**
         * Whether it is noticed or not.
         */
        noticed: boolean;
        /**
         * Latest job ID.
         */
        latest_job_id: string;
    };
}

/**
 * Interface representing a Genshin Impact character's avatar data as recorded in the player's game data.
 */
interface IGenshinRecordAvatar {
    /**
     * The ID of the avatar.
     */
    id: number;
    /**
     * The URL for the avatar's image.
     */
    image: string;
    /**
     * The name of the avatar.
     */
    name: string;
    /**
     * The element associated with the avatar.
     */
    element: string;
    /**
     * The number of fetters unlocked for the avatar.
     */
    fetter: number;
    /**
     * The level of the avatar.
     */
    level: number;
    /**
     * The rarity of the avatar.
     */
    rarity: number;
    /**
     * The number of constellations unlocked for the avatar.
     */
    actived_constellation_num: number;
    /**
     * The URL for the avatar's card image.
     */
    card_image: string;
    /**
     * Whether the avatar has been chosen as the player's current character.
     */
    is_chosen: boolean;
}
/**
 * Represents the statistics of a player's Genshin Impact game record.
 */
interface IGenshinRecordStat {
    /**
     * The number of days the player has been actively playing.
     */
    active_day_number: number;
    /**
     * The number of achievements the player has unlocked.
     */
    achievement_number: number;
    /**
     * The number of Anemoculi the player has found.
     */
    anemoculus_number: number;
    /**
     * The number of Geoculi the player has found.
     */
    geoculus_number: number;
    /**
     * The number of characters the player has obtained.
     */
    avatar_number: number;
    /**
     * The number of waypoints the player has unlocked.
     */
    way_point_number: number;
    /**
     * The number of domains the player has unlocked.
     */
    domain_number: number;
    /**
     * The player's current Spiral Abyss progress.
     */
    spiral_abyss: string;
    /**
     * The number of Precious Chests the player has opened.
     */
    precious_chest_number: number;
    /**
     * The number of Luxurious Chests the player has opened.
     */
    luxurious_chest_number: number;
    /**
     * The number of Exquisite Chests the player has opened.
     */
    exquisite_chest_number: number;
    /**
     * The number of Common Chests the player has opened.
     */
    common_chest_number: number;
    /**
     * The number of Electroculi the player has found.
     */
    electroculus_number: number;
    /**
     * The number of Magic Chests the player has opened.
     */
    magic_chest_number: number;
    /**
     * The number of Dendroculi the player has found.
     */
    dendroculus_number: number;
}
/**
 * Represents the world exploration record of a player in Genshin Impact.
 * @interface
 */
interface IGenshinRecordWorldExploration {
    /**
     * The current level of world exploration. */
    level: number;
    /**
     * The percentage of world exploration completion. */
    exploration_percentage: number;
    /**
     * The URL of the icon representing the exploration region. */
    icon: string;
    /**
     * The name of the exploration region. */
    name: string;
    /**
     * The type of the exploration region. */
    type: string;
    /**
     * An array of offerings available in the exploration region.
     * @property {string} name - The name of the offering.
     * @property {number} level - The level requirement of the offering.
     * @property {string} icon - The URL of the icon representing the offering.
     * */
    offerings: {
        name: string;
        level: number;
        icon: string;
    }[];
    /**
     * The ID of the exploration region. */
    id: number;
    /**
     * The parent ID of the exploration region. */
    parent_id: number;
    /**
     * The URL of the map of the exploration region. */
    map_url: string;
    /**
     * The URL of the strategy guide of the exploration region. */
    strategy_url: string;
    /**
     * The URL of the background image of the exploration region. */
    background_image: string;
    /**
     * The URL of the inner icon of the exploration region. */
    inner_icon: string;
    /**
     * The URL of the cover image of the exploration region. */
    cover: string;
}
/**
 * Interface representing Genshin Impact player's home record information.
 */
interface IGenshinRecordHome {
    /**
     * The level of the player's home.
     */
    level: number;
    /**
     * The number of times the player has visited their home.
     */
    visit_num: number;
    /**
     * The comfort level of the player's home.
     */
    comfort_num: number;
    /**
     * The number of items the player has placed in their home.
     */
    item_num: number;
    /**
     * The name of the player's home.
     */
    name: string;
    /**
     * The URL of the icon representing the player's home.
     */
    icon: string;
    /**
     * The name of the comfort level of the player's home.
     */
    comfort_level_name: string;
    /**
     * The URL of the icon representing the comfort level of the player's home.
     */
    comfort_level_icon: string;
}
/**
 * Interface representing a Genshin Impact player record.
 */
interface IGenshinRecord {
    /**
     * An object containing player role information.
     */
    role: {
        /**
         * The URL of the player's avatar image.
         */
        AvatarUrl: string;
        /**
         * The player's nickname.
         */
        nickname: string;
        /**
         * The region of the player's game account.
         */
        region: string;
        /**
         * The player's level.
         */
        level: number;
    };
    /**
     * An array of the player's avatars.
     */
    avatars: IGenshinRecordAvatar[];
    /**
     * An object containing the player's statistics.
     */
    stats: IGenshinRecordStat;
    /**
     * An array of the player's world explorations.
     */
    world_explorations: IGenshinRecordWorldExploration[];
    /**
     * An array of the player's homes.
     */
    homes: IGenshinRecordHome[];
    /**
     * An array of the player's city explorations.
     * The structure of this array is not specified.
     */
    city_explorations: unknown[];
}

/**
 * Represents an avatar rank in the Spiral Abyss event in Genshin Impact.
 */
interface IGenshinSpiralAbyssRank {
    /**
     * The ID of the avatar.
     */
    avatar_id: number;
    /**
     * The icon of the avatar.
     */
    avatar_icon: string;
    /**
     * The rank value of the avatar.
     */
    value: number;
    /**
     * The rarity of the avatar.
     */
    rarity: number;
}
/**
 * Represents an avatar in the Spiral Abyss event in Genshin Impact.
 */
interface IGenshinSpiralAbyssAvatar {
    /**
     * The ID of the avatar.
     */
    id: number;
    /**
     * The icon of the avatar.
     */
    icon: string;
    /**
     * The level of the avatar.
     */
    level: number;
    /**
     * The rarity of the avatar.
     */
    rarity: number;
}
/**
 * Represents a battle in the Spiral Abyss event in Genshin Impact.
 */
interface IGenshinSpiralAbyssBattle {
    /**
     * The index of the battle.
     */
    index: number;
    /**
     * The timestamp of the battle.
     */
    timestamp: string;
    /**
     * The avatars involved in the battle.
     */
    avatars: IGenshinSpiralAbyssAvatar[];
}
/**
 * Represents a level in the Spiral Abyss event in Genshin Impact.
 */
interface IGenshinSpiralAbyssLevel {
    /**
     * The index of the level.
     */
    index: number;
    /**
     * The star rating of the level.
     */
    star: number;
    /**
     * The maximum star rating of the level.
     */
    max_star: number;
    /**
     * The battles that occurred in the level.
     */
    battles: IGenshinSpiralAbyssBattle[];
}
/**
 * Represents the floor of the Spiral Abyss in Genshin Impact.
 */
interface IGenshinSpiralAbyssFloor {
    /**
     * The floor index.
     */
    index: number;
    /**
     * The icon of the floor.
     */
    icon: string;
    /**
     * Whether the floor is unlocked.
     */
    is_unlock: boolean;
    /**
     * The time when the floor was completed and settled.
     */
    settle_time: string;
    /**
     * The number of stars obtained in the floor.
     */
    star: number;
    /**
     * The maximum number of stars that can be obtained in the floor.
     */
    max_star: number;
    /**
     * The levels in the floor.
     */
    levels: IGenshinSpiralAbyssLevel[];
}
/**
 * Represents the Spiral Abyss in Genshin Impact.
 */
interface IGenshinSpiralAbyss {
    /**
     * The ID of the Spiral Abyss schedule.
     */
    schedule_id: number;
    /**
     * The start time of the Spiral Abyss.
     */
    start_time: string;
    /**
     * The end time of the Spiral Abyss.
     */
    end_time: string;
    /**
     * The total number of battles fought in the Spiral Abyss.
     */
    total_battle_times: number;
    /**
     * The total number of battles won in the Spiral Abyss.
     */
    total_win_times: number;
    /**
     * The maximum floor reached in the Spiral Abyss.
     */
    max_floor: string;
    /**
     * The rankings for revealing the floor in the Spiral Abyss.
     */
    reveal_rank: IGenshinSpiralAbyssRank[];
    /**
     * The rankings for defeating the monsters in the Spiral Abyss.
     */
    defeat_rank: IGenshinSpiralAbyssRank[];
    /**
     * The rankings for damage dealt in the Spiral Abyss.
     */
    damage_rank: IGenshinSpiralAbyssRank[];
    /**
     * The rankings for taking damage in the Spiral Abyss.
     */
    take_damage_rank: IGenshinSpiralAbyssRank[];
    /**
     * The rankings for using normal skills in the Spiral Abyss.
     */
    normal_skill_rank: IGenshinSpiralAbyssRank[];
    /**
     * The rankings for using elemental burst skills in the Spiral Abyss.
     */
    energy_skill_rank: IGenshinSpiralAbyssRank[];
    /**
     * The floors in the Spiral Abyss.
     */
    floors: IGenshinSpiralAbyssFloor[];
    /**
     * The total number of stars obtained in the Spiral Abyss.
     */
    total_star: number;
    /**
     * Whether the Spiral Abyss is unlocked.
     */
    is_unlock: boolean;
}

/**
 * RecordModule class provides methods to interact with Genshin Impact's record module endpoints.
 *
 * @class
 * @internal
 * @category Module
 */
declare class RecordModule {
    private request;
    private lang;
    private region;
    private uid;
    /**
     * Creates an instance of RecordModule.
     *
     * @constructor
     * @param {Request} request - An instance of Request class.
     * @param {LanguageEnum} lang - The language code to be used in requests.
     * @param {string | null} region - The server region code in which the user's account resides.
     * @param {number | null} uid - The user ID of the Genshin Impact account.
     */
    constructor(request: Request, lang: LanguageEnum, region: string | null, uid: number | null);
    /**
     * Get user's Genshin Impact record
     *
     * @async
     * @function
     * @returns {Promise<IGenshinRecord>} - User's Genshin Impact record
     * @throws {HoyolabError} If UID parameter is missing or failed to be filled
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    records(): Promise<IGenshinRecord>;
    /**
     *
     * Retrieves the Genshin characters of the user.
     *
     * @async
     * @returns {Promise<IGenshinCharacters>} A Promise that contains the Genshin characters object.
     * @throws {HoyolabError} If UID parameter is missing or failed to be filled.
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    characters(): Promise<IGenshinCharacters>;
    /**
     * Returns the summary information of Genshin Impact game characters.
     *
     * @param characterIds - An array of character IDs to retrieve the summary information for.
     * @returns A Promise that resolves to an object containing the summary information of the characters.
     * @throws Throws an error if the UID parameter is missing or failed to be filled.
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    charactersSummary(characterIds: number[]): Promise<IGenshinCharacterSummary>;
    /**
     * Retrieves information about the player's performance in the Spiral Abyss.
     *
     * @param scheduleType - The schedule type of the Abyss, either CURRENT or PREVIOUS.
     * @returns A Promise that resolves with an object containing the player's Spiral Abyss data.
     * @throws HoyolabError if UID parameter is missing or failed to be filled, or if the given scheduleType parameter is invalid.
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    spiralAbyss(scheduleType?: AbyssScheduleEnum): Promise<IGenshinSpiralAbyss>;
    /**
     * Retrieve the daily note information for a Genshin Impact user.
     * @returns Promise<IGenshinDailyNote> The daily note information.
     * @throws HoyolabError if the UID parameter is missing or failed to be filled.
     * @remarks
     * This method sends a request to the Genshin Impact API to get the daily note information for a user.
     * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
     */
    dailyNote(): Promise<IGenshinDailyNote>;
}

/**
 * Genshin Impact Regions
 *
 * @remarks
 * This enum represents the available regions in Genshin Impact game.
 *
 * @enum
 * @readonly
 */
declare enum GenshinRegion {
    /** United States */
    USA = "os_usa",
    /** Europe */
    EUROPE = "os_euro",
    /** Asia */
    ASIA = "os_asia",
    /** China Taiwan */
    CHINA_TAIWAN = "os_cht"
}

/**
 * Interface representing the options for the Genshin Impact API.
 * Inherits from `IHoyolabOptions`.
 *
 * @interface
 */
interface IGenshinOptions extends IHoyolabOptions {
    /**
     * The UID of the Genshin Impact player.
     */
    uid?: number;
    /**
     * The region of the Genshin Impact player.
     */
    region?: GenshinRegion;
}

/**
 * The `Genshin` class provides an interface to interact with Genshin Impact-related features on the Mihoyo website.
 * It contains references to various modules such as `DailyModule`, `RedeemModule`, `RecordModule`, and `DiaryModule` which allow you to perform various operations related to these features.
 *
 * @class
 * @category Main
 */
declare class GenshinImpact {
    /**
     * The `DailyModule` object provides an interface to interact with the daily check-in feature in Genshin Impact.
     *
     */
    readonly daily: DailyModule;
    /**
     * The `RedeemModule` object provides an interface to interact with the code redemption feature in Genshin Impact.
     *
     */
    readonly redeem: RedeemModule;
    /**
     * The `RecordModule` object provides an interface to interact with the user record feature in Genshin Impact.
     *
     */
    readonly record: RecordModule;
    /**
     * The `DiaryModule` object provides an interface to interact with the user diary feature in Genshin Impact.
     *
     */
    readonly diary: DiaryModule;
    /**
     * The cookie object to be used in requests.
     */
    readonly cookie: ICookie;
    /**
     * The `Request` object used to make requests.
     */
    readonly request: Request;
    /**
     * The UID of the user, if available.
     */
    uid: number | null;
    /**
     * The region of the user, if available.
     */
    region: string | null;
    /**
     * The language to be used in requests.
     */
    lang: LanguageEnum;
    /**
     * Constructs a new `Genshin` object.
     * @param options The options object used to configure the object.
     * @param options.cookie The cookie string or object to be used in requests.
     * @param options.uid The UID of the user.
     * @param options.region The region of the user.
     * @param options.lang The language to be used in requests.
     */
    constructor(options: IGenshinOptions);
    /**
     * Create a new instance of the GenshinImpact class asynchronously.
     *
     * @param options The options object used to configure the object.
     * @param options.cookie The cookie string or object to be used in requests.
     * @param options.lang The language to be used in requests.
     * @returns A promise that resolves with a new Genshin instance.
     */
    static create(options: IGenshinOptions): Promise<GenshinImpact>;
    /**
     * Get user's Genshin Impact record
     *
     * @alias {@link GenshinImpact.record | Genshin.record.records()}
     * @deprecated Use through {@link GenshinImpact.record | Genshin.record.records()} instead
     */
    records(): Promise<IGenshinRecord>;
    /**
     * Retrieves the Genshin characters of the user.
     *
     * @alias {@link GenshinImpact.record | Genshin.record.characters()}
     * @deprecated Use through {@link GenshinImpact.record | Genshin.record.characters()} instead
     */
    characters(): Promise<IGenshinCharacters>;
    /**
     * Returns the summary information of Genshin Impact game characters
     *
     * @param characterIds number[] Characters ID
     * @alias {@link GenshinImpact.record | Genshin.record.charactersSummary()}
     * @deprecated Use through {@link GenshinImpact.record | Genshin.record.charactersSummary()} instead
     */
    charactersSummary(characterIds: number[]): Promise<IGenshinCharacterSummary>;
    /**
     * Retrieves information about the player's performance in the Spiral Abyss.
     *
     * @param scheduleType AbyssScheduleEnum
     * @alias {@link GenshinImpact.record | Genshin.record.spiralAbyss()}
     * @deprecated Use through {@link GenshinImpact.record | Genshin.record.spiralAbyss()} instead
     */
    spiralAbyss(scheduleType?: AbyssScheduleEnum): Promise<IGenshinSpiralAbyss>;
    /**
     * Retrieve the daily note information for a Genshin Impact user.
     *
     * @alias {@link GenshinImpact.record | Genshin.record.dailyNote()}
     * @deprecated Use through {@link GenshinImpact.record | Genshin.record.dailyNote()} instead
     */
    dailyNote(): Promise<IGenshinDailyNote>;
    /**
     * Returns the diary information of a given month for a user
     *
     * @param month
     * @alias {@link GenshinImpact.diary | Genshin.diary.diaries()}
     * @deprecated Use through {@link GenshinImpact.diary | Genshin.diary.diaries()} instead
     */
    diaries(month?: DiaryMonthEnum): Promise<IGenshinDiaryInfo>;
    /**
     * Returns the diary details of a given type and month for a user
     *
     * @param type DiaryEnum
     * @param month DiaryMonthEnum
     * @alias {@link GenshinImpact.diary | Genshin.diary.detail()}
     * @deprecated Use through {@link GenshinImpact.diary | Genshin.diary.detail()} instead
     */
    diaryDetail(type: DiaryEnum, month?: DiaryMonthEnum): Promise<IGenshinDiaryDetail>;
    /**
     * Retrieves daily information.
     *
     * @alias {@link GenshinImpact.daily | Genshin.daily.info()}
     * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.info()} instead
     */
    dailyInfo(): Promise<IDailyInfo>;
    /**
     * Retrieve daily rewards information.
     *
     * @alias {@link GenshinImpact.daily | Genshin.daily.rewards()}
     * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.rewards()} instead
     */
    dailyRewards(): Promise<IDailyRewards>;
    /**
     * Get the daily reward for a specific day or the current day
     *
     * @param day number | null
     * @alias {@link GenshinImpact.daily | Genshin.daily.reward()}
     * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.reward()} instead
     */
    dailyReward(day?: number | null): Promise<IDailyReward>;
    /**
     * Claim current reward
     *
     * @alias {@link GenshinImpact.daily | Genshin.daily.claim()}
     * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.claim()} instead
     */
    dailyClaim(): Promise<IDailyClaim>;
    /**
     * Redeems a code for a specific account.
     *
     * @param code string
     * @alias {@link GenshinImpact.daily | Genshin.redeem.claim()}
     * @deprecated Use through {@link GenshinImpact.daily | Genshin.redeem.claim()} instead
     */
    redeemCode(code: string): Promise<IRedeemCode>;
}

/**
 * Get Genshin Impact region based on UID.
 *
 * @param uid User ID.
 * @returns Region for the UID.
 * @throws `HoyolabError` when the UID is invalid.
 */
declare function getGenshinRegion(uid: number): GenshinRegion;

declare enum HsrRegion {
    USA = "prod_official_asia",
    EUROPE = "prod_official_euro",
    ASIA = "prod_official_asia",
    CHINA_TAIWAN = "prod_official_cht"
}

interface IHsrOptions extends IHoyolabOptions {
    uid?: number;
    region?: HsrRegion;
}

/**
 * Class representing the Honkai Star Rail game.
 *
 * @public
 * @class
 * @category Main
 */
declare class HonkaiStarRail {
    /**
     * The Daily module for the Honkai Star Rail game.
     *
     * @public
     * @readonly
     */
    readonly daily: DailyModule;
    /**
     * The Redeem module for the Honkai Star Rail game.
     *
     * @public
     * @readonly
     */
    readonly redeem: RedeemModule;
    /**
     * The cookie used for authentication.
     *
     * @public
     * @readonly
     */
    readonly cookie: ICookie;
    /**
     * The request object used to make HTTP requests.
     *
     * @public
     * @readonly
     */
    readonly request: Request;
    /**
     * The UID of the Honkai Star Rail account.
     *
     * @public
     */
    uid: number | null;
    /**
     * The region of the Honkai Star Rail account.
     *
     * @public
     */
    region: string | null;
    /**
     * The language of the Honkai Star Rail account.
     *
     * @public
     */
    lang: LanguageEnum;
    /**
     * Create a new instance of HonkaiStarRail.
     *
     * @public
     * @constructor
     * @param {IHsrOptions} options - The options for the HonkaiStarRail instance.
     */
    constructor(options: IHsrOptions);
    /**
     * Create a new instance of HonkaiStarRail using a Hoyolab account.
     * If `uid` is not provided in the `options`, the account with the highest level will be used.
     *
     * @public
     * @static
     * @param {IHsrOptions} options - The options for the HonkaiStarRail instance.
     * @returns {Promise<HonkaiStarRail>} - A promise that resolves with a new HonkaiStarRail instance.
     */
    static create(options: IHsrOptions): Promise<HonkaiStarRail>;
    /**
     * Retrieves daily information.
     *
     * @alias {@link DailyModule.info | DailyModule.info }
     * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.info() } instead
     */
    dailyInfo(): Promise<IDailyInfo>;
    /**
     *
     * @alias {@link DailyModule.rewards | DailyModule.rewards }
     * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.rewards() } instead
     */
    dailyRewards(): Promise<IDailyRewards>;
    /**
     * Fetch reward from daily login based on day
     *
     * @param day number | null
     * @alias {@link DailyModule.reward | DailyModule.reward }
     * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.reward() } instead
     */
    dailyReward(day?: number | null): Promise<IDailyReward>;
    /**
     * Claim current reward
     *
     * @alias {@link DailyModule.claim | DailyModule.claim }
     * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.claim() } instead
     */
    dailyClaim(): Promise<IDailyClaim>;
    /**
     * Redeem Code
     *
     * @param code string
     * @alias {@link RedeemModule.claim | RedeemModule.claim }
     * @deprecated Use through { @link HonkaiStarRail.redeem | HonkaiStarRail.redeem.claim() } instead
     */
    redeemCode(code: string): Promise<IRedeemCode>;
}

/**
 * Get Server Region by UID
 *
 * @param uid number UID
 * @returns {string}
 */
declare function getHsrRegion(uid: number): HsrRegion;

/**
 * An enum representing Honkai servers region.
 */
declare enum HonkaiRegion {
    /** United States */
    USA = "usa01",
    /** Europe */
    EUROPE = "eur01",
    /** Asia */
    ASIA = "overseas01"
}

/**
 * Interface representing the options for the Honkai Impact API.
 * Inherits from `IHoyolabOptions`.
 *
 * @interface
 */
interface IHi3Options extends IHoyolabOptions {
    /**
     * The UID of the Honkai Impact player.
     */
    uid?: number;
    /**
     * The region of the Honkai Impact player.
     */
    region?: HonkaiRegion;
}

/**
 * Class representing the Honkai Impact 3rd game.
 *
 * @public
 * @class
 * @category Main
 */
declare class HonkaiImpact {
    /**
     * The Daily module for the Honkai Impact 3rd game.
     *
     * @public
     * @readonly
     */
    readonly daily: DailyModule;
    /**
     * The Redeem module for the Honkai Impact 3rd game.
     *
     * @public
     * @readonly
     */
    readonly redeem: RedeemModule;
    /**
     * The cookie used for authentication.
     *
     * @public
     * @readonly
     */
    readonly cookie: ICookie;
    /**
     * The request object used to make HTTP requests.
     *
     * @public
     * @readonly
     */
    readonly request: Request;
    /**
     * The UID of the Honkai Impact 3rd account.
     *
     * @public
     */
    uid: number | null;
    /**
     * The region of the Honkai Impact 3rd account.
     *
     * @public
     */
    region: string | null;
    /**
     * The language of the Honkai Impact 3rd account.
     *
     * @public
     */
    lang: LanguageEnum;
    /**
     * Create a new instance of HonkaiImpact.
     *
     * @public
     * @constructor
     * @param {IHi3Options} options - The options for the HonkaiImpact instance.
     */
    constructor(options: IHi3Options);
    /**
     * Create a new instance of HonkaiImpact using a Hoyolab account.
     * If `uid` is not provided in the `options`, the account with the highest level will be used.
     *
     * @public
     * @static
     * @param {IHi3Options} options - The options for the HonkaiImpact instance.
     * @returns {Promise<HonkaiImpact>} - A promise that resolves with a new HonkaiImpact instance.
     */
    static create(options: IHi3Options): Promise<HonkaiImpact>;
    /**
     * Retrieves daily information.
     *
     * @alias {@link DailyModule.info | DailyModule.info }
     * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.info() } instead
     */
    dailyInfo(): Promise<IDailyInfo>;
    /**
     *
     * @alias {@link DailyModule.rewards | DailyModule.rewards }
     * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.rewards() } instead
     */
    dailyRewards(): Promise<IDailyRewards>;
    /**
     * Fetch reward from daily login based on day
     *
     * @param day number | null
     * @alias {@link DailyModule.reward | DailyModule.reward }
     * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.reward() } instead
     */
    dailyReward(day?: number | null): Promise<IDailyReward>;
    /**
     * Claim current reward
     *
     * @alias {@link DailyModule.claim | DailyModule.claim }
     * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.claim() } instead
     */
    dailyClaim(): Promise<IDailyClaim>;
    /**
     * Redeem Code
     *
     * @param code string
     * @alias {@link RedeemModule.claim | RedeemModule.claim }
     * @deprecated Use through { @link HonkaiImpact.redeem | HonkaiImpact.redeem.claim() } instead
     */
    redeemCode(code: string): Promise<IRedeemCode>;
}

/**
 * Gets the Honkai region from a given UID.
 * @function
 * @param {number} uid - The UID to get the Honkai region for.
 * @returns {HonkaiRegion} - The Honkai region for the given UID.
 * @throws {HoyolabError} - If the UID is invalid.
 */
declare function getHi3Region(uid: number): HonkaiRegion;

/**
 * Represents an error that can be thrown during interactions with the Hoyolab API.
 *
 * @class
 * @category Main
 */
declare class HoyolabError extends Error {
    /**
     * The name of this error.
     */
    readonly name: string;
    /**
     * The message associated with this error.
     */
    readonly message: string;
    /**
     * Constructs a new instance of the HoyolabError class with the specified message.
     *
     * @param message The message to associate with this error.
     */
    constructor(message: string);
}

/**
 * The `GenshinImpact` namespace provides a collection of methods to interact with the Genshin Impact game.
 *
 * @alias {@link GenshinImpact | GenshinImpact}
 * @see {@link GenshinImpact | GenshinImpact}
 * @category Deprecated
 * @deprecated Use {@link GenshinImpact | GenshinImpact} class instead.
 */
declare class Genshin extends GenshinImpact {
}

export { AbyssScheduleEnum, BaseType, Cache, CacheKey, Cookie, DailyModule, DiaryEnum, DiaryModule, DiaryMonthEnum, GamesEnum, Genshin, GenshinImpact, GenshinRegion, HonkaiImpact, HonkaiRegion, HonkaiStarRail, Hoyolab, HoyolabError, HsrRegion, ICookie, IDailyAwardItem, IDailyClaim, IDailyInfo, IDailyReward, IDailyRewards, IGame, IGamesList, IGenshinCharacterAvatarFull, IGenshinCharacterBase, IGenshinCharacterConstellation, IGenshinCharacterCostume, IGenshinCharacterReliquaries, IGenshinCharacterReliquariesAffix, IGenshinCharacterReliquariesSet, IGenshinCharacterRole, IGenshinCharacterSummary, IGenshinCharacterWeapon, IGenshinCharacters, IGenshinDailyNote, IGenshinDiaryBase, IGenshinDiaryDetail, IGenshinDiaryHistory, IGenshinDiaryInfo, IGenshinOptions, IGenshinRecord, IGenshinRecordAvatar, IGenshinRecordHome, IGenshinRecordStat, IGenshinRecordWorldExploration, IGenshinSpiralAbyss, IGenshinSpiralAbyssAvatar, IGenshinSpiralAbyssBattle, IGenshinSpiralAbyssFloor, IGenshinSpiralAbyssLevel, IGenshinSpiralAbyssRank, IHi3Options, IHoyolabOptions, IHsrOptions, IRedeemCode, IResponse, Language, LanguageEnum, RecordModule, RedeemModule, Request, RequestBodyType, RequestHeaderType, RequestParamType, delay, generateDS, getGenshinRegion, getHi3Region, getHsrRegion };
