/**
 * This file contains typedefs for the entire e-commerce backend logic,
 * based on the comprehensive markdown reference specs.
 */

// ==========================================
// FEATURE 01: PRODUCTS
// ==========================================

/**
 * @typedef {Object} ProductVariant
 * @property {string} id
 * @property {string} size
 * @property {string} color
 * @property {string} sku
 * @property {number} stock
 * @property {number} priceOverride  // nullable; falls back to Product.basePrice
 * @property {string} barcode
 * @property {boolean} discontinued
 * @property {number} weight         // nullable override
 * @property {string} imageId        // nullable
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {string[]} images
 * @property {string} categoryId
 * @property {string[]} tags
 * @property {number} basePrice
 * @property {number} compareAtPrice
 * @property {'live'|'draft'|'pending_review'|'archived'} status
 * @property {ProductVariant[]} variants
 * @property {number} lowStockThreshold
 * @property {number} totalStock
 * @property {number} rating
 * @property {number} reviewCount
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} vendor
 * @property {string} productType
 * @property {string} seoTitle
 * @property {string} seoDescription
 * @property {string[]} collections
 * @property {string} shippingProfileId
 * @property {number} weight
 * @property {{length: number, width: number, height: number}} dimensions
 * @property {'taxable'|'exempt'} taxStatus
 * @property {number} costPerItem
 * @property {boolean} trackQuantity
 * @property {boolean} allowBackorder
 * @property {string[]} channels
 * @property {string} rejectionReason
 * @property {string} submittedBy
 * @property {string} approvedBy
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} description
 * @property {'manual'|'automatic'} ruleType
 * @property {{field: string, operator: string, value: string}[]} rules
 * @property {string[]} productIds
 */

// ==========================================
// FEATURE 02: INVENTORY
// ==========================================

/**
 * @typedef {Object} Location
 * @property {string} id
 * @property {string} name
 * @property {'warehouse'|'retail'|'dropship'} type
 * @property {Address} address
 * @property {boolean} isDefault
 * @property {boolean} isFulfillmentEnabled
 */

/**
 * @typedef {Object} InventoryLevel
 * @property {string} id
 * @property {string} variantId
 * @property {string} locationId
 * @property {number} onHand
 * @property {number} reserved
 * @property {number} incoming
 */

/**
 * @typedef {Object} StockMovement
 * @property {string} id
 * @property {string} variantId
 * @property {string} locationId
 * @property {number} quantityChange
 * @property {'sale'|'purchase_order_received'|'transfer_in'|'transfer_out'|'return_to_stock'|'damaged'|'theft_or_loss'|'cycle_count_correction'|'manual_correction_other'} reason
 * @property {string} note
 * @property {'order'|'purchase_order'|'transfer'|'manual'} referenceType
 * @property {string} referenceId
 * @property {string} actorId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} contactEmail
 * @property {string} contactPhone
 * @property {number} leadTimeDays
 * @property {string} paymentTerms
 */

/**
 * @typedef {Object} PurchaseOrder
 * @property {string} id
 * @property {string} poNumber
 * @property {string} supplierId
 * @property {string} destinationLocationId
 * @property {'draft'|'submitted'|'partially_received'|'received'|'closed'|'cancelled'} status
 * @property {{variantId: string, quantityOrdered: number, quantityReceived: number, unitCost: number}[]} lines
 * @property {string} expectedDeliveryDate
 * @property {string} createdAt
 * @property {string} receivedAt
 */

/**
 * @typedef {Object} Transfer
 * @property {string} id
 * @property {string} sourceLocationId
 * @property {string} destinationLocationId
 * @property {'draft'|'in_transit'|'completed'|'cancelled'} status
 * @property {{variantId: string, quantityShipped: number, quantityReceived: number}[]} lines
 * @property {string} createdAt
 * @property {string} completedAt
 */

// ==========================================
// FEATURE 03: ORDERS
// ==========================================

/**
 * @typedef {Object} Address
 * @property {string} line1
 * @property {string} line2
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country
 */

/**
 * @typedef {Object} Customer
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {Address} defaultAddress
 * @property {number} lifetimeValue
 * @property {number} ordersCount
 * @property {string} createdAt
 */

/**
 * @typedef {Object} OrderLineItem
 * @property {string} productId
 * @property {string} variantId
 * @property {string} titleSnapshot
 * @property {number} unitPrice
 * @property {number} quantity
 * @property {'unfulfilled'|'fulfilled'|'backordered'} fulfillmentStatus
 * @property {boolean} returnEligible
 * @property {string} locationId
 */

