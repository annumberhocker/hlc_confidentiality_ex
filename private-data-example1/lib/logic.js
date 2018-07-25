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
* Place an order; Seller creates an order 
* @param {org.privatedata.exampleone.CreateOrder} tx_CreateOrder 
* @transaction
*/
async function tx_CreateOrder(orderRequest) { // eslint-disable-line no-unused-vars
 // Incoming Data: orderId, Buyer, Seller, sellerInfo string, buyerInfo string 

 const factory = getFactory();
 const namespace = 'org.privatedata.exampleone';

 // Create a new Order Asset
 const order = factory.newResource(namespace, 'Order', orderRequest.orderId);

 // Create a new Seller relationship and assign to new Order Asset.
 order.seller = factory.newRelationship(namespace, 'Seller',  
orderRequest.seller.getIdentifier());

 // Create a new Buyer relationship and assign to new Order Asset.
 order.buyer = factory.newRelationship(namespace, 'Buyer', 
orderRequest.buyer.getIdentifier());

 // Assign incoming data to new Order Asset
 order.price = orderRequest.price;
 order.sellerInfo = orderRequest.sellerInfo; 
 order.buyerInfo = orderRequest.buyerInfo; 

 // save the new Order Asset in the Asset Registry
 const assetRegistry1 = await getAssetRegistry(order.getFullyQualifiedType());
 await assetRegistry1.add(order);
}

/**
* Update the Seller info
* @param {org.privatedata.exampleone.UpdateOrderSellerInfo} tx_UpdateOrderSellerInfo
* @transaction
*/
async function tx_UpdateOrderSellerInfo (incomingData) {
 // incomingData: Order order; String newInfo

 const namespace = 'org.privatedata.exampleone';
 const assetRegistry = await getAssetRegistry(namespace + '.Order');
 var order = await assetRegistry.get(incomingData.order.getIdentifier());
 order.sellerInfo += "; " + incomingData.newInfo;
 await assetRegistry.update(order);
}

/**
* Update the Buyer info
* @param {org.privatedata.exampleone.UpdateOrderBuyerInfo} tx_UpdateOrderBuyerInfo
* @transaction
*/
async function tx_UpdateOrderBuyerInfo (incomingData) {
// incomingData: Order order; String newInfo

  const namespace = 'org.privatedata.exampleone';

  // Currently, only the UPDATE logic is here. 
  const assetRegistry = await getAssetRegistry(namespace + '.Order');
  var order = await assetRegistry.get(incomingData.order.getIdentifier());
  order.buyerInfo += "; " + incomingData.newInfo;
  await assetRegistry.update(order);
}

/**
* Update price in Asset:Order;  Seller only can update price; 
* @param {org.privatedata.exampleone.UpdateOrderPrice} tx_UpdateOrderPrice
* @transaction
*/
async function tx_UpdateOrderPrice (incomingData) {
 // incomingData: Order order; Double newPrice

 const namespace = 'org.privatedata.exampleone';

 // fetch the order; access (update) the price
 const assetRegistry = await getAssetRegistry(namespace + '.Order');
 var order = await assetRegistry.get(incomingData.order.getIdentifier());
 order.price = incomingData.newPrice;
 await assetRegistry.update(order);
}

/**
* Functionality: Gets the order info from the Registry; 
* @param {org.privatedata.exampleone.GetOrderInfo} tx_GetOrderInfo
* @transaction
*/
async function tx_GetOrderInfo (incomingData) {
    // incomingData: Account account; 
    
    const namespace = 'org.privatedata.exampleone';
  
    var event1 = getFactory().newEvent (namespace, "e_GetOrderPrice");
    var event2 = getFactory().newEvent (namespace, "e_GetSellerInfo");
    var event3 = getFactory().newEvent (namespace, "e_GetBuyerInfo");
   
    event1.orderId = event2.orderId = event3.orderId = incomingData.account.getIdentifier();
    event1.price = incomingData.order.price;    
    event2.sellerInfo = incomingData.order.sellerInfo;    
    event3.buyerInfo = incomingData.order.buyerInfo;    
  
    //  this serves as a means for a participant to READ the order
    emit(event1);
    emit(event2);
    emit(event3);
}