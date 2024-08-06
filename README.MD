# SampleName-Protocol Docs

This is the documentation for the SampleName-Protocol. It is a protocol for Lending & Borrowing.

## Important Contracts for implementation

### CErc20 / CETH

Each asset supported is integrated through a cToken contract, which is an EIP-20 compliant representation of balances supplied to the protocol. By minting cTokens, users (1) earn interest through the cToken’s exchange rate, which increases in value relative to the underlying asset, and (2) gain the ability to use cTokens as collateral.

cTokens are the primary means of interacting with the Compound Protocol; when a user mints, redeems, borrows, repays a borrow, liquidates a borrow, or transfers cTokens, she will do so using the cToken contract.

There are currently two types of cTokens: CErc20 and CEther. Though both types expose the EIP-20 interface, CErc20 wraps an underlying ERC-20 asset, while CEther simply wraps Ether itself. As such, the core functions which involve transferring an asset into the protocol have slightly different interfaces depending on the type, each of which is shown below.

-Write Functions-

#### Mint

The mint function transfers an asset into the protocol, which begins accumulating interest based on the current Supply Rate for the asset. The user receives a quantity of cTokens equal to the underlying tokens supplied, divided by the current Exchange Rate.

CErc20

`	function mint(uint mintAmount) returns (uint)`

msg.sender: The account which shall supply the asset, and own the minted cTokens.
mintAmount: The amount of the asset to be supplied, in units of the underlying asset.
RETURN: 0 on success, otherwise an Error code Before supplying an asset, users must first approve the cToken to access their token balance.

CEther

`	function mint() payable`

msg.value: The amount of ether to be supplied, in wei.
msg.sender: The account which shall supply the ether, and own the minted cTokens.
RETURN: No return, reverts on error.

#### Redeem

The redeem function converts a specified quantity of cTokens into the underlying asset, and returns them to the user. The amount of underlying tokens received is equal to the quantity of cTokens redeemed, multiplied by the current Exchange Rate. The amount redeemed must be less than the user’s Account Liquidity and the market’s available liquidity.

`	function redeem(uint redeemTokens) returns (uint)`

msg.sender: The account which shall redeem the cTokens, and own the redeemed tokens.
redeemTokens: The amount of cTokens to be redeemed, in units of the underlying asset.
RETURN: 0 on success, otherwise an Error code

#### Redeem Underlying

The redeem underlying function converts cTokens into a specified quantity of the underlying asset, and returns them to the user. The amount of cTokens redeemed is equal to the quantity of underlying tokens received, divided by the current Exchange Rate. The amount redeemed must be less than the user’s Account Liquidity and the market’s available liquidity.

`	function redeemUnderlying(uint redeemAmount) returns (uint)`

msg.sender: The account to which redeemed funds shall be transferred.
redeemAmount: The amount of underlying tokens to be redeemed.
RETURN: 0 on success, otherwise an Error code

#### Borrow

The borrow function transfers an asset from the protocol to the user, and creates a borrow balance which begins accumulating interest based on the Borrow Rate for the asset. The amount borrowed must be less than the user’s Account Liquidity and the market’s available liquidity. To borrow Ether, the borrower must be ‘payable’ (solidity).

CErc20 / CEther

`	function borrow(uint borrowAmount) returns (uint)`

msg.sender: The account to which borrowed funds shall be transferred.
borrowAmount : The amount of the underlying asset to be borrowed.
RETURN: 0 on success, otherwise an Error code

#### Repay Borrow

The repay function transfers an asset into the protocol, reducing the user’s borrow balance.

CErc20

`	function repayBorrow(uint repayAmount) returns (uint)`

msg.sender: The account which borrowed the asset, and shall repay the borrow.
repayAmount: The amount of the underlying borrowed asset to be repaid. A value of -1 (i.e. 2^256 - 1) can be used to repay the full amount.
RETURN: 0 on success, otherwise an Error code Before repaying an asset, users must first approve the cToken to access their token balance.

CEther

`	function repayBorrow() payable`

msg.value: The amount of ether to be repaid, in wei.
msg.sender: The account which borrowed the asset, and shall repay the borrow.
RETURN: No return, reverts on error.

#### Repay Borrow Behalf

The repay function transfers an asset into the protocol, reducing the target user’s borrow balance.

CErc20

`	function repayBorrowBehalf(address borrower, uint repayAmount) returns (uint)`

msg.sender: The account which shall repay the borrow.
borrower: The account which borrowed the asset to be repaid.
repayAmount: The amount of the underlying borrowed asset to be repaid. A value of -1 (i.e. 2^256 - 1) can be used to repay the full amount.
RETURN: 0 on success, otherwise an Error code Before repaying an asset, users must first approve the cToken to access their token balance.

CEther

`	function repayBorrowBehalf(address borrower) payable`