/**
 * @typedef {Object} StatusHistoryEntry
 * @property {'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED'|'REFUNDED'|'ON_HOLD'} status
 * @property {string} timestamp
 * @property {string} note
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} customerId
 * @property {OrderLineItem[]} items
 * @property {Address} shippingAddress
 * @property {'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED'|'REFUNDED'|'ON_HOLD'} status
 * @property {StatusHistoryEntry[]} statusHistory
 * @property {string} trackingId
 * @property {string} carrier
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} discountAmount
 * @property {string} promotionCodeApplied
 * @property {number} tax
 * @property {number} total
 * @property {'unpaid'|'authorized'|'paid'|'refunded'|'partially_refunded'|'voided'} paymentStatus
 * @property {boolean} isDraft
 * @property {string[]} tags
 * @property {{body: string, authorId: string, createdAt: string}[]} internalNotes
 * @property {{body: string, authorId: string, createdAt: string, sentToCustomer: boolean}[]} customerNotes
 * @property {'low'|'medium'|'high'} riskLevel
 * @property {string} channel
 * @property {'unfulfilled'|'partial'|'fulfilled'} fulfillmentStatus
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Return
 * @property {string} id
 * @property {string} orderId
 * @property {string[]} lineItemRefs
 * @property {'wrong_item'|'defective'|'no_longer_wanted'|'size_fit'|'damaged_in_transit'|'other'} reason
 * @property {string} reasonNote
 * @property {'refund'|'exchange'|'store_credit'} requestedResolution
 * @property {'requested'|'approved'|'rejected'|'awaiting_receipt'|'received'|'inspected'|'resolved'} status
 * @property {'resellable'|'damaged'|'defective'} inspectionResult
 * @property {number} restockingFeeApplied
 * @property {string} createdAt
 * @property {string} resolvedAt
 */

/**
 * @typedef {Object} RefundRecord
 * @property {string} id
 * @property {string} orderId
 * @property {string} returnId
 * @property {number} amount
 * @property {string} reason
 * @property {string} createdAt
 */

// ==========================================
// FEATURE 04: SHIPPING
// ==========================================

/**
 * @typedef {Object} ShippingZone
 * @property {string} id
 * @property {string} name
 * @property {number} priority
 * @property {{country: string, states: string[]}[]} regions
 * @property {'flat'|'weight_based'|'carrier_calculated'} rateStrategy
 * @property {{minOrderValue: number, maxOrderValue: number, price: number}[]} flatRateTable
 * @property {{minWeight: number, maxWeight: number, price: number}[]} weightRateTable
 * @property {number} freeShippingThreshold
 */

/**
 * @typedef {Object} Carrier
 * @property {string} id
 * @property {string} name
 * @property {{id: string, label: string, estimatedDaysMin: number, estimatedDaysMax: number}[]} serviceLevels
 * @property {boolean} isConnected
 */

/**
 * @typedef {Object} Shipment
 * @property {string} id
 * @property {string} orderId
 * @property {string[]} lineItemRefs
 * @property {string} trackingId
 * @property {string} carrier
 * @property {string} locationId
 * @property {string} shippedAt
 * @property {string} deliveredAt
 * @property {string} packagingId
 * @property {number} weight
 * @property {number} rateCharged
 * @property {string} serviceLevel
 * @property {'label_created'|'in_transit'|'out_for_delivery'|'delivered'|'delivery_exception'} trackingStatus
 * @property {{status: string, location: string, timestamp: string}[]} trackingHistory
 */

/**
 * @typedef {Object} Packaging
 * @property {string} id
 * @property {string} name
 * @property {'box'|'envelope'|'custom'} type
 * @property {number} length
 * @property {number} width
 * @property {number} height
 * @property {number} maxWeight
 * @property {boolean} isDefault
 */

// ==========================================
// FEATURE 05: DASHBOARD (NO NEW PERSISTED DATA EXCEPT LAYOUT)
// ==========================================
/**
 * @typedef {Object} DashboardLayoutPreference
 * @property {string} adminUserId
 * @property {string[]} widgetOrder
 * @property {string[]} hiddenWidgets
 */

// ==========================================
// FEATURE 06: ANALYTICS
// ==========================================
/**
 * @typedef {Object} ProductViewEvent
 * @property {string} id
 * @property {string} productId
 * @property {string} sessionId
 * @property {string} timestamp
 */

