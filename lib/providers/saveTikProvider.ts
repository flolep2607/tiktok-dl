import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '..';
import {matchCustomDownload} from './util';

/**
 * @class SaveTikProvider
 */
export class SaveTikProvider extends BaseProvider {
  /**
     * Get resource name
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'savetik';
  }

  public client = getFetch('https://savetik.net');

  public maintenance = undefined;

  /**
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
  async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client('./');

    const token = (
            response.body.match(/id="token" value="([^""]+)"/) as string[]
    )[1];

    const responseAction = await this.client.post(
        './action.php', {
          'form': {
            'url': url,
            'token': token,
          },
          'headers': {
            'cookie': response.headers['set-cookie']?.toString(),
            'Referer': 'https://savetik.net/',
            'Origin': 'https://savetik.net',
          },
        },
    );

    if (JSON.parse(responseAction.body).error) {
      return {
        'error': JSON.parse(responseAction.body).message,
      };
    };

    return this.extract(JSON.parse(responseAction.body).data);
  }

  /**
   * @param {string} html
   * @return {ExtractedInfo}
   */
  extract(html: string): ExtractedInfo {
    const urls = matchCustomDownload('savetik', html);

    return {
      'music': {
        'url': urls?.pop() as string,
      },
      'video': {
        'thumb': urls?.shift(),
        'urls': urls as string[],
      },
    };
  }
}
