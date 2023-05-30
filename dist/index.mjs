// src/utils/error.ts
var HoyolabError = class extends Error {
  /**
   * Constructs a new instance of the HoyolabError class with the specified message.
   *
   * @param message The message to associate with this error.
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor);
  }
};

// src/cookie/cookie.helper.ts
function toCamelCase(str) {
  const words = str.split("_");
  const camelCaseWords = words.map((word, index) => {
    return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
  });
  return camelCaseWords.join("");
}
function toSnakeCase(text) {
  return text.replace(/([A-Z])/g, " $1").split(" ").join("_").toLowerCase();
}

// src/language/language.interface.ts
var LanguageEnum = /* @__PURE__ */ ((LanguageEnum6) => {
  LanguageEnum6["SIMPLIFIED_CHINESE"] = "zh-cn";
  LanguageEnum6["TRADIIONAL_CHINESE"] = "zh-tw";
  LanguageEnum6["GERMAN"] = "de-de";
  LanguageEnum6["ENGLISH"] = "en-us";
  LanguageEnum6["SPANISH"] = "es-es";
  LanguageEnum6["FRENCH"] = "fr-fr";
  LanguageEnum6["INDONESIAN"] = "id-id";
  LanguageEnum6["ITALIAN"] = "it-it";
  LanguageEnum6["JAPANESE"] = "ja-jp";
  LanguageEnum6["KOREAN"] = "ko-kr";
  LanguageEnum6["PORTUGUESE"] = "pt-pt";
  LanguageEnum6["RUSSIAN"] = "ru-ru";
  LanguageEnum6["THAI"] = "th-th";
  LanguageEnum6["TURKISH"] = "tr-tr";
  LanguageEnum6["VIETNAMESE"] = "vi-vn";
  return LanguageEnum6;
})(LanguageEnum || {});

// src/language/language.ts
var Language = class {
  /**
   * Parses a language string into its corresponding LanguageEnum value.
   *
   * @param lang The language string to parse, or null/undefined to default to English.
   * @returns The LanguageEnum value corresponding to the provided string, or English if the string is invalid or undefined.
   */
  static parseLang(lang) {
    if (!lang) {
      return "en-us" /* ENGLISH */;
    }
    const langKeys = Object.keys(LanguageEnum);
    const matchingKey = langKeys.find((key) => LanguageEnum[key] === lang);
    return matchingKey ? LanguageEnum[matchingKey] : "en-us" /* ENGLISH */;
  }
};

// src/cookie/cookie.ts
var Cookie = class {
  /**
   * Parses a cookie string and returns a parsed ICookie object.
   *
   * @param cookieString - The cookie string to be parsed.
   * @returns {string} - A parsed ICookie object.
   * @throws {HoyolabError} when ltuid or ltoken keys are not found in the cookie string.
   */
  static parseCookieString(cookieString) {
    const cookies = {};
    const keys = [
      "ltoken",
      "ltuid",
      "account_id",
      "cookie_token",
      "mi18nLang"
    ];
    cookieString.split(";").forEach((cookie) => {
      const [cookieKey, cookieValue] = cookie.trim().split("=");
      if (keys.includes(cookieKey)) {
        cookies[toCamelCase(cookieKey)] = decodeURIComponent(cookieValue);
        if (cookieKey === "ltuid" || cookieKey === "account_id") {
          cookies[toCamelCase(cookieKey)] = parseInt(
            cookies[toCamelCase(cookieKey)],
            10
          );
        } else if (cookieKey === "mi18nLang") {
          cookies[toCamelCase(cookieKey)] = Language.parseLang(
            cookies[toCamelCase(cookieKey)].toString()
          );
        }
      }
    });
    if (cookies.ltuid && !cookies.accountId) {
      cookies.accountId = cookies.ltuid;
    } else if (!cookies.ltuid && cookies.accountId) {
      cookies.ltuid = cookies.accountId;
    }
    if (!cookies.ltoken || !cookies.ltuid) {
      throw new HoyolabError("Cookie key ltuid or ltoken doesnt exist !");
    }
    return cookies;
  }
  /**
   * Converts an `ICookie` object into a cookie string.
   * @param {ICookie} cookie - The `ICookie` object to convert.
   * @returns {string} A string representing the cookie.
   * @throws {HoyolabError} If the `ltuid` or `ltoken` key is missing in the `ICookie` object.
   */
  static parseCookie(cookie) {
    if (!cookie.accountId) {
      cookie.accountId = cookie.ltuid;
    }
    const cookies = [];
    Object.entries(cookie).forEach(([key, value]) => {
      if (value) {
        if (["cookieToken", "accountId"].includes(key)) {
          key = toSnakeCase(key);
        }
        cookies.push(`${key}=${value}`);
      }
    });
    return cookies.join("; ");
  }
};

// src/request/request.cache.ts
import { createHash } from "crypto";
import NodeCache from "node-cache";
var Cache = class {
  constructor() {
    /**
     * The default time-to-live (TTL) value for cached data in seconds.
     */
    this.stdTTL = 30;
    /**
     * The NodeCache instance used to store and retrieve data.
     */
    this.nodeCache = new NodeCache({
      stdTTL: this.stdTTL
    });
  }
  /**
   * Generates a cache key based on the URL, query parameters, and body of a request.
   *
   * @param key - The key object containing the URL, query parameters, and body of the request.
   * @returns A unique MD5 hash key generated from the key object.
   */
  generateKey(key) {
    return createHash("md5").update(JSON.stringify(key)).digest("hex");
  }
  /**
   * Sets a value in the cache with a given key and TTL.
   *
   * @param key - The key object containing the URL, query parameters, and body of the request.
   * @param value - The value to be stored in the cache.
   * @param ttl - The TTL value for the cached data in seconds.
   * @returns True if the value was successfully stored in the cache, false otherwise.
   */
  set(key, value, ttl) {
    if (typeof ttl === "undefined") {
      ttl = this.stdTTL;
    }
    return this.nodeCache.set(this.generateKey(key), value, ttl);
  }
  /**
   * Retrieves a value from the cache using a given key.
   *
   * @param key - The key object containing the URL, query parameters, and body of the request.
   * @returns The cached value if it exists, null otherwise.
   */
  get(key) {
    return this.nodeCache.get(this.generateKey(key));
  }
  /**
   * Checks if a key exists in the cache.
   *
   * @param key - The key object containing the URL, query parameters, and body of the request.
   * @returns True if the key exists in the cache, false otherwise.
   */
  has(key) {
    return this.nodeCache.has(this.generateKey(key));
  }
  /**
   * Deletes a key-value pair from the cache.
   *
   * @param key - The key object containing the URL, query parameters, and body of the request.
   * @returns True if the key-value pair was successfully deleted from the cache, false otherwise.
   */
  del(key) {
    return this.nodeCache.del(this.generateKey(key));
  }
};

// src/request/request.ts
import axios, { AxiosError } from "axios";

// src/request/request.helper.ts
import { createHash as createHash2 } from "crypto";
function generateDS() {
  const salt = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
  const date = /* @__PURE__ */ new Date();
  const time = Math.floor(date.getTime() / 1e3);
  let random = "";
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomIndex);
    random += randomChar;
  }
  const hash = createHash2("md5").update(`salt=${salt}&t=${time}&r=${random}`).digest("hex");
  return `${time},${random},${hash}`;
}
function delay(second) {
  return new Promise((resolve) => {
    setTimeout(resolve, second * 1e3);
  });
}