/**
 * @typedef {Object} Cart
 * @property {string} id
 * @property {string} sessionId
 * @property {string} customerId
 * @property {{variantId: string, quantity: number}[]} items
 * @property {'active'|'abandoned'|'converted'} status
 * @property {string} lastActivityAt
 * @property {string} convertedOrderId
 */

/**
 * @typedef {Object} SavedReport
 * @property {string} id
 * @property {string} adminUserId
 * @property {string} name
 * @property {'orders'|'products'|'customers'} baseEntity
 * @property {string[]} dimensions
 * @property {string[]} metrics
 * @property {Object} filters
 */

// ==========================================
// FEATURE 07: FINANCIALS
// ==========================================

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {'sale'|'refund'|'platform_fee'|'payment_processing_fee'|'chargeback'|'adjustment'} type
 * @property {string} orderId
 * @property {number} grossAmount
 * @property {number} feeAmount
 * @property {number} netAmount
 * @property {'pending'|'settled'|'paid_out'} status
 * @property {string} jurisdiction
 * @property {string} createdAt
 * @property {string} settledAt
 */

/**
 * @typedef {Object} Payout
 * @property {string} id
 * @property {string} periodStart
 * @property {string} periodEnd
 * @property {number} grossRevenue
 * @property {number} platformFees
 * @property {number} refunds
 * @property {number} netPayout
 * @property {'scheduled'|'processing'|'paid'} status
 * @property {string} paidAt
 * @property {string[]} transactionIds
 * @property {'bank_transfer'|'manual'} method
 */

/**
 * @typedef {Object} PlatformFeeRule
 * @property {string} id
 * @property {'percentage'|'flat'} type
 * @property {number} value
 * @property {string} appliesTo
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} PaymentProcessingFeeRule
 * @property {string} id
 * @property {number} percentageComponent
 * @property {number} flatComponent
 * @property {string} currency
 */

/**
 * @typedef {Object} Expense
 * @property {string} id
 * @property {string} category
 * @property {number} amount
 * @property {string} note
 * @property {string} incurredAt
 */

// ==========================================
// FEATURE 08: SETTINGS
// ==========================================

/**
 * @typedef {Object} StoreSettings
 * @property {string} storeName
 * @property {string} currency
 * @property {string} timezone
 * @property {string} contactEmail
 * @property {boolean} autoApproveProducts
 * @property {boolean} autoApproveReviews
 * @property {number} defaultLowStockThreshold
 * @property {number} taxRatePercent
 * @property {number} flatShippingRate
 * @property {number} freeShippingThreshold
 * @property {'before'|'after'} currencyPosition
 * @property {'kg'|'lb'} weightUnit
 * @property {'cm'|'in'} dimensionUnit
 * @property {'exclusive'|'inclusive'} taxMode
 * @property {boolean} digitalGoodsTaxable
 * @property {boolean} guestCheckoutAllowed
 * @property {number} orderEditWindowHours
 * @property {number} minOrderValue
 * @property {number} abandonedCartThresholdHours
 * @property {string} defaultLocationId
 * @property {'nearest_to_customer'|'primary_warehouse_first'|'most_available_stock'} locationPriorityStrategy
 * @property {{frequency: 'daily'|'weekly'|'monthly', weekday: number, dayOfMonth: number, minimumBalance: number}} payoutSchedule
 * @property {number} returnWindowDays
 * @property {number} returnAutoApprovalThreshold
 * @property {number} restockingFeePercent
 * @property {string[]} finalSaleCategoryIds
 */

/**
 * @typedef {Object} TaxJurisdictionRate
 * @property {string} id
 * @property {string} country
 * @property {string} state
 * @property {number} ratePercent
 */

/**
 * @typedef {Object} NotificationTemplate
 * @property {string} id
 * @property {string} trigger
 * @property {boolean} isActive
 * @property {string} subject
 * @property {string} body
 */

/**
 * @typedef {Object} StaffUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'owner'|'manager'|'fulfillment_staff'|'support_staff'} role
 * @property {'active'|'invited'|'disabled'} status
 * @property {string} lastLoginAt
 */

/**
 * @typedef {Object} PaymentProviderConfig
 * @property {string} id
 * @property {string} name
 * @property {string[]} supportedMethods
 * @property {'connected'|'test_mode'|'disconnected'} status
 */

// ==========================================
// FEATURE 09: PROMOTIONS
// ==========================================

