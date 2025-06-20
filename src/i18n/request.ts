import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `headers()`, `cookies()`, etc.
  const headersList = await headers();
  const locale = headersList.get('x-locale') ?? 'ja';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