// src/request/request.ts
var Request = class {
  /**
   * Constructor for the Request class.
   *
   * @param cookies - A string of cookies to be added to the request headers (default: null).
   */
  constructor(cookies = null) {
    /**
     * The number of request attempts made.
     */
    this.retries = 1;
    this.headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "x-rpc-app_version": "1.5.0",
      "x-rpc-client_type": "5",
      "x-rpc-language": "en-us" /* ENGLISH */
    };
    this.body = {};
    this.params = {};
    this.cache = new Cache();
    this.ds = false;
    if (cookies)
      this.headers.Cookie = cookies;
  }
  /**
   * Set Referer Headers
   *
   * @param url - The URL string of referer
   * @returns The updated Request instance.
   */
  setReferer(url) {
    this.headers.Referer = url;
    this.headers.Origin = url;
    return this;
  }
  /**
   * Set Body Parameter
   *
   * @param body - RequestBodyType as object containing the body parameters.
   * @returns This instance of Request object.
   */
  setBody(body) {
    this.body = { ...this.body, ...body };
    return this;
  }
  /**
   * Sets search parameters or query parameter.
   *
   * @param params - An object of query parameter to be set.
   * @returns {Request} - Returns this Request object.
   */
  setParams(params) {
    this.params = { ...this.params, ...params };
    return this;
  }
  /**
   * Set to used Dynamic Security or not
   *
   * @param flag boolean Flag indicating whether to use dynamic security or not (default: true).
   * @returns {this} The current Request instance.
   */
  setDs(flag = true) {
    this.ds = flag;
    return this;
  }
  /**
   * Set Language
   *
   * @param lang Language Language that used for return of API (default: Language.ENGLISH).
   * @returns {this}
   */
  setLang(lang = "en-us" /* ENGLISH */) {
    this.headers["x-rpc-language"] = lang;
    return this;
  }
  /**
   * Send the HTTP request.
   *
   * @param url - The URL to send the request to.
   * @param method - The HTTP method to use. Defaults to 'GET'.
   * @param ttl - The TTL value for the cached data in seconds.
   * @returns A Promise that resolves with the response data, or rejects with a HoyolabError if an error occurs.
   * @throws {HoyolabError} if an error occurs rejects with a HoyolabError
   */
  async send(url, method = "GET", ttl) {
    const cacheKey = {
      url,
      method,
      body: this.body,
      params: this.params
    };
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      console.log("Requet Cached");
      return cachedResult;
    }
    if (this.ds) {
      this.headers.DS = generateDS();
    }
    const config = {
      method,
      params: this.params,
      headers: this.headers,
      responseType: "json"
    };
    if (method === "POST") {
      config.data = this.body;
    }
    try {
      const request = await axios(url, config);
      const result = request.data;
      if ([200, 201].includes(request.status) === false) {
        throw new AxiosError(
          request.statusText ?? result.data,
          request.status.toString()
        );
      }
      if (result.retcode === -2016 && this.retries <= 60) {
        this.retries++;
        await delay(1);
        return this.send(url, method);
      }
      this.cache.set(cacheKey, result, ttl);
      this.retries = 1;
      this.body = {};
      return result;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new HoyolabError(
          `Request Error: [${error.code}] - ${error.message}`
        );
      } else {
        return {
          retcode: -9999,
          message: "",
          data: null
        };
      }
    }
  }
};

// src/routes.ts
var Routes = class {
  static bbs() {
    return `https://bbs-api-os.hoyolab.com`;
  }
  static apiAccount() {
    return `https://api-account-os.hoyolab.com`;
  }
  static hke() {
    return `https://sg-hk4e-api.hoyolab.com`;
  }
  static sgPublic() {
    return `https://sg-public-api.hoyolab.com`;
  }
  static referer() {
    return `https://act.hoyolab.com`;
  }
};

