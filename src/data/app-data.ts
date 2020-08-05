export class AppData {
  static get localesArr(): string[] {
    return ['zu', 'zh', 'xh', 'vi', 've', 'uz', 'ur', 'uk', 'ts', 'tr', 'to', 'tn', 'tk', 'ti', 'th', 'tg', 'ta', 'sw', 'sv', 'st', 'ss', 'sr', 'sq', 'so', 'sn', 'sm', 'sl', 'sk', 'si', 'sg', 'rw', 'ru', 'ro', 'rn', 'qu', 'pt', 'ps', 'pl', 'pa', 'oc', 'ny', 'nr', 'no', 'nn', 'nl', 'ne', 'nd', 'nb', 'na', 'my', 'mt', 'ms', 'mn', 'mk', 'mi', 'mh', 'mg', 'lv', 'lu', 'lt', 'lo', 'ln', 'lb', 'la', 'ky', 'ku', 'ko', 'km', 'kl', 'kk', 'kg', 'ka', 'ja', 'it', 'is', 'id', 'hy', 'hu', 'ht', 'hr', 'hi', 'he', 'gv', 'gn', 'gl', 'ga', 'fr', 'fo', 'fj', 'fi', 'ff', 'fa', 'eu', 'et', 'es', 'en', 'el', 'dz', 'dv', 'de', 'da', 'cs', 'ch', 'ca', 'bs', 'bn', 'bi', 'bg', 'be', 'az', 'ay', 'ar', 'am', 'af', 'ad-ca', 'ae-ar', 'af-ps', 'af-tk', 'af-uz', 'ag-en', 'ai-en', 'al-sq', 'am-hy', 'am-ru', 'ao-pt', 'ar-es', 'ar-gn', 'as-en', 'as-sm', 'at-de', 'au-en', 'aw-nl', 'aw-pa', 'ax-sv', 'az-az', 'ba-bs', 'ba-hr', 'ba-sr', 'bb-en', 'bd-bn', 'be-de', 'be-fr', 'be-nl', 'bf-ff', 'bf-fr', 'bg-bg', 'bh-ar', 'bi-fr', 'bi-rn', 'bj-fr', 'bl-fr', 'bm-en', 'bn-ms', 'bo-ay', 'bo-es', 'bo-qu', 'bq-nl', 'br-pt', 'bs-en', 'bt-dz', 'bv-nb', 'bv-nn', 'bv-no', 'bw-en', 'bw-tn', 'by-be', 'by-ru', 'bz-en', 'bz-es', 'ca-en', 'ca-fr', 'cc-en', 'cd-fr', 'cd-kg', 'cd-ln', 'cd-lu', 'cd-sw', 'cf-fr', 'cf-sg', 'cg-fr', 'cg-ln', 'ch-de', 'ch-fr', 'ch-it', 'ci-fr', 'ck-en', 'cl-es', 'cm-en', 'cm-fr', 'cn-zh', 'co-es', 'cr-es', 'cu-es', 'cv-pt', 'cw-en', 'cw-nl', 'cw-pa', 'cx-en', 'cy-el', 'cy-hy', 'cy-tr', 'cz-cs', 'cz-sk', 'de-de', 'dj-ar', 'dj-fr', 'dk-da', 'dm-en', 'do-es', 'dz-ar', 'ec-es', 'ee-et', 'eg-ar', 'eh-es', 'er-ar', 'er-en', 'er-ti', 'es-ca', 'es-es', 'es-eu', 'es-gl', 'es-oc', 'et-am', 'fi-fi', 'fi-sv', 'fj-en', 'fj-fj', 'fj-hi', 'fj-ur', 'fk-en', 'fm-en', 'fo-fo', 'fr-fr', 'ga-fr', 'gb-en', 'gd-en', 'ge-ka', 'gf-fr', 'gg-en', 'gg-fr', 'gh-en', 'gi-en', 'gl-kl', 'gm-en', 'gn-ff', 'gn-fr', 'gp-fr', 'gq-es', 'gq-fr', 'gr-el', 'gs-en', 'gt-es', 'gu-ch', 'gu-en', 'gu-es', 'gw-pt', 'gy-en', 'hk-en', 'hk-zh', 'hm-en', 'hn-es', 'hr-hr', 'ht-fr', 'ht-ht', 'hu-hu', 'id-id', 'ie-en', 'ie-ga', 'il-ar', 'il-he', 'im-en', 'im-gv', 'in-en', 'in-hi', 'io-en', 'iq-ar', 'iq-ku', 'ir-fa', 'is-is', 'it-it', 'je-en', 'je-fr', 'jm-en', 'jo-ar', 'jp-ja', 'ke-en', 'ke-sw', 'kg-ky', 'kg-ru', 'kh-km', 'ki-en', 'km-ar', 'km-fr', 'kn-en', 'kp-ko', 'kr-ko', 'kw-ar', 'ky-en', 'kz-kk', 'kz-ru', 'la-lo', 'lb-ar', 'lb-fr', 'lc-en', 'li-de', 'lk-si', 'lk-ta', 'lr-en', 'ls-en', 'ls-st', 'lt-lt', 'lu-de', 'lu-fr', 'lu-lb', 'lv-lv', 'ly-ar', 'ma-ar', 'mc-fr', 'md-ro', 'me-bs', 'me-hr', 'me-sq', 'me-sr', 'mf-en', 'mf-fr', 'mf-nl', 'mg-fr', 'mg-mg', 'mh-en', 'mh-mh', 'mk-mk', 'ml-fr', 'mm-my', 'mn-mn', 'mo-pt', 'mo-zh', 'mp-ch', 'mp-en', 'mq-fr', 'mr-ar', 'ms-en', 'mt-en', 'mt-mt', 'mu-en', 'mv-dv', 'mw-en', 'mw-ny', 'mx-es', 'my-ms', 'mz-pt', 'na-af', 'na-en', 'nc-fr', 'ne-fr', 'nf-en', 'ng-en', 'ni-es', 'nl-nl', 'no-nb', 'no-nn', 'no-no', 'np-ne', 'nr-en', 'nr-na', 'nu-en', 'nz-en', 'nz-mi', 'om-ar', 'pa-es', 'pe-es', 'pf-fr', 'pg-en', 'ph-en', 'pk-en', 'pk-ur', 'pl-pl', 'pm-fr', 'pn-en', 'pr-en', 'pr-es', 'ps-ar', 'pt-pt', 'pw-en', 'py-es', 'py-gn', 'qa-ar', 're-fr', 'ro-ro', 'rs-sr', 'ru-ru', 'rw-en', 'rw-fr', 'rw-rw', 'sa-ar', 'sb-en', 'sc-en', 'sc-fr', 'sd-ar', 'sd-en', 'se-sv', 'sg-en', 'sg-ms', 'sg-ta', 'sg-zh', 'sh-en', 'si-sl', 'sj-no', 'sk-sk', 'sl-en', 'sm-it', 'sn-fr', 'so-ar', 'so-so', 'sr-nl', 'ss-en', 'st-pt', 'sv-es', 'sx-en', 'sx-nl', 'sy-ar', 'sz-en', 'sz-ss', 'tc-en', 'td-ar', 'td-fr', 'tf-fr', 'tg-fr', 'th-th', 'tj-ru', 'tj-tg', 'tk-en', 'tl-pt', 'tm-ru', 'tm-tk', 'tn-ar', 'to-en', 'to-to', 'tr-tr', 'tt-en', 'tv-en', 'tw-zh', 'tz-en', 'tz-sw', 'ua-uk', 'ug-en', 'ug-sw', 'um-en', 'us-en', 'uy-es', 'uz-ru', 'uz-uz', 'va-it', 'va-la', 'vc-en', 've-es', 'vg-en', 'vi-en', 'vn-vi', 'vu-bi', 'vu-en', 'vu-fr', 'wf-fr', 'ws-en', 'ws-sm', 'xk-sq', 'xk-sr', 'ye-ar', 'yt-fr', 'za-af', 'za-en', 'za-nr', 'za-ss', 'za-st', 'za-tn', 'za-ts', 'za-ve', 'za-xh', 'za-zu', 'zm-en', 'zw-en', 'zw-nd', 'zw-sn'];
  }
}