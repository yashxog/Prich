export interface PhoneCallingCodeOption {
  callingCode: string
  flag: string
  label: string
}

export interface CountryOption {
  flag: string
  label: string
}

export interface SplitPhoneNumber {
  callingCode: string
  nationalNumber: string
}

const BASE_PHONE_CALLING_CODE_OPTIONS = [
  { callingCode: '+93', label: 'Afghanistan' },
  { callingCode: '+355', label: 'Albania' },
  { callingCode: '+213', label: 'Algeria' },
  { callingCode: '+376', label: 'Andorra' },
  { callingCode: '+244', label: 'Angola' },
  { callingCode: '+54', label: 'Argentina' },
  { callingCode: '+374', label: 'Armenia' },
  { callingCode: '+61', label: 'Australia' },
  { callingCode: '+43', label: 'Austria' },
  { callingCode: '+994', label: 'Azerbaijan' },
  { callingCode: '+973', label: 'Bahrain' },
  { callingCode: '+880', label: 'Bangladesh' },
  { callingCode: '+375', label: 'Belarus' },
  { callingCode: '+32', label: 'Belgium' },
  { callingCode: '+501', label: 'Belize' },
  { callingCode: '+229', label: 'Benin' },
  { callingCode: '+975', label: 'Bhutan' },
  { callingCode: '+591', label: 'Bolivia' },
  { callingCode: '+387', label: 'Bosnia and Herzegovina' },
  { callingCode: '+267', label: 'Botswana' },
  { callingCode: '+55', label: 'Brazil' },
  { callingCode: '+673', label: 'Brunei' },
  { callingCode: '+359', label: 'Bulgaria' },
  { callingCode: '+226', label: 'Burkina Faso' },
  { callingCode: '+257', label: 'Burundi' },
  { callingCode: '+855', label: 'Cambodia' },
  { callingCode: '+237', label: 'Cameroon' },
  { callingCode: '+1', label: 'North America / Caribbean (NANP)' },
  { callingCode: '+238', label: 'Cape Verde' },
  { callingCode: '+236', label: 'Central African Republic' },
  { callingCode: '+235', label: 'Chad' },
  { callingCode: '+56', label: 'Chile' },
  { callingCode: '+86', label: 'China' },
  { callingCode: '+57', label: 'Colombia' },
  { callingCode: '+269', label: 'Comoros' },
  { callingCode: '+242', label: 'Congo' },
  { callingCode: '+243', label: 'Congo, Democratic Republic' },
  { callingCode: '+506', label: 'Costa Rica' },
  { callingCode: '+385', label: 'Croatia' },
  { callingCode: '+53', label: 'Cuba' },
  { callingCode: '+357', label: 'Cyprus' },
  { callingCode: '+420', label: 'Czechia' },
  { callingCode: '+45', label: 'Denmark' },
  { callingCode: '+253', label: 'Djibouti' },
  { callingCode: '+593', label: 'Ecuador' },
  { callingCode: '+20', label: 'Egypt' },
  { callingCode: '+503', label: 'El Salvador' },
  { callingCode: '+240', label: 'Equatorial Guinea' },
  { callingCode: '+291', label: 'Eritrea' },
  { callingCode: '+372', label: 'Estonia' },
  { callingCode: '+268', label: 'Eswatini' },
  { callingCode: '+251', label: 'Ethiopia' },
  { callingCode: '+679', label: 'Fiji' },
  { callingCode: '+358', label: 'Finland' },
  { callingCode: '+33', label: 'France' },
  { callingCode: '+241', label: 'Gabon' },
  { callingCode: '+220', label: 'Gambia' },
  { callingCode: '+995', label: 'Georgia' },
  { callingCode: '+49', label: 'Germany' },
  { callingCode: '+233', label: 'Ghana' },
  { callingCode: '+30', label: 'Greece' },
  { callingCode: '+502', label: 'Guatemala' },
  { callingCode: '+224', label: 'Guinea' },
  { callingCode: '+245', label: 'Guinea-Bissau' },
  { callingCode: '+592', label: 'Guyana' },
  { callingCode: '+509', label: 'Haiti' },
  { callingCode: '+504', label: 'Honduras' },
  { callingCode: '+852', label: 'Hong Kong' },
  { callingCode: '+36', label: 'Hungary' },
  { callingCode: '+354', label: 'Iceland' },
  { callingCode: '+91', label: 'India' },
  { callingCode: '+62', label: 'Indonesia' },
  { callingCode: '+98', label: 'Iran' },
  { callingCode: '+964', label: 'Iraq' },
  { callingCode: '+353', label: 'Ireland' },
  { callingCode: '+972', label: 'Israel' },
  { callingCode: '+39', label: 'Italy / Vatican City' },
  { callingCode: '+225', label: 'Ivory Coast' },
  { callingCode: '+81', label: 'Japan' },
  { callingCode: '+962', label: 'Jordan' },
  { callingCode: '+7', label: 'Kazakhstan / Russia' },
  { callingCode: '+254', label: 'Kenya' },
  { callingCode: '+686', label: 'Kiribati' },
  { callingCode: '+383', label: 'Kosovo' },
  { callingCode: '+965', label: 'Kuwait' },
  { callingCode: '+996', label: 'Kyrgyzstan' },
  { callingCode: '+856', label: 'Laos' },
  { callingCode: '+371', label: 'Latvia' },
  { callingCode: '+961', label: 'Lebanon' },
  { callingCode: '+266', label: 'Lesotho' },
  { callingCode: '+231', label: 'Liberia' },
  { callingCode: '+218', label: 'Libya' },
  { callingCode: '+423', label: 'Liechtenstein' },
  { callingCode: '+370', label: 'Lithuania' },
  { callingCode: '+352', label: 'Luxembourg' },
  { callingCode: '+853', label: 'Macao' },
  { callingCode: '+261', label: 'Madagascar' },
  { callingCode: '+265', label: 'Malawi' },
  { callingCode: '+60', label: 'Malaysia' },
  { callingCode: '+960', label: 'Maldives' },
  { callingCode: '+223', label: 'Mali' },
  { callingCode: '+356', label: 'Malta' },
  { callingCode: '+692', label: 'Marshall Islands' },
  { callingCode: '+222', label: 'Mauritania' },
  { callingCode: '+230', label: 'Mauritius' },
  { callingCode: '+52', label: 'Mexico' },
  { callingCode: '+691', label: 'Micronesia' },
  { callingCode: '+373', label: 'Moldova' },
  { callingCode: '+377', label: 'Monaco' },
  { callingCode: '+976', label: 'Mongolia' },
  { callingCode: '+382', label: 'Montenegro' },
  { callingCode: '+212', label: 'Morocco' },
  { callingCode: '+258', label: 'Mozambique' },
  { callingCode: '+95', label: 'Myanmar' },
  { callingCode: '+264', label: 'Namibia' },
  { callingCode: '+674', label: 'Nauru' },
  { callingCode: '+977', label: 'Nepal' },
  { callingCode: '+31', label: 'Netherlands' },
  { callingCode: '+64', label: 'New Zealand' },
  { callingCode: '+505', label: 'Nicaragua' },
  { callingCode: '+227', label: 'Niger' },
  { callingCode: '+234', label: 'Nigeria' },
  { callingCode: '+850', label: 'North Korea' },
  { callingCode: '+389', label: 'North Macedonia' },
  { callingCode: '+47', label: 'Norway' },
  { callingCode: '+968', label: 'Oman' },
  { callingCode: '+92', label: 'Pakistan' },
  { callingCode: '+680', label: 'Palau' },
  { callingCode: '+970', label: 'Palestine' },
  { callingCode: '+507', label: 'Panama' },
  { callingCode: '+675', label: 'Papua New Guinea' },
  { callingCode: '+595', label: 'Paraguay' },
  { callingCode: '+51', label: 'Peru' },
  { callingCode: '+63', label: 'Philippines' },
  { callingCode: '+48', label: 'Poland' },
  { callingCode: '+351', label: 'Portugal' },
  { callingCode: '+974', label: 'Qatar' },
  { callingCode: '+40', label: 'Romania' },
  { callingCode: '+250', label: 'Rwanda' },
  { callingCode: '+685', label: 'Samoa' },
  { callingCode: '+378', label: 'San Marino' },
  { callingCode: '+239', label: 'Sao Tome and Principe' },
  { callingCode: '+966', label: 'Saudi Arabia' },
  { callingCode: '+221', label: 'Senegal' },
  { callingCode: '+381', label: 'Serbia' },
  { callingCode: '+248', label: 'Seychelles' },
  { callingCode: '+232', label: 'Sierra Leone' },
  { callingCode: '+65', label: 'Singapore' },
  { callingCode: '+421', label: 'Slovakia' },
  { callingCode: '+386', label: 'Slovenia' },
  { callingCode: '+677', label: 'Solomon Islands' },
  { callingCode: '+252', label: 'Somalia' },
  { callingCode: '+27', label: 'South Africa' },
  { callingCode: '+82', label: 'South Korea' },
  { callingCode: '+211', label: 'South Sudan' },
  { callingCode: '+34', label: 'Spain' },
  { callingCode: '+94', label: 'Sri Lanka' },
  { callingCode: '+249', label: 'Sudan' },
  { callingCode: '+597', label: 'Suriname' },
  { callingCode: '+46', label: 'Sweden' },
  { callingCode: '+41', label: 'Switzerland' },
  { callingCode: '+963', label: 'Syria' },
  { callingCode: '+886', label: 'Taiwan' },
  { callingCode: '+992', label: 'Tajikistan' },
  { callingCode: '+255', label: 'Tanzania' },
  { callingCode: '+66', label: 'Thailand' },
  { callingCode: '+670', label: 'Timor-Leste' },
  { callingCode: '+228', label: 'Togo' },
  { callingCode: '+676', label: 'Tonga' },
  { callingCode: '+216', label: 'Tunisia' },
  { callingCode: '+90', label: 'Turkey' },
  { callingCode: '+993', label: 'Turkmenistan' },
  { callingCode: '+688', label: 'Tuvalu' },
  { callingCode: '+256', label: 'Uganda' },
  { callingCode: '+380', label: 'Ukraine' },
  { callingCode: '+971', label: 'United Arab Emirates' },
  { callingCode: '+44', label: 'United Kingdom' },
  { callingCode: '+598', label: 'Uruguay' },
  { callingCode: '+998', label: 'Uzbekistan' },
  { callingCode: '+678', label: 'Vanuatu' },
  { callingCode: '+58', label: 'Venezuela' },
  { callingCode: '+84', label: 'Vietnam' },
  { callingCode: '+967', label: 'Yemen' },
  { callingCode: '+260', label: 'Zambia' },
  { callingCode: '+263', label: 'Zimbabwe' },
] as const

