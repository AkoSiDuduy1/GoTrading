import { ethers } from 'ethers';
import Web3 from 'web3';
import { Log, provider, TransactionConfig, TransactionReceipt } from 'web3-core';
import { AggregatorUtils } from './v1/utils';
import { AggregatorStable } from './v1/aggregator';
import { HttpsProxyAgent } from 'https-proxy-agent';

// # user-land interface , core  should implement this
export enum EVMChain {
  ETH = 'eth',
}
export interface Aggregator {
  /**
   * Return a list of listing info about a single NFT.
   * - details: {@link }
   * @param contract The contract address of the collection
   * @param tokenId The token id of the nft
   * @returns Promise<{@link SingleNFTListingsResponse}>
   */
  getListingOfNFT(contract: string, tokenId: string): Promise<SingleNFTListingsResponse>;

  /**
   * Bulk buy nfts. If you know clearly about the nfts you want to buy, just put them into bulk buy, and you will get a result.
   * - details: {@link }
   * @param params {@link BulkBuyParams} nfts, callbacks and config
   * @returns void
   */
  bulkBuy(params: BulkBuyParams): void;

  /**
   * Return a list of listing info about a Ethereum address.
   * - details: {@link}
   * @param address The address of an account
   * @returns Promise<{@link SingleAddressListingsResponse}>
   */
  getListingsOfWallet(address: string): Promise<SingleAddressListingsResponse>;

  /**
   * Return a list of listing info about a single NFT.
   * - details: {@link }
   * @param params The post data{@link AggregateParams}
   * @returns Promise<{@link AggregateResponse}>
   */
  getAggregateInfo(params: AggregateParams): Promise<AggregateResponse>;

  /**
   * Return filtered items of an NFT collection. You can select traits, sorting and listing to filter a subset of items.
   * - details: {@link https://docs.nftgo.io/reference/get_filtered_nfts_eth_v1_collection__contract_address__filtered_nfts_get}
   * @param collectionContract The contract address of the collection
   * @param params The query params {@link FilteredNFTsParam}
   * @returns Promise<{@link FilteredNFTsResponse}>
   */
  getListingsOfCollection(contract: string, params?: FilteredNFTsParam): Promise<FilteredNFTsResponse>;
}

export type TransactionHashHandler = ((hash: string) => void) | null | undefined;
export type ReceiptHandler = ((receipt: TransactionReceipt) => void) | null | undefined;
export type ErrorHandler = ((error: Error) => void) | null | undefined;
export type FinallyHandler = (() => void) | null | undefined;
export interface BuyNFTsWithOrderIdsParams {
  buyer_address: string;
  order_ids: string[];
  is_safe_mode?: boolean;
}

export interface Transaction {
  on(type: 'transaction_hash', handler: TransactionHashHandler): Transaction;

  on(type: 'receipt', handler: ReceiptHandler): Transaction;

  on(type: 'error', handler: ErrorHandler): Transaction;

  on(
    type: 'error' | 'receipt' | 'transaction_hash',
    handler: (receipt: Error | TransactionReceipt | string | object) => void
  ): Transaction;
  finally(handler: FinallyHandler): void;
}

export interface DecodeLogRes {
  contract?: string;
  token_id?: string;
  amount?: number;
  is1155?: boolean;
  to?: string;
}

export interface InspectTransactionParams {
  hash: string;
  interval?: number;
}

export type UniqueNFTKey = string;
export interface Utils {
  /**
   * Return a unique key for a NFT.
   * - details: {@link }
   * @param contract The contract address of the collection
   * @param tokenId The token id of the nft
   * @returns string
   */
  genUniqueKeyForNFT({ contract, tokenId }: NFTBaseInfo): UniqueNFTKey;
  /**
   * Decode transaction log, return contract, token id, trading amount, buyer
   * - details: {@link }
   * @param log {@link Log} single log returned by send transaction method
   * @returns res {@link DecodeLogRes}
   */
  decodeLog(log: Log): DecodeLogRes | null;
  /**
   * Parse transacted NFTs from a transaction receipt
   * - details: {@link }
   * @param receipt {@link TransactionReceipt} transaction receipt returned by send transaction method
   * @returns Map<{@link UniqueNFTKey}, {@link NFTInfoForTrade}>
   */
  parseTransactedNFTs(receipt: TransactionReceipt): Map<UniqueNFTKey, NFTInfoForTrade> | undefined;
  /**
   * Send transaction with safe mode, using flash bot
   * - details: {@link }
   * @param transactionConfig {@link https://docs.ethers.io/v5/api/providers/types/#providers-TransactionRequest} transaction config
   * @returns transaction {@link Transaction}
   */
  sendSafeModeTransaction(transactionConfig: Partial<ethers.Transaction>): Transaction;
  /**
   * Send transaction
   * - details: {@link }
   * @param transactionConfig {@link https://web3js.readthedocs.io/en/v1.8.2/web3-eth.html#sendtransaction} transaction config
   * @returns transaction {@link Transaction}
   */
  sendTransaction(transactionConfig: TransactionConfig): Transaction;
  /**
   * inspect a transaction
   * - details: {@link }
   * @param params {@link InspectTransactionParams} transaction hash, inspect interval
   * @returns transaction {@link Transaction}
   */
  inspectTransaction(params: InspectTransactionParams): Transaction;
}

