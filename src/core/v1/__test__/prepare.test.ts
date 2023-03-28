import { HTTPClient } from '../../interface';
import { ListingIndexerStable } from '../listing-indexer';
import { ExternalHTTPClient } from '../../internal-http-client';
import { AggregatorUtils } from '../utils';
import { mockListingStepData, mockLooksRareOrder, mockNFTs, mockOpenSeaOrder, mockX2y2Order } from './mock';
import { initConfig } from './config';

const config = initConfig();
let httpClient: HTTPClient = new ExternalHTTPClient(config?.agent);

describe('prepareListing api testing [OpenSea,LooksRare,X2Y2] ', () => {
  const utils = new AggregatorUtils(config.web3Provider, config.walletConfig);
  let listingIndexer: ListingIndexerStable;

  beforeEach(() => {
    listingIndexer = new ListingIndexerStable(httpClient, config, utils);
  });

  test('should create an instance of ListingIndexerStable', () => {
    expect(listingIndexer).toBeInstanceOf(ListingIndexerStable);
  });

  test('empty prepare listing', async () => {
    expect.assertions(1);
    try {
      await listingIndexer.prepareListing([]);
    } catch (e) {
      expect(e).toEqual("The param 'nfts' is invalid. nfts should not be empty");
    }
  }, 3000);

  test('single opensea prepare listing', async () => {
    try {
      const result = await listingIndexer.prepareListing([mockOpenSeaOrder]);
      expect(result).toMatchObject(mockListingStepData);
    } catch (e) {
      console.error(e);
    }
  }, 3000);

  test('single looksRare prepare listing', async () => {
    try {
      const result = await listingIndexer.prepareListing([mockLooksRareOrder]);
      expect(result).toMatchObject(mockListingStepData);
    } catch (e) {
      console.error(e);
    }
  }, 3000);

  test('single x2y2 prepare listing', async () => {
    try {
      const result = await listingIndexer.prepareListing([mockX2y2Order]);
      expect(result).toMatchObject(mockListingStepData);
    } catch (e) {
      console.error(e);
    }
  }, 3000);

  test('bulk nfts & markets prepare listing', async () => {
    try {
      const result = await listingIndexer.prepareListing([mockOpenSeaOrder, mockLooksRareOrder, mockX2y2Order]);
      expect(result).toMatchObject(mockListingStepData);
    } catch (e) {
      console.error(e);
    }
  });
});
