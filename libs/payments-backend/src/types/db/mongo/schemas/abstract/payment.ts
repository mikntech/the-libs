import type { Document as MDocument } from 'mongoose';

export enum PaymentMethod {
  CARD_STRIPE = 'Stripe',
  BANK_MANUAL = 'manualBank',
}

export enum Currency {
  afn = 'Afghani',
  eur = 'Euro',
  all = 'Lek',
  dzd = 'Algerian Dinar',
  usd = 'US Dollar',
  aoa = 'Kwanza',
  xcd = 'East Caribbean Dollar',
  ars = 'Argentine Peso',
  amd = 'Armenian Dram',
  awg = 'Aruban Florin',
  aud = 'Australian Dollar',
  azn = 'Azerbaijan Manat',
  bsd = 'Bahamian Dollar',
  bhd = 'Bahraini Dinar',
  bdt = 'Taka',
  bbd = 'Barbados Dollar',
  byn = 'Belarusian Ruble',
  bzd = 'Belize Dollar',
  xof = 'CFA Franc BCEAO',
  bmd = 'Bermudian Dollar',
  inr = 'Indian Rupee',
  btn = 'Ngultrum',
  bob = 'Boliviano',
  bov = 'Mvdol',
  bam = 'Convertible Mark',
  bwp = 'Pula',
  nok = 'Norwegian Krone',
  brl = 'Brazilian Real',
  bnd = 'Brunei Dollar',
  bgn = 'Bulgarian Lev',
  bif = 'Burundi Franc',
  cve = 'Cabo Verde Escudo',
  khr = 'Riel',
  xaf = 'CFA Franc BEAC',
  cad = 'Canadian Dollar',
  kyd = 'Cayman Islands Dollar',
  clp = 'Chilean Peso',
  clf = 'Unidad de Fomento',
  cny = 'Yuan Renminbi',
  cop = 'Colombian Peso',
  cou = 'Unidad de Valor Real',
  kmf = 'Comorian Franc',
  cdf = 'Congolese Franc',
  nzd = 'New Zealand Dollar',
  crc = 'Costa Rican Colon',
  cup = 'Cuban Peso',
  cuc = 'Peso Convertible',
  ang = 'Netherlands Antillean Guilder',
  czk = 'Czech Koruna',
  dkk = 'Danish Krone',
  djf = 'Djibouti Franc',
  dop = 'Dominican Peso',
  egp = 'Egyptian Pound',
  svc = 'El Salvador Colon',
  ern = 'Nakfa',
  szl = 'Lilangeni',
  etb = 'Ethiopian Birr',
  fkp = 'Falkland Islands Pound',
  fjd = 'Fiji Dollar',
  xpf = 'CFP Franc',
  gmd = 'Dalasi',
  gel = 'Lari',
  ghs = 'Ghana Cedi',
  gip = 'Gibraltar Pound',
  gtq = 'Quetzal',
  gbp = 'Pound Sterling',
  gnf = 'Guinean Franc',
  gyd = 'Guyana Dollar',
  htg = 'Gourde',
  hnl = 'Lempira',
  hkd = 'Hong Kong Dollar',
  huf = 'Forint',
  isk = 'Iceland Krona',
  idr = 'Rupiah',
  xdr = 'SDR (Special Drawing Right)',
  irr = 'Iranian Rial',
  iqd = 'Iraqi Dinar',
  ils = 'New Israeli Sheqel',
  jmd = 'Jamaican Dollar',
  jpy = 'Yen',
  jod = 'Jordanian Dinar',
  kzt = 'Tenge',
  kes = 'Kenyan Shilling',
  kpw = 'North Korean Won',
  krw = 'Won',
  kwd = 'Kuwaiti Dinar',
  kgs = 'Som',
  lak = 'Lao Kip',
  lbp = 'Lebanese Pound',
  lsl = 'Loti',
  zar = 'Rand',
  lrd = 'Liberian Dollar',
  lyd = 'Libyan Dinar',
  chf = 'Swiss Franc',
  mop = 'Pataca',
  mkd = 'Denar',
  mga = 'Malagasy Ariary',
  mwk = 'Malawi Kwacha',
  myr = 'Malaysian Ringgit',
  mvr = 'Rufiyaa',
  mru = 'Ouguiya',
  mur = 'Mauritius Rupee',
  xua = 'ADB Unit of Account',
  mxn = 'Mexican Peso',
  mxv = 'Mexican Unidad de Inversion (UDI)',
  mdl = 'Moldovan Leu',
  mnt = 'Tugrik',
  mad = 'Moroccan Dirham',
  mzn = 'Mozambique Metical',
  mmk = 'Kyat',
  nad = 'Namibia Dollar',
  npr = 'Nepalese Rupee',
  nio = 'Cordoba Oro',
  ngn = 'Naira',
  omr = 'Rial Omani',
  pkr = 'Pakistan Rupee',
  pab = 'Balboa',
  pgk = 'Kina',
  pyg = 'Guarani',
  pen = 'Sol',
  php = 'Philippine Peso',
  pln = 'Zloty',
  qar = 'Qatari Rial',
  ron = 'Romanian Leu',
  rub = 'Russian Ruble',
  rwf = 'Rwanda Franc',
  shp = 'Saint Helena Pound',
  wst = 'Tala',
  stn = 'Dobra',
  sar = 'Saudi Riyal',
  rsd = 'Serbian Dinar',
  scr = 'Seychelles Rupee',
  sle = 'Leone',
  sgd = 'Singapore Dollar',
  xsu = 'Sucre',
  sbd = 'Solomon Islands Dollar',
  sos = 'Somali Shilling',
  ssp = 'South Sudanese Pound',
  lkr = 'Sri Lanka Rupee',
  sdg = 'Sudanese Pound',
  srd = 'Surinam Dollar',
  sek = 'Swedish Krona',
  che = 'WIR Euro',
  chw = 'WIR Franc',
  syp = 'Syrian Pound',
  twd = 'New Taiwan Dollar',
  tjs = 'Somoni',
  tzs = 'Tanzanian Shilling',
  thb = 'Baht',
  top = 'Paʻanga',
  ttd = 'Trinidad and Tobago Dollar',
  tnd = 'Tunisian Dinar',
  try = 'Turkish Lira',
  tmt = 'Turkmenistan New Manat',
  ugx = 'Uganda Shilling',
  uah = 'Hryvnia',
  aed = 'UAE Dirham',
  usn = 'US Dollar (Next day)',
  uyu = 'Peso Uruguayo',
  uyi = 'Uruguay Peso en Unidades Indexadas (UI)',
  uyw = 'Unidad Previsional',
  uzs = 'Uzbekistan Sum',
  vuv = 'Vatu',
  ves = 'Bolívar Soberano',
  ved = 'Bolívar Soberano',
  vnd = 'Dong',
  yer = 'Yemeni Rial',
  zmw = 'Zambian Kwacha',
  zwg = 'Zimbabwe Gold',
  xba = 'Bond Markets Unit European Composite Unit (EURCO)',
  xbb = 'Bond Markets Unit European Monetary Unit (E.M.U.-6)',
  xbc = 'Bond Markets Unit European Unit of Account 9 (E.U.A.-9)',
  xbd = 'Bond Markets Unit European Unit of Account 17 (E.U.A.-17)',
  xts = 'Codes specifically reserved for testing purposes',
  xxx = 'The codes assigned for transactions where no currency is involved',
  xau = 'Gold',
  xpd = 'Palladium',
  xpt = 'Platinum',
  xag = 'Silver',
  afa = 'Afghani',
  fim = 'Markka',
  alk = 'Old Lek',
  adp = 'Andorran Peseta',
  esp = 'Spanish Peseta',
  frf = 'French Franc',
  aok = 'Kwanza',
  aon = 'New Kwanza',
  aor = 'Kwanza Reajustado',
  ara = 'Austral',
  arp = 'Peso Argentino',
  ary = 'Peso',
  rur = 'Russian Ruble',
  ats = 'Schilling',
  aym = 'Azerbaijan Manat',
  azm = 'Azerbaijanian Manat',
  byb = 'Belarusian Ruble',
  byr = 'Belarusian Ruble',
  bec = 'Convertible Franc',
  bef = 'Belgian Franc',
  bel = 'Financial Franc',
  bop = 'Peso boliviano',
  bad = 'Dinar',
  brb = 'Cruzeiro',
  brc = 'Cruzado',
  bre = 'Cruzeiro',
  brn = 'New Cruzado',
  brr = 'Cruzeiro Real',
  bgj = 'Lev A/52',
  bgk = 'Lev A/62',
  bgl = 'Lev',
  buk = 'Kyat',
  hrd = 'Croatian Dinar',
  hrk = 'Croatian Kuna',
  cyp = 'Cyprus Pound',
  csj = 'Krona A/53',
  csk = 'Koruna',
  ecs = 'Sucre',
  ecv = 'Unidad de Valor Constante (UVC)',
  gqe = 'Ekwele',
  eek = 'Kroon',
  xeu = 'European Currency Unit (E.C.U)',
  gek = 'Georgian Coupon',
  ddm = 'Mark der DDR',
  dem = 'Deutsche Mark',
  ghc = 'Cedi',
  ghp = 'Ghana Cedi',
  grd = 'Drachma',
  gne = 'Syli',
  gns = 'Syli',
  gwe = 'Guinea Escudo',
  gwp = 'Guinea-Bissau Peso',
  itl = 'Italian Lira',
  isj = 'Old Krona',
  iep = 'Irish Pound',
  ilp = 'Pound',
  ilr = 'Old Shekel',
  laj = 'Pathet Lao Kip',
  lvl = 'Latvian Lats',
  lvr = 'Latvian Ruble',
  lsm = 'Loti',
  zal = 'Financial Rand',
  ltl = 'Lithuanian Litas',
  ltt = 'Talonas',
  luc = 'Luxembourg Convertible Franc',
  luf = 'Luxembourg Franc',
  lul = 'Luxembourg Financial Franc',
  mgf = 'Malagasy Franc',
  mvq = 'Maldive Rupee',
  mlf = 'Mali Franc',
  mtl = 'Maltese Lira',
  mtp = 'Maltese Pound',
  mro = 'Ouguiya',
  mxp = 'Mexican Peso',
  mze = 'Mozambique Escudo',
  mzm = 'Mozambique Metical',
  nlg = 'Netherlands Guilder',
  nic = 'Cordoba',
  peh = 'Sol',
  pei = 'Inti',
  pes = 'Sol',
  plz = 'Zloty',
  pte = 'Portuguese Escudo',
  rok = 'Leu A/52',
  rol = 'Old Leu',
  std = 'Dobra',
  csd = 'Serbian Dinar',
  sll = 'Leone',
  skk = 'Slovak Koruna',
  sit = 'Tolar',
  rhd = 'Rhodesian Dollar',
  esa = 'Spanish Peseta',
  sdd = 'Sudanese Dinar',
  sdp = 'Sudanese Pound',
  srg = 'Surinam Guilder',
  chc = 'WIR Franc (for electronic)',
  tjr = 'Tajik Ruble',
  tpe = 'Timor Escudo',
  trl = 'Old Turkish Lira',
  tmm = 'Turkmenistan Manat',
  ugs = 'Uganda Shilling',
  ugw = 'Old Shilling',
  uak = 'Karbovanet',
  sur = 'Rouble',
  uss = 'US Dollar (Same day)',
  uyn = 'Old Uruguay Peso',
  uyp = 'Uruguayan Peso',
  veb = 'Bolivar',
  vef = 'Bolivar Fuerte',
  vnc = 'Old Dong',
  ydd = 'Yemeni Dinar',
  yud = 'New Yugoslavian Dinar',
  yum = 'New Dinar',
  yun = 'Yugoslavian Dinar',
  zrn = 'New Zaire',
  zrz = 'Zaire',
  zmk = 'Zambian Kwacha',
  zwc = 'Rhodesian Dollar',
  zwd = 'Zimbabwe Dollar',
  zwn = 'Zimbabwe Dollar (new)',
  zwr = 'Zimbabwe Dollar',
  zwl = 'Zimbabwe Dollar',
  xfo = 'Gold-Franc',
  xre = 'RINET Funds Code',
  xfu = 'UIC-Franc',
}

export enum PaymentStatus {
  UNKNOWN = 'Unknown',
  COMPLETED = 'Completed',
  FINAL = 'Final',
  PENDING = 'Pending',
  REVERSED = 'Reversed',
  CANCELED = 'Canceled',
  REFUSED = 'Refused',
}

export interface BasePayment extends MDocument {
  method: PaymentMethod;
  amount: number;
  currency: keyof typeof Currency;
  manualStatus: PaymentStatus;
  automaticStatus: PaymentStatus;
  timestamp?: number;
  userId?: string;
  transactionId?: string;
}