const PHONE_COUNTRY_CODES = [
  'AF', 'AL', 'DZ', 'AD', 'AO', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BH', 'BD', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO',
  'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'US', 'CV', 'CF', 'TD', 'CL', 'CN', 'CO', 'KM', 'CG',
  'CD', 'CR', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FJ', 'FI',
  'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID',
  'IR', 'IQ', 'IE', 'IL', 'IT', 'CI', 'JP', 'JO', 'KZ', 'KE', 'KI', 'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS',
  'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD',
  'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'KP', 'MK', 'NO', 'OM',
  'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'WS', 'SM', 'ST', 'SA', 'SN',
  'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'KR', 'SS', 'ES', 'LK', 'SD', 'SR', 'SE', 'CH', 'SY',
  'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TN', 'TR', 'TM', 'TV', 'UG', 'UA', 'AE', 'GB', 'UY', 'UZ', 'VU',
  'VE', 'VN', 'YE', 'ZM', 'ZW',
] as const

/**
 * Converts an ISO 3166-1 alpha-2 code into its Unicode country flag.
 * @param countryCode - The two-letter uppercase country code.
 * @returns The corresponding country flag glyph.
 */
function countryCodeToFlag(countryCode: string): string {
  return String.fromCodePoint(...[...countryCode].map((character) => 127397 + character.charCodeAt(0)))
}

