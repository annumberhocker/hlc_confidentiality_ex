/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Place an order 
 * @param {org.privatedata.exampletwo.CreateOrder} tx_CreateOrder - the CreateOrder transaction
 * @transaction
 */
async function tx_CreateOrder(orderRequest) { // eslint-disable-line no-unused-vars
    // Incoming Data: Order, Seller, Buyer, price, buyerInfo string, sellerInfo string 

  const factory = getFactory();
  const namespace = 'org.privatedata.exampletwo';

  // Create a new Order Asset
  const order = factory.newResource(namespace, 'Order', orderRequest.order.getIdentifier());
  // Create a new Seller relationship and assign to new Order Asset. Use incoming Seller id
  order.seller = factory.newRelationship(namespace, 'Seller', orderRequest.seller.getIdentifier());
  // Create a new Carrie relationship and assign to new Order Asset. Use incoming Carrier id
  order.buyer = factory.newRelationship(namespace, 'Buyer', orderRequest.buyer.getIdentifier());
  
  // Assign incoming buyerInfo and price to new Order Asset
  order.price = orderRequest.price;
  order.buyerInfo = orderRequest.buyerInfo;

  // Create a new OrderSellerInfo Asset
  const sellerInfo = factory.newResource(namespace, 'OrderSellerInfo', orderRequest.order.getIdentifier());
  // Assign incoming sellerInfo to new OrderSellerInfo Asset just created
  sellerInfo.info = orderRequest.sellerInfo;
  // Need to set Seller in PrivateInfo Asset for queries to access. Having trouble with indirection in query rules.
  sellerInfo.seller = order.seller;
  // Connect Private Info and Order
  sellerInfo.order = order;
  // privateInfo.order = factory.newRelationship(namespace, 'Order', orderRequest.order.getIdentifier());
  order.sellerInfo = sellerInfo;
  
  // save the new Order Asset in the Asset Registry
  const assetRegistry1 = await getAssetRegistry(order.getFullyQualifiedType());
  await assetRegistry1.add(order);
  const assetRegistry2 = await getAssetRegistry(sellerInfo.getFullyQualifiedType());
  await assetRegistry2.add(sellerInfo);
}

/**
* Update the public notes
* @param {org.privatedata.exampletwo.UpdateOrderBuyerInfo} tx_UpdateOrderBuyerInfo
* @transaction
*/
async function tx_UpdateOrderBuyerInfo(incomingData) {
  // incomingData: Order order; String newNotes

  const namespace = 'org.privatedata.exampletwo';

  // Currently, only the UPDATE logic is here. 
   const assetRegistry = await getAssetRegistry(namespace + '.Order');
   var order = await assetRegistry.get(incomingData.order.getIdentifier());
   order.buyerInfo += "; " + incomingData.newInfo;
   await assetRegistry.update(order);
}

/**
* Update the Seller Private notes
* @param {org.privatedata.exampletwo.UpdateOrderSellerInfo} tx_UpdateOrderSellerInfo
* @transaction
*/
async function tx_UpdateOrderSellerInfo(incomingData) {
  // incomingData: Order order; String newNotes

  const namespace = 'org.privatedata.exampletwo';

  // update the orderSellerInfo
  const assetRegistry = await getAssetRegistry(namespace + '.OrderSellerInfo');
  var orderSellerInfo = await assetRegistry.get(incomingData.order.getIdentifier());
  orderSellerInfo.info += "; " + incomingData.newInfo;
  await assetRegistry.update(orderSellerInfo);
}