// src/games/hoyolab/hoyolab.routes.ts
var HoyolabRoute = class {
  static games() {
    return `${Routes.apiAccount()}/account/binding/api/getUserGameRolesByCookieToken`;
  }
};

// src/games/hoyolab/hoyolab.ts
var Hoyolab = class {
  /**
   * Creates a new instance of `Hoyolab`.
   *
   * @constructor
   * @param {IHoyolabOptions} options - The options to initialize the `Hoyolab` instance.
   * @throws {HoyolabError} If `ltuid` or `ltoken` keys are missing in the `ICookie` object.
   */
  constructor(options) {
    const cookie = typeof options.cookie === "string" ? Cookie.parseCookieString(options.cookie) : options.cookie;
    this.cookie = cookie;
    if (!options.lang) {
      options.lang = Language.parseLang(cookie.mi18nLang);
    }
    this.request = new Request(Cookie.parseCookie(this.cookie));
    this.request.setLang(options.lang);
    this.lang = options.lang;
  }
  /**
   * Get the list of games on this Hoyolab account.
   *
   * @async
   * @param {GamesEnum} [game] The optional game for which to retrieve accounts.
   * @throws {HoyolabError} Thrown if there are no game accounts on this Hoyolab account.
   * @returns {Promise<IGame[]>} The list of games on this Hoyolab account.
   */
  async gamesList(game) {
    if (game) {
      this.request.setParams({
        game_biz: game
      });
    }
    this.request.setParams({
      uid: this.cookie.ltuid,
      sLangKey: this.cookie.mi18nLang
    });
    const res = await this.request.send(HoyolabRoute.games());
    const data = res.data;
    if (!res.data || !data.list) {
      throw new HoyolabError(
        "There is no game account on this hoyolab account !"
      );
    }
    return data.list;
  }
  /**
   * Get the account of a specific game from the games list.
   *
   * @async
   * @param {GamesEnum} game - The game that the account belongs to.
   * @throws {HoyolabError} If there is no game account on this hoyolab account.
   * @returns {Promise<IGame>} The game account.
   */
  async gameAccount(game) {
    const games = await this.gamesList(game);
    if (games.length < 1) {
      throw new HoyolabError(
        "There is no game account on this hoyolab account !"
      );
    }
    return games.reduce((first, second) => {
      return second.level > first.level ? second : first;
    });
  }
};

// src/games/hoyolab/hoyolab.enum.ts
var GamesEnum = /* @__PURE__ */ ((GamesEnum2) => {
  GamesEnum2["GENSHIN_IMPACT"] = "hk4e_global";
  GamesEnum2["HONKAI_IMPACT"] = "bh3_global";
  GamesEnum2["HONKAI_STAR_RAIL"] = "hkrpg_global";
  return GamesEnum2;
})(GamesEnum || {});

// src/modules/daily/daily.route.ts
var DailyRoute = class {
  /** GI Daily Route */
  static giDailyInfo() {
    return `${this.giBase}/event/sol/info?act_id=${this.giActId}`;
  }
  static giDailyReward() {
    return `${this.giBase}/event/sol/home?act_id=${this.giActId}`;
  }
  static giDailyClaim() {
    return `${this.giBase}/event/sol/sign?act_id=${this.giActId}`;
  }
  /** HSR Daily Route */
  static hsrDailyInfo() {
    return `${this.hsrBase}/event/luna/os/info?act_id=${this.hsrActId}`;
  }
  static hsrDailyReward() {
    return `${this.hsrBase}/event/luna/os/home?act_id=${this.hsrActId}`;
  }
  static hsrDailyClaim() {
    return `${this.hsrBase}/event/luna/os/sign?act_id=${this.hsrActId}`;
  }
  /** HI Daily Route */
  static hiDailyInfo() {
    return `${this.hiBase}/event/mani/info?act_id=${this.hiActId}`;
  }
  static hiDailyReward() {
    return `${this.hiBase}/event/mani/home?act_id=${this.hiActId}`;
  }
  static hiDailyClaim() {
    return `${this.hiBase}/event/mani/sign?act_id=${this.hiActId}`;
  }
};
DailyRoute.hsrActId = "e202303301540311";
DailyRoute.hsrBase = Routes.sgPublic();
DailyRoute.giActId = "e202102251931481";
DailyRoute.giBase = Routes.hke();
DailyRoute.hiActId = "e202110291205111";
DailyRoute.hiBase = Routes.sgPublic();

