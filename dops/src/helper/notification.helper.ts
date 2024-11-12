import { InternalServerErrorException } from '@nestjs/common';
import { CacheKey } from '../enum/cache-key.enum';
import { ImageType } from '../enum/image-type.enum';
import { NotificationTemplate } from '../enum/notification-template.enum';
import { getFromCache } from './cache.helper';
import { Cache } from 'cache-manager';
import * as Handlebars from 'handlebars';

/**
 * Retrieves a base64 encoded image string from the cache.
 *
 * @param imageType - The type of the image to retrieve.
 * @param cacheManager - The cache manager instance to use.
 * @param cacheKey - The cache key under which the image is stored.
 * @returns A promise that resolves to a base64 encoded image string.
 */
export const getBase64Img = async (
  imageType: ImageType,
  cacheManager: Cache,
  cacheKey: CacheKey,
): Promise<string> => {
  return `data:${imageType};base64,${await getFromCache(
    cacheManager,
    cacheKey,
  )}`;
};

export const getCacheKeyforEmailTemplate = (
  templateName: NotificationTemplate,
): CacheKey => {
  switch (templateName) {
    case NotificationTemplate.ISSUE_PERMIT:
      return CacheKey.EMAIL_TEMPLATE_ISSUE_PERMIT;
    case NotificationTemplate.PAYMENT_RECEIPT:
      return CacheKey.EMAIL_TEMPLATE_PAYMENT_RECEIPT;
    case NotificationTemplate.PROFILE_REGISTRATION:
      return CacheKey.EMAIL_TEMPLATE_PROFILE_REGISTRATION;
    case NotificationTemplate.COMPANY_SUSPEND:
      return CacheKey.EMAIL_TEMPLATE_COMPANY_SUSPEND;
    case NotificationTemplate.COMPANY_UNSUSPEND:
      return CacheKey.EMAIL_TEMPLATE_COMPANY_UNSUSPEND;
    case NotificationTemplate.APPLICATION_APPROVED:
      return CacheKey.EMAIL_TEMPLATE_APPLICATION_APPROVED;
    case NotificationTemplate.APPLICATION_REJECTED:
      return CacheKey.EMAIL_TEMPLATE_APPLICATION_REJECTED;
    default:
      throw new Error('Invalid template name');
  }
};

/**
 * Compiles an HTML email body from a specified template and data.
 *
 * This method retrieves an email template by name from the cache, then uses Handlebars to compile the template
 * with the provided data object. It automatically adds URLs for various logos based on environment variables
 * and returns the compiled HTML as a string.
 *
 * @param templateName The name of the email template to render.
 * @param data The data object to pass to the Handlebars template.
 * @param isEmbedBase64Image Whether to embed images as Base64 images.
 * @returns A promise that resolves with the compiled HTML string of the email body.
 * @throws InternalServerErrorException If the template is not found in the cache.
 */
export const renderTemplate = async (
  templateName: NotificationTemplate,
  data: object,
  cacheManager: Cache,
  isEmbedBase64Image = false,
): Promise<string> => {
  const template = await getFromCache(
    cacheManager,
    getCacheKeyforEmailTemplate(templateName),
  );
  if (!template?.length) {
    throw new InternalServerErrorException('Template not found');
  }
  const compiledTemplate = Handlebars.compile(template);
  const htmlBody = compiledTemplate({
    ...data,
    headerLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_HEADER_LOGO,
        )
      : process.env.FRONTEND_URL + '/BC_Logo_MOTI.png',
    footerLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_FOOTER_LOGO,
        )
      : process.env.FRONTEND_URL + '/onRouteBC_Logo.png',
    darkModeHeaderLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_DARK_MODE_HEADER_LOGO,
        )
      : process.env.FRONTEND_URL + '/BC_Logo_Rev_MOTI.png',
    darkModeMedHeaderLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_DARK_MODE_MED_HEADER_LOGO,
        )
      : process.env.FRONTEND_URL + '/BC_Logo_Rev_MOTI@2x.png',
    darkModeFooterLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_DARK_MODE_FOOTER_LOGO,
        )
      : process.env.FRONTEND_URL + '/onRouteBC_Rev_Logo.png',
    darkModeMedFooterLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.PNG,
          cacheManager,
          CacheKey.IMG_DARK_MODE_MED_FOOTER_LOGO,
        )
      : process.env.FRONTEND_URL + '/onRouteBC_Rev_Logo@2x.png',
    whiteHeaderLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.JPG,
          cacheManager,
          CacheKey.IMG_WHITE_HEADER_LOGO,
        )
      : process.env.FRONTEND_URL + '/BC_Logo_MOTI_White.jpg',
    whiteMedHeaderLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.JPG,
          cacheManager,
          CacheKey.IMG_WHITE_MED_HEADER_LOGO,
        )
      : process.env.FRONTEND_URL + '/BC_Logo_MOTI_White@2x.jpg',
    whiteFooterLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.JPG,
          cacheManager,
          CacheKey.IMG_WHITE_FOOTER_LOGO,
        )
      : process.env.FRONTEND_URL + '/onRouteBC_Logo_White.jpg',
    whiteMedFooterLogo: isEmbedBase64Image
      ? await getBase64Img(
          ImageType.JPG,
          cacheManager,
          CacheKey.IMG_WHITE_MED_FOOTER_LOGO,
        )
      : process.env.FRONTEND_URL + '/onRouteBC_Logo_White@2x.jpg',
  });
  return htmlBody;
};
