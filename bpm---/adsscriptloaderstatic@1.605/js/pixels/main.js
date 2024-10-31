'use es6';

import * as utils from '../utils';
import { addPixels, disablePixels, reinstallPixels, onUtkReady } from './pixels';
import { fetchConfig } from '../configFetcher';
const start = function start() {
  const envString = utils.getEnv() === 'qa' ? 'qa' : '';
  const hublet = utils.getHublet();
  /* eslint-disable-next-line hubspot-dev/no-hublet-references, hubspot-dev/no-hublet-comparison */
  const hubletString = hublet === 'na1' || !hublet ? '' : `-${hublet}`;
  const configDomain = `api${hubletString}.hubapi${envString}.com`;
  let config = null;
  let utk = null;
  let gtag;
  window.enabledEventSettings = {
    FACEBOOK: [],
    ADWORDS: []
  };
  if (window.disabledHsPopups && window.disabledHsPopups.indexOf('ADS') > -1) {
    return;
  }

  // For GDPR purposes, users must consent to privacy policy before pixel is added
  window._hsp = window._hsp || [];
  window._hsp.push(['addPrivacyConsentListener', function (consent) {
    if (consent.categories.advertisement) {
      if (!config) {
        fetchConfig({
          jsonUrl: `${configDomain}/hs-script-loader-public/v1/config/pixels-and-events/json`,
          jsonpUrl: `${configDomain}/hs-script-loader-public/v1/config/pixels-and-events/jsonp`
        }, response => {
          config = response.pixels;
          addPixels(response.pixels, utk);
          window.enabledEventSettings = response.enhancedConversionEventSettings;
        }, 'addPixels');
      } else {
        reinstallPixels(config, utk);
      }
    } else if (config) {
      disablePixels(config);
    }
  }]);
  window._hsq = window._hsq || [];
  window._hsq.push(['addUserTokenListener', function (newUtk) {
    utk = newUtk;
    if (config) {
      onUtkReady(config, utk);
    }
  }]);
  function sendEventToFacebook(settings, event) {
    if (window.fbq === undefined) {
      return;
    }
    const {
      hubSpotFormId,
      eventCategory
    } = settings;
    const {
      conversionId: transaction_id,
      formGuid
    } = event;

    // https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/
    if (formGuid === hubSpotFormId) {
      window.fbq('track', eventCategory, {}, {
        eventID: transaction_id
      });
    }
  }
  function sendEventToGoogle(setting, event) {
    const {
      hubSpotFormId,
      pixelId,
      conversionLabel
    } = setting;
    const {
      conversionId: transaction_id,
      formGuid
    } = event;
    gtag = function () {
      //eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    if (formGuid === hubSpotFormId && conversionLabel !== null) {
      gtag('event', 'conversion', {
        send_to: `AW-${pixelId}/${conversionLabel}`,
        transaction_id
      });
    }
  }

  // form submission event listener
  window.addEventListener('message', event => {
    if (event.data && event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmitted') {
      if (window.enabledEventSettings.FACEBOOK) {
        window.enabledEventSettings.FACEBOOK.forEach(settings => {
          sendEventToFacebook(settings, event.data.data);
        });
      }
      if (window.enabledEventSettings.ADWORDS) {
        window.enabledEventSettings.ADWORDS.forEach(settings => {
          sendEventToGoogle(settings, event.data.data);
        });
      }
    }
  }, false);
};
window.PIXELS_RAN = window.PIXELS_RAN || false;
if (!window.PIXELS_RAN) {
  window.PIXELS_RAN = true;
  // Code entry point
  start();
}