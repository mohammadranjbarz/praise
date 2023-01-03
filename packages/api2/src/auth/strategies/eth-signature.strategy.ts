import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ethers } from 'ethers';
import { EthSignatureService } from '../eth-signature.service';
import { User } from '@/users/schemas/users.schema';

@Injectable()
/**
 * Passport strategy for authenticating users using Ethereum signature.
 */
export class EthSignatureStrategy extends PassportStrategy(
  Strategy,
  'eth-signature',
) {
  constructor(
    private usersService: UsersService,
    private ethSignatureService: EthSignatureService,
  ) {
    super({
      usernameField: 'identityEthAddress',
      passwordField: 'signature',
    });
  }
  /**
   * Validate user signature and return user if valid.
   *
   * @param identityEthAddress
   * @param signature
   * @returns
   */
  async validate(identityEthAddress: string, signature: string): Promise<User> {
    // Check if user exists
    const user = await this.usersService.findOneByEth(identityEthAddress);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has previously generated a nonce
    if (!user.nonce) {
      throw new UnauthorizedException('Nonce not found');
    }

    // Generate expected message
    const message = this.ethSignatureService.generateLoginMessage(
      identityEthAddress,
      user.nonce,
    );

    // Verify signature
    try {
      // Recovered signer address must match identityEthAddress
      const signerAddress = ethers.utils.verifyMessage(message, signature);
      if (signerAddress !== identityEthAddress) throw new Error();
    } catch (e) {
      throw new UnauthorizedException('Signature verification failed');
    }

    // Return user if all checks pass
    return user;
  }
}