export interface GoTrading {
  aggregator: AggregatorStable;
  utils?: AggregatorUtils | null;
}

export interface HTTPClient {
  get<R, Q = undefined>(url: string, query: Q | undefined, headers?: Record<string, string>): Promise<R>;
  post<R, P = undefined>(url: string, data: P, headers?: Record<string, string>): Promise<R>;
}

export interface Config {
  api_key: string;
  chain?: EVMChain;
  base_url?: string;
  web3_provider?: provider;
  agent?: HttpsProxyAgent;
}

// # all below is POJO for response

/**
 * Last Sale，Last sale price of the NFT
 *
 * Sale
 */
export interface Sale {
  /**
   * Price，Transaction price
   */
  price: Price;
  /**
   * Price Token，Trade price quoted in transaction token
   */
  price_token: number;
  /**
   * Price Usd，The transaction price converted to USD
   */
  price_usd: number;
  /**
   * Time，Transaction timestamp in seconds
   */
  time: number;
  /**
   * Token Contract Address，Contract address of the token the sale was transacted in
   */
  token_contract_address: string;
  /**
   * Token Symbol，Symbol of the token the sale was transacted in
   */
  token_symbol: string;
  /**
   * Tx Hash，Transaction Hash
   */
  tx_hash: string;
  /**
   * Tx Url，Transaction url
   */
  tx_url: string;
}

/**
 * Price，Transaction price
 *
 * Price，Price in cryptocurrency or US dollars
 *
 * Listing Price，Listing price of the NFT
 */
export interface Price {
  /**
   * Crypto Unit，The crypto unit of measurement, e.g. ETH, USDC, DAI.
   */
  crypto_unit: string;
  /**
   * Quantity，(Deprecated) This field is deprecated and will be removed in the future. Use
   * {value} instead. Total value in the measure of {crypto_unit}
   */
  quantity: number;
  /**
   * Usd，Total US dollar value of the cryptocurrency. It equals to quantity * crypto_unit *
   * usd_price_per_crypto_unit
   */
  usd?: number;
  /**
   * Value，Total value in the measure of {crypto_unit}
   */
  value: number;
}

/**
 * Listinginfo
 */
export interface ListingInfo {
  /**
   * Contract，Address of the contract for this NFT collection, beginning with 0x
   */
  contract?: string;
  /**
   * Eth Price，The price(eth) of the NFT
   */
  eth_price?: number;
  /**
   * Expired Time，The listing expire time of the NFT
   */
  expired_time?: number;
  /**
   * Listing Time，The listing time of the NFT
   */
  listing_time?: number;
  /**
   * Market Link，The listing market link the NFT
   */
  market_link?: string;
  /**
   * Market Name，The listing market name the NFT
   */
  market_name?: string;
  /**
   * Order Id，ID for aggregate
   */
  order_id: string;
  /**
   * Seller Address，The seller address of the NFT
   */
  seller_address?: string;
  /**
   * Token Id，The token ID for this NFT. Each item in an NFT collection will be assigned a
   * unique id, the value generally ranges from 0 to N, with N being the total number of
   * NFTs in a collection.
   */
  token_id?: string;
  /**
   * Usd Price，The usd price(usd) of the NFT
   */
  usd_price?: number;
}

export interface NftListing {
  last_updated: number;
  nft_list: ListingInfo[];
}

/**
 * NFT
 */