export const PHONE_CALLING_CODE_OPTIONS: readonly PhoneCallingCodeOption[] = BASE_PHONE_CALLING_CODE_OPTIONS.map(
  (option, index) => ({
    ...option,
    flag: countryCodeToFlag(PHONE_COUNTRY_CODES[index] ?? 'UN'),
  }),
)

export const COUNTRY_OPTIONS: readonly CountryOption[] = PHONE_CALLING_CODE_OPTIONS.map(({ flag, label }) => ({
  flag,
  label,
}))

const CALLING_CODES_BY_LENGTH = [...PHONE_CALLING_CODE_OPTIONS]
  .sort((firstOption, secondOption) => secondOption.callingCode.length - firstOption.callingCode.length)

/**
 * Combines a selected calling code and national number into E.164 form.
 * @param callingCode - The selected international calling code, including its leading plus sign.
 * @param nationalNumber - The user-entered national phone number.
 * @returns A normalized phone number containing only the calling code and digits.
 */
export function buildE164PhoneNumber(callingCode: string, nationalNumber: string): string {
  const normalizedNationalNumber = nationalNumber.replace(/\D/g, '').replace(/^0+/, '')
  return `${callingCode}${normalizedNationalNumber}`
}

/**
 * Separates a stored E.164 number for display in the calling-code and national-number controls.
 * @param phoneNumber - The stored E.164 phone number.
 * @returns The recognized calling code and remaining national number.
 */
export function splitE164PhoneNumber(phoneNumber: string): SplitPhoneNumber {
  const option = CALLING_CODES_BY_LENGTH.find((candidate) => phoneNumber.startsWith(candidate.callingCode))

  return option
    ? { callingCode: option.callingCode, nationalNumber: phoneNumber.slice(option.callingCode.length) }
    : { callingCode: '', nationalNumber: phoneNumber.replace(/\D/g, '') }
}