// src/modules/daily/daily.ts
var DailyModule = class {
  constructor(request, lang, game) {
    this.request = request;
    this.lang = lang;
    this.game = game;
    if (this.game === "hk4e_global" /* GENSHIN_IMPACT */) {
      this.dailyInfoUrl = DailyRoute.giDailyInfo();
      this.dailyRewardUrl = DailyRoute.giDailyReward();
      this.dailySignUrl = DailyRoute.giDailyClaim();
    } else if (this.game === "hkrpg_global" /* HONKAI_STAR_RAIL */) {
      this.dailyInfoUrl = DailyRoute.hsrDailyInfo();
      this.dailyRewardUrl = DailyRoute.hsrDailyReward();
      this.dailySignUrl = DailyRoute.hsrDailyClaim();
    } else if (this.game === "bh3_global" /* HONKAI_IMPACT */) {
      this.dailyInfoUrl = DailyRoute.hiDailyInfo();
      this.dailyRewardUrl = DailyRoute.hiDailyReward();
      this.dailySignUrl = DailyRoute.hiDailyClaim();
    } else {
      throw new HoyolabError("Game Paramater is invalid");
    }
  }
  /**
   * Retrieves daily information.
   *
   * @returns {Promise<IDailyInfo>} A promise that resolves to an IDailyInfo object.
   */
  async info() {
    this.request.setParams({
      lang: this.lang
    }).setLang(this.lang);
    const res = (await this.request.send(this.dailyInfoUrl)).data;
    if (typeof res.first_bind === "undefined") {
      res.first_bind = false;
    }
    if (typeof res.month_last_day === "undefined") {
      const today = /* @__PURE__ */ new Date();
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      res.month_last_day = today.getDate() === lastDayOfMonth;
    }
    if (typeof res.sign_cnt_missed === "undefined") {
      res.sign_cnt_missed = 0;
    }
    if (typeof res.short_sign_day === "undefined") {
      res.short_sign_day = 0;
    }
    return res;
  }
  /**
   * Retrieve daily rewards information.
   *
   * @returns {Promise<IDailyRewards>} A promise that resolves to an IDailyRewards object.
   */
  async rewards() {
    this.request.setParams({
      lang: this.lang
    }).setLang(this.lang);
    const res = (await this.request.send(this.dailyRewardUrl)).data;
    if (typeof res.now === "undefined") {
      res.now = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3).toString();
    }
    if (this.game === "hk4e_global" /* GENSHIN_IMPACT */) {
      res.biz = "hk4e";
    } else if (this.game === "bh3_global" /* HONKAI_IMPACT */) {
      res.biz = "hk4e";
    } else if (this.game === "hkrpg_global" /* HONKAI_STAR_RAIL */) {
      res.biz = "hkrpg";
    } else {
      res.biz = "";
    }
    if (typeof res.resign === "undefined") {
      res.resign = false;
    }
    return res;
  }
  /**
   * Get the daily reward for a specific day or the current day
   *
   * @param {number | null} day - The day to retrieve the reward for. If null, retrieve the reward for the current day.
   * @returns {Promise<IDailyReward>} - A promise that resolves with the daily reward for the specified day or the current day
   * @throws {HoyolabError} - If the specified day is not a valid date in the current month or if the reward for the specified day is undefined.
   */
  async reward(day = null) {
    const response = await this.rewards();
    if (day === null) {
      const now = response?.now ? new Date(parseInt(response.now) * 1e3) : /* @__PURE__ */ new Date();
      day = now.getDate();
    }
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (!(day > 0 && day <= daysInMonth) || typeof response.awards[day - 1] === void 0) {
      throw new HoyolabError(`${day} is not a valid date in this month.`);
    }
    return {
      month: response.month,
      now: response.now,
      biz: response.biz,
      resign: response.resign,
      award: response.awards[day - 1]
    };
  }
  /**
   * Claim the daily rewards.
   *
   * @returns {Promise<IDailyClaim>} The claim information.
   */
  async claim() {
    this.request.setParams({
      lang: this.lang
    }).setLang(this.lang);
    const response = await this.request.send(this.dailySignUrl, "POST");
    const info = await this.info();
    const reward = await this.reward();
    if (response.retcode === -5003) {
      return {
        status: response.message,
        code: -5003,
        reward,
        info
      };
    }
    if (response.data?.code.toString().toLowerCase() === "ok" && response.retcode === 0) {
      return {
        status: response.message,
        code: 0,
        reward,
        info
      };
    }
    return {
      status: response.message,
      code: response.retcode,
      reward: null,
      info
    };
  }
};

// src/modules/redeem/redeem.route.ts
var RedeemRoute = class {
  static redeem() {
    return `${Routes.hke()}/common/apicdkey/api/webExchangeCdkey`;
  }
};

// src/modules/redeem/redeem.ts
var RedeemModule = class {
  /**
   * Constructs a new RedeemModule object.
   * @param request - The Request object used for making HTTP requests.
   * @param lang - The language to use for the API response.
   * @param game - The game to redeem the code for.
   * @param region - The region of the user's account. If null, the API will use the default region for the game.
   * @param uid - The user ID of the account. If null, the API will use the user ID associated with the provided auth cookies.
   */
  constructor(request, lang, game, region, uid) {
    this.request = request;
    this.lang = lang;
    this.game = game;
    this.region = region;
    this.uid = uid;
  }
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
  async claim(code) {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    this.request.setParams({
      uid: this.uid,
      region: this.region,
      game_biz: this.game,
      cdkey: code.replace(/\uFFFD/g, ""),
      lang: this.lang,
      sLangKey: this.lang
    });
    const res = await this.request.send(RedeemRoute.redeem());
    return res;
  }
};

// src/modules/records/records.enum.ts
var AbyssScheduleEnum = /* @__PURE__ */ ((AbyssScheduleEnum2) => {
  AbyssScheduleEnum2[AbyssScheduleEnum2["CURRENT"] = 1] = "CURRENT";
  AbyssScheduleEnum2[AbyssScheduleEnum2["PREVIOUS"] = 2] = "PREVIOUS";
  return AbyssScheduleEnum2;
})(AbyssScheduleEnum || {});

// src/modules/records/records.route.ts
var RecordRoute = class {
  static index() {
    return `${this.baseUrl}/index`;
  }
  static character() {
    return `${this.baseUrl}/character`;
  }
  static avatarBasicInfo() {
    return `${this.baseUrl}/avatarBasicInfo`;
  }
  static spiralAbyss() {
    return `${this.baseUrl}/spiralAbyss`;
  }
  static dailyNote() {
    return `${this.baseUrl}/dailyNote`;
  }
};
RecordRoute.baseUrl = `${Routes.bbs()}/game_record/genshin/api`;

