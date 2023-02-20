import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { requestApiAuth, requestNonce } from '@/utils/auth';
import { SignMessageLayout } from '../../layouts/SignMessageLayout';
import { generateLoginMessage } from '@/utils/message';

const LoginPage = (): JSX.Element => {
  const { address } = useAccount();
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const generateNewMessage = async (address): Promise<void> => {
      try {
        const nonce = await requestNonce(address);
        const newMessage = generateLoginMessage(address, nonce);

        setMessage(newMessage);
      } catch (err) {
        toast.error('Error connecting to server');
      }
    };

    if (address) void generateNewMessage(address);
  }, [address]);

  const onSignSuccess = async (signature): Promise<void> => {
    try {
      if (!address) throw new Error();

      // Verify signature with server
      await requestApiAuth({ identityEthAddress: address, signature });
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <SignMessageLayout
      onSignSuccess={(signature): void => void onSignSuccess(signature)}
      message={message}
      buttonText="Sign login message"
    >
      <div className="flex justify-center w-full">
        <div>
          <div className="mb-2 text-xl font-semibold text-center">Login</div>
          <div className="text-center">
            To login to praise, first connect a wallet and then sign a
            verification message.
          </div>
        </div>
      </div>
    </SignMessageLayout>
  );
};

// eslint-disable-next-line import/no-default-export
export default LoginPage;
