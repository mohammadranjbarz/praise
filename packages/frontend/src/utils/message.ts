/**
 * Generate a login message that will be signed by the frontend user, and validated by the api

 * @param  {string} account
 * @param  {string} nonce
 * @returns string
 */
export const generateLoginMessage = (
  account: string,
  nonce: string
): string => {
  return (
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};

/**
 * Generate an activation message that will be signed by the frontend user, and validated by the api
 *
 * @param  {string} accountId
 * @param  {string} identityEthAddress
 * @param  {string} token
 * @returns string
 */
export const generateActivateMessage = (
  accountId: string,
  identityEthAddress: string,
  token: string
): string => {
  return (
    'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
    `ACCOUNT ID:\n${accountId}\n\n` +
    `ADDRESS:\n${identityEthAddress}\n\n` +
    `TOKEN:\n${token}`
  );
};
