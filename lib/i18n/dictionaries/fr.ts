// lib/i18n/dictionaries/fr.ts
export const fr = {
  nav: { shop: 'Boutique', services: 'Services', sell: 'Commencer à Vendre', orders: 'Mes Commandes', login: 'Connexion', searchPlaceholder: 'Rechercher un produit…' },
  hero: { badge: "L'avenir du commerce numérique exclusif", titleLine1: 'Possédez les meilleurs', titleLine2: 'Actifs numériques', subtitle: 'La destination privilégiée des créateurs pour acheter et vendre des modèles, livres numériques et solutions logicielles exclusives.', ctaShop: 'Parcourir les produits', ctaSell: 'Commencer à vendre →' },
  stats: { products: 'Produits numériques', sellers: 'Vendeurs vérifiés', rating: 'Note de la plateforme', new: 'Nouveau 🌱' },
  featured: { title: 'Dernières sorties', subtitle: 'Sélections exclusives, vérifiées manuellement', viewAll: 'Voir toute la boutique →', empty: 'Aucun produit publié pour le moment.', emptyCta: 'Devenez le premier vendeur →' },
  footer: { rights: '© 2026 Tous droits réservés', terms: 'Conditions', privacy: 'Confidentialité', support: 'Support' },
  shop: { title: 'Boutique', itemsUnit: 'produits et services', searchingFor: 'Résultats de recherche pour :', clearSearch: 'Effacer la recherche', filters: { all: 'Tout', services: 'Services', ui: 'Kits UI', ebooks: 'Livres numériques', code: 'Code' }, noResultsTitle: 'Aucun résultat', noResultsSubtitle: 'Essayez un autre terme de recherche', login: 'Connexion', sortLabel: 'Trier par', sortPopular: 'Meilleures ventes', sortNewest: 'Plus récents', sortPriceAsc: 'Prix : croissant', sortPriceDesc: 'Prix : décroissant', sortTopRated: 'Mieux notés', priceRangeLabel: 'Fourchette de prix', minPricePlaceholder: 'Min $', maxPricePlaceholder: 'Max $', applyFilters: 'Appliquer', clearFilters: 'Effacer les filtres' },
  product: { login: 'Connexion', notFoundTitle: 'Produit introuvable', freeLabel: 'Gratuit', save: 'Économisez', sales: 'ventes', reviews: 'avis', deliveryPrefix: 'Livraison sous', deliveryUnit: 'jours' },
  buyBox: { freeLabel: 'Gratuit', loading: 'Redirection…', buyNow: 'Acheter maintenant', orderService: 'Commander le service', genericError: 'Une erreur est survenue, veuillez réessayer', checkoutError: "Impossible de démarrer le paiement", serviceManualOnly: "Les services se commandent actuellement en contactant directement le vendeur, pas via le paiement instantané.", contactSellerCta: 'Contacter le support pour demander ce service', features: { secureDownload: 'Lien de téléchargement sécurisé et chiffré', validity: 'Valable 48 heures après achat', refund: 'Garantie de remboursement de 14 jours', securePayment: 'Paiement sécurisé et chiffré' } },
  login: { welcomeBack: 'Content de vous revoir', createAccount: 'Créez votre compte gratuit', loginTab: 'Connexion', signupTab: 'Inscription', emailLabel: 'Email', passwordLabel: 'Mot de passe', loadingText: 'Chargement…', loginButton: 'Connexion', signupButton: 'Créer le compte', checkEmailTitle: 'Vérifiez votre email', checkEmailBodyPrefix: 'Nous avons envoyé un lien de confirmation à', checkEmailBodySuffix: 'Cliquez sur le lien pour activer votre compte, puis connectez-vous.', backToLogin: 'Retour à la connexion', emailNotConfirmedError: "Vous n'avez pas encore confirmé votre email. Vérifiez votre boîte de réception (et vos spams) et cliquez sur le lien de confirmation.", genericError: 'Une erreur est survenue', forgotPasswordLink: 'Mot de passe oublié ?' },
  forgotPassword: {
    title: 'Réinitialiser le mot de passe', subtitle: "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    emailLabel: 'Email', sendButton: 'Envoyer le lien', sendingText: 'Envoi en cours…',
    successTitle: 'Vérifiez votre email', successBody: "Si cet email est enregistré chez nous, nous avons envoyé un lien de réinitialisation. Vérifiez votre boîte de réception et vos spams.",
    backToLogin: 'Retour à la connexion', errorGeneric: "Impossible d'envoyer le lien, veuillez réessayer",
  },
  resetPassword: {
    title: 'Nouveau mot de passe', subtitle: 'Entrez votre nouveau mot de passe.',
    newPasswordLabel: 'Nouveau mot de passe', confirmPasswordLabel: 'Confirmer le mot de passe',
    saveButton: 'Enregistrer le nouveau mot de passe', savingText: 'Enregistrement…',
    successMessage: '✅ Mot de passe changé avec succès', goToLogin: 'Aller à la connexion',
    errorMismatch: 'Les mots de passe ne correspondent pas', errorTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    errorGeneric: "Impossible d'enregistrer le mot de passe. Le lien a peut-être expiré, demandez-en un nouveau.",
    errorLinkExpired: "Le lien de réinitialisation a expiré ou est invalide",
  },
  sell: { navShop: 'Boutique', badge: 'Pour les créateurs et freelances', titlePrefix: 'Transformez votre expertise', titleHighlight: 'en revenu', subtitle: "Vendez des modèles, des livres numériques, du code, ou proposez vos services de conseil à des milliers d'acheteurs intéressés.", ctaLogin: 'Connectez-vous pour commencer', ctaDashboard: 'Aller au tableau de bord vendeur →', ctaActivate: 'Activer le compte vendeur →', stats: { keepPercent: '80%', keepLabel: 'conservés sur chaque vente', reviewTime: '48h', reviewLabel: 'délai moyen de révision du produit', sellersCount: '+3K', sellersLabel: 'vendeurs vérifiés sur la plateforme' }, stepsTitle: 'Comment commencer', steps: [{ n: '01', title: 'Créez votre boutique', desc: 'Nom, URL personnalisée et bio — cela prend deux minutes.' }, { n: '02', title: 'Ajoutez votre produit ou service', desc: 'Téléchargez les fichiers, fixez votre prix et rédigez une description.' }, { n: '03', title: 'Révision rapide', desc: 'Notre équipe examine le produit pour garantir sa qualité avant publication.' }, { n: '04', title: 'Recevez vos paiements', desc: 'Nous transférons vos gains (virement bancaire ou Payoneer) après chaque vente, selon un calendrier périodique, après déduction de la commission de la plateforme.' }], footer: '© 2026 DEGITALE — Tous droits réservés' },
  becomeSeller: { title: 'Créez votre boutique', subtitle: 'Une étape et vous devenez vendeur sur la plateforme', storeNameLabel: 'Nom de la boutique', storeNamePlaceholder: 'ex : Studio Authentique', bioLabel: 'À propos de votre boutique (facultatif)', bioPlaceholder: "Que vendez-vous ? Qu'est-ce qui vous distingue ?", submitButton: 'Créer la boutique et commencer', errorNameTooShort: 'Le nom de la boutique doit contenir au moins 3 caractères', errorCreateFailed: 'Impossible de créer la boutique, essayez un autre nom' },
  orders: { title: 'Mes commandes', shopLink: 'Boutique', paidStatus: 'Payé', completedStatus: 'Terminé', downloadButton: 'Télécharger', linkExpired: 'Lien expiré', defaultProductName: 'Produit', emptyTitle: 'Aucune commande précédente.', emptyCta: 'Parcourir la boutique →' },
  listingForm: { coverImageLabel: 'Image de couverture', noImage: 'Aucune image', titleLabel: 'Titre', descriptionLabel: 'Description', categoryLabel: 'Catégorie', categoryPlaceholder: 'Choisir une catégorie', priceLabel: 'Prix (USD)', fileLabel: 'Fichier du produit', errorTitleTooShort: 'Le titre doit contenir au moins 3 caractères', errorInvalidPrice: 'Entrez un prix valide', errorImageUploadPrefix: "Impossible de télécharger l'image :", genericError: 'Une erreur inattendue est survenue' },
  newListing: { backToDashboard: '← Tableau de bord', title: 'Ajouter un nouveau produit', subtitle: 'Notre équipe examinera le produit avant de le publier aux acheteurs (généralement sous 48 heures).', typeProduct: 'Produit numérique', typeService: 'Service', coverImageHint: "Cette image sera visible par les acheteurs dans la boutique et sur la page d'accueil.", titlePlaceholder: 'ex : Modèle de tableau de bord pour boutique en ligne', descriptionPlaceholder: "Expliquez en détail ce que l'acheteur recevra", pricePlaceholder: '29.00', fileHint: "C'est le fichier que l'acheteur recevra après paiement.", errorFileRequired: 'Vous devez télécharger le fichier du produit numérique', errorCreateFailed: 'Impossible de créer le produit, veuillez réessayer', errorFileUploadPrefix: 'Impossible de télécharger le fichier :', submitButton: 'Soumettre pour révision', submittingText: 'Envoi en cours…' },
  editListing: { backToDashboard: '← Tableau de bord', title: 'Modifier le produit', subtitle: 'Le produit sera renvoyé en révision après toute modification du titre, de la description ou du fichier.', keepImageHint: "Laissez ce champ vide si vous ne voulez pas changer l'image actuelle.", currentFilePrefix: '📄 Fichier actuel :', keepFileHint: 'Laissez ce champ vide si vous ne voulez pas changer le fichier actuel.', saveButton: 'Enregistrer les modifications', savingText: 'Enregistrement…', errorUpdateFailed: 'Impossible de mettre à jour le produit, veuillez réessayer', errorFileUploadPartialPrefix: "Les données du produit ont été mises à jour, mais le nouveau fichier n'a pas pu être téléchargé :" },
  deleteListing: { confirmText: 'Confirmer ?', yesDelete: 'Oui, supprimer', cancel: 'Annuler', deleteLabel: 'Supprimer 🗑️' },
  payoutSettings: {
    backToDashboard: '← Tableau de bord', title: 'Paramètres de paiement',
    subtitle: 'Entrez vos coordonnées de paiement. Les virements sont actuellement effectués manuellement par notre équipe, périodiquement, sur la base de ces informations.',
    methodLabel: 'Méthode de paiement', methodPlaceholder: 'Choisir une méthode',
    methodBank: 'Virement bancaire', methodPayoneer: 'Payoneer', methodVisa: 'Carte Visa', methodRedotPay: 'RedotPay', methodBinance: 'Binance', methodOther: 'Autre méthode',
    detailsLabel: 'Coordonnées de paiement',
    detailsPlaceholder: "ex : nom de la banque, numéro de compte / IBAN, nom du titulaire — ou email Payoneer",
    detailsHint: 'Ces informations ne sont visibles que par notre équipe lors du traitement du virement.',
    errorMethodRequired: 'Choisissez une méthode de paiement',
    errorDetailsInvalid: "Entrez des coordonnées claires (numéro de compte, IBAN, email Payoneer...)",
    errorSaveFailed: "Impossible d'enregistrer les données, veuillez réessayer",
    genericError: 'Une erreur inattendue est survenue',
    savedSuccess: '✓ Enregistré avec succès',
    saveButton: 'Enregistrer', savingText: 'Enregistrement…',
  },
  checkoutSuccess: {
    pageTitle: 'Paiement réussi',
    processingTitle: 'Confirmation de votre paiement…',
    processingBodyPrefix: "Cela peut prendre quelques secondes. Si la page ne se met pas à jour, consultez",
    processingBodySuffix: 'dans un instant.',
    ordersLink: 'Mes commandes',
    viewOrdersButton: 'Voir mes commandes',
    successTitlePrefix: 'Paiement', successTitleHighlight: 'réussi',
    thankYouPrefix: 'Merci pour votre achat «', thankYouSuffix: '»',
    downloadButton: 'Télécharger le fichier',
    viewAllOrdersButton: 'Voir toutes mes commandes',
    validityNote: "Le lien de téléchargement est valable 48 heures après l'achat",
  },
  contact: {
    pageTitle: 'Support', homeLink: 'Accueil',
    title: 'Contactez le support',
    subtitle: "Une question ou un problème avec une commande ou un produit ? Écrivez-nous, nous répondrons sous 24 heures.",
  },
  account: {
    pageTitle: 'Paramètres du compte', homeLink: 'Accueil', title: 'Paramètres du compte',
    usernameSectionTitle: "Nom d'utilisateur",
    usernameLabel: "Nom d'utilisateur", usernamePlaceholder: 'Sif Khelif',
    usernameHint: "Lettres anglaises, chiffres, espaces et underscores — ce nom apparaît à la place de votre email sur le site.",
    saveButton: 'Enregistrer les modifications',
    successMessage: "✅ Nom d'utilisateur enregistré avec succès",
    errorTooShort: "Le nom d'utilisateur doit contenir au moins 2 caractères",
    errorTaken: 'Ce nom est déjà pris, essayez-en un autre',
    errorSaveFailed: "Impossible d'enregistrer le nom, veuillez réessayer",
    avatar: {
      sectionTitle: 'Photo de profil',
      changeButton: 'Changer la photo', uploading: 'Téléversement…',
      saved: '✅ Photo de profil mise à jour',
      errorUpload: "Impossible de téléverser l'image, veuillez réessayer",
      errorType: 'Le fichier doit être une image (JPG ou PNG)',
      errorSize: "La taille de l'image ne doit pas dépasser 2 Mo",
    },
    password: {
      sectionTitle: 'Mot de passe',
      currentLabel: 'Mot de passe actuel', newLabel: 'Nouveau mot de passe', confirmLabel: 'Confirmer le nouveau mot de passe',
      saveButton: 'Mettre à jour le mot de passe', savingText: 'Mise à jour…',
      successMessage: '✅ Mot de passe mis à jour avec succès',
      errorCurrentWrong: 'Le mot de passe actuel est incorrect',
      errorMismatch: 'Les nouveaux mots de passe ne correspondent pas',
      errorTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
      errorGeneric: 'Impossible de mettre à jour le mot de passe, veuillez réessayer',
    },
    email: {
      sectionTitle: 'Adresse email',
      currentLabel: 'Email actuel', newLabel: 'Nouvelle adresse email',
      saveButton: "Mettre à jour l'email", savingText: 'Envoi en cours…',
      successMessage: "✅ Nous avons envoyé un lien de confirmation à votre ancien et nouvel email. Cliquez sur le lien pour terminer le changement.",
      errorGeneric: "Impossible de mettre à jour l'email, veuillez réessayer",
      errorSameEmail: 'Ceci est déjà votre email actuel',
    },
    dangerZone: {
      title: 'Zone de danger',
      text: 'La suppression de votre compte efface définitivement vos données personnelles. Pour demander la suppression de votre compte, contactez notre équipe de support.',
      cta: 'Demander la suppression du compte',
    },
  },
  becomeSellerDone: {
    preparingText: 'Préparation de votre boutique…',
  },
  terms: {
  "title": "Conditions Générales",
  "intro": "En utilisant la plateforme DEGITALE, vous acceptez les conditions suivantes. Veuillez les lire attentivement avant de vendre ou d'acheter sur la plateforme. Si vous n'acceptez pas l'une de ces conditions, veuillez ne pas utiliser la plateforme.",
  "sections": [
    {
      "title": "1. Nature de la plateforme",
      "body": "DEGITALE est une place de marché (Marketplace) qui met en relation vendeurs et acheteurs d'actifs numériques (modèles, livres numériques, code) et de services numériques. La plateforme ne produit pas le contenu proposé et n'en garantit pas la qualité, bien qu'elle examine chaque produit avant sa publication comme étape de vérification initiale, qui ne constitue pas une garantie complète de la qualité du contenu."
    },
    {
      "title": "2. Éligibilité",
      "body": "Vous devez avoir au moins 18 ans pour créer un compte ou effectuer des achats ou des ventes sur la plateforme. En utilisant la plateforme, vous confirmez que vous remplissez cette condition."
    },
    {
      "title": "3. Commission de la plateforme et tarification",
      "body": "La plateforme prélève une commission sur chaque vente réussie, selon le taux annoncé au moment de la vente (actuellement affiché dans les paramètres de la plateforme). Tous les prix affichés sont en dollars américains (USD), sauf indication contraire."
    },
    {
      "title": "4. Versement des gains du vendeur",
      "body": "Les gains nets du vendeur (après déduction de la commission de la plateforme) sont transférés manuellement sur la base des coordonnées de paiement (virement bancaire, Payoneer ou autre méthode) saisies par le vendeur dans les paramètres de son compte, de façon périodique selon la politique de paiement annoncée par l'équipe de la plateforme. La plateforme pourra à l'avenir migrer vers un système de versement automatique (comme Stripe Connect) dès qu'il sera disponible, et les vendeurs en seront alors informés. La plateforme n'est pas responsable de tout retard résultant de coordonnées de paiement incorrectes saisies par le vendeur."
    },
    {
      "title": "5. Responsabilités du vendeur et propriété intellectuelle",
      "body": "Le vendeur assume l'entière responsabilité de l'exactitude de la description de son produit, de la détention des droits complets (ou de la licence nécessaire) sur le contenu qu'il téléverse, et de la qualité des fichiers téléversés. Il est interdit de téléverser du contenu volé, plagié, ou portant atteinte aux droits de propriété intellectuelle d'un tiers. La plateforme se réserve le droit de refuser ou de retirer tout produit enfreignant ces conditions, sans préavis dans les cas graves.",
      "body2": "Pour signaler une atteinte à la propriété intellectuelle, veuillez nous contacter via la page de support en fournissant une preuve de propriété et les détails du produit concerné ; la plateforme examinera chaque signalement et pourra retirer temporairement le produit concerné pendant l'examen."
    },
    {
      "title": "6. Droits de l'acheteur et livraison du produit",
      "body": "Une fois l'achat effectué avec succès, l'acheteur reçoit un lien de téléchargement valable 48 heures à partir du moment de l'achat. Il est conseillé à l'acheteur de télécharger le fichier immédiatement après l'achat et d'en conserver une copie personnelle, la plateforme ne garantissant pas le renouvellement automatique du lien après son expiration."
    },
    {
      "title": "7. Politique de remboursement",
      "body": "Un remboursement peut être accordé dans les 14 jours suivant l'achat en cas de défaut substantiel du produit (par exemple, un fichier ne correspondant pas à la description, ou un fichier corrompu), selon l'évaluation de l'équipe de support au cas par cas. Aucun remboursement n'est accordé simplement parce que l'acheteur a changé d'avis après avoir téléchargé le fichier avec succès."
    },
    {
      "title": "8. Suspension et bannissement de compte",
      "body": "La plateforme se réserve le droit de restreindre ou de bannir tout compte enfreignant ces conditions ou utilisé de manière nuisible ou frauduleuse, avec ou sans préavis selon la gravité de l'infraction."
    },
    {
      "title": "9. Suppression de compte",
      "body": "Tout utilisateur peut demander la suppression de son compte et de ses données personnelles en contactant l'équipe de support via la page de contact. La plateforme peut conserver certaines données de transaction pendant une durée limitée afin de respecter des obligations comptables ou légales."
    },
    {
      "title": "10. Impôts",
      "body": "Chaque vendeur est responsable de la déclaration de ses propres impôts et du respect des lois fiscales applicables dans son pays, indépendamment de la plateforme."
    },
    {
      "title": "11. Clause de non-responsabilité",
      "body": "La plateforme est fournie « telle quelle », sans aucune garantie expresse ou implicite quant à la continuité ininterrompue du service ou à son absence d'erreurs. La plateforme n'est pas responsable des pertes indirectes résultant de l'utilisation de la plateforme, dans la mesure maximale permise par la loi applicable."
    },
    {
      "title": "12. Loi applicable",
      "body": "Le droit applicable à ces conditions et la juridiction compétente pour les litiges seront définitivement déterminés une fois l'enregistrement officiel de l'entité juridique propriétaire de la plateforme finalisé, et cette clause sera mise à jour en conséquence avant le lancement officiel."
    }
  ],
  "footer": "Dernière mise à jour : juillet 2026. Ces conditions sont un modèle et nécessitent une révision juridique spécialisée par un avocat agréé avant le lancement officiel."
},
  privacy: {
  "title": "Politique de confidentialité",
  "intro": "Nous respectons votre vie privée et nous engageons à protéger vos données personnelles. Cette page explique quelles données nous collectons, comment nous les utilisons et où elles sont stockées.",
  "sections": [
    {
      "title": "1. Données que nous collectons",
      "body": "Adresse email, nom (facultatif), nom d'utilisateur, et données de commandes et de transactions nécessaires à la fourniture du service. Nous ne stockons pas les données de votre carte bancaire — tous les paiements sont traités directement via Stripe.",
      "body2": "Si vous êtes vendeur, nous collectons également les coordonnées de paiement que vous saisissez vous-même (comme un numéro de compte bancaire / IBAN ou un email Payoneer), utilisées exclusivement par l'équipe autorisée de la plateforme pour traiter vos versements, et qui ne sont communiquées à aucun autre tiers."
    },
    {
      "title": "2. Cookies",
      "body": "Nous utilisons uniquement des cookies essentiels pour gérer votre session de connexion et l'authentification. Nous n'utilisons actuellement aucun cookie de suivi ou de publicité tierce."
    },
    {
      "title": "3. Comment nous utilisons vos données",
      "body": "Nous utilisons vos données pour faire fonctionner votre compte, traiter les commandes, livrer les produits numériques, exécuter les versements aux vendeurs, et communiquer avec vous au sujet de vos commandes ou de votre compte."
    },
    {
      "title": "4. Partage des données et lieu de stockage",
      "body": "Nous ne vendons pas vos données à des tiers. Nous partageons le minimum de données nécessaires avec des prestataires de confiance, uniquement pour faire fonctionner la plateforme :",
      "list": [
        "Supabase — stockage de la base de données et des fichiers (serveurs situés à Francfort, Allemagne / Union européenne)",
        "Stripe — traitement des paiements",
        "Resend — envoi des emails opérationnels (confirmation de compte, notifications de commandes)"
      ]
    },
    {
      "title": "5. Durée de conservation des données",
      "body": "Nous conservons vos données tant que votre compte est actif. Lors d'une demande de suppression de compte, vos données personnelles sont supprimées dans un délai raisonnable, à l'exception de ce qui doit être conservé à des fins comptables ou légales obligatoires."
    },
    {
      "title": "6. Sécurité des données",
      "body": "Nous appliquons des politiques de sécurité au niveau de la base de données (Row Level Security) garantissant que chaque utilisateur n'accède qu'à ses propres données, en plus d'un chiffrement des connexions (HTTPS) sur l'ensemble de la plateforme."
    },
    {
      "title": "7. Vos droits",
      "body": "Vous avez le droit, à tout moment, de :",
      "list": [
        "Accéder à vos données personnelles conservées chez nous",
        "Corriger ou mettre à jour vos données",
        "Demander la suppression de votre compte et de vos données",
        "Vous opposer au traitement de vos données dans certains cas"
      ],
      "closing": "Pour exercer l'un de ces droits, contactez-nous via la page de support."
    },
    {
      "title": "8. Enfants et mineurs",
      "body": "La plateforme ne s'adresse pas aux personnes de moins de 18 ans, et nous ne collectons pas intentionnellement de données d'utilisateurs que nous savons être mineurs."
    }
  ],
  "footer": "Dernière mise à jour : juillet 2026. Cette politique est un modèle et nécessite une révision juridique spécialisée par un avocat agréé avant le lancement officiel, notamment en ce qui concerne la pleine conformité aux réglementations de protection des données (comme le RGPD européen) si votre audience inclut des utilisateurs de l'Union européenne."
},
  sellerOrders: {
    title: 'Commandes des acheteurs', backToDashboard: '← Tableau de bord',
    colProduct: 'Produit', colBuyer: 'Acheteur', colAmount: 'Montant', colDate: 'Date', colStatus: 'Statut',
    statusPaid: 'Payé', statusPending: 'En traitement', statusFree: 'Gratuit',
    emptyText: "Aucune commande sur vos produits pour l'instant.",
    navLink: 'Commandes des acheteurs 🧾',
  },
  dashboard: {
    payoutSettingsLink: 'Paramètres de paiement 💰', viewStoreLink: 'Voir ma boutique publique →',
    welcomePrefix: '🎉 Votre boutique «', welcomeSuffix: '» a été activée avec succès ! Ajoutez votre premier produit pour commencer à vendre.',
    addProductButton: '+ Ajouter un nouveau produit',
    statActive: 'Produits publiés', statPending: 'En attente de révision', statSales: 'Ventes totales', statRating: 'Note',
    statTotalRevenue: 'Revenu total', statMonthRevenue: 'Revenu de ce mois', statBestSeller: 'Meilleure vente',
    revenueChartTitle: 'Revenus — 30 derniers jours', noBestSeller: 'Aucun pour le moment',
    myProductsTitle: 'Mes produits',
    colProduct: 'Produit', colPrice: 'Prix', colStatus: 'Statut', colSales: 'Ventes', colViews: 'Vues', colActions: 'Actions',
    editLink: 'Modifier ✏️',
    emptyText: "Vous n'avez ajouté aucun produit pour le moment.", emptyCta: 'Ajoutez votre premier produit →',
    statusActive: 'Publié', statusPending: 'En attente', statusRejected: 'Rejeté', statusPaused: 'En pause', statusDraft: 'Brouillon',
    noStoreAdminTitle: 'Aucune boutique liée à votre compte',
    noStoreAdminDesc: "Votre compte est administrateur et ne possède pas de boutique automatiquement. Vous pouvez créer une boutique pour vendre comme n'importe quel vendeur, ou accéder au panneau d'administration pour gérer la plateforme.",
    createStoreNow: 'Créer une boutique maintenant', goToAdmin: "Aller au panneau d'administration",
  },
  store: {
    notFoundTitle: 'Boutique introuvable',
    verified: '✓ Vérifié',
    ratingSuffix: 'avis',
    salesLabel: 'ventes',
    memberSince: 'Membre depuis',
    generalShop: 'Boutique',
    productsTitlePrefix: 'Produits de la boutique',
    emptyText: "Aucun produit publié dans cette boutique pour l'instant",
    login: 'Connexion',
    adBannerLabel: 'Espace publicitaire',
    adCardLabel: 'Publicité',
  },
  ads: {
    banner: 'Espace publicitaire',
    card: 'Publicité',
    strip: 'Espace publicitaire',
  },
  about: {
    badge: 'À propos',
    title: 'Une plateforme numérique arabe, aux standards mondiaux',
    subtitle: "DEGITALE est une marketplace unifiée pour acheter et vendre des produits et services numériques — modèles, code, ebooks et services freelance — en toute sécurité.",
    missionTitle: 'Notre mission',
    missionText: "Nous pensons que les créateurs numériques du monde arabe méritent une plateforme professionnelle qui les protège ainsi que leurs clients, avec une commission équitable et des outils simples leur permettant de se concentrer sur la création plutôt que sur la complexité technique.",
    howItWorksTitle: 'Comment ça marche',
    buyerStepTitle: 'Pour les acheteurs',
    buyerStepText: "Parcourez des milliers de produits, payez en toute sécurité via Stripe, et recevez un lien de téléchargement instantané valable 48 heures, avec une garantie de remboursement de 14 jours.",
    sellerStepTitle: 'Pour les vendeurs',
    sellerStepText: "Créez votre boutique en quelques minutes, publiez votre produit, et commencez à vendre après une validation rapide de notre équipe sous 48 heures.",
    trustTitle: 'Pourquoi DEGITALE ?',
    trust1Title: 'Paiements sécurisés',
    trust1Text: "Toutes les transactions passent par Stripe, nous ne stockons jamais vos données bancaires.",
    trust2Title: 'Liens protégés',
    trust2Text: "Chaque lien de téléchargement est chiffré et limité dans le temps, il ne peut donc pas être partagé ou détourné.",
    trust3Title: 'Support réactif',
    trust3Text: "Notre équipe de support répond sous 24 heures à toute question ou problème.",
    ctaTitle: 'Prêt à commencer ?',
    ctaShop: 'Parcourir la boutique',
    ctaSell: 'Commencer à vendre',
  },
  faq: {
    badge: 'FAQ',
    title: 'Tout ce que vous devez savoir',
    subtitle: 'Réponses rapides aux questions les plus fréquentes',
    q1: "Comment acheter un produit numérique ?", a1: "Choisissez un produit, cliquez sur « Acheter maintenant », finalisez le paiement sécurisé via Stripe, et recevez un lien de téléchargement instantané valable 48 heures.",
    q2: "Quelle est la politique de remboursement ?", a2: "Vous pouvez obtenir un remboursement complet sous 14 jours après l'achat si le produit ne correspond pas à sa description — contactez le support pour lancer une demande.",
    q3: "Comment devenir vendeur ?", a3: "Cliquez sur « Commencer à vendre » sur la page d'accueil, créez votre boutique, et publiez votre premier produit — notre équipe le valide sous 48 heures avant sa mise en ligne.",
    q4: "Quelle est la commission de la plateforme ?", a4: "Les vendeurs conservent 80 % de chaque vente, le reste couvre le fonctionnement de la plateforme, le support et le traitement des paiements.",
    q5: "Mes données de paiement sont-elles sécurisées ?", a5: "Oui, tous les paiements sont traités directement par Stripe, vos données bancaires n'atteignent jamais nos serveurs.",
    q6: "Que faire si mon lien de téléchargement a expiré ?", a6: "Contactez le support via la page « Nous contacter » avec votre numéro de commande, et nous générerons un nouveau lien immédiatement.",
  },
  reviews: {
    title: 'Avis',
    leaveReview: 'Laisser un avis',
    yourRating: 'Votre note',
    commentPlaceholder: 'Partagez votre avis sur le produit (optionnel)',
    submit: "Envoyer l'avis",
    submitting: 'Envoi en cours...',
    editReview: 'Modifier votre avis',
    update: "Mettre à jour l'avis",
    thanks: 'Merci pour votre avis !',
    alreadyReviewed: 'Votre avis envoyé',
    noReviewsYet: "Aucun avis pour l'instant — soyez le premier à évaluer ce produit",
    anonymous: 'Acheteur',
    error: "Une erreur s'est produite, veuillez réessayer",
  },
  wishlist: {
    navLabel: 'Favoris',
    title: 'Ma liste de favoris',
    subtitle: 'Les produits que vous avez enregistrés pour plus tard',
    emptyTitle: 'Votre liste de favoris est vide',
    emptyCta: 'Parcourir la boutique →',
    remove: 'Retirer',
  },
  userMenu: {
    accountSettings: 'Paramètres du compte',
    wishlist: 'Favoris',
    adminPanel: "Panneau d'administration",
    sellerDashboard: 'Tableau de bord vendeur',
    myOrders: 'Mes commandes',
    roleAdmin: 'Admin', roleSeller: 'Vendeur', roleBuyer: 'Acheteur',
    signingOut: 'Déconnexion…',
    signOut: 'Se déconnecter',
  },
  storeSettings: {
    navLink: 'Paramètres de la boutique',
    title: 'Paramètres de la boutique',
    subtitle: 'Personnalisez la page publique de votre boutique',
    bannerLabel: 'Image de couverture',
    bannerHint: 'Dimensions larges recommandées (~1600×400), JPG ou PNG',
    changeBanner: "Changer l'image",
    nameLabel: 'Nom de la boutique',
    bioLabel: 'Description de la boutique',
    saveButton: 'Enregistrer',
    saving: 'Enregistrement…',
    savedSuccess: 'Enregistré avec succès ✓',
    errorGeneric: "Une erreur s'est produite, veuillez réessayer",
    previewLink: 'Aperçu de ma boutique publique ←',
  },
}