// src/modules/records/records.ts
var RecordModule = class {
  /**
   * Creates an instance of RecordModule.
   *
   * @constructor
   * @param {Request} request - An instance of Request class.
   * @param {LanguageEnum} lang - The language code to be used in requests.
   * @param {string | null} region - The server region code in which the user's account resides.
   * @param {number | null} uid - The user ID of the Genshin Impact account.
   */
  constructor(request, lang, region, uid) {
    this.request = request;
    this.lang = lang;
    this.region = region;
    this.uid = uid;
  }
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
  async records() {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    this.request.setParams({
      server: this.region,
      role_id: this.uid,
      lang: this.lang
    }).setDs(true);
    const res = (await this.request.send(RecordRoute.index())).data;
    return res;
  }
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
  async characters() {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    this.request.setBody({
      server: this.region,
      role_id: this.uid
    }).setDs(true);
    const res = (await this.request.send(RecordRoute.character(), "POST")).data;
    return res;
  }
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
  async charactersSummary(characterIds) {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    this.request.setBody({
      character_ids: characterIds,
      role_id: this.uid,
      server: this.region
    }).setDs();
    const res = (await this.request.send(RecordRoute.avatarBasicInfo(), "POST")).data;
    return res;
  }
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
  async spiralAbyss(scheduleType = 1 /* CURRENT */) {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    if (Object.values(AbyssScheduleEnum).includes(scheduleType) === false) {
      throw new HoyolabError("The given scheduleType parameter is invalid !");
    }
    this.request.setParams({
      server: this.region,
      role_id: this.uid,
      schedule_type: scheduleType
    }).setDs();
    const res = (await this.request.send(RecordRoute.spiralAbyss())).data;
    return res;
  }
  /**
   * Retrieve the daily note information for a Genshin Impact user.
   * @returns Promise<IGenshinDailyNote> The daily note information.
   * @throws HoyolabError if the UID parameter is missing or failed to be filled.
   * @remarks
   * This method sends a request to the Genshin Impact API to get the daily note information for a user.
   * The user's region and UID must be set before calling this method, otherwise an error will be thrown.
   */
  async dailyNote() {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    this.request.setParams({
      server: this.region,
      role_id: this.uid
    }).setDs();
    const res = (await this.request.send(RecordRoute.dailyNote())).data;
    return res;
  }
};

// src/modules/diary/diary.enum.ts
var DiaryMonthEnum = /* @__PURE__ */ ((DiaryMonthEnum2) => {
  DiaryMonthEnum2[DiaryMonthEnum2["CURRENT"] = 3] = "CURRENT";
  DiaryMonthEnum2[DiaryMonthEnum2["ONE_MONTH_AGO"] = 2] = "ONE_MONTH_AGO";
  DiaryMonthEnum2[DiaryMonthEnum2["TWO_MONTH_AGO"] = 1] = "TWO_MONTH_AGO";
  return DiaryMonthEnum2;
})(DiaryMonthEnum || {});
var DiaryEnum = /* @__PURE__ */ ((DiaryEnum3) => {
  DiaryEnum3[DiaryEnum3["PRIMOGEMS"] = 1] = "PRIMOGEMS";
  DiaryEnum3[DiaryEnum3["MORA"] = 2] = "MORA";
  return DiaryEnum3;
})(DiaryEnum || {});

// src/modules/diary/diary.route.ts
var DiaryRoute = class {
  /**
   * Returns the URL for the diary list.
   * @returns {string} The URL for the diary list.
   */
  static list() {
    return `${this.baseUrl}/event/ysledgeros/month_info`;
  }
  /**
   * Returns the URL for the diary detail.
   * @returns {string} The URL for the diary detail.
   */
  static detail() {
    return `${this.baseUrl}/event/ysledgeros/month_detail`;
  }
};
/**
 * The base URL for the routes.
 */
DiaryRoute.baseUrl = Routes.hke();

// src/modules/diary/diary.ts
var DiaryModule = class {
  /**
   * Constructs a DiaryModule instance
   *
   * @param request - An instance of the Request class to make HTTP requests
   * @param lang - A LanguageEnum value for the language of the user
   * @param region - A string value for the region of the user
   * @param uid - A number value for the UID of the user
   */
  constructor(request, lang, region, uid) {
    this.request = request;
    this.lang = lang;
    this.region = region;
    this.uid = uid;
  }
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
  async diaries(month = 3 /* CURRENT */) {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    if (Object.values(DiaryMonthEnum).includes(month) === false) {
      throw new HoyolabError("The given month parameter is invalid !");
    }
    this.request.setParams({
      region: this.region,
      uid: this.uid,
      month
    }).setDs();
    const res = (await this.request.send(DiaryRoute.list())).data;
    return res;
  }
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
  async detail(type, month = 3 /* CURRENT */) {
    if (!this.region || !this.uid) {
      throw new HoyolabError("UID parameter is missing or failed to be filled");
    }
    if (Object.values(DiaryMonthEnum).includes(month) === false) {
      throw new HoyolabError("The given month parameter is invalid !");
    }
    if (Object.values(DiaryEnum).includes(type) === false) {
      throw new HoyolabError("The given type parameter is invalid !");
    }
    const responses = {};
    let page = 1;
    let next = true;
    do {
      this.request.setParams({
        region: this.region,
        uid: this.uid,
        month,
        type,
        current_page: page,
        page_size: 100
      }).setDs();
      const res = await (await this.request.send(DiaryRoute.detail())).data;
      responses.uid = res.uid;
      responses.region = res.region;
      responses.optional_month = res.optional_month;
      responses.nickname = res.nickname;
      responses.data_month = res.data_month;
      responses.current_page = res.current_page;
      responses.list = [...responses.list ?? [], ...res.list];
      if (res.list.length < 1) {
        next = false;
      }
      page++;
    } while (next);
    responses.list.sort((a, b) => {
      const keyA = new Date(a.time);
      const keyB = new Date(b.time);
      if (keyA < keyB)
        return -1;
      if (keyA > keyB)
        return 1;
      return 0;
    });
    return responses;
  }
};

