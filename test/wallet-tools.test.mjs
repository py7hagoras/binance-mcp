import assert from 'node:assert/strict';
import test from 'node:test';
import { BinanceAPI } from '../build/binance-api.js';

function createApi() {
  const api = new BinanceAPI({ apiKey: 'test-key', apiSecret: 'test-secret' });
  const requests = [];

  api.client = {
    async get(path, config) {
      requests.push({ method: 'GET', path, config });
      return { data: [] };
    },
    async post(path, body, config) {
      requests.push({ method: 'POST', path, body, config });
      return { data: [] };
    },
  };

  return { api, requests };
}

test('read-only wallet methods route to the documented Binance endpoints', async () => {
  const { api, requests } = createApi();

  await api.getWalletBalances();
  await api.getApiRestrictions();
  await api.getFundingWallet('USDT', false);
  await api.getSimpleEarnAccount();
  await api.getSimpleEarnFlexiblePositions({ asset: 'USDT', size: 10 });
  await api.getSimpleEarnLockedPositions({ asset: 'BNB', size: 10 });
  await api.getUsdmFuturesBalances();
  await api.getCoinmFuturesBalances();
  await api.getCrossMarginAccount();
  await api.getIsolatedMarginAccount('BTCUSDT');

  assert.deepEqual(
    requests.map(({ method, path }) => `${method} ${path}`),
    [
      'GET /sapi/v1/asset/wallet/balance',
      'GET /sapi/v1/account/apiRestrictions',
      'POST /sapi/v1/asset/get-funding-asset',
      'GET /sapi/v1/simple-earn/account',
      'GET /sapi/v1/simple-earn/flexible/position',
      'GET /sapi/v1/simple-earn/locked/position',
      'GET /fapi/v3/balance',
      'GET /dapi/v1/balance',
      'GET /sapi/v1/margin/account',
      'GET /sapi/v1/margin/isolated/account',
    ]
  );

  assert.equal(requests[2].config.params.asset, 'USDT');
  assert.equal(requests[2].config.params.needBtcValuation, 'false');
  assert.equal(requests[6].config.baseURL, 'https://fapi.binance.com');
  assert.equal(requests[7].config.baseURL, 'https://dapi.binance.com');
  assert.equal(requests[9].config.params.symbols, 'BTCUSDT');

  for (const request of requests) {
    assert.equal(typeof request.config.params.timestamp, 'number');
    assert.equal(typeof request.config.params.signature, 'string');
    assert.ok(request.config.params.signature.length > 0);
  }
});
