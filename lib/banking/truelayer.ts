
const scopes = ['accounts', 'balance', 'cards', 'transactions', 'offline_access'];

function encode(value: string) {
  return encodeURIComponent(value);
}

export function getTrueLayerConfig() {
  return {
    clientId: process.env.TRUELAYER_CLIENT_ID || '',
    clientSecret: process.env.TRUELAYER_CLIENT_SECRET || '',
    redirectUri: process.env.TRUELAYER_REDIRECT_URI || '',
    environment: process.env.TRUELAYER_ENVIRONMENT || 'sandbox',
  };
}

export function getTrueLayerAuthBase(environment: string) {
  return environment === 'live'
    ? 'https://auth.truelayer.com/'
    : 'https://auth.truelayer-sandbox.com/';
}

export function getTrueLayerAuthUrl(state: string) {
  const config = getTrueLayerConfig();
  if (!config.clientId || !config.redirectUri) return null;

  const base = getTrueLayerAuthBase(config.environment);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: scopes.join(' '),
    providers: 'uk-ob-all uk-oauth-all',
    state,
  });

  return `${base}?${params.toString()}`;
}

export function hasTrueLayerConfig() {
  const config = getTrueLayerConfig();
  return Boolean(config.clientId && config.clientSecret && config.redirectUri);
}