// src/games/gi/gi.enum.ts
var GenshinRegion = /* @__PURE__ */ ((GenshinRegion2) => {
  GenshinRegion2["USA"] = "os_usa";
  GenshinRegion2["EUROPE"] = "os_euro";
  GenshinRegion2["ASIA"] = "os_asia";
  GenshinRegion2["CHINA_TAIWAN"] = "os_cht";
  return GenshinRegion2;
})(GenshinRegion || {});

// src/games/gi/gi.helper.ts
function getGenshinRegion(uid) {
  const server_region = Number(uid.toString().trim().slice(0, 1));
  let key;
  switch (server_region) {
    case 6:
      key = "USA";
      break;
    case 7:
      key = "EUROPE";
      break;
    case 8:
      key = "ASIA";
      break;
    case 9:
      key = "CHINA_TAIWAN";
      break;
    default:
      throw new HoyolabError(`Given UID ${uid} is invalid !`);
  }
  return GenshinRegion[key];
}

// src/games/gi/gi.ts
var GenshinImpact = class {
  /**
   * Constructs a new `Genshin` object.
   * @param options The options object used to configure the object.
   * @param options.cookie The cookie string or object to be used in requests.
   * @param options.uid The UID of the user.
   * @param options.region The region of the user.
   * @param options.lang The language to be used in requests.
   */
  constructor(options) {
    const cookie = typeof options.cookie === "string" ? Cookie.parseCookieString(options.cookie) : options.cookie;
    this.cookie = cookie;
    if (!options.lang) {
      options.lang = Language.parseLang(cookie.mi18nLang);
    }
    this.request = new Request(Cookie.parseCookie(this.cookie));
    this.request.setReferer(Routes.referer());
    this.request.setLang(options.lang);
    this.uid = options.uid ?? null;
    this.region = this.uid !== null ? getGenshinRegion(this.uid) : null;
    this.lang = options.lang;
    this.daily = new DailyModule(
      this.request,
      this.lang,
      "hk4e_global" /* GENSHIN_IMPACT */
    );
    this.redeem = new RedeemModule(
      this.request,
      this.lang,
      "hk4e_global" /* GENSHIN_IMPACT */,
      this.region,
      this.uid
    );
    this.record = new RecordModule(
      this.request,
      this.lang,
      this.region,
      this.uid
    );
    this.diary = new DiaryModule(this.request, this.lang, this.region, this.uid);
  }
  /**
   * Create a new instance of the GenshinImpact class asynchronously.
   *
   * @param options The options object used to configure the object.
   * @param options.cookie The cookie string or object to be used in requests.
   * @param options.lang The language to be used in requests.
   * @returns A promise that resolves with a new Genshin instance.
   */
  static async create(options) {
    if (typeof options.uid === "undefined") {
      const hoyolab = new Hoyolab({
        cookie: options.cookie
      });
      const game = await hoyolab.gameAccount("hk4e_global" /* GENSHIN_IMPACT */);
      options.uid = parseInt(game.game_uid);
      options.region = getGenshinRegion(parseInt(game.game_uid));
    }
    return new GenshinImpact(options);
  }
  /**
   * Get user's Genshin Impact record
   *
   * @alias {@link GenshinImpact.record | Genshin.record.records()}
   * @deprecated Use through {@link GenshinImpact.record | Genshin.record.records()} instead
   */
  async records() {
    return this.record.records();
  }
  /**
   * Retrieves the Genshin characters of the user.
   *
   * @alias {@link GenshinImpact.record | Genshin.record.characters()}
   * @deprecated Use through {@link GenshinImpact.record | Genshin.record.characters()} instead
   */
  async characters() {
    return this.record.characters();
  }
  /**
   * Returns the summary information of Genshin Impact game characters
   *
   * @param characterIds number[] Characters ID
   * @alias {@link GenshinImpact.record | Genshin.record.charactersSummary()}
   * @deprecated Use through {@link GenshinImpact.record | Genshin.record.charactersSummary()} instead
   */
  async charactersSummary(characterIds) {
    return this.record.charactersSummary(characterIds);
  }
  /**
   * Retrieves information about the player's performance in the Spiral Abyss.
   *
   * @param scheduleType AbyssScheduleEnum
   * @alias {@link GenshinImpact.record | Genshin.record.spiralAbyss()}
   * @deprecated Use through {@link GenshinImpact.record | Genshin.record.spiralAbyss()} instead
   */
  async spiralAbyss(scheduleType = 1 /* CURRENT */) {
    return this.record.spiralAbyss(scheduleType);
  }
  /**
   * Retrieve the daily note information for a Genshin Impact user.
   *
   * @alias {@link GenshinImpact.record | Genshin.record.dailyNote()}
   * @deprecated Use through {@link GenshinImpact.record | Genshin.record.dailyNote()} instead
   */
  async dailyNote() {
    return this.record.dailyNote();
  }
  /**
   * Returns the diary information of a given month for a user
   *
   * @param month
   * @alias {@link GenshinImpact.diary | Genshin.diary.diaries()}
   * @deprecated Use through {@link GenshinImpact.diary | Genshin.diary.diaries()} instead
   */
  async diaries(month = 3 /* CURRENT */) {
    return this.diary.diaries(month);
  }
  /**
   * Returns the diary details of a given type and month for a user
   *
   * @param type DiaryEnum
   * @param month DiaryMonthEnum
   * @alias {@link GenshinImpact.diary | Genshin.diary.detail()}
   * @deprecated Use through {@link GenshinImpact.diary | Genshin.diary.detail()} instead
   */
  async diaryDetail(type, month = 3 /* CURRENT */) {
    return this.diary.detail(type, month);
  }
  /**
   * Retrieves daily information.
   *
   * @alias {@link GenshinImpact.daily | Genshin.daily.info()}
   * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.info()} instead
   */
  dailyInfo() {
    return this.daily.info();
  }
  /**
   * Retrieve daily rewards information.
   *
   * @alias {@link GenshinImpact.daily | Genshin.daily.rewards()}
   * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.rewards()} instead
   */
  dailyRewards() {
    return this.daily.rewards();
  }
  /**
   * Get the daily reward for a specific day or the current day
   *
   * @param day number | null
   * @alias {@link GenshinImpact.daily | Genshin.daily.reward()}
   * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.reward()} instead
   */
  dailyReward(day = null) {
    return this.daily.reward(day);
  }
  /**
   * Claim current reward
   *
   * @alias {@link GenshinImpact.daily | Genshin.daily.claim()}
   * @deprecated Use through {@link GenshinImpact.daily | Genshin.daily.claim()} instead
   */
  dailyClaim() {
    return this.daily.claim();
  }
  /**
   * Redeems a code for a specific account.
   *
   * @param code string
   * @alias {@link GenshinImpact.daily | Genshin.redeem.claim()}
   * @deprecated Use through {@link GenshinImpact.daily | Genshin.redeem.claim()} instead
   */
  redeemCode(code) {
    return this.redeem.claim(code);
  }
};

