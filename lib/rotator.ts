import {getRandomProvider} from '.';
import {providerCache} from '../config';
import {BaseProvider, ExtractedInfo} from './providers/baseProvider';

/**
 * Rotate provider.
 * @param {BaseProvider} provider Provider instance
 * @param {string} url Video TikTok URL
 * @param {boolean?} noCache NoCache option
 * @param {boolean?} skipOnError Rotate when error
 * @return {Promise<ExtractedInfo>}
 */
export const rotateProvider = async (
    provider: BaseProvider, url: string,
    noCache: boolean = false, skipOnError: boolean = true):
    Promise<ExtractedInfo & { provider: string; }> => {
  if (provider.maintenance) {
    return await rotateProvider(getRandomProvider(), url, noCache, skipOnError);
  }
    try {
      const data = await provider.fetch(url);
      if (data.error) {
        // switching to other provider
        return await rotateProvider(getRandomProvider(), url);
      } else if (data.video && !data.video.urls.length) {
        return await rotateProvider(getRandomProvider(), url);
      } else {
        return {...data, provider: provider.resourceName()};
      }
    } catch (e) {
      if (skipOnError) {
        return await rotateProvider(getRandomProvider(), url);
      } else {
        return {
          error: (e as Error).message,
          provider: provider.resourceName(),
        };
      }
    }

};