export interface NFT {
  /**
   * Animation Url，The url of animation associated with the NFT
   */
  animation_url?: string;
  /**
   * Blockchain，Name of the blockchain the NFT belongs to
   */
  blockchain: string;
  /**
   * Collection Name，Name of the collection the NFT belongs to
   */
  collection_name?: string;
  /**
   * Collection Opensea Slug，Opensea Slug of the collection the NFT belongs to
   */
  collection_opensea_slug?: string;
  /**
   * Collection Slug，NFTGo Slug of the collection the NFT belongs to
   */
  collection_slug?: string;
  /**
   * Contract Address，Contract address of the collection the NFT belongs to
   */
  contract_address: string;
  contract_type: 'ERC1155' | 'ERC721';
  /**
   * Description，The description of the NFT
   */
  description?: string;
  /**
   * Image，The url or base64 data of image or video associated with the NFT
   */
  image?: string;
  /**
   * Last Sale，Last sale price of the NFT
   */
  last_sale?: Sale;
  listing_data?: NftListing;
  /**
   * Listing Price，Listing price of the NFT
   */
  listing_price?: Price;
  /**
   * Listing Time，Listing time of the NFT, formatted as timestamp in second.
   */
  listing_time?: number;
  /**
   * Marketplace，Listing marketplace of the NFT
   */
  marketplace?: string;
  /**
   * Marketplace Link，Marketplace link of the NFT
   */
  marketplace_link?: string;
  /**
   * Name，The name of the NFT
   */
  name?: string;
  /**
   * Owner Addresses，List of owner addresses currently holding the NFT.A list of one
   * address if it's an ERC721 NFT. A list of addresses if it's an ERC1155 NFT.
   */
  owner_addresses?: string[];
  /**
   * Rarity，NFT Rarity score. Calculation methods can be seen as below:
   * https://mirror.xyz/nftgoio.eth/kHWaMtNY6ZOvDzr7PR99D03--VNu6-ZOjYuf6E9-QH0
   */
  rarity?: Rarity;
  /**
   * Token Id，The token ID of the NFT
   */
  token_id: string;
  suspicious: boolean;
  /**
   * Traits，The list of NFT traits. Traits consist of a series of types and values, referring
   * to the feature of an NFT. For example, if a project has avatar NFTs, the traits may
   * include headwear, facial traits, clothes, etc. Traits make each item in an NFT collection
   * unique and determine its rarity in a collection.
   */
  traits?: Trait[];
}

/**
 * Rarity，NFT Rarity score. Calculation methods can be seen as below:
 * https://mirror.xyz/nftgoio.eth/kHWaMtNY6ZOvDzr7PR99D03--VNu6-ZOjYuf6E9-QH0
 *
 * Rarity，https://mirror.xyz/nftgoio.eth/kHWaMtNY6ZOvDzr7PR99D03--VNu6-ZOjYuf6E9-QH0
 */
export interface Rarity {
  /**
   * Rank，The rarity rank
   */
  rank: number;
  /**
   * Score，Rarity score. See methodology:
   * https://mirror.xyz/nftgoio.eth/kHWaMtNY6ZOvDzr7PR99D03--VNu6-ZOjYuf6E9-QH0
   */
  score: number;
  /**
   * Total，Total number of NFTs belonging to the colleciton involved in calculation of rarity
   */
  total: number;
}

/**
 * Trait，Trait of an NFT
 */
export interface Trait {
  /**
   * Percentage，The rarity percentage of trait
   */
  percentage?: number;
  /**
   * Type，The type of trait
   */
  type?: string;
  /**
   * Value，The value of trait
   */
  value?: string;
}

/**
 * TXInfo
 */
export interface TXInfo {
  /**
   * Data，The price(eth) of the NFT
   */
  data: string;
  /**
   * From Address，The address of the from
   */
  from_address: string;
  /**
   * To Address，The address of the to
   */
  to_address: string;
  /**
   * Value，The price(eth) of the NFT
   */
  value: number;
}

export type SortBy =
  | 'listing_price_low_to_high'
  | 'listing_price_high_to_low'
  | 'last_price_low_to_high'
  | 'last_price_high_to_low'
  | 'rarity_low_to_high'
  | 'rarity_high_to_low'
  | 'sales_time';

