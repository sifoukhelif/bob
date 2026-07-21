// lib/i18n/dictionaries/en.ts
export const en = {
  nav: { shop: 'Shop', services: 'Services', sell: 'Start Selling', orders: 'My Orders', login: 'Log In', searchPlaceholder: 'Search for a product…' },
  hero: { badge: 'The Future of Exclusive Digital Commerce', titleLine1: 'Own the Best', titleLine2: 'Digital Assets', subtitle: 'The go-to destination for creators to buy and sell templates, e-books, and exclusive software solutions.', ctaShop: 'Browse Products', ctaSell: 'Start Selling →' },
  stats: { products: 'Digital Products', sellers: 'Verified Sellers', rating: 'Platform Rating', new: 'New 🌱' },
  featured: { title: 'Latest Releases', subtitle: 'Exclusive picks, manually curated', viewAll: 'Browse Full Shop →', empty: 'No products published yet.', emptyCta: 'Be the first seller →' },
  footer: { rights: '© 2026 All rights reserved', terms: 'Terms', privacy: 'Privacy', support: 'Support' },
  shop: { title: 'Shop', itemsUnit: 'products & services', searchingFor: 'Search results for:', clearSearch: 'Clear search', filters: { all: 'All', services: 'Services', ui: 'UI Kits', ebooks: 'E-books', code: 'Code' }, noResultsTitle: 'No results found', noResultsSubtitle: 'Try a different search term', login: 'Log In', sortLabel: 'Sort by', sortPopular: 'Best selling', sortNewest: 'Newest', sortPriceAsc: 'Price: Low to High', sortPriceDesc: 'Price: High to Low', sortTopRated: 'Top rated', priceRangeLabel: 'Price range', minPricePlaceholder: 'Min $', maxPricePlaceholder: 'Max $', applyFilters: 'Apply', clearFilters: 'Clear filters' },
  product: { login: 'Log In', notFoundTitle: 'Product not found', freeLabel: 'Free', save: 'Save', sales: 'sales', reviews: 'reviews', deliveryPrefix: 'Delivery within', deliveryUnit: 'days' },
  buyBox: { freeLabel: 'Free', loading: 'Redirecting…', buyNow: 'Buy Now', orderService: 'Order Service', genericError: 'An error occurred, please try again', checkoutError: 'Could not start checkout', serviceManualOnly: 'Services are currently ordered by contacting the seller directly, not through instant checkout.', contactSellerCta: 'Contact support to request this service', features: { secureDownload: 'Secure, encrypted download link', validity: 'Valid for 48 hours after purchase', refund: '14-day refund guarantee', securePayment: 'Secure, encrypted payment' } },
  login: { welcomeBack: 'Welcome back', createAccount: 'Create your free account', loginTab: 'Log In', signupTab: 'Sign Up', emailLabel: 'Email', passwordLabel: 'Password', loadingText: 'Loading…', loginButton: 'Log In', signupButton: 'Create Account', checkEmailTitle: 'Check your email', checkEmailBodyPrefix: 'We sent a confirmation link to', checkEmailBodySuffix: 'Click the link to activate your account, then log in.', backToLogin: 'Back to login', emailNotConfirmedError: "You haven't confirmed your email yet. Check your inbox (and spam folder) and click the confirmation link.", genericError: 'An error occurred', forgotPasswordLink: 'Forgot password?' },
  forgotPassword: {
    title: 'Reset your password', subtitle: 'Enter your email and we\'ll send you a link to reset your password.',
    emailLabel: 'Email', sendButton: 'Send reset link', sendingText: 'Sending…',
    successTitle: 'Check your email', successBody: 'If this email is registered with us, we sent a password reset link. Check your inbox and spam folder.',
    backToLogin: 'Back to login', errorGeneric: 'Could not send the link, please try again',
  },
  resetPassword: {
    title: 'New password', subtitle: 'Enter your new password.',
    newPasswordLabel: 'New password', confirmPasswordLabel: 'Confirm password',
    saveButton: 'Save new password', savingText: 'Saving…',
    successMessage: '✅ Password changed successfully', goToLogin: 'Go to login',
    errorMismatch: 'Passwords do not match', errorTooShort: 'Password must be at least 6 characters',
    errorGeneric: 'Could not save the password. The link may have expired, request a new one.',
    errorLinkExpired: 'The reset link has expired or is invalid',
  },
  sell: { navShop: 'Shop', badge: 'For Creators & Freelancers', titlePrefix: 'Turn your expertise', titleHighlight: 'into income', subtitle: 'Sell templates, e-books, code, or offer your consulting services to thousands of interested buyers.', ctaLogin: 'Log in to get started', ctaDashboard: 'Go to Seller Dashboard →', ctaActivate: 'Activate Seller Account →', stats: { keepPercent: '80%', keepLabel: 'you keep from every sale', reviewTime: '48h', reviewLabel: 'average product review time', sellersCount: '+3K', sellersLabel: 'verified sellers on the platform' }, stepsTitle: 'How to get started', steps: [{ n: '01', title: 'Create your store', desc: 'Name, custom URL, and bio — takes two minutes.' }, { n: '02', title: 'Add your product or service', desc: 'Upload files, set your price, and write a description.' }, { n: '03', title: 'Quick review', desc: 'Our team reviews the product to ensure quality before publishing.' }, { n: '04', title: 'Get paid', desc: 'We transfer your payout details (bank transfer or Payoneer) after each sale, on a periodic schedule, after deducting the platform fee.' }], footer: '© 2026 DEGITALE — All rights reserved' },
  becomeSeller: { title: 'Create your store', subtitle: 'One step and you become a seller on the platform', storeNameLabel: 'Store name', storeNamePlaceholder: 'e.g. Authentic Studio', bioLabel: 'About your store (optional)', bioPlaceholder: 'What do you sell? What makes you unique?', submitButton: 'Create Store & Start', errorNameTooShort: 'Store name must be at least 3 characters', errorCreateFailed: 'Could not create the store, try a different name' },
  orders: { title: 'My Orders', shopLink: 'Shop', paidStatus: 'Paid', completedStatus: 'Completed', downloadButton: 'Download', linkExpired: 'Link expired', defaultProductName: 'Product', emptyTitle: 'No previous orders.', emptyCta: 'Browse shop →' },
  listingForm: { coverImageLabel: 'Cover Image', noImage: 'No image', titleLabel: 'Title', descriptionLabel: 'Description', categoryLabel: 'Category', categoryPlaceholder: 'Choose a category', priceLabel: 'Price (USD)', fileLabel: 'Product File', errorTitleTooShort: 'Title must be at least 3 characters', errorInvalidPrice: 'Enter a valid price', errorImageUploadPrefix: 'Could not upload image:', genericError: 'An unexpected error occurred' },
  newListing: { backToDashboard: '← Dashboard', title: 'Add a new product', subtitle: 'Our team will review the product before publishing it to buyers (usually within 48 hours).', typeProduct: 'Digital Product', typeService: 'Service', coverImageHint: 'This image will be shown to buyers in the shop and homepage.', titlePlaceholder: 'e.g. Admin dashboard template for online stores', descriptionPlaceholder: 'Explain in detail what the buyer will receive', pricePlaceholder: '29.00', fileHint: 'This is the file the buyer will receive after payment.', errorFileRequired: 'You must upload the digital product file', errorCreateFailed: 'Could not create the product, please try again', errorFileUploadPrefix: 'Could not upload file:', submitButton: 'Submit for Review', submittingText: 'Submitting…' },
  editListing: { backToDashboard: '← Dashboard', title: 'Edit Product', subtitle: 'The product will be sent for review again after any change to the title, description, or file.', keepImageHint: "Leave this field empty if you don't want to change the current image.", currentFilePrefix: '📄 Current file:', keepFileHint: "Leave this field empty if you don't want to change the current file.", saveButton: 'Save Changes', savingText: 'Saving…', errorUpdateFailed: 'Could not update the product, please try again', errorFileUploadPartialPrefix: 'Product data was updated, but the new file could not be uploaded:' },
  deleteListing: { confirmText: 'Sure?', yesDelete: 'Yes, delete', cancel: 'Cancel', deleteLabel: 'Delete 🗑️' },
  payoutSettings: {
    backToDashboard: '← Dashboard', title: 'Payout Settings',
    subtitle: 'Enter your payout details. Transfers are currently handled manually by our team on a periodic basis, based on this information.',
    methodLabel: 'Payout Method', methodPlaceholder: 'Choose a method',
    methodBank: 'Bank Transfer', methodPayoneer: 'Payoneer', methodVisa: 'Visa Card', methodRedotPay: 'RedotPay', methodBinance: 'Binance', methodOther: 'Other',
    detailsLabel: 'Payout Details',
    detailsPlaceholder: 'e.g. bank name, account number / IBAN, account holder name — or Payoneer email',
    detailsHint: 'This information is only seen by our team when processing the transfer.',
    errorMethodRequired: 'Choose a payout method',
    errorDetailsInvalid: 'Enter clear payout details (account number, IBAN, Payoneer email...)',
    errorSaveFailed: 'Could not save the data, please try again',
    genericError: 'An unexpected error occurred',
    savedSuccess: '✓ Saved successfully',
    saveButton: 'Save Details', savingText: 'Saving…',
  },
  checkoutSuccess: {
    pageTitle: 'Payment Successful',
    processingTitle: 'Confirming your payment…',
    processingBodyPrefix: "This may take a few seconds. If the page doesn't update, check",
    processingBodySuffix: 'in a moment.',
    ordersLink: 'My Orders',
    viewOrdersButton: 'View My Orders',
    successTitlePrefix: 'Payment', successTitleHighlight: 'Successful',
    thankYouPrefix: 'Thank you for purchasing «', thankYouSuffix: '»',
    downloadButton: 'Download File Now',
    viewAllOrdersButton: 'View All My Orders',
    validityNote: 'The download link is valid for 48 hours from the time of purchase',
  },
  contact: {
    pageTitle: 'Support', homeLink: 'Home',
    title: 'Contact Support',
    subtitle: "Have a question or an issue with an order or product? Message us and we'll reply within 24 hours.",
  },
  account: {
    pageTitle: 'Account Settings', homeLink: 'Home', title: 'Account Settings',
    usernameLabel: 'Username', usernamePlaceholder: 'Sif Khelif',
    usernameHint: 'English letters, numbers, spaces, and underscores — this name appears instead of your email on the site.',
    saveButton: 'Save Changes',
    successMessage: '✅ Username saved successfully',
    errorTooShort: 'Username must be at least 2 characters',
    errorTaken: 'This name is already taken, try another one',
    errorSaveFailed: 'Could not save the name, please try again',
  },
  becomeSellerDone: {
    preparingText: 'Preparing your store…',
  },
  terms: {
  "title": "Terms & Conditions",
  "intro": "By using the DEGITALE platform, you agree to the following terms. Please read them carefully before selling or buying on the platform. If you do not agree to any part of these terms, please do not use the platform.",
  "sections": [
    {
      "title": "1. Nature of the Platform",
      "body": "DEGITALE is a marketplace connecting sellers and buyers of digital assets (templates, e-books, code) and digital services. The platform does not produce the listed content and does not guarantee its quality, though it reviews every product before publishing as an initial vetting step that is not a full guarantee of content quality."
    },
    {
      "title": "2. Eligibility",
      "body": "You must be at least 18 years old to create an account or make purchases or sales on the platform. By using the platform, you confirm that you meet this requirement."
    },
    {
      "title": "3. Platform Commission & Pricing",
      "body": "The platform charges a commission on every successful sale, based on the rate disclosed at the time of sale (currently shown in the platform settings). All displayed prices are in US Dollars (USD) unless stated otherwise."
    },
    {
      "title": "4. Seller Payouts",
      "body": "The seller's net earnings (after deducting the platform commission) are transferred manually based on the payout details (bank transfer, Payoneer, or another method) entered by the seller in their account settings, on a periodic basis according to the payment policy announced by the platform team. The platform may in the future move to an automated payout system (such as Stripe Connect) once available, and sellers will be notified at that time. The platform is not responsible for any delay resulting from incorrect payout details entered by the seller."
    },
    {
      "title": "5. Seller Responsibilities & Intellectual Property",
      "body": "The seller bears full responsibility for the accuracy of their product description, for owning full rights (or the necessary license) to the content they upload, and for the quality of the uploaded files. Uploading stolen or plagiarized content, or content that infringes a third party's intellectual property rights, is prohibited. The platform reserves the right to reject or remove any product that violates these terms without prior notice in serious cases.",
      "body2": "To report intellectual property infringement, please contact us via the support page with proof of ownership and details of the infringing product; the platform will review every report and may temporarily remove the infringing product during review."
    },
    {
      "title": "6. Buyer Rights & Product Delivery",
      "body": "Upon successful completion of a purchase, the buyer receives a download link valid for 48 hours from the time of purchase. The buyer is advised to download the file immediately after purchase and keep a personal copy, as the platform does not guarantee automatic renewal of the link after it expires."
    },
    {
      "title": "7. Refund Policy",
      "body": "A refund may be granted within 14 days of purchase in the event of a material defect in the product (such as the file not matching the description, or a corrupted file), subject to the support team's assessment of each case individually. No refund is granted simply because the buyer changed their mind after successfully downloading the file."
    },
    {
      "title": "8. Suspension & Account Bans",
      "body": "The platform reserves the right to restrict or ban any account that violates these terms or is used in a harmful or fraudulent manner, with or without prior notice depending on the severity of the violation."
    },
    {
      "title": "9. Account Deletion",
      "body": "Any user may request the deletion of their account and personal data by contacting the support team via the contact page. The platform may retain certain transaction data for a limited period to comply with mandatory accounting or legal obligations."
    },
    {
      "title": "10. Taxes",
      "body": "Each seller is responsible for declaring their own taxes and complying with the tax laws applicable in their country, independently of the platform."
    },
    {
      "title": "11. Disclaimer",
      "body": "The platform is provided \"as is\" without any express or implied warranties regarding uninterrupted service continuity or being error-free. The platform is not liable for any indirect losses resulting from the use of the platform, to the maximum extent permitted by applicable law."
    },
    {
      "title": "12. Governing Law",
      "body": "The governing law for these terms and the competent jurisdiction for disputes will be finalized once the official registration of the platform's owning legal entity is completed, and this clause will be updated accordingly before the official launch."
    }
  ],
  "footer": "Last updated: July 2026. These terms are a template and require specialized legal review by a licensed attorney before official launch."
},
  privacy: {
  "title": "Privacy Policy",
  "intro": "We respect your privacy and are committed to protecting your personal data. This page explains what data we collect, how we use it, and where it is stored.",
  "sections": [
    {
      "title": "1. Data We Collect",
      "body": "Email address, name (optional), username, and order and transaction data necessary to provide the service. We do not store your bank card details — all payments are processed directly via Stripe.",
      "body2": "If you are a seller, we also collect the payout details you enter yourself (such as a bank account number / IBAN or Payoneer email), which are used exclusively by the platform's authorized team to process your payouts, and are not shown to any other party."
    },
    {
      "title": "2. Cookies",
      "body": "We use only essential cookies to manage your login session and authentication. We do not currently use tracking or third-party advertising cookies."
    },
    {
      "title": "3. How We Use Your Data",
      "body": "We use your data to operate your account, process orders, deliver digital products, execute payout transfers for sellers, and communicate with you about your orders or account."
    },
    {
      "title": "4. Data Sharing & Storage Location",
      "body": "We do not sell your data to third parties. We share the minimum data necessary with trusted service providers solely to operate the platform:",
      "list": [
        "Supabase — database and file storage (servers located in Frankfurt, Germany / European Union)",
        "Stripe — payment processing",
        "Resend — sending operational emails (account confirmation, order notifications)"
      ]
    },
    {
      "title": "5. Data Retention Period",
      "body": "We retain your data for as long as your account is active. Upon requesting account deletion, your personal data is deleted within a reasonable period, except for data that must be retained for mandatory accounting or legal purposes."
    },
    {
      "title": "6. Data Security",
      "body": "We apply database-level security policies (Row Level Security) that ensure each user can only access their own data, in addition to encrypted connections (HTTPS) across the entire platform."
    },
    {
      "title": "7. Your Rights",
      "body": "You have the right at any time to:",
      "list": [
        "Access your personal data stored with us",
        "Correct or update your data",
        "Request deletion of your account and data",
        "Object to the processing of your data in certain cases"
      ],
      "closing": "To exercise any of these rights, contact us via the support page."
    },
    {
      "title": "8. Children & Minors",
      "body": "The platform is not directed at individuals under 18 years of age, and we do not knowingly and intentionally collect data from users we know to be minors."
    }
  ],
  "footer": "Last updated: July 2026. This policy is a template and requires specialized legal review by a licensed attorney before official launch, particularly regarding full compliance with data protection regulations (such as the European GDPR) if your audience includes users from the European Union."
},
  sellerOrders: {
    title: 'Buyer Orders', backToDashboard: '← Dashboard',
    colProduct: 'Product', colBuyer: 'Buyer', colAmount: 'Amount', colDate: 'Date', colStatus: 'Status',
    statusPaid: 'Paid', statusPending: 'Processing', statusFree: 'Free',
    emptyText: 'No orders on your products yet.',
    navLink: 'Buyer Orders 🧾',
  },
  dashboard: {
    payoutSettingsLink: 'Payout Settings 💰', viewStoreLink: 'View my public store →',
    welcomePrefix: '🎉 Your store «', welcomeSuffix: '» has been activated! Add your first product to start selling.',
    addProductButton: '+ Add New Product',
    statActive: 'Published Products', statPending: 'Pending Review', statSales: 'Total Sales', statRating: 'Rating',
    statTotalRevenue: 'Total Revenue', statMonthRevenue: "This Month's Revenue", statBestSeller: 'Best Seller',
    revenueChartTitle: 'Revenue — Last 30 Days', noBestSeller: 'None yet',
    myProductsTitle: 'My Products',
    colProduct: 'Product', colPrice: 'Price', colStatus: 'Status', colSales: 'Sales', colViews: 'Views', colActions: 'Actions',
    editLink: 'Edit ✏️',
    emptyText: "You haven't added any product yet.", emptyCta: 'Add your first product →',
    statusActive: 'Published', statusPending: 'Pending Review', statusRejected: 'Rejected', statusPaused: 'Paused', statusDraft: 'Draft',
    noStoreAdminTitle: 'No store linked to your account',
    noStoreAdminDesc: "Your account is an admin, and doesn't automatically have a store. You can create a store to sell like any other seller, or go to the admin panel to manage the platform.",
    createStoreNow: 'Create a Store Now', goToAdmin: 'Go to Admin Panel',
  },
  store: {
    notFoundTitle: 'Store not found',
    verified: '✓ Verified',
    ratingSuffix: 'reviews',
    salesLabel: 'sales',
    memberSince: 'Member since',
    generalShop: 'Shop',
    productsTitlePrefix: 'Store products',
    emptyText: 'No products published in this store yet',
    login: 'Login',
    adBannerLabel: 'Advertisement Space',
    adCardLabel: 'Ad',
  },
  ads: {
    banner: 'Advertisement Space',
    card: 'Ad',
    strip: 'Advertisement Space',
  },
  about: {
    badge: 'About Us',
    title: 'A digital platform, global standards',
    subtitle: 'DEGITALE is a unified marketplace for buying and selling digital products and services — templates, code, ebooks, and freelance services — safely and easily.',
    missionTitle: 'Our Mission',
    missionText: 'We believe digital creators deserve a professional platform that protects them and their customers, with fair commission and simple tools that let them focus on creating instead of technical complexity.',
    howItWorksTitle: 'How It Works',
    buyerStepTitle: 'For Buyers',
    buyerStepText: 'Browse thousands of products, pay securely via Stripe, and get an instant download link valid for 48 hours, with a 14-day refund guarantee.',
    sellerStepTitle: 'For Sellers',
    sellerStepText: 'Set up your store in minutes, upload your product, and start selling right after quick approval from our team within 48 hours.',
    trustTitle: 'Why DEGITALE?',
    trust1Title: 'Secure Payments',
    trust1Text: 'All transactions go through Stripe, we never store your card details.',
    trust2Title: 'Protected Links',
    trust2Text: 'Every download link is encrypted and time-limited, so it can\'t be shared or misused.',
    trust3Title: 'Fast Support',
    trust3Text: 'Our support team replies within 24 hours to any question or issue.',
    ctaTitle: 'Ready to start?',
    ctaShop: 'Browse the Shop',
    ctaSell: 'Start Selling',
  },
  faq: {
    badge: 'FAQ',
    title: 'Everything you need to know',
    subtitle: 'Quick answers to the most common questions',
    q1: 'How do I buy a digital product?', a1: 'Pick a product, click "Buy Now", complete secure checkout via Stripe, and get an instant download link valid for 48 hours.',
    q2: 'What is the refund policy?', a2: 'You can get a full refund within 14 days of purchase if the product isn\'t as described — contact support to start a request.',
    q3: 'How do I become a seller?', a3: 'Click "Start Selling" on the homepage, set up your store, and upload your first product — our team reviews it within 48 hours before it goes live.',
    q4: 'What is the platform commission?', a4: 'Sellers keep 80% of every sale, the rest covers platform operations, support, and payment processing.',
    q5: 'Is my payment data safe?', a5: 'Yes, all payments are processed directly through Stripe, your card details never reach our servers.',
    q6: 'What if my download link expires?', a6: 'Contact support via the "Contact Us" page with your order number, and we\'ll generate a new link right away.',
  },
  reviews: {
    title: 'Reviews',
    leaveReview: 'Leave a review',
    yourRating: 'Your rating',
    commentPlaceholder: 'Share your thoughts about the product (optional)',
    submit: 'Submit Review',
    submitting: 'Submitting...',
    editReview: 'Edit your review',
    update: 'Update Review',
    thanks: 'Thanks for your review!',
    alreadyReviewed: 'Your submitted review',
    noReviewsYet: 'No reviews yet — be the first to review this product',
    anonymous: 'Buyer',
    error: 'Something went wrong, please try again',
  },
  wishlist: {
    navLabel: 'Wishlist',
    title: 'Wishlist',
    subtitle: 'Products you saved to come back to later',
    emptyTitle: 'Your wishlist is empty',
    emptyCta: 'Browse the shop →',
    remove: 'Remove',
  },
  userMenu: {
    accountSettings: 'Account Settings',
    wishlist: 'Wishlist',
    adminPanel: 'Admin Panel',
    sellerDashboard: 'Seller Dashboard',
    myOrders: 'My Orders',
    roleAdmin: 'Admin', roleSeller: 'Seller', roleBuyer: 'Buyer',
    signingOut: 'Signing out…',
    signOut: 'Sign Out',
  },
}