// src/games/hsr/hsr.enum.ts
var HsrRegion = /* @__PURE__ */ ((HsrRegion2) => {
  HsrRegion2["USA"] = "prod_official_asia";
  HsrRegion2["EUROPE"] = "prod_official_euro";
  HsrRegion2["ASIA"] = "prod_official_asia";
  HsrRegion2["CHINA_TAIWAN"] = "prod_official_cht";
  return HsrRegion2;
})(HsrRegion || {});

// src/games/hsr/hsr.helper.ts
function getHsrRegion(uid) {
  const server_region = Number(uid.toString().trim().slice(0, 1));
  let key;
  switch (server_region) {
    case 6:
      key = "USA";
      break;
    case 7:
      key = "EUROPE";
      break;
    case 8:
      key = "ASIA";
      break;
    case 9:
      key = "CHINA_TAIWAN";
      break;
    default:
      throw new HoyolabError(`Given UID ${uid} is invalid !`);
  }
  return HsrRegion[key];
}

// src/games/hsr/hsr.ts
var HonkaiStarRail = class {
  /**
   * Create a new instance of HonkaiStarRail.
   *
   * @public
   * @constructor
   * @param {IHsrOptions} options - The options for the HonkaiStarRail instance.
   */
  constructor(options) {
    const cookie = typeof options.cookie === "string" ? Cookie.parseCookieString(options.cookie) : options.cookie;
    this.cookie = cookie;
    if (!options.lang) {
      options.lang = Language.parseLang(cookie.mi18nLang);
    }
    this.request = new Request(Cookie.parseCookie(this.cookie));
    this.request.setReferer(Routes.referer());
    this.request.setLang(options.lang);
    this.uid = options.uid ?? null;
    this.region = this.uid !== null ? getHsrRegion(this.uid) : null;
    this.lang = options.lang;
    this.daily = new DailyModule(
      this.request,
      this.lang,
      "hkrpg_global" /* HONKAI_STAR_RAIL */
    );
    this.redeem = new RedeemModule(
      this.request,
      this.lang,
      "hkrpg_global" /* HONKAI_STAR_RAIL */,
      this.region,
      this.uid
    );
  }
  /**
   * Create a new instance of HonkaiStarRail using a Hoyolab account.
   * If `uid` is not provided in the `options`, the account with the highest level will be used.
   *
   * @public
   * @static
   * @param {IHsrOptions} options - The options for the HonkaiStarRail instance.
   * @returns {Promise<HonkaiStarRail>} - A promise that resolves with a new HonkaiStarRail instance.
   */
  static async create(options) {
    if (typeof options.uid === "undefined") {
      const hoyolab = new Hoyolab({
        cookie: options.cookie
      });
      const game = await hoyolab.gameAccount("hkrpg_global" /* HONKAI_STAR_RAIL */);
      options.uid = parseInt(game.game_uid);
      options.region = getHsrRegion(parseInt(game.game_uid));
    }
    return new HonkaiStarRail(options);
  }
  /**
   * Retrieves daily information.
   *
   * @alias {@link DailyModule.info | DailyModule.info }
   * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.info() } instead
   */
  dailyInfo() {
    return this.daily.info();
  }
  /**
   *
   * @alias {@link DailyModule.rewards | DailyModule.rewards }
   * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.rewards() } instead
   */
  dailyRewards() {
    return this.daily.rewards();
  }
  /**
   * Fetch reward from daily login based on day
   *
   * @param day number | null
   * @alias {@link DailyModule.reward | DailyModule.reward }
   * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.reward() } instead
   */
  dailyReward(day = null) {
    return this.daily.reward(day);
  }
  /**
   * Claim current reward
   *
   * @alias {@link DailyModule.claim | DailyModule.claim }
   * @deprecated Use through { @link HonkaiStarRail.daily | HonkaiStarRail.daily.claim() } instead
   */
  dailyClaim() {
    return this.daily.claim();
  }
  /**
   * Redeem Code
   *
   * @param code string
   * @alias {@link RedeemModule.claim | RedeemModule.claim }
   * @deprecated Use through { @link HonkaiStarRail.redeem | HonkaiStarRail.redeem.claim() } instead
   */
  redeemCode(code) {
    return this.redeem.claim(code);
  }
};

