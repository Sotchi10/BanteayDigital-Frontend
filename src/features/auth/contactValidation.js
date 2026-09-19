const emailWithDomainPattern = /^(?=.{1,255}$)[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

const normalizePhoneNumber = (value) => value.replace(/[\s().-]/g, "");
const validPhoneNumber = (value) =>
  /^0\d{8,9}$/.test(normalizePhoneNumber(value));

export { emailWithDomainPattern, normalizePhoneNumber, validPhoneNumber };
