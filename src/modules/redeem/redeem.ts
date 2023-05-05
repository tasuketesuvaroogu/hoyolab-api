import type { GamesEnum } from '../../games/hoyolab'
import type { LanguageEnum } from '../../language'
import { Request } from '../../request'
import { HoyolabError } from '../../utils'
import type { IRedeemCode } from './redeem.interface'
import { RedeemRoute } from './redeem.route'

/**
 * Class representing the Redeem module for Genshin Impact's Hoyolab API.
 *
 * @public
 * @internal
 * @category Module
 */
export class RedeemModule {
  /**
   * Constructs a new RedeemModule object.
   * @param request - The Request object used for making HTTP requests.
   * @param lang - The language to use for the API response.
   * @param game - The game to redeem the code for.
   * @param region - The region of the user's account. If null, the API will use the default region for the game.
   * @param uid - The user ID of the account. If null, the API will use the user ID associated with the provided auth cookies.
   */
  constructor(
    private request: Request,
    private lang: LanguageEnum,
    private game: GamesEnum,
    private region: string | null,
    private uid: number | null,
  ) {}

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
  async claim(code: string): Promise<IRedeemCode> {
    if (!this.region || !this.uid) {
      throw new HoyolabError('UID parameter is missing or failed to be filled')
    }

    this.request.setParams({
      uid: this.uid,
      region: this.region,
      game_biz: this.game,
      cdkey: code.replace(/\uFFFD/g, ''),
      lang: this.lang,
      sLangKey: this.lang,
    })

    const res = await this.request.send(RedeemRoute.redeem())

    return res as IRedeemCode
  }
}