msg.value: The amount of ether to be repaid, in wei.
msg.sender: The account which shall repay the borrow.
borrower: The account which borrowed the asset to be repaid.
RETURN: No return, reverts on error.

#### Liquidate Borrow

A user who has negative account liquidity is subject to liquidation by other users of the protocol to return his/her account liquidity back to positive (i.e. above the collateral requirement). When a liquidation occurs, a liquidator may repay some or all of an outstanding borrow on behalf of a borrower and in return receive a discounted amount of collateral held by the borrower; this discount is defined as the liquidation incentive. A liquidator may close up to a certain fixed percentage (i.e. close factor) of any individual outstanding borrow of the underwater account. Unlike in v1, liquidators must interact with each cToken contract in which they wish to repay a borrow and seize another asset as collateral. When collateral is seized, the liquidator is transferred cTokens, which they may redeem the same as if they had supplied the asset themselves. Users must approve each cToken contract before calling liquidate (i.e. on the borrowed asset which they are repaying), as they are transferring funds into the contract.

CErc20

`	function liquidateBorrow(address borrower, uint amount, address collateral) returns (uint)`

msg.sender: The account which shall liquidate the borrower by repaying their debt and seizing their collateral.
borrower: The account with negative account liquidity that shall be liquidated.
repayAmount: The amount of the borrowed asset to be repaid and converted into collateral, specified in units of the underlying borrowed asset.
cTokenCollateral: The address of the cToken currently held as collateral by a borrower, that the liquidator shall seize.
RETURN: 0 on success, otherwise an Error code Before supplying an asset, users must first approve the cToken to access their token balance.

CEther

`	function liquidateBorrow(address borrower, address cTokenCollateral) payable`
msg.value: The amount of ether to be repaid and converted into collateral, in wei.
msg.sender: The account which shall liquidate the borrower by repaying their debt and seizing their collateral.
borrower: The account with negative account liquidity that shall be liquidated.
cTokenCollateral: The address of the cToken currently held as collateral by a borrower, that the liquidator shall seize.
RETURN: No return, reverts on error.

-Read Functions-

#### Exchange Rate

Each cToken is convertible into an ever increasing quantity of the underlying asset, as interest accrues in the market. The exchange rate between a cToken and the underlying asset is equal to

#### Get Cash

Cash is the amount of underlying balance owned by this cToken contract. One may query the total amount of cash currently available to this market.

#### Total Borrows

Total Borrows is the amount of underlying currently loaned out by the market, and the amount upon which interest is accumulated to suppliers of the market.

#### Borrow Balance

A user who borrows assets from the protocol is subject to accumulated interest based on the current borrow rate. Interest is accumulated every block and integrations may use this function to obtain the current value of a user’s borrow balance with interest.

#### Borrow Rate

At any point in time one may query the contract to get the current borrow rate per block.

#### Underlying Balance

The user’s underlying balance, representing their assets in the protocol, is equal to the user’s cToken balance multiplied by the Exchange Rate.

#### Supply Rate

At any point in time one may query the contract to get the current supply rate per block. The supply rate is derived from the borrow rate, reserve factor and the amount of total borrows.

#### Total Reserves

Reserves are an accounting entry in each cToken contract that represents a portion of historical interest set aside as cash which can be withdrawn or transferred through the protocol’s governance. A small portion of borrower interest accrues into the protocol, determined by the reserve factor.

#### Reserve Factor

The reserve factor defines the portion of borrower interest that is converted into reserves.

### Comptroller

The Comptroller is the risk management layer; it determines how much collateral a user is required to maintain, and whether (and by how much) a user can be liquidated. Each time a user interacts with a cToken, the Comptroller is asked to approve or deny the transaction.

The Comptroller maps user balances to prices (via the Price Oracle) to risk weights (called Collateral Factors) to make its determinations. Users explicitly list which assets they would like included in their risk scoring, by calling Enter Markets and Exit Market.

### SimplePriceOracle

A simple Oracle which pushes the price to the Comptroller manually.

-Write Functions-

#### setUnderlyingPrice

Sets the price of the underlying asset with the price scaled by 1e18.

`function setUnderlyingPrice(CToken cToken, uint underlyingPriceMantissa)`

#### setDirectPrice

Sets the price of the asset.

`function setDirectPrice(address asset, uint price) public`

-Read Functions-

#### getUnderlyingPrice

Gets the price of the underlying asset.

`function getUnderlyingPrice(CToken cToken) public override view returns (uint)`

#### getUnderlyingAddress

Gets the address of the underlying asset.

`function _getUnderlyingAddress(CToken cToken) private view returns (address)`

## Developer Guide

Set Admin addresses

- Unitroller
- Comptroller
- Price Oracle

Configure Comptroller

-

## Addresses

The addresses of the contracts are in the [addresses.MD](addresses.MD) file.