// src/games/hi/hi.enum.ts
var HonkaiRegion = /* @__PURE__ */ ((HonkaiRegion2) => {
  HonkaiRegion2["USA"] = "usa01";
  HonkaiRegion2["EUROPE"] = "eur01";
  HonkaiRegion2["ASIA"] = "overseas01";
  return HonkaiRegion2;
})(HonkaiRegion || {});

// src/games/hi/hi.helper.ts
function getHi3Region(uid) {
  let key;
  if (uid > 1e7 && uid < 1e8) {
    key = "ASIA";
  } else if (uid > 1e8 && uid < 2e8) {
    key = "USA";
  } else if (uid > 2e8 && uid < 3e8) {
    key = "EURO";
  } else {
    throw new HoyolabError(`Given UID ${uid} is invalid !`);
  }
  return HonkaiRegion[key];
}

// src/games/hi/hi.ts
var HonkaiImpact = class {
  /**
   * Create a new instance of HonkaiImpact.
   *
   * @public
   * @constructor
   * @param {IHi3Options} options - The options for the HonkaiImpact instance.
   */
  constructor(options) {
    const cookie = typeof options.cookie === "string" ? Cookie.parseCookieString(options.cookie) : options.cookie;
    this.cookie = cookie;
    if (!options.lang) {
      options.lang = Language.parseLang(cookie.mi18nLang);
    }
    this.request = new Request(Cookie.parseCookie(this.cookie));
    this.request.setReferer(Routes.referer());
    this.request.setLang(options.lang);
    this.uid = options.uid ?? null;
    this.region = this.uid !== null ? getHi3Region(this.uid) : null;
    this.lang = options.lang;
    this.daily = new DailyModule(
      this.request,
      this.lang,
      "bh3_global" /* HONKAI_IMPACT */
    );
    this.redeem = new RedeemModule(
      this.request,
      this.lang,
      "bh3_global" /* HONKAI_IMPACT */,
      this.region,
      this.uid
    );
  }
  /**
   * Create a new instance of HonkaiImpact using a Hoyolab account.
   * If `uid` is not provided in the `options`, the account with the highest level will be used.
   *
   * @public
   * @static
   * @param {IHi3Options} options - The options for the HonkaiImpact instance.
   * @returns {Promise<HonkaiImpact>} - A promise that resolves with a new HonkaiImpact instance.
   */
  static async create(options) {
    if (typeof options.uid === "undefined") {
      const hoyolab = new Hoyolab({
        cookie: options.cookie
      });
      const game = await hoyolab.gameAccount("bh3_global" /* HONKAI_IMPACT */);
      options.uid = parseInt(game.game_uid);
      options.region = getHi3Region(parseInt(game.game_uid));
    }
    return new HonkaiImpact(options);
  }
  /**
   * Retrieves daily information.
   *
   * @alias {@link DailyModule.info | DailyModule.info }
   * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.info() } instead
   */
  dailyInfo() {
    return this.daily.info();
  }
  /**
   *
   * @alias {@link DailyModule.rewards | DailyModule.rewards }
   * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.rewards() } instead
   */
  dailyRewards() {
    return this.daily.rewards();
  }
  /**
   * Fetch reward from daily login based on day
   *
   * @param day number | null
   * @alias {@link DailyModule.reward | DailyModule.reward }
   * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.reward() } instead
   */
  dailyReward(day = null) {
    return this.daily.reward(day);
  }
  /**
   * Claim current reward
   *
   * @alias {@link DailyModule.claim | DailyModule.claim }
   * @deprecated Use through { @link HonkaiImpact.daily | HonkaiImpact.daily.claim() } instead
   */
  dailyClaim() {
    return this.daily.claim();
  }
  /**
   * Redeem Code
   *
   * @param code string
   * @alias {@link RedeemModule.claim | RedeemModule.claim }
   * @deprecated Use through { @link HonkaiImpact.redeem | HonkaiImpact.redeem.claim() } instead
   */
  redeemCode(code) {
    return this.redeem.claim(code);
  }
};

// src/index.ts
var Genshin = class extends GenshinImpact {
};
export {
  AbyssScheduleEnum,
  Cache,
  Cookie,
  DailyModule,
  DiaryEnum,
  DiaryModule,
  DiaryMonthEnum,
  GamesEnum,
  Genshin,
  GenshinImpact,
  GenshinRegion,
  HonkaiImpact,
  HonkaiRegion,
  HonkaiStarRail,
  Hoyolab,
  HoyolabError,
  HsrRegion,
  Language,
  LanguageEnum,
  RecordModule,
  RedeemModule,
  Request,
  delay,
  generateDS,
  getGenshinRegion,
  getHi3Region,
  getHsrRegion
};
