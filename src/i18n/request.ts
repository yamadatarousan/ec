import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // 一時的に静的設定でビルドエラーを回避
  const locale = 'ja';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
