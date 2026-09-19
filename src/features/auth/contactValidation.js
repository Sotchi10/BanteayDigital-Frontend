const emailWithDomainPattern = /^(?=.{1,255}$)[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
const acceptedEmailDomains = [
  "gmail.com",
  "student.cadt.edu.kh",
  "outlook.com",
  "icloud.com",
  "yahoo.com",
];

const hasAcceptedEmailDomain = (value) => {
  const domain = value.trim().split("@")[1]?.toLowerCase();
  return Boolean(domain && acceptedEmailDomains.includes(domain));
};

const validAcceptedEmail = (value) =>
  emailWithDomainPattern.test(value.trim()) && hasAcceptedEmailDomain(value);

const normalizePhoneNumber = (value) => value.replace(/[\s().-]/g, "");
const validPhoneNumber = (value) =>
  /^0\d{8,9}$/.test(normalizePhoneNumber(value));

export {
  acceptedEmailDomains,
  emailWithDomainPattern,
  hasAcceptedEmailDomain,
  normalizePhoneNumber,
  validAcceptedEmail,
  validPhoneNumber,
};