/**
 * @typedef {Object} Promotion
 * @property {string} id
 * @property {string} title
 * @property {string} customerDescription
 * @property {'code'|'automatic'} method
 * @property {string} code
 * @property {'percentage'|'flat'|'free_shipping'|'buy_x_get_y'|'tiered'} discountType
 * @property {number} value
 * @property {number} maxShippingAmount
 * @property {'entire_order'|'specific_products'|'specific_collections'|'specific_categories'} targetScope
 * @property {string[]} targetIds
 * @property {boolean} excludeSaleItems
 * @property {number} buyQuantity
 * @property {{type: 'any'|'products'|'collection', ids: string[]}} buyScope
 * @property {number} getQuantity
 * @property {{type: 'same'|'products'|'collection', ids: string[]}} getScope
 * @property {'free'|'percentage'|'flat'} getDiscountType
 * @property {number} getDiscountValue
 * @property {number} maxUsesPerOrder
 * @property {'subtotal'|'quantity'} tierThresholdType
 * @property {{threshold: number, discountValue: number}[]} tiers
 * @property {number} minOrderValue
 * @property {number} minQuantity
 * @property {'all'|'segment'|'specific_customers'|'first_time_only'} customerEligibility
 * @property {string} customerSegmentTag
 * @property {string[]} eligibleCustomerIds
 * @property {string[]} eligibleCountries
 * @property {string} startsAt
 * @property {string} expiresAt
 * @property {boolean} active
 * @property {number} usageLimit
 * @property {number} usageCount
 * @property {number} perCustomerLimit
 * @property {Object.<string, number>} perCustomerUsage
 * @property {boolean} combinesWithProductDiscounts
 * @property {boolean} combinesWithOrderDiscounts
 * @property {boolean} combinesWithShippingDiscounts
 * @property {number} priority
 * @property {string} parentPromotionId
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PromotionRedemption
 * @property {string} id
 * @property {string} promotionId
 * @property {string} orderId
 * @property {string} customerId
 * @property {number} discountAmount
 * @property {string} redeemedAt
 */

// ==========================================
// FEATURE 10: REVIEWS
// ==========================================

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} productId
 * @property {string} customerId
 * @property {number} rating
 * @property {string} title
 * @property {string} body
 * @property {'pending'|'approved'|'rejected'} status
 * @property {string} createdAt
 * @property {string} titleText
 * @property {{type: 'image'|'video', url: string}[]} media
 * @property {boolean} verifiedPurchase
 * @property {{body: string, repliedAt: string}} merchantReply
 * @property {string} internalNote
 * @property {'spam'|'offensive_language'|'fake_or_unverifiable'|'off_topic'|'other'} rejectionReason
 * @property {string} rejectionNote
 * @property {{reason: 'spam'|'offensive'|'off_topic'|'fake', reporterCustomerId: string, createdAt: string}[]} flags
 * @property {number} wordCount
 */

// ==========================================
// FEATURE 11: MESSAGES
// ==========================================

/**
 * @typedef {Object} MessageThreadEntry
 * @property {'customer'|'admin'} sender
 * @property {string} body
 * @property {string} timestamp
 * @property {boolean} internal
 * @property {{url: string, filename: string}[]} attachments
 * @property {string} readByCustomerAt
 */

/**
 * @typedef {Object} MessageThread
 * @property {string} id
 * @property {string} customerId
 * @property {string} orderId
 * @property {string} subject
 * @property {'open'|'pending'|'resolved'|'closed'} status
 * @property {'low'|'normal'|'high'} priority
 * @property {MessageThreadEntry[]} messages
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} category
 * @property {'email'|'contact_form'|'chat'|'social'} channel
 * @property {string} assignedTo
 * @property {string} slaFirstResponseDeadline
 * @property {string} slaResolutionDeadline
 * @property {string} firstRespondedAt
 * @property {string} resolvedAt
 * @property {string} closedAt
 * @property {number} satisfactionRating
 * @property {string} satisfactionComment
 * @property {{note: string, escalatedBy: string, timestamp: string}[]} escalation
 */

/**
 * @typedef {Object} CannedResponse
 * @property {string} id
 * @property {string} title
 * @property {string} body
 */

/**
 * @typedef {Object} SupportSettings
 * @property {number} firstResponseTargetHours
 * @property {number} resolutionTargetHours
 * @property {{high: {firstResponseTargetHours: number, resolutionTargetHours: number}}} priorityOverrides
 * @property {boolean} autoAssignEnabled
 * @property {number} resolvedGracePeriodHours
 */