export interface BulkBuyParams {
  nfts: NFTInfoForTrade[];
  onSendingTransaction?: (hash: string) => void;
  onFinishTransaction?: (successNFTs: NFTBaseInfo[], failNFTs: NFTBaseInfo[], nftsListingInfo: NftsListingInfo) => void;
  onError?: (error: Error, nftsListingInfo?: NftsListingInfo) => void;
  config: {
    ignoreUnListedNFTs: boolean;
    ignoreInvalidOrders: boolean;
    ignoreSuspiciousOrders: boolean;
    withSafeMode: boolean;
  };
}

export interface FilteredNFTsParam {
  /**
   * Select specific traits for nft. Use '-' to join trait type and trait value, and ',' to join different traits. For example, 'Eyes-Bored,Fur-Trippy'. Default is None for not selecting traits.
   */
  traits?: string;
  /**
   * Sort by listing_price_low_to_high / listing_price_high_to_low / last_price_low_to_high / last_price_high_to_low / rarity_low_to_high / rarity_high_to_low / sales_time
   */
  sort_by?: SortBy;
  /**
   * The index of data segments. The returned data is divided into many segments. One segment is returned at a time. {offset} parameter indicates the index of data segments.
   */
  offset?: number; // default: 0
  /**
   * The size of a returned data segment
   */
  limit?: number; // default: 10
  /**
   * Queries can be searched with this keyword.
   */
  key_word?: string;
  /**
   * Queries can be bounded by a Min price and Max Price.
   */
  min_price?: number;
  /**
   * Queries can be bounded by a Min price and Max Price.
   */
  max_price?: number;
}

/**
 * NFT_list
 */
export interface FilteredNFTsResponse {
  /**
   * Nfts，List of NFTs in the collection
   */
  nfts: NFT[];
  /**
   * Total，Total number of items
   */
  total: number;
}

/**
 * NftListing
 */
export interface SingleNFTListingsResponse {
  /**
   * Last Updated，Last updated timestamp in seconds
   */
  last_updated: number;
  /**
   * Nft List
   */
  nft_list: ListingInfo[];
}

/**
 * OrderInfo
 */
export interface MultiNFTListingsResponse {
  /**
   * Orders
   */
  orders: OrderInfo[];
}

/**
 * _OrderInfo
 */
export interface OrderInfo {
  /**
   * Blockchain，The blockchain the collection belongs to
   */
  blockchain: string;
  /**
   * Contract，Address of the contract for this NFT collection, beginning with 0x
   */
  contract_address: string;
  listing_data?: NftListing;
  /**
   * Token Id，The token ID for this NFT. Each item in an NFT collection     will be assigned a
   * unique id, the value generally ranges from 0 to     N,  with N being the total number of
   * NFTs in a collection.
   */
  token_id: string;
}

/**
 * NftListing
 */
export interface SingleAddressListingsResponse {
  /**
   * Last Updated，Last updated timestamp in seconds
   */
  last_updated: number;
  /**
   * Nft List
   */
  nfts: NFT[];
}

/**
 * Body_aggregate_eth_v1_nft_aggregate_aggregate_post
 */
export interface AggregateParams {
  /**
   * Buyer Address，Address of buyer.
   */
  buyer_address: string;
  /**
   * Is Safe，Is it safe mode? true or false
   */
  is_safe?: boolean;
  /**
   * Order Ids，A list of orderIds.order id is from listing API.
   */
  order_ids: string[];
}

/**
 * AggregateResult
 */
export interface AggregateResponse {
  /**
   * Gas Limit，The gas limit
   */
  gas_limit: number;
  /**
   * Saving Gas，The saving gas
   */
  saving_gas: number;
  /**
   * Invalid Ids，The Invalid IDs
   */
  invalid_ids: string[];
  tx_info: TXInfo;
  /**
   * Used Gas，The used gas
   */
  used_gas: number;
}

export interface NFTBaseInfo {
  contract?: string;
  tokenId?: string;
}

export interface NFTInfoForTrade extends NFTBaseInfo {
  amount: number; // The amount of ERC721 nft should only be 1
}
export interface NftsListingInfo {
  validOrders: ListingInfo[];
  expireNFTs: NFTBaseInfo[];
  expireOrders: ListingInfo[];
  unListNFTs: NFTBaseInfo[];
  yourOwnNFTs: NFTBaseInfo[];
  suspiciousNFTs: NFTBaseInfo[];
  suspiciousOrders: ListingInfo[];
